import { useState, useRef } from 'react';
import { Upload, FileText, X, Sparkles, ArrowLeft, Trash2, Plus, FileImage, File, FileIcon, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ColorPickerPopover } from '@/components/ColorPickerPopover';
import { ContextQuestionnaire, CONTEXT_QUESTIONS } from '@/components/ContextQuestionnaire';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  comment: string;
  type?: 'reference' | 'input';
  fileType?: string;
  originalFile: File;
}

interface PendingFile {
  name: string;
  content: string;
  fileType: string;
  originalFile: File;
}

interface ProposalGeneratorProps {
  onGenerate: (files: UploadedFile[], metadata: { companyName: string; brandColor: string; answers: Record<string, string> }) => void;
  onBack: () => void;
  isGenerating?: boolean;
}

export function ProposalGenerator({ onGenerate, onBack, isGenerating = false }: ProposalGeneratorProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);
  
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const [lastSelectedType, setLastSelectedType] = useState<'reference' | 'input'>('reference');

  const [selectedType, setSelectedType] = useState<'reference' | 'input' | ''>('');
  const [companyName, setCompanyName] = useState('');
  const [brandColor, setBrandColor] = useState('#f97316');
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const areRequiredAnswersFilled = CONTEXT_QUESTIONS
    .filter((q) => q.required)
    .every((q) => (answers[q.id] || '').trim() !== '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;
    
    processFiles(Array.from(uploadedFiles));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = (filesList: File[]) => {
    filesList.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        
        setPendingFiles((prev) => [...prev, {
          name: file.name,
          content,
          fileType: file.type || 'unknown',
          originalFile: file,
        }]);
        setSelectedType(lastSelectedType);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      processFiles(Array.from(droppedFiles));
    }
  };

  const handleConfirmFile = () => {
    if (pendingFiles.length === 0 || !selectedType) return;

    const currentFile = pendingFiles[0];

    setFiles((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        name: currentFile.name,
        content: currentFile.content,
        comment: '',
        type: selectedType as 'reference' | 'input',
        fileType: currentFile.fileType,
        originalFile: currentFile.originalFile, 
      },
    ]);
    
    setPendingFiles((prev) => prev.slice(1));
    setSelectedType(lastSelectedType);
  };

  const handleCancelPending = () => {
    setPendingFiles((prev) => prev.slice(1));
    setSelectedType(lastSelectedType);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const changeFileType = (id: string, newType: 'reference' | 'input') => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, type: newType } : f))
    );
  };

  const handleGenerate = () => {
    if (!areRequiredAnswersFilled) {
      setShowValidation(true);
      return;
    }
    if (files.length > 0 && companyName.trim()) {
      const answersWithLabels: Record<string, string> = {};
      CONTEXT_QUESTIONS.forEach((q) => {
        if (answers[q.id]?.trim()) {
          answersWithLabels[q.label] = answers[q.id];
        }
      });
      onGenerate(files, {
        companyName,
        brandColor,
        answers: answersWithLabels,
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImage className="w-4 h-4 text-foreground" />;
    }
    return <FileText className="w-4 h-4 text-foreground" />;
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
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

          <div className="flex gap-2 mt-8">
            <span className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center px-4 py-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-['Biennale-Medium'] tracking-tight">
            <span className="text-slate-900">avali</span>
            <span className="bg-gradient-to-r from-[#FF3B30] via-[#FF7A45] to-[#FF9500] bg-clip-text text-transparent">
              AI
            </span>
          </h1>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
          Gerador de Propostas
        </h2>
        <p className="text-muted-foreground mb-8 text-center">
          Anexe seus documentos e configure as informações da proposta
        </p>

        <div className="w-full max-w-2xl mb-8 flex gap-3 items-end">
          <div className="flex-1">
            <Label className="block text-sm font-medium text-foreground mb-2">
              Nome da empresa cliente
            </Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Digite o nome da empresa"
              className="border-primary/30 focus-visible:border-primary bg-white"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Cor da marca
            </Label>
            <ColorPickerPopover value={brandColor} onChange={setBrandColor} />
          </div>
        </div>

        {pendingFiles.length === 0 ? (
          <div className="w-full max-w-2xl mb-12">
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer p-8 ${
                isDragging 
                  ? 'border-primary bg-primary/15' 
                  : 'border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/10'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className={`w-8 h-8 text-primary ${isDragging ? 'animate-bounce' : ''}`} />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">
                    {isDragging ? 'Solte o arquivo agora' : 'Clique para selecionar um arquivo'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou arraste e solte aqui
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Suporta: PDF, imagens e outros formatos
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl mb-6 bg-primary/5 rounded-2xl border-2 border-primary/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{pendingFiles[0].name}</p>
                <p className="text-xs text-muted-foreground">
                  {pendingFiles.length > 1 ? (
                    <>
                      Selecione o tipo do documento. Restam <strong>{pendingFiles.length}</strong> documentos para classificar.
                    </>
                  ) : (
                    'Selecione o tipo do documento.'
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelPending}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <RadioGroup
              value={selectedType}
              onValueChange={(value) => {
                const val = value as 'reference' | 'input';
                setSelectedType(val);
                setLastSelectedType(val);
              }}
              className="space-y-3"
            >
              <div 
                className={`flex items-start space-x-3 p-3 rounded-xl bg-white border cursor-pointer transition-colors ${
                  selectedType === 'reference' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-primary/20 hover:border-primary/40'
                }`}
                onClick={() => {
                  setSelectedType('reference');
                  setLastSelectedType('reference');
                }}
              >
                <RadioGroupItem value="reference" id="reference" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="reference" className="font-medium text-foreground cursor-pointer">
                    Documento de Referência
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Documento usado como base ou modelo para a proposta (ex: propostas anteriores, templates)
                  </p>
                </div>
              </div>

              <div 
                className={`flex items-start space-x-3 p-3 rounded-xl bg-white border cursor-pointer transition-colors ${
                  selectedType === 'input' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-primary/20 hover:border-primary/40'
                }`}
                onClick={() => {
                  setSelectedType('input');
                  setLastSelectedType('input');
                }}
              >
                <RadioGroupItem value="input" id="input" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="input" className="font-medium text-foreground cursor-pointer">
                    Documento de Entrada
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Documento com informações específicas do cliente ou projeto (ex: briefings, requisitos)
                  </p>
                </div>
              </div>
            </RadioGroup>

            <div className="flex justify-end mt-4">
              <Button
                onClick={handleConfirmFile}
                disabled={!selectedType}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Plus className="w-4 h-4" />
                {pendingFiles.length > 1 ? 'Próximo Arquivo' : 'Adicionar Documento'}
              </Button>
            </div>
          </div>
        )}

        <div className={`w-full max-w-2xl mb-12 transition-opacity ${files.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-base font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              Documentos anexados {files.length > 0 && `(${files.length})`}
            </p>
          </div>
          {files.length > 0 ? (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-primary/20 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(file.fileType || '')}
                    <div className="min-w-0">
                      <span className="text-sm text-foreground truncate block max-w-[200px] md:max-w-[300px]">
                        {file.name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => changeFileType(file.id, 'reference')}
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                            file.type === 'reference'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-primary/20'
                          }`}
                        >
                          Referência
                        </button>
                        <button
                          onClick={() => changeFileType(file.id, 'input')}
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                            file.type === 'input'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-primary/20'
                          }`}
                        >
                          Entrada
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl px-4 py-3 border border-dashed border-muted-foreground/30 text-sm text-muted-foreground text-center">
              Nenhum documento anexado ainda
            </div>
          )}
        </div>

        <div className={`w-full max-w-2xl transition-opacity ${files.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
          <ContextQuestionnaire
            answers={answers}
            onAnswerChange={handleAnswerChange}
            showValidation={showValidation}
          />
        </div>

        <div className="flex items-center gap-4 mt-auto pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2 border-primary/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Menu
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={files.length === 0 || !companyName.trim() || pendingFiles.length > 0 || !areRequiredAnswersFilled}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base font-semibold rounded-full shadow-lg transition-all gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            GERAR PROPOSTA
          </Button>
        </div>
      </div>
    </div>
  );
}