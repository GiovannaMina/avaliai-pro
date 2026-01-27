import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface ColorPickerPopoverProps {
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#f97316', '#ef4444', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#000000',
  '#f59e0b', '#dc2626', '#84cc16', '#10b981', '#06b6d4',
  '#6366f1', '#a855f7', '#f43f5e', '#374151', '#ffffff',
];

export function ColorPickerPopover({ value, onChange }: ColorPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-primary/30 hover:border-primary"
        >
          <div
            className="w-5 h-5 rounded border border-input"
            style={{ backgroundColor: value }}
          />
          <Palette className="w-4 h-4 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-white border shadow-lg z-50" align="start">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Selecione uma cor</p>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                  value === color ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="pt-2 border-t">
            <label className="text-xs text-muted-foreground mb-1 block">
              Cor personalizada
            </label>
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
