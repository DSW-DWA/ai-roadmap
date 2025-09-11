import axios from 'axios';
import type { RewriteRequest, KnowledgeGraph } from './types.ts';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000',
  timeout: 0
});

export async function uploadFiles(files: File[]): Promise<KnowledgeGraph> {
  const form = new FormData();
  files.forEach(f => form.append('files', f));
  const { data } = await api.post<KnowledgeGraph>('/roadmap/from-files', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function rewriteRoadmap(req: RewriteRequest): Promise<KnowledgeGraph> {
  const form = new FormData();
  
  // Добавляем все данные в FormData
  req.files.forEach(f => form.append('files', f));
  form.append('knowledge_map', JSON.stringify(req.graph));
  form.append('user_query', req.prompt);
  
  // Логируем содержимое для отладки
  console.log('Sending rewrite request:', {
    filesCount: req.files.length,
    graphConceptsCount: req.graph.concepts.length,
    prompt: req.prompt,
    graphKeys: Object.keys(req.graph)
  });
  
  // Логируем содержимое FormData
  console.log('FormData contents:');
  for (const [key, value] of form.entries()) {
    console.log(`${key}:`, value);
  }
  
  const { data } = await api.post<KnowledgeGraph>('/roadmap/rewrite', form, {
    headers: { 
      'Accept': 'application/json'
    }
  });
  return data;
}
