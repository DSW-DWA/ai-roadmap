/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRoadmap } from '../state';
import { rewriteRoadmap } from '../api';
import { useNavigate } from 'react-router-dom';
import {
  Box, Drawer, Toolbar, TextField, Button, Stack, Card, CardContent,
  Chip, Typography, LinearProgress, Divider
} from '@mui/material';
import RoadmapGraph from '../components/RoadmapGraph';
import type { Milestone } from '../types';

const leftWidth = 360;
const rightWidth = 380;

export default function RoadmapPage() {
  const { roadmap, setRoadmap } = useRoadmap();
  const nav = useNavigate();
  const [prompt, setPrompt] = useState(
    'Сделай план для начинающего, фокус на Postgres и уложи до 20 часов. Добавь ресурсы'
  );
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Milestone | null>(null);

  useEffect(() => { if (!roadmap) nav('/upload'); }, [roadmap, nav]);
  if (!roadmap) return null;

  const levelColor =
    roadmap.level === 'beginner' ? 'primary'
    : roadmap.level === 'intermediate' ? 'info'
    : 'warning';

  async function applyPrompt() {
    if (!roadmap) return;
    setLoading(true);
    try {
      const updated = await rewriteRoadmap({ roadmap, prompt });
      setRoadmap(updated);
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Ошибка переписывания');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Левая панель: промпты */}
      <Drawer variant="permanent" open
        sx={{
          width: leftWidth, flexShrink: 0,
          '& .MuiDrawer-paper': { width: leftWidth, boxSizing: 'border-box', p: 2, top: { xs: 56, sm: 64 }, height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' } }
        }}>
        <Toolbar />
        <Stack spacing={2}>
          <Typography variant="h6">Промпт</Typography>
          <TextField
            label="Инструкция"
            multiline minRows={8}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
          <Button variant="contained" onClick={applyPrompt} disabled={loading}>Применить</Button>
          <Typography variant="subtitle2">Быстрые подсказки</Typography>
          <Stack spacing={1}>
            <Button variant="outlined" onClick={() =>
              setPrompt('Сделай план для начинающего, фокус на Postgres и уложи до 20 часов. Добавь ресурсы')
            }>Beginner + Postgres ≤20ч</Button>
            <Button variant="outlined" onClick={() =>
              setPrompt('Сделай акцент на аналитике/BI. за 4 недели')
            }>Акцент BI, 4 недели</Button>
            <Button variant="outlined" onClick={() =>
              setPrompt('Продвинутый уровень, убери транзакции')
            }>Advanced, без транзакций</Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* Центральная область: граф */}
      <Box component="main"
            sx={{
              flexGrow: 1,
              // высота видимой области под фикс-хедером (56px на xs, 64px на sm+)
              height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              px: 3, pb: 3
            }}
      >
        <Toolbar />
        <Card sx={{ mb: 1 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>{roadmap.title}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip color={levelColor as any} label={`Уровень: ${roadmap.level}`} />
              <Chip label={`Всего часов: ${roadmap.total_estimated_hours}`} />
            </Stack>
          </CardContent>
        </Card>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <RoadmapGraph roadmap={roadmap} onSelect={setSelected} direction="LR" />
        </Box>
      </Box>

      {/* Правая панель: детали по выбранному узлу */}
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
            <Typography variant="body2" sx={{ mb: 1 }}>{selected.summary}</Typography>
            <Chip size="small" label={`~${selected.estimated_hours} ч`} />
            <Divider sx={{ my: 2 }} />
            {!!selected.topics?.length && (
              <>
                <Typography variant="subtitle2">Темы</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                  {selected.topics.map(t => <Chip key={t} label={t} size="small" />)}
                </Stack>
              </>
            )}
            {!!selected.resources?.length && (
              <>
                <Typography variant="subtitle2">Ресурсы</Typography>
                <Stack spacing={1}>
                  {selected.resources.map((r, i) => (
                    <Button key={i} href={r.url || '#'} target="_blank" rel="noreferrer">
                      {r.title}
                    </Button>
                  ))}
                </Stack>
              </>
            )}
            <Divider sx={{ my: 2 }} />
            <Button variant="outlined" onClick={() => setSelected(null)}>Закрыть</Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
