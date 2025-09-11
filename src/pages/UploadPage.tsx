import * as React from 'react';
import { useState } from 'react';
import {
  Card, CardContent, CardHeader, Button, Stack, List, ListItem, ListItemText, IconButton,
  LinearProgress, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadFiles } from '../api';
import { useRoadmap } from '../state';
import { useNavigate } from 'react-router-dom';
import type { KnowledgeGraph } from '../types';

const MAX_FILES = 5;
const MAX_MB = 5;
const ALLOWED_EXTS = ['.docx', '.pptx', '.xlsx'];
const ALLOWED_MIMES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const jsonRef = React.useRef<HTMLInputElement>(null);
  const { setGraph, setOriginalFiles } = useRoadmap();
  const nav = useNavigate();

  function addFiles(list: FileList | null) {
    if (!list) return;
    const selected = Array.from(list).filter(f =>
      ALLOWED_EXTS.some(ext => f.name.toLowerCase().endsWith(ext)) ||
      ALLOWED_MIMES.includes(f.type)
    );
    const rejected = Array.from(list).filter(f => !selected.includes(f));
    if (rejected.length) {
      alert('Допустимые типы: .docx, .pptx, .xlsx');
    }
    const next = [...files, ...selected];
    // dedupe by name+size
    const map = new Map<string, File>();
    next.forEach(f => map.set(`${f.name}-${f.size}`, f));
    setFiles(Array.from(map.values()).slice(0, MAX_FILES));
  }

  function validate(): string | null {
    if (!files.length) return 'Добавьте хотя бы один файл';
    if (files.length > MAX_FILES) return `Не более ${MAX_FILES} файлов`;
    for (const f of files) {
      const okType = ALLOWED_EXTS.some(ext => f.name.toLowerCase().endsWith(ext)) || ALLOWED_MIMES.includes(f.type);
      if (!okType) return 'Допустимые типы: .docx, .pptx, .xlsx';
      if (f.size > MAX_MB * 1024 * 1024) return `Файл ${f.name} превышает ${MAX_MB} МБ`;
    }
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { alert(err); return; }
    setLoading(true);
    try {
      const graph = await uploadFiles(files);
      setGraph(graph);
      setOriginalFiles(files); // Сохраняем исходные файлы
      nav('/roadmap');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }

  async function handleImportJson(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as KnowledgeGraph;
      if (!parsed || !Array.isArray((parsed as KnowledgeGraph).concepts)) {
        alert('Некорректный JSON: требуется объект с полем concepts (массив)');
        return;
      }
      setGraph(parsed);
      setOriginalFiles([]); // Очищаем исходные файлы при импорте JSON
      nav('/roadmap');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert('Не удалось прочитать JSON: ' + (e?.message ?? 'ошибка'));
    }
  }

  return (
    <Card sx={{ maxWidth: 960, mx: 'auto' }}>
      <CardHeader title="Загрузка файлов" subheader="До 5 файлов, каждый ≤ 5 МБ (.docx, .pptx, .xlsx)" />
      <CardContent>
        <Stack spacing={2}>
          <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => inputRef.current?.click()}>
            Выбрать файлы
          </Button>
          <input
            ref={inputRef}
            type="file"
            hidden
            multiple
            accept=".docx,.pptx,.xlsx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={e => addFiles(e.target.files)}
          />

          <Button variant="outlined" onClick={() => jsonRef.current?.click()}>
            Загрузить JSON с графом
          </Button>
          <input
            ref={jsonRef}
            type="file"
            hidden
            accept="application/json,.json"
            onChange={e => handleImportJson(e.target.files?.[0] ?? null)}
          />

          {!files.length && <Typography variant="body2" color="text.secondary">Файлы пока не выбраны.</Typography>}

          {!!files.length && (
            <List dense>
              {files.map((f, i) => (
                <ListItem
                  key={`${f.name}-${f.size}`}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={f.name} secondary={`${(f.size/1024/1024).toFixed(2)} МБ`} />
                </ListItem>
              ))}
            </List>
          )}

          {loading && <LinearProgress />}

          <Stack direction="row" justifyContent="flex-end">
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>Сгенерировать граф знаний</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
