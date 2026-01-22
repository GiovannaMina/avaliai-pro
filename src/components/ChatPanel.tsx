import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Plus, FileText, X, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileAttachmentDialog } from '@/components/FileAttachmentDialog';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: { name: string; }[];
}

interface ChatPanelProps {
  onUpdateProposal: (newProposal: string) => void;
}

export function ChatPanel({ onUpdateProposal }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou o avaliAI, seu assistente para propostas comerciais. Como posso ajudar você a aprimorar esta proposta?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; content: string }[]>([]);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setAttachedFiles((prev) => [
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
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachedFiles.map(f => ({ name: f.name })),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Entendi! Vou ajustar a proposta para enfatizar melhor os resultados mensuráveis do SROI. A seção de impacto foi atualizada com métricas mais específicas.',
        'Feito! Adicionei uma seção detalhada sobre a metodologia de avaliação de impacto social, incluindo os KPIs específicos para programas de inclusão produtiva.',
        'Perfeito! Reformulei a introdução para destacar a parceria com o Instituto Porto Seguro e os objetivos alinhados à estratégia ESG da empresa.',
        'Pronto! Incluí um cronograma detalhado das entregas e marcos do projeto, facilitando o acompanhamento por parte do cliente.',
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestions = [
    'Adicione métricas de SROI',
    'Destaque os benefícios',
    'Simplifique a linguagem',
    'Inclua cronograma',
  ];

  return (
    <div className="flex flex-col h-full bg-sidebar border-l">
      {/* Header */}
      <div className="px-4 py-4 border-b bg-card/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg gradient-brand">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Chat com IA</h3>
            <p className="text-xs text-muted-foreground">Refine sua proposta</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-fade-in ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card border shadow-sm rounded-bl-md'
              }`}
            >
              {/* Show attachments if any */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {message.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                        message.role === 'user'
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-accent text-accent-foreground'
                      }`}
                    >
                      <Paperclip className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-typing" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-typing" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-typing" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 bg-accent rounded-full px-3 py-1.5 text-xs"
              >
                <FileText className="w-3 h-3 text-primary" />
                <span className="text-accent-foreground truncate max-w-[100px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachedFile(file.id)}
                  className="p-0.5 hover:bg-primary/10 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-card/50">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          {/* File Upload Button */}
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setIsFileDialogOpen(true)}
            className="flex-shrink-0 h-[44px] w-[44px] rounded-xl"
          >
            <Plus className="w-5 h-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Como posso melhorar a proposta?"
            className="min-h-[44px] max-h-32 resize-none text-sm"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={(!input.trim() && attachedFiles.length === 0) || isTyping}
            className="gradient-brand text-primary-foreground hover:opacity-90 flex-shrink-0 h-[44px] w-[44px]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* File Attachment Dialog */}
      <FileAttachmentDialog
        open={isFileDialogOpen}
        onOpenChange={setIsFileDialogOpen}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
}
