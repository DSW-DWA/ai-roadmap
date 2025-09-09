import axios from 'axios';
import type { Roadmap, RewriteRequest, KnowledgeGraph } from './types.ts';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000',
  timeout: 20000
});

export async function uploadFiles(files: File[]): Promise<KnowledgeGraph> {
  const form = new FormData();
  files.forEach(f => form.append('files', f));
  const { data } = await api.post<KnowledgeGraph>('/roadmap/from-files', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function rewriteRoadmap(req: RewriteRequest): Promise<Roadmap> {
  const { data } = await api.post<Roadmap>('/roadmap/rewrite', req);
  return data;
}
