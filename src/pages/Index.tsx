import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProposalViewer } from '@/components/ProposalViewer';
import { ProposalGenerator } from '@/components/ProposalGenerator';
import { ChatPanel } from '@/components/ChatPanel';
import { Dashboard } from '@/pages/Dashboard';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  comment: string;
}

type Screen = 'dashboard' | 'generator' | 'viewer';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [proposal, setProposal] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [metadata, setMetadata] = useState({
    title: 'Proposta Comercial',
    client: '',
    date: new Date().toLocaleDateString('pt-BR'),
  });

  const handleUpdateProposal = (newProposal: string) => {
    setProposal(newProposal);
  };

  const handleGenerate = (files: UploadedFile[]) => {
    setIsGenerating(true);
    
    // Simulate AI generation delay - in the future, this will call the AI
    setTimeout(() => {
      // Placeholder: AI will generate the proposal based on files
      // For now, just pass empty content - the real AI will populate this
      const generatedContent = '';
      
      setProposal(generatedContent);
      setMetadata({
        title: 'Proposta Comercial',
        client: '',
        date: new Date().toLocaleDateString('pt-BR'),
      });
      setIsGenerating(false);
      setCurrentScreen('viewer');
    }, 2000);
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

  // Dashboard screen
  if (currentScreen === 'dashboard') {
    return <Dashboard onNavigateToModule={handleNavigateToModule} />;
  }

  // Generator screen
  if (currentScreen === 'generator') {
    return (
      <ProposalGenerator 
        onGenerate={handleGenerate} 
        onBack={handleBackToDashboard}
        isGenerating={isGenerating} 
      />
    );
  }

  // Proposal viewer screen
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header onBackToGenerator={handleBackToGenerator} showBackButton />
      
      <div className="flex-1 flex relative">
        {/* Main Content - Proposal Viewer */}
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'lg:mr-[380px]' : ''}`}>
          <ProposalViewer
            proposal={proposal || ''}
            title={metadata.title}
            date={metadata.date}
            client={metadata.client}
            onUpdateProposal={handleUpdateProposal}
          />
        </div>

        {/* Chat Panel - Desktop */}
        <div
          className={`hidden lg:flex fixed right-0 top-14 bottom-0 w-[380px] transition-transform duration-300 ${
            isChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <ChatPanel onUpdateProposal={handleUpdateProposal} />
        </div>

        {/* Chat Panel - Mobile */}
        {isChatOpen && (
          <div className="lg:hidden fixed inset-0 top-14 z-40 bg-background">
            <ChatPanel onUpdateProposal={handleUpdateProposal} />
          </div>
        )}

        {/* Toggle Chat Button */}
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          size="icon"
          className={`fixed z-50 shadow-brand transition-all duration-300 ${
            isChatOpen 
              ? 'bottom-4 right-[396px] lg:right-[396px] bg-secondary hover:bg-secondary/90' 
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
