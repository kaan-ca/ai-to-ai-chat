'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AVAILABLE_MODELS } from '@/lib/models';

// Re-export for backwards compatibility
export { AVAILABLE_MODELS } from '@/lib/models';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#ef4444', // red
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
];

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  color?: string;
  onColorChange?: (color: string) => void;
}

export function ModelSelector({ value, onValueChange, label, color = '#3b82f6', onColorChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-full cursor-pointer border border-input shadow-sm flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
              style={{ backgroundColor: color }}
              title="Change color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start" side="left">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Pick a color</span>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${
                      color === presetColor ? 'border-foreground' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => {
                      onColorChange?.(presetColor);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange?.(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs text-muted-foreground">Custom</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
    </div>
  );
}
