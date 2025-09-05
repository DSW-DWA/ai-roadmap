import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RoadmapProvider } from './state.tsx';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoadmapProvider>
        <App />
      </RoadmapProvider>
    </BrowserRouter>
  </React.StrictMode>
);
