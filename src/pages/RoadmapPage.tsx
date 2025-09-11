/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useRoadmap } from '../state';
import { rewriteRoadmap } from '../api';
import { useNavigate } from 'react-router-dom';
import {
  Box, Drawer, Toolbar,
  Chip, Typography, LinearProgress, Divider, Stack, Button, TextField
} from '@mui/material';
import RoadmapGraph from '../components/RoadmapGraph';
import type { Concept } from '../types';

const rightWidth = 380;
const leftWidth = 360;

export default function RoadmapPage() {
  const { graph, setGraph } = useRoadmap();
  const nav = useNavigate();
  const [selected, setSelected] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(false);
  const [descDraft, setDescDraft] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState<string>('');

  useEffect(() => { if (!graph) nav('/upload'); }, [graph, nav]);
  if (!graph) return null;

  function findConceptByTitle(concepts: Concept[] | null | undefined, title: string): Concept | null {
    if (!concepts) return null;
    for (const c of concepts) {
      if (c.title === title) return c;
      const nested = findConceptByTitle(c.consist_of, title);
      if (nested) return nested;
    }
    return null;
  }

  function updateConceptDescription(title: string, description: string | null) {
    if (!graph) return;
    function cloneWithUpdate(concepts: Concept[] | null | undefined): Concept[] | null {
      if (!concepts) return concepts ?? null;
      return concepts.map(c => {
        if (c.title === title) {
          return { ...c, description };
        }
        return {
          ...c,
          consist_of: cloneWithUpdate(c.consist_of)
        };
      });
    }
    const next = { ...graph, concepts: cloneWithUpdate(graph.concepts) ?? [] };
    setGraph(next);
    const updated = findConceptByTitle(next.concepts, title);
    setSelected(updated);
  }

  function startEditing() {
    if (!selected) return;
    setDescDraft(selected.description ?? '');
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setDescDraft('');
  }

  function saveEditing() {
    if (!selected) return;
    updateConceptDescription(selected.title, descDraft.trim() === '' ? null : descDraft);
    setIsEditing(false);
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Левая панель: чат с промптом для переписывания графа */}
      <Drawer
        variant="persistent"
        anchor="left"
        open
        sx={{
          width: leftWidth, flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: leftWidth,
            p: 2,
            top: { xs: 56, sm: 64 },
            height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' }
          }
        }}
      >
        <Toolbar />
        <Stack spacing={1} sx={{ height: '100%' }}>
          <Typography variant="h6">Чат переписывания</Typography>
          <Typography variant="body2" color="text.secondary">
            Введите инструкцию. Отправим текущий граф и получим обновлённый.
          </Typography>
          <TextField
            label="Промпт"
            multiline
            minRows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={loading || !prompt.trim()}
              onClick={async () => {
                if (!graph) return;
                setLoading(true);
                try {
                  const updated = await rewriteRoadmap({ graph, prompt: prompt.trim() });
                  setGraph(updated);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e: any) {
                  alert(e?.response?.data?.detail || 'Ошибка переписывания графа');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Переписать граф
            </Button>
            <Button variant="text" onClick={() => setPrompt('')}>Очистить</Button>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              disabled={!graph}
              onClick={() => {
                if (!graph) return;
                const json = JSON.stringify(graph, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const ts = new Date();
                const pad = (n: number) => String(n).padStart(2, '0');
                const fname = `graph-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;
                a.href = url;
                a.download = fname;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
            >
              Скачать JSON
            </Button>
          </Stack>
        </Stack>
      </Drawer>
      {/* Центральная область: граф */}
      <Box component="main"
            sx={{
              flexGrow: 1,
              height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              px: 3, pb: 3
            }}
      >
        <Toolbar />

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <RoadmapGraph graph={graph} onSelect={setSelected} direction="LR" />
        </Box>
      </Box>

      {/* Правая панель: детали по выбранному узлу */
      }
      <Drawer
        variant="persistent"
        anchor="right"
        open={!!selected}
        sx={{
          width: rightWidth, flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: rightWidth,
            p: 2,
            top: { xs: 56, sm: 64 },
            height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' }
          }
        }}
      >
        <Toolbar />
        {selected && (
          <Box>
            <Typography variant="h6" gutterBottom>{selected.title}</Typography>
            {!isEditing && (
              <>
                {!!selected.description && (
                  <Typography variant="body2" sx={{ mb: 1 }}>{selected.description}</Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Button variant="outlined" onClick={startEditing}>Редактировать описание</Button>
                </Stack>
              </>
            )}
            {isEditing && (
              <Stack spacing={1} sx={{ mb: 2 }}>
                <TextField
                  label="Описание"
                  multiline
                  minRows={4}
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="text" onClick={cancelEditing}>Отмена</Button>
                  <Button variant="contained" onClick={saveEditing}>Сохранить</Button>
                </Stack>
              </Stack>
            )}
            {!!selected.source && (
              <Chip size="small" label={selected.source} sx={{ mb: 1 }} />
            )}
            {!!selected.related?.length && (
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Связанные</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {selected.related.map(r => <Chip key={r} size="small" label={r} />)}
                </Stack>
              </Stack>
            )}
            <Divider sx={{ my: 2 }} />
            <Button variant="outlined" onClick={() => setSelected(null)}>Закрыть</Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
