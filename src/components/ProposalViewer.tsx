import { Copy, Download, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ProposalViewerProps {
  proposal: string;
  title: string;
  date: string;
  client: string;
}

export function ProposalViewer({ proposal, title, date, client }: ProposalViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([proposal], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposta-${client.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <FileText className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{client} • {date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="gap-2 gradient-brand text-primary-foreground hover:opacity-90"
          >
            <Download className="w-4 h-4" />
            Baixar
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto p-8 scrollbar-thin">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-xl p-8 shadow-card border">
            <div className="prose-proposal whitespace-pre-wrap">
              {proposal.split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <h1 key={i} className="text-2xl font-bold mb-4 text-foreground">{line.replace('# ', '')}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-semibold mb-3 mt-6 text-foreground">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="text-lg font-medium mb-2 mt-4 text-foreground">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('- ')) {
                  return <li key={i} className="ml-4 mb-1 text-muted-foreground">{line.replace('- ', '')}</li>;
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={i} className="font-semibold mb-2 text-foreground">{line.replace(/\*\*/g, '')}</p>;
                }
                if (line.trim() === '') {
                  return <div key={i} className="h-3" />;
                }
                return <p key={i} className="mb-2 text-muted-foreground leading-relaxed">{line}</p>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
