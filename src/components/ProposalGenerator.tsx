import { useState, useRef } from 'react';
import { Upload, FileText, X, Sparkles, ArrowLeft, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  comment: string;
}

interface ProposalGeneratorProps {
  onGenerate: (files: UploadedFile[]) => void;
  onBack: () => void;
  isGenerating?: boolean;
}

type Step = 'upload' | 'comments' | 'generating';

export function ProposalGenerator({ onGenerate, onBack, isGenerating = false }: ProposalGeneratorProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [step, setStep] = useState<Step>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFiles((prev) => [
          ...prev,
          {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            content,
            comment: '',
          },
        ]);
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileComment = (id: string, comment: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, comment } : f))
    );
  };

  const handleContinueToComments = () => {
    if (files.length > 0) {
      setStep('comments');
    }
  };

  const handleGenerate = () => {
    setStep('generating');
    onGenerate(files);
  };

  const handleBackToUpload = () => {
    setStep('upload');
  };

  // Loading screen
  if (step === 'generating' || isGenerating) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-t-primary border-r-primary/50 border-b-primary/20 border-l-primary/50 animate-spin" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Gerando sua proposta...
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            A IA está analisando seus documentos e criando uma proposta comercial profissional.
          </p>

          {/* Progress dots */}
          <div className="flex gap-2 mt-8">
            <span className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  // Comments step
  if (step === 'comments') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              avali<span className="text-primary">AI</span>
            </h1>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
            Gerador de Propostas
          </h2>
          <p className="text-muted-foreground mb-10 text-center">
            Você deseja adicionar algum comentário sobre o documento?
          </p>

          {/* Files with comment inputs */}
          <div className="w-full max-w-2xl space-y-4 mb-10">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 bg-card rounded-xl p-4 border"
              >
                {/* File name */}
                <div className="flex items-center gap-2 min-w-0 flex-shrink-0 max-w-[200px]">
                  <File className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground truncate font-medium">
                    {file.name}
                  </span>
                </div>

                {/* Comment input */}
                <div className="flex-1">
                  <Input
                    value={file.comment}
                    onChange={(e) => updateFileComment(file.id, e.target.value)}
                    placeholder="Adicione um comentário (Opcional)"
                    className="border-primary/30 focus-visible:border-primary bg-background text-sm"
                  />
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBackToUpload}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <Button
              onClick={handleGenerate}
              className="gradient-brand text-primary-foreground hover:opacity-90 px-10 py-6 text-base font-semibold rounded-full shadow-brand transition-all gap-2"
            >
              <Sparkles className="w-5 h-5" />
              GERAR
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Upload step (default)
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            avali<span className="text-primary">AI</span>
          </h1>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
          Gerador de Propostas
        </h2>
        <p className="text-muted-foreground mb-10 text-center">
          Faça upload dos seus arquivos para gerar uma proposta profissional
        </p>

        {/* File Upload Area */}
        <div className="w-full max-w-xl mb-8">
          <div
            className="relative rounded-2xl border-2 border-dashed border-primary/40 bg-accent/30 hover:border-primary/60 hover:bg-accent/50 transition-all cursor-pointer p-8"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.doc,.docx,.pdf,.xlsx,.xls"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  Clique para selecionar arquivos
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou arraste e solte aqui
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Suporta: TXT, MD, DOC, DOCX, PDF, XLSX
              </p>
            </div>
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-foreground mb-3">
                Arquivos selecionados ({files.length})
              </p>
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground truncate max-w-[250px]">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Menu
          </Button>

          <Button
            onClick={handleContinueToComments}
            disabled={files.length === 0}
            className="gradient-brand text-primary-foreground hover:opacity-90 px-10 py-6 text-base font-semibold rounded-full shadow-brand transition-all disabled:opacity-50"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
