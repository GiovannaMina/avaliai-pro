import { useState, useRef } from 'react';
import { Upload, FileText, Plus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
}

interface ProposalGeneratorProps {
  onGenerate: (prompt: string, files: UploadedFile[]) => void;
  isGenerating?: boolean;
}

export function ProposalGenerator({ onGenerate, isGenerating = false }: ProposalGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
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
          },
        ]);
      };
      reader.readAsText(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleGenerate = () => {
    if (prompt.trim() || files.length > 0) {
      onGenerate(prompt, files);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight">
          avali<span className="text-primary">AI</span>
        </h1>
      </div>

      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
        Gerador de Propostas
      </h2>

      {/* Prompt Area */}
      <div className="w-full max-w-2xl mb-6">
        <div className="relative rounded-2xl border-2 border-primary/60 bg-card shadow-soft overflow-hidden transition-all focus-within:border-primary focus-within:shadow-brand">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Insira o prompt aqui"
            className="min-h-[140px] border-0 resize-none text-base focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-5 py-4"
          />
        </div>
      </div>

      {/* File Upload Area */}
      <div className="w-full max-w-xl mb-8">
        <div
          className="relative rounded-full border-2 border-secondary/40 bg-card hover:border-secondary/60 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.doc,.docx"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 py-3.5 px-6">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {files.length > 0 
                ? `${files.length} arquivo${files.length > 1 ? 's' : ''} selecionado${files.length > 1 ? 's' : ''}`
                : 'Insira os arquivos aqui'
              }
            </span>
          </div>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 bg-accent rounded-full px-3 py-1.5 text-sm"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span className="text-accent-foreground truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-0.5 hover:bg-primary/10 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={(!prompt.trim() && files.length === 0) || isGenerating}
        className="gradient-brand text-primary-foreground hover:opacity-90 px-12 py-6 text-base font-semibold rounded-full shadow-brand transition-all disabled:opacity-50"
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
            Gerando...
          </div>
        ) : (
          'GERAR'
        )}
      </Button>
    </div>
  );
}
