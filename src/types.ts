export type ResourceType = 'article'|'doc'|'video'|'course'|'exercise'|'book'|'repo';

export interface Resource {
  title: string;
  url?: string | null;
  type: ResourceType;
}

export interface Milestone {
  id: string;
  title: string;
  summary: string;
  topics: string[];
  resources: Resource[];
  estimated_hours: number;
  tags: string[];
}

export type Level = 'beginner'|'intermediate'|'advanced';

export interface Roadmap {
  title: string;
  level: Level;
  total_estimated_hours: number;
  milestones: Milestone[];
  notes?: string | null;
}

export interface RewriteRequest {
  graph: KnowledgeGraph;
  prompt: string;
}

// New types for /roadmap/from-files response
export interface Concept {
  title: string;
  description: string | null;
  related: string[] | null;
  source: string | null;
  consist_of: Concept[] | null;
}

export interface KnowledgeGraph {
  concepts: Concept[];
}