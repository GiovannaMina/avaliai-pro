import { FilePlus, Archive, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';

interface ProposalHubProps {
  onNewProposal: () => void;
  onMyProposals: () => void;
  onBack: () => void;
}

export function ProposalHub({ onNewProposal, onMyProposals, onBack }: ProposalHubProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-1 text-center">
          Gerador de Propostas
        </h2>
        <p className="text-muted-foreground mb-10 text-center text-sm">
          O que deseja fazer?
        </p>

        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
          {/* New proposal */}
          <button
            onClick={onNewProposal}
            className="group flex-1 flex flex-col items-center gap-4 rounded-2xl border-2 border-primary/30 bg-card p-8 transition-all hover:border-primary hover:shadow-brand cursor-pointer"
          >
            <div className="p-4 rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <FilePlus className="w-8 h-8" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-semibold text-foreground">
                Nova proposta
              </span>
              <span className="block text-xs text-muted-foreground mt-1">
                Crie uma proposta comercial do zero
              </span>
            </div>
          </button>

          {/* My proposals */}
          <button
            onClick={onMyProposals}
            className="group flex-1 flex flex-col items-center gap-4 rounded-2xl border-2 border-primary/30 bg-card p-8 transition-all hover:border-primary hover:shadow-brand cursor-pointer"
          >
            <div className="p-4 rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <Archive className="w-8 h-8" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-semibold text-foreground">
                Minhas propostas
              </span>
              <span className="block text-xs text-muted-foreground mt-1">
                Acesse propostas salvas anteriormente
              </span>
            </div>
          </button>
        </div>

        <button
          onClick={onBack}
          className="mt-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Menu
        </button>
      </main>
    </div>
  );
}
