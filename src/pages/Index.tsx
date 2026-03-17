import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProposalViewer } from '@/components/ProposalViewer';
import { ProposalGenerator } from '@/components/ProposalGenerator';
import { ChatPanel } from '@/components/ChatPanel';
import { Dashboard } from '@/pages/Dashboard';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { sampleProposal } from '@/data/sampleProposal';

type Screen = 'dashboard' | 'generator' | 'viewer';

interface GeneratePayload {
  files: any[];
  companyName: string;
  brandColor: string;
  answers: Record<string, string>;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [proposal, setProposal] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeColor, setActiveColor] = useState('#f97316');
  const [metadata, setMetadata] = useState({
    title: 'Proposta Comercial',
    client: '',
    date: new Date().toLocaleDateString('pt-BR'),
  });

  const handleUpdateProposal = (newProposal: string) => {
    setProposal(newProposal);
  };

const handleGenerate = async (
      files: any[], 
      meta: { companyName: string; brandColor: string; answers: Record<string, string> }
  ) => { 
    setIsGenerating(true);
    setActiveColor(meta.brandColor);

    // Simulate generation delay for prototype
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Build a mock proposal using the sample as base, replacing client name
      const mockProposal = sampleProposal.replace(/Instituto Porto Seguro/g, meta.companyName);
      
      setProposal(mockProposal);
      setProposalId(`mock-${Date.now()}`);
      setMetadata({
        title: 'Proposta Comercial',
        client: meta.companyName,
        date: new Date().toLocaleDateString('pt-BR'),
      });
      setCurrentScreen('viewer');
      
      toast({
        title: 'Proposta gerada com sucesso!',
        description: `${files.length} arquivo(s) processados.`,
      });
    } catch (error) {
      console.error('Erro ao gerar proposta:', error);
      toast({
        title: 'Erro ao gerar proposta',
        description: 'Erro inesperado ao gerar proposta.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNavigateToModule = (moduleId: string) => {
    if (moduleId === 'proposal-generator') {
      setCurrentScreen('generator');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
    setProposal(null);
  };

  const handleBackToGenerator = () => {
    setCurrentScreen('generator');
    setProposal(null);
  };

  if (currentScreen === 'dashboard') {
    return <Dashboard onNavigateToModule={handleNavigateToModule} />;
  }

  if (currentScreen === 'generator') {
    return (
      <ProposalGenerator
        onGenerate={handleGenerate}
        onBack={handleBackToDashboard}
        isGenerating={isGenerating}
      />
    );
  }

  return (
    <div className="h-screen bg-muted/30 flex flex-col overflow-hidden">
      <Header onBackToGenerator={handleBackToGenerator} showBackButton />

      <div className="flex-1 flex relative overflow-hidden">
        <div
          className={`flex-1 h-full transition-all duration-300 ${
            isChatOpen ? 'lg:mr-[380px]' : ''
          }`}
        >
          <ProposalViewer
            proposal={proposal || ''}
            title={metadata.title}
            date={metadata.date}
            client={metadata.client}
            themeColor={activeColor}
            proposalId={proposalId || ''} 
            onUpdateProposal={handleUpdateProposal}
          />
        </div>

        <div
          className={`hidden lg:flex fixed right-0 top-14 bottom-0 w-[380px] transition-transform duration-300 ${
            isChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <ChatPanel onUpdateProposal={handleUpdateProposal} />
        </div>

        {isChatOpen && (
          <div className="lg:hidden fixed inset-0 top-14 z-40 bg-background">
            <ChatPanel onUpdateProposal={handleUpdateProposal} />
          </div>
        )}

        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          size="icon"
          className={`fixed z-50 transition-all duration-300 ${
            isChatOpen
              ? 'bottom-4 right-[396px] bg-secondary hover:bg-secondary/90'
              : 'bottom-4 right-4 gradient-brand hover:opacity-90'
          }`}
        >
          {isChatOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Index;