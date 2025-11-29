import modelsConfig from '@/models.json';

export interface Model {
  id: string;
  name: string;
}

export const AVAILABLE_MODELS: Model[] = modelsConfig.models;

export function getModelName(id: string): string {
  return AVAILABLE_MODELS.find(m => m.id === id)?.name || id;
}
