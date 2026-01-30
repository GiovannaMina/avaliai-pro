import { Copy, FileText, Share2, FileDown, ChevronDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/RichTextEditor';
import { downloadProposalPDF, getProposalPDFDataUrl } from '@/utils/pdfGenerator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProposalViewerProps {
  proposal: string;
  title: string;
  date: string;
  client: string;
  onUpdateProposal?: (newProposal: string) => void;
}

export function ProposalViewer({ proposal, title, date, client, onUpdateProposal }: ProposalViewerProps) {
  const [editedProposal, setEditedProposal] = useState(proposal);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Update editedProposal when proposal changes externally
  useEffect(() => {
    setEditedProposal(proposal);
  }, [proposal]);

  const handleCopyContent = async () => {
    // Remove HTML tags to get plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editedProposal;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    await navigator.clipboard.writeText(plainText);
    toast({ title: 'Proposta copiada!', description: 'O conteúdo foi copiado para a área de transferência.' });
  };

  const [pdfUrl, setPdfUrl] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownload = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadProposalPDF(editedProposal, { title, client, date });
      toast({ title: 'PDF baixado!', description: 'A proposta foi baixada em formato PDF.' });
    } catch (error) {
      toast({ title: 'Erro ao gerar PDF', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePreviewPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const url = await getProposalPDFDataUrl(editedProposal, { title, client, date });
      setPdfUrl(url);
      setShowPdfPreview(true);
    } catch (error) {
      toast({ title: 'Erro ao gerar preview', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleEditorChange = (content: string) => {
    setEditedProposal(content);
    onUpdateProposal?.(content);
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
          {/* Preview PDF Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviewPdf}
            disabled={isGeneratingPdf}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            {isGeneratingPdf ? 'Gerando...' : 'Visualizar PDF'}
          </Button>

          {/* Share Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleCopyContent} className="gap-2 cursor-pointer">
                <Copy className="w-4 h-4" />
                Copiar conteúdo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} className="gap-2 cursor-pointer">
                <FileDown className="w-4 h-4" />
                Baixar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Document Editor - Full Screen WYSIWYG */}
      <div className="flex-1 overflow-hidden p-4 md:p-8">
        <div className="h-full max-w-4xl mx-auto">
          <RichTextEditor
            content={editedProposal}
            onChange={handleEditorChange}
          />
        </div>
      </div>

      {/* PDF Preview Modal */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-primary" />
              Preview do PDF
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-lg border"
              title="Preview do PDF"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPdfPreview(false)}>
              Fechar
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={isGeneratingPdf}
              className="gap-2 gradient-brand text-primary-foreground hover:opacity-90"
            >
              <FileDown className="w-4 h-4" />
              {isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
