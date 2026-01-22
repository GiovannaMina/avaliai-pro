import { useRef } from 'react';
import { FileText, Upload, Image, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FileAttachmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelect: (files: FileList) => void;
}

interface FileOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  accept: string;
  description: string;
}

const fileOptions: FileOption[] = [
  {
    id: 'document',
    name: 'Documento',
    icon: <FileText className="w-6 h-6" />,
    accept: '.txt,.md,.doc,.docx,.pdf',
    description: 'TXT, DOC, DOCX, PDF',
  },
  {
    id: 'spreadsheet',
    name: 'Planilha',
    icon: <FileSpreadsheet className="w-6 h-6" />,
    accept: '.xlsx,.xls,.csv',
    description: 'XLSX, XLS, CSV',
  },
  {
    id: 'image',
    name: 'Imagem',
    icon: <Image className="w-6 h-6" />,
    accept: 'image/*',
    description: 'PNG, JPG, WEBP',
  },
  {
    id: 'any',
    name: 'Qualquer Arquivo',
    icon: <Upload className="w-6 h-6" />,
    accept: '*',
    description: 'Todos os formatos',
  },
];

export function FileAttachmentDialog({ open, onOpenChange, onFileSelect }: FileAttachmentDialogProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
      onOpenChange(false);
    }
    // Reset input
    e.target.value = '';
  };

  const handleOptionClick = (option: FileOption) => {
    fileInputRefs.current[option.id]?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Anexar Arquivo</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {fileOptions.map((option) => (
            <div key={option.id}>
              <input
                ref={(el) => (fileInputRefs.current[option.id] = el)}
                type="file"
                accept={option.accept}
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => handleOptionClick(option)}
                className="w-full flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-accent/50 transition-all group"
              >
                <div className="p-3 rounded-full bg-accent text-primary group-hover:bg-primary/10 transition-colors">
                  {option.icon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{option.name}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
