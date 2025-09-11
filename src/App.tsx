import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import UploadPage from './pages/UploadPage';
import RoadmapPage from './pages/RoadmapPage.tsx';
import { useRoadmap } from './state';

export default function App() {
  const nav = useNavigate();
  const location = useLocation();
  const { graph } = useRoadmap();
  
  const handleDownloadGraph = () => {
    if (!graph) return;
    const json = JSON.stringify(graph, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fname = `concepts-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => nav('/')}>
            AI Concepts
          </Typography>
          <Button color="inherit" component={Link} to="/upload">Upload Files</Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
          <Button color="inherit" component={Link} to="/roadmap">View Graph</Button>
          {location.pathname === '/roadmap' && graph && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Button color="inherit" onClick={handleDownloadGraph}>Export JSON Graph</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Toolbar />
      <Container maxWidth={false} sx={{ mt: 2, mb: 4}}>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="*" element={<UploadPage />} />
        </Routes>
      </Container>
    </>
  );
}
