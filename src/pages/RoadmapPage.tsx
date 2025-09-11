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

const leftWidth = '25vw';

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
            top: { xs: '7vh', sm: '8.8vh' },
            height: { xs: 'calc(100vh - 7vh)', sm: 'calc(100vh - 13vh)' }
          }
        }}
      >
        <Toolbar />
        <Stack spacing={1} sx={{ height: '100%', overflow: 'hidden' }}>
          {/* Секция описания узла */}
          <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            {selected ? (
              <Box>
                <Typography variant="h5" gutterBottom>{selected.title}</Typography>
                {!isEditing && (
                  <>
                    {!!selected.description && (
                      <Typography variant="body2" sx={{ mb: 1, fontSize: '0.875rem' }}>{selected.description}</Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Button variant="outlined" size="small" onClick={startEditing}>Редактировать</Button>
                      <Button variant="outlined" size="small" onClick={() => setSelected(null)}>Закрыть</Button>
                    </Stack>
                  </>
                )}
                {isEditing && (
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <TextField
                      label="Описание"
                      multiline
                      minRows={2}
                      maxRows={3}
                      value={descDraft}
                      onChange={(e) => setDescDraft(e.target.value)}
                    />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="text" size="small" onClick={cancelEditing}>Отмена</Button>
                      <Button variant="contained" size="small" onClick={saveEditing}>Сохранить</Button>
                    </Stack>
                  </Stack>
                )}
                {!!selected.source && (
                  <Stack spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Источники:</Typography>
                    <Chip size="small" label={selected.source} />
                  </Stack>
                )}
                {!!selected.related?.length && (
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Связанные</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {selected.related.map(r => <Chip key={r} size="small" label={r} />)}
                    </Stack>
                  </Stack>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Выберите узел в графе для просмотра деталей
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Секция AI редактора */}
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="subtitle1" gutterBottom>AI редактор</Typography>
            <TextField
              label="Промпт"
              multiline
              minRows={2}
              maxRows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button
                variant="contained"
                size="small"
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
                Переписать
              </Button>
              <Button variant="text" size="small" onClick={() => setPrompt('')}>Очистить</Button>
            </Stack>
          </Box>
        </Stack>
      </Drawer>
      {/* Центральная область: граф */}
      <Box component="main"
            sx={{
              flexGrow: 1,
              height: { xs: 'calc(100vh - 7vh)', sm: 'calc(100vh - 21vh)' },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              px: '2rem', pb: '2rem'
            }}
      >
        <Toolbar />

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <RoadmapGraph graph={graph} onSelect={setSelected} direction="LR" />
        </Box>
      </Box>

    </Box>
  );
}
