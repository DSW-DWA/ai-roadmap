import * as React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import UploadPage from './pages/UploadPage';
import RoadmapPage from './pages/RoadmapPage.tsx';

export default function App() {
  const nav = useNavigate();
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => nav('/')}>
            AI Roadmap
          </Typography>
          <Button color="inherit" component={Link} to="/upload">Загрузка</Button>
          <Button color="inherit" component={Link} to="/roadmap">Roadmap</Button>
        </Toolbar>
      </AppBar>

      <Toolbar />
      <Container sx={{ mt: 2, mb: 4 }}>
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
