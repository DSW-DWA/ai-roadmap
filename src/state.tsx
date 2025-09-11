import React, { createContext, useContext, useState } from 'react';
import type { KnowledgeGraph } from './types';

type Ctx = {
  graph: KnowledgeGraph | null;
  setGraph: (g: KnowledgeGraph | null) => void;
  originalFiles: File[];
  setOriginalFiles: (files: File[]) => void;
};

const RoadmapCtx = createContext<Ctx>({ 
  graph: null, 
  setGraph: () => {}, 
  originalFiles: [], 
  setOriginalFiles: () => {} 
});

export const RoadmapProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  return <RoadmapCtx.Provider value={{ graph, setGraph, originalFiles, setOriginalFiles }}>{children}</RoadmapCtx.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRoadmap = () => useContext(RoadmapCtx);
