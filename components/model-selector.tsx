'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AVAILABLE_MODELS } from '@/lib/models';

// Re-export for backwards compatibility
export { AVAILABLE_MODELS } from '@/lib/models';

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
