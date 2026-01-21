import { Logo } from './Logo';
import { Menu, Plus, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="h-14 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Logo size="md" />
        <div className="h-6 w-px bg-border hidden sm:block" />
        <span className="text-sm text-muted-foreground hidden sm:block">Gerador de Propostas</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
          <Plus className="w-4 h-4" />
          Nova Proposta
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <History className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
