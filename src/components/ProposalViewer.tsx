import { Copy, FileText, Share2, FileDown, ChevronDown, Eye, Save } from 'lucide-react';
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
  DialogTitle,
} from '@/components/ui/dialog';
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});



interface ProposalViewerProps {
  proposal: string;
  title: string;
  date: string;
  client: string;
  themeColor: string;
  proposalId: string;
  onUpdateProposal?: (newProposal: string) => void;
}

export function ProposalViewer({ proposal, title, date, client, themeColor, proposalId, onUpdateProposal }: ProposalViewerProps) {
  console.log("DEBUG - ID da Proposta no Viewer:", proposalId);
  
  const [editedProposal, setEditedProposal] = useState(() => md.render(proposal || ''));
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
  setEditedProposal(md.render(proposal || ''));
}, [proposal]);

  useEffect(() => {
    let isMounted = true;
    const generatePreview = async () => {
      const url = await getProposalPDFDataUrl(editedProposal, { title, client, date, themeColor });
      if (isMounted) setPreviewUrl(url);
    };
    const timer = setTimeout(generatePreview, 100);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [editedProposal, title, client, date, themeColor]);

  const handleCopyContent = async () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editedProposal;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    await navigator.clipboard.writeText(plainText);
    toast({ title: 'Copiado!', description: 'Conteúdo copiado.' });
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownload = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadProposalPDF(editedProposal, { title, client, date, themeColor });
      toast({ title: 'Sucesso!', description: 'PDF baixado.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao gerar PDF.', variant: 'destructive' });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleEditorChange = (content: string) => {
    setEditedProposal(content);
    onUpdateProposal?.(content);
  };

 //
const handleSaveNewVersion = async () => {
  if (!proposalId) {
    toast({ 
      title: 'Erro', 
      description: 'ID da proposta não encontrado.', 
      variant: 'destructive' 
    });
    return;
  }

  const payload = {
    companyName: client,    
    brandColor: themeColor, 
    answers: {},          
    files: [],             
    new_content: editedProposal 
  };

  console.log("📤 Trying to save new version for ID:", proposalId);

  try {
    const response = await fetch(`http://localhost:8000/api/update-proposal/${proposalId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload),
    });

    toast({ 
      title: 'Sucesso!', 
      description: 'Nova versão salva com sucesso no histórico.' 
    });

    if (onUpdateProposal) {
      onUpdateProposal(editedProposal);
    }

  } catch (error: any) {
    console.error("Erro detalhado no handleSaveNewVersion:", error);
    toast({ 
      title: 'Falha ao atualizar', 
      description: error.message || 'Erro de conexão com o servidor', 
      variant: 'destructive' 
    });
  }
};

useEffect(() => {
    const hadleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSaveNewVersion();
      }
    };
    window.addEventListener('keydown', hadleKeyDown);
    return () => {      window.removeEventListener('keydown', hadleKeyDown);
    };
  }, [editedProposal, proposalId]);

useEffect(() => {
    const hadleKeyEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPdfPreview) {
        setShowPdfPreview(false);
      }
    };
    window.addEventListener('keydown', hadleKeyEsc);
    return () => {
      window.removeEventListener('keydown', hadleKeyEsc);
    };
  }, [showPdfPreview]);

  return (
    <div className="flex flex-col h-full bg-background">
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
          <Button variant="outline" size="sm" onClick={() => setShowPdfPreview(true)} className="gap-2">
            <Eye className="w-4 h-4" /> Visualizar PDF
          </Button>
          {/*<DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" /> Ações <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyContent} className="gap-2 cursor-pointer"><Copy className="w-4 h-4" /> Copiar texto</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} className="gap-2 cursor-pointer"><FileDown className="w-4 h-4" /> Baixar PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
          <Button variant="outline" size="sm" onClick={handleSaveNewVersion} className="gap-2 border-orange-500 text-orange-500 hover:bg-orange-50">
            <Save className="w-4 h-4" /> Salvar Versão Atual
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4 md:p-8">
        <div className="h-full max-w-4xl mx-auto">
          <RichTextEditor content={editedProposal} onChange={handleEditorChange} />
        </div>
      </div>

      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 [&>button]:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Preview do PDF
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPdfPreview(false)}>Fechar</Button>
              <Button onClick={handleDownload} className="gap-2 bg-primary hover:bg-primary/90">
                <FileDown className="w-4 h-4" /> Baixar PDF
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-muted/30 p-4 overflow-hidden">
            <iframe src={previewUrl} className="w-full h-full rounded-lg shadow-lg bg-white" title="Preview" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}