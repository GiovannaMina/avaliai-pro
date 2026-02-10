import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    type: 'input',
    required: true,
  },
  {
    id: 'tone',
    label: 'Qual o tom desejado para a proposta?',
    placeholder: 'Selecione o tom',
    type: 'select',
    required: true,
    options: [
      { value: 'formal', label: 'Formal' },
      { value: 'semi-formal', label: 'Semi-formal' },
      { value: 'informal', label: 'Informal' },
    ],
  },
  {
    id: 'additional_info',
    label: 'Existe alguma informação adicional ou restrição importante?',
    placeholder: 'Ex: Orçamento máximo de R$50k, prazo de 3 meses, exigências regulatórias...',
    type: 'textarea',
    required: false,
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
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Informações para a proposta
        </h3>
      </div>

      <div className="space-y-5 bg-primary/5 rounded-2xl border border-primary/20 p-6">
        {CONTEXT_QUESTIONS.map((q) => {
          const value = answers[q.id] || '';
          const hasError = showValidation && q.required && !value.trim();

          return (
            <div key={q.id} className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {q.label}
                {q.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {q.type === 'textarea' && (
                <Textarea
                  value={value}
                  onChange={(e) => onAnswerChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  className={`bg-white border transition-colors resize-none min-h-[80px] ${
                    hasError
                      ? 'border-destructive focus-visible:border-destructive'
                      : 'border-primary/20 focus-visible:border-primary'
                  }`}
                />
              )}

              {q.type === 'input' && (
                <Input
                  value={value}
                  onChange={(e) => onAnswerChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  className={`bg-white border transition-colors ${
                    hasError
                      ? 'border-destructive focus-visible:border-destructive'
                      : 'border-primary/20 focus-visible:border-primary'
                  }`}
                />
              )}

              {q.type === 'select' && (
                <Select value={value} onValueChange={(v) => onAnswerChange(q.id, v)}>
                  <SelectTrigger
                    className={`bg-white border transition-colors ${
                      hasError
                        ? 'border-destructive focus-visible:border-destructive'
                        : 'border-primary/20 focus-visible:border-primary'
                    }`}
                  >
                    <SelectValue placeholder={q.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {q.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {hasError && (
                <p className="text-xs text-destructive">Este campo é obrigatório</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
