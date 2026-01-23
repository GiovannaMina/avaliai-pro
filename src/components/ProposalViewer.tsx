import { Copy, Download, FileText, Check, Share2, Pencil, FileDown, Link, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/RichTextEditor';
import { downloadProposalPDF, getProposalPDFDataUrl } from '@/utils/pdfGenerator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProposalViewerProps {
  proposal: string;
  title: string;
  date: string;
  client: string;
  onUpdateProposal?: (newProposal: string) => void;
}

export function ProposalViewer({ proposal, title, date, client, onUpdateProposal }: ProposalViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProposal, setEditedProposal] = useState(proposal);

  // Update editedProposal when proposal changes externally
  useEffect(() => {
    setEditedProposal(proposal);
  }, [proposal]);

  // Generate PDF URL for preview - updates in real-time during editing
  const pdfUrl = useMemo(() => {
    const content = isEditing ? editedProposal : proposal;
    return getProposalPDFDataUrl(content, { title, client, date });
  }, [isEditing ? editedProposal : proposal, title, client, date, isEditing]);

  const handleCopyLink = async () => {
    const shareUrl = window.location.href;
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copiado!', description: 'O link foi copiado para a área de transferência.' });
  };

  const handleDownload = () => {
    const content = isEditing ? editedProposal : proposal;
    downloadProposalPDF(content, { title, client, date });
    toast({ title: 'PDF baixado!', description: 'A proposta foi baixada em formato PDF.' });
  };

  const handleSaveEdit = () => {
    onUpdateProposal?.(editedProposal);
    setIsEditing(false);
    toast({ title: 'Proposta atualizada!', description: 'Suas alterações foram salvas.' });
  };

  const handleCancelEdit = () => {
    setEditedProposal(proposal);
    setIsEditing(false);
  };

  const handleEditorChange = (content: string) => {
    setEditedProposal(content);
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
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="gap-2"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="gap-2 gradient-brand text-primary-foreground hover:opacity-90"
              >
                <Check className="w-4 h-4" />
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Pencil className="w-4 h-4" />
                Editar
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
                  <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
                    <Link className="w-4 h-4" />
                    Copiar link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload} className="gap-2 cursor-pointer">
                    <FileDown className="w-4 h-4" />
                    Baixar PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8 scrollbar-thin">
        {isEditing ? (
          /* Full-width editor - Google Docs style */
          <div className="h-full max-w-4xl mx-auto">
            <RichTextEditor
              content={editedProposal}
              onChange={handleEditorChange}
            />
          </div>
        ) : (
          /* PDF View */
          <div className="h-full w-full max-w-4xl mx-auto">
            <iframe
              src={pdfUrl}
              className="w-full h-full min-h-[700px] rounded-xl border shadow-card bg-card"
              title="Visualização da Proposta em PDF"
            />
          </div>
        )}
      </div>
    </div>
  );
}
