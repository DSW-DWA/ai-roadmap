/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useRoadmap } from '../state';
import { useNavigate } from 'react-router-dom';
import {
  Box, Drawer, Toolbar,
  Chip, Typography, LinearProgress, Divider, Stack, Button
} from '@mui/material';
import RoadmapGraph from '../components/RoadmapGraph';
import type { Concept } from '../types';

const rightWidth = 380;

export default function RoadmapPage() {
  const { graph } = useRoadmap();
  const nav = useNavigate();
  const [selected, setSelected] = useState<Concept | null>(null);
  const [loading] = useState(false);

  useEffect(() => { if (!graph) nav('/upload'); }, [graph, nav]);
  if (!graph) return null;

  return (
    <Box sx={{ display: 'flex' }}>
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
            {!!selected.description && (
              <Typography variant="body2" sx={{ mb: 1 }}>{selected.description}</Typography>
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
