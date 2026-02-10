import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ClipboardList } from 'lucide-react';

export interface ContextQuestion {
  id: string;
  label: string;
  placeholder: string;
  type: 'input' | 'textarea' | 'select';
  required: boolean;
  options?: { value: string; label: string }[];
}

export const CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: 'objective',
    label: 'Qual o objetivo principal desta proposta?',
    placeholder: 'Ex: Apresentar solução de automação para o setor financeiro...',
    type: 'textarea',
    required: true,
  },
  {
    id: 'audience',
    label: 'Quem é o público-alvo ou tomador de decisão?',
    placeholder: 'Ex: Diretor de TI, CEO, equipe de compras...',
    type: 'textarea',
    required: true,
  },
  {
    id: 'tone',
    label: 'Qual o tom desejado para a proposta?',
    placeholder: 'Ex: Formal, semi-formal, técnico, persuasivo...',
    type: 'textarea',
    required: true,
  },
  {
    id: 'additional_info',
    label: 'Existe alguma informação adicional ou restrição importante?',
    placeholder: 'Ex: Orçamento máximo de R$50k, prazo de 3 meses, exigências regulatórias...',
    type: 'textarea',
    required: true,
  },
];

interface ContextQuestionnaireProps {
  answers: Record<string, string>;
  onAnswerChange: (id: string, value: string) => void;
  showValidation: boolean;
}

export function ContextQuestionnaire({ answers, onAnswerChange, showValidation }: ContextQuestionnaireProps) {
  return (
    <div className="w-full max-w-2xl mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
        <p className="text-base font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          Informações para a proposta
        </p>
      </div>

      <div className="space-y-2">
        {CONTEXT_QUESTIONS.map((q) => {
          const value = answers[q.id] || '';
          const hasError = showValidation && q.required && !value.trim();

          return (
            <div
              key={q.id}
              className={`bg-white rounded-xl px-4 py-3 border shadow-sm transition-colors ${
                hasError ? 'border-destructive' : 'border-primary/20'
              }`}
            >
              <Label className="text-sm font-medium text-foreground mb-2 block">
                {q.label}
                {q.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              <Textarea
                value={value}
                onChange={(e) => onAnswerChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="bg-transparent border-0 p-0 shadow-none focus-visible:ring-0 resize-none min-h-[60px] text-sm text-foreground placeholder:text-muted-foreground"
              />

              {hasError && (
                <p className="text-xs text-destructive mt-1">Este campo é obrigatório</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
