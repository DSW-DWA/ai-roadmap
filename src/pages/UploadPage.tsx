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

const MAX_FILES = 5;
const MAX_MB = 5;

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { setRoadmap } = useRoadmap();
  const nav = useNavigate();

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)];
    // dedupe by name+size
    const map = new Map<string, File>();
    next.forEach(f => map.set(`${f.name}-${f.size}`, f));
    setFiles(Array.from(map.values()).slice(0, MAX_FILES));
  }

  function validate(): string | null {
    if (!files.length) return 'Добавьте хотя бы один файл';
    if (files.length > MAX_FILES) return `Не более ${MAX_FILES} файлов`;
    for (const f of files) {
      if (f.size > MAX_MB * 1024 * 1024) return `Файл ${f.name} превышает ${MAX_MB} МБ`;
    }
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { alert(err); return; }
    setLoading(true);
    try {
      const roadmap = await uploadFiles(files);
      setRoadmap(roadmap);
      nav('/roadmap');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card sx={{ maxWidth: 960, mx: 'auto' }}>
      <CardHeader title="Загрузка файлов" subheader="До 5 файлов, каждый ≤ 5 МБ (.txt, .md, .csv, .sql)" />
      <CardContent>
        <Stack spacing={2}>
          <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => inputRef.current?.click()}>
            Выбрать файлы
          </Button>
          <input ref={inputRef} type="file" hidden multiple onChange={e => addFiles(e.target.files)} />

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
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>Сгенерировать роадмап</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
