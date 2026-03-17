import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardList, CalendarDays } from 'lucide-react';

export interface ContextQuestion {
  id: string;
  label: string;
  placeholder: string;
  type: 'input' | 'textarea' | 'select' | 'multiselect' | 'currency' | 'daterange';
  required: boolean;
  options?: { value: string; label: string }[];
}

export const CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: 'objective',
    label: 'Qual o objetivo principal desta proposta?',
    placeholder: 'Ex: Apresentar solução de automação para o setor financeiro...',
    type: 'textarea',
    required: false, 
  },
  {
    id: 'cost',
    label: 'Quanto o cliente está disposto a investir nesta proposta?',
    placeholder: 'Ex: R$ 5.000.000,00',
    type: 'currency',
    required: false,
  },
  {
    id: 'module',
    label: 'Qual(is) módulo(s) do avaliAI deverão ser abordados na proposta?',
    placeholder: 'Selecione os módulos adequados',
    type: 'multiselect',
    required: false,
    options: [
      { value: '01', label: 'Módulo 01 - Definição do Problema' },
      { value: '02', label: 'Módulo 02 - Re(Desenho) da Solução' },
      { value: '03', label: 'Módulo 03 - Planejamento & Monitoramento dos Resultados e Impacto' },
      { value: '04', label: 'Módulo 04 - Análise de resultados & impacto' },
      { value: '05', label: 'Módulo 05 - Potencializar impacto - Otimizar investimentos' },
    ],
  },
  {
    id: 'timeline',
    label: 'Qual o prazo de execução desejado para a proposta?',
    placeholder: 'Ex: Janeiro de 2026 a Fevereiro de 2027',
    type: 'daterange',
    required: false,
  },
];

interface ContextQuestionnaireProps {
  answers: Record<string, string>;
  onAnswerChange: (id: string, value: string) => void;
  showValidation: boolean;
}

export function ContextQuestionnaire({ answers, onAnswerChange, showValidation }: ContextQuestionnaireProps) {

  const handleCurrencyChange = (id: string, rawValue: string) => {
    const numericValue = rawValue.replace(/\D/g, '');
    if (!numericValue) {
      onAnswerChange(id, '');
      return;
    }
    const amount = parseInt(numericValue, 10) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    onAnswerChange(id, formatted);
  };
  
  const renderField = (q: ContextQuestion, value: string, hasError: boolean) => {
    switch (q.type) {
      case 'daterange': {
        const [startStr = '', endStr = ''] = value.split(' até ');
        
        const updateRange = (start: string, end: string) => {
          if (!start && !end) onAnswerChange(q.id, '');
          else onAnswerChange(q.id, `${start} até ${end}`);
        };

        return (
          <div className="flex items-center gap-4 mt-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> Início
              </Label>
              <Input 
                type="date" 
                value={startStr} 
                onChange={(e) => updateRange(e.target.value, endStr)}
                className="bg-primary/5 border-0 rounded-lg px-3 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm text-foreground h-[42px] w-full block"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> Fim
              </Label>
              <Input 
                type="date" 
                value={endStr} 
                onChange={(e) => updateRange(startStr, e.target.value)}
                className="bg-primary/5 border-0 rounded-lg px-3 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm text-foreground h-[42px] w-full block"
              />
            </div>
          </div>
        );
      }
      case 'currency':
        return (
          <Input
            value={value}
            onChange={(e) => handleCurrencyChange(q.id, e.target.value)}
            placeholder={q.placeholder}
            className="bg-primary/5 border-0 rounded-lg px-3 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm text-foreground placeholder:text-muted-foreground h-[42px]"
          />
        );
      case 'multiselect': {
        const selectedLabels = value ? value.split(' | ') : [];

        const handleToggle = (optionLabel: string) => {
          const newSelection = selectedLabels.includes(optionLabel)
            ? selectedLabels.filter((l) => l !== optionLabel)
            : [...selectedLabels, optionLabel];
          
          onAnswerChange(q.id, newSelection.join(' | '));
        };

        return (
          <div className="grid grid-cols-1 gap-2 mt-2">
            {q.options?.map((opt) => {
              const isSelected = selectedLabels.includes(opt.label);
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-white border-primary/20 hover:border-primary/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(opt.label)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  <span className={`text-sm ${isSelected ? 'font-semibold text-primary' : 'font-medium text-foreground'}`}>
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
        );
      }
      
      case 'textarea':
      default:
        return (
          <Textarea
            value={value}
            onChange={(e) => onAnswerChange(q.id, e.target.value)}
            placeholder={q.placeholder}
            className="bg-primary/5 border-0 rounded-lg px-3 py-2 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 resize-none min-h-[60px] text-sm text-foreground placeholder:text-muted-foreground"
          />
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mb-8">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-base font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          Informações para a proposta
        </p>
      </div>

      <div className="space-y-4">
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

              {renderField(q, value, hasError)}

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