import { Logo } from './Logo';
import { ArrowLeft, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onBackToGenerator?: () => void;
  showBackButton?: boolean;
}

export function Header({ onBackToGenerator, showBackButton }: HeaderProps) {
  return (
    <header className="h-14 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {showBackButton && onBackToGenerator && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackToGenerator}
            className="mr-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Logo size="md" />
        <div className="h-6 w-px bg-border hidden sm:block" />
        <span className="text-sm text-muted-foreground hidden sm:block">Gerador de Propostas</span>
      </div>

      <div className="flex items-center gap-2">
        {showBackButton && onBackToGenerator && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 hidden sm:flex"
            onClick={onBackToGenerator}
          >
            Nova Proposta
          </Button>
        )}
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
