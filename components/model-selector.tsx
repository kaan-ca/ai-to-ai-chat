'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AVAILABLE_MODELS = [
  { id: 'x-ai/grok-4.1-fast:free', name: 'Grok 4.1 Fast (free)' },
  { id: 'openai/gpt-oss-120b', name: 'gpt-oss-120b' },
  { id: 'openai/gpt-oss-20b:free', name: 'gpt-oss-20b (free)' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air (free)' },
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2 (free)' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large' },
  { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B' },
];

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
}

export function ModelSelector({ value, onValueChange, label }: ModelSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
