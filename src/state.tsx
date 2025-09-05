import React, { createContext, useContext, useState } from 'react';
import type { Roadmap } from './types';

type Ctx = {
  roadmap: Roadmap | null;
  setRoadmap: (r: Roadmap | null) => void;
};

const RoadmapCtx = createContext<Ctx>({ roadmap: null, setRoadmap: () => {} });

export const RoadmapProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  return <RoadmapCtx.Provider value={{ roadmap, setRoadmap }}>{children}</RoadmapCtx.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRoadmap = () => useContext(RoadmapCtx);
