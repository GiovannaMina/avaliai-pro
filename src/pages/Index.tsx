import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProposalViewer } from '@/components/ProposalViewer';
import { ChatPanel } from '@/components/ChatPanel';
import { sampleProposal, proposalMetadata } from '@/data/sampleProposal';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [proposal, setProposal] = useState(sampleProposal);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const handleUpdateProposal = (newProposal: string) => {
    setProposal(newProposal);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      
      <div className="flex-1 flex relative">
        {/* Main Content - Proposal Viewer */}
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'lg:mr-[380px]' : ''}`}>
          <ProposalViewer
            proposal={proposal}
            title={proposalMetadata.title}
            date={proposalMetadata.date}
            client={proposalMetadata.client}
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
