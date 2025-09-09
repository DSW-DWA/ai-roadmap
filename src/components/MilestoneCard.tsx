import type { Milestone } from '../types';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Chip, Stack, Typography, List, ListItem, ListItemIcon, ListItemText, Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';

export default function MilestoneCard({ m }: { m: Milestone }) {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ flexGrow: 1 }}>{m.title}</Typography>
        <Typography sx={{ mr: 2 }}>~{m.estimated_hours} ч</Typography>
        <Stack direction="row" spacing={1}>
          {m.tags?.map(t => <Chip key={t} size="small" label={t} />)}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" sx={{ mb: 1 }}>{m.summary}</Typography>

        {!!m.topics?.length && (
          <>
            <Typography variant="subtitle2">Темы</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
              {m.topics.map(t => <Chip key={t} label={t} size="small" />)}
            </Stack>
          </>
        )}

        {!!m.resources?.length && (
          <>
            <Typography variant="subtitle2">Ресурсы</Typography>
            <List dense>
              {m.resources.map((r, i) => (
                <ListItem key={i} secondaryAction={
                  r.url ? <Link href={r.url} target="_blank" rel="noreferrer">Открыть</Link> : null
                }>
                  <ListItemIcon><LinkIcon /></ListItemIcon>
                  <ListItemText primary={r.title} secondary={r.type} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
