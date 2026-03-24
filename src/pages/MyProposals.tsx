import { useState } from 'react';
import { Header } from '@/components/Header';
import { ArrowLeft, ArrowRight, Building2, FileText, GitBranch, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MyProposalsProps {
  onBack: () => void;
  onOpenProposal: (companyId: string, proposalId: string, versionId: string) => void;
}

const initialCompanies = [
  { id: 'c1', name: 'Instituto Porto Seguro', proposalCount: 3 },
  { id: 'c2', name: 'Construtora Horizonte', proposalCount: 2 },
  { id: 'c3', name: 'Tech Solutions Ltda', proposalCount: 1 },
];

const initialProposals: Record<string, { id: string; title: string; date: string; versionCount: number }[]> = {
  c1: [
    { id: 'p1', title: 'Proposta Comercial — Consultoria TI', date: '12/03/2026', versionCount: 3 },
    { id: 'p2', title: 'Proposta Comercial — Infraestrutura', date: '05/02/2026', versionCount: 1 },
    { id: 'p3', title: 'Proposta Comercial — Suporte 24h', date: '20/01/2026', versionCount: 2 },
  ],
  c2: [
    { id: 'p4', title: 'Proposta Comercial — Automação', date: '10/03/2026', versionCount: 2 },
    { id: 'p5', title: 'Proposta Comercial — ERP', date: '01/03/2026', versionCount: 1 },
  ],
  c3: [
    { id: 'p6', title: 'Proposta Comercial — MVP App', date: '15/03/2026', versionCount: 4 },
  ],
};

const initialVersions: Record<string, { id: string; label: string; date: string }[]> = {
  p1: [
    { id: 'v1', label: 'Versão 1 — Original', date: '12/03/2026 10:30' },
    { id: 'v2', label: 'Versão 2 — Ajuste de preço', date: '13/03/2026 14:15' },
    { id: 'v3', label: 'Versão 3 — Final', date: '14/03/2026 09:00' },
  ],
  p2: [
    { id: 'v4', label: 'Versão 1 — Original', date: '05/02/2026 11:00' },
  ],
  p3: [
    { id: 'v5', label: 'Versão 1 — Original', date: '20/01/2026 16:00' },
    { id: 'v6', label: 'Versão 2 — Revisada', date: '22/01/2026 10:45' },
  ],
  p4: [
    { id: 'v7', label: 'Versão 1 — Original', date: '10/03/2026 08:30' },
    { id: 'v8', label: 'Versão 2 — Atualizada', date: '11/03/2026 17:00' },
  ],
  p5: [
    { id: 'v9', label: 'Versão 1 — Original', date: '01/03/2026 13:00' },
  ],
  p6: [
    { id: 'v10', label: 'Versão 1 — Rascunho', date: '15/03/2026 09:00' },
    { id: 'v11', label: 'Versão 2 — Beta', date: '15/03/2026 15:00' },
    { id: 'v12', label: 'Versão 3 — Release', date: '16/03/2026 10:00' },
    { id: 'v13', label: 'Versão 4 — Hotfix', date: '17/03/2026 11:30' },
  ],
};

const steps = [
  { label: 'Empresa', icon: Building2 },
  { label: 'Proposta', icon: FileText },
  { label: 'Versão', icon: GitBranch },
];

type DeleteTarget =
  | { type: 'company'; id: string; name: string }
  | { type: 'proposal'; id: string; title: string }
  | { type: 'version'; id: string; label: string };

export function MyProposals({ onBack, onOpenProposal }: MyProposalsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const [companies, setCompanies] = useState(initialCompanies);
  const [proposals, setProposals] = useState(initialProposals);
  const [versions, setVersions] = useState(initialVersions);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const handleSelectCompany = (id: string) => {
    setSelectedCompany(id);
    setSelectedProposal(null);
    setSelectedVersion(null);
    setCurrentStep(1);
  };

  const handleSelectProposal = (id: string) => {
    setSelectedProposal(id);
    setSelectedVersion(null);
    setCurrentStep(2);
  };

  const handleSelectVersion = (id: string) => {
    setSelectedVersion(id);
  };

  const handleGoToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      if (step < 2) setSelectedVersion(null);
      if (step < 1) {
        setSelectedProposal(null);
        setSelectedVersion(null);
      }
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'company') {
      const companyProposals = proposals[deleteTarget.id] || [];
      const newVersions = { ...versions };
      companyProposals.forEach((p) => {
        delete newVersions[p.id];
      });
      const newProposals = { ...proposals };
      delete newProposals[deleteTarget.id];
      setVersions(newVersions);
      setProposals(newProposals);
      setCompanies((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'proposal') {
      const newVersions = { ...versions };
      delete newVersions[deleteTarget.id];
      setVersions(newVersions);
      setProposals((prev) => {
        const updated = { ...prev };
        if (selectedCompany) {
          updated[selectedCompany] = (updated[selectedCompany] || []).filter(
            (p) => p.id !== deleteTarget.id
          );
        }
        return updated;
      });
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === selectedCompany ? { ...c, proposalCount: Math.max(0, c.proposalCount - 1) } : c
        )
      );
      if (selectedProposal === deleteTarget.id) {
        setSelectedProposal(null);
        setSelectedVersion(null);
        setCurrentStep(1);
      }
    } else if (deleteTarget.type === 'version') {
      setVersions((prev) => {
        const updated = { ...prev };
        if (selectedProposal) {
          updated[selectedProposal] = (updated[selectedProposal] || []).filter(
            (v) => v.id !== deleteTarget.id
          );
        }
        return updated;
      });
      if (selectedVersion === deleteTarget.id) {
        setSelectedVersion(null);
      }
    }

    setDeleteTarget(null);
  };

  const getDeleteMessage = () => {
    if (!deleteTarget) return '';
    if (deleteTarget.type === 'company') {
      return `Todas as propostas e versões relacionadas a "${deleteTarget.name}" serão excluídas permanentemente.`;
    }
    if (deleteTarget.type === 'proposal') {
      return `Todas as versões de "${deleteTarget.title}" serão excluídas permanentemente.`;
    }
    return `A versão "${deleteTarget.label}" será excluída permanentemente.`;
  };

  const companyName = companies.find((c) => c.id === selectedCompany)?.name;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 pt-10 pb-16 max-w-2xl mx-auto w-full">
        {/* Stepper */}
        <div className="flex items-center justify-center w-full mb-12">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isCompleted = i < currentStep;

            return (
              <div key={i} className="flex items-center">
                <button
                  onClick={() => handleGoToStep(i)}
                  disabled={i > currentStep}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : isCompleted
                        ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20'
                        : 'bg-muted text-muted-foreground cursor-default'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 transition-colors ${
                      i < currentStep ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 0: Companies */}
        {currentStep === 0 && (
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Selecione a empresa
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Escolha a empresa para visualizar suas propostas.
            </p>
            <div className="flex flex-col gap-3">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-sm"
                >
                  <button
                    onClick={() => handleSelectCompany(company.id)}
                    className="flex items-center gap-4 flex-1 text-left"
                  >
                    <div className="p-3 rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {company.name}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {company.proposalCount} proposta{company.proposalCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: 'company', id: company.id, name: company.name });
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir empresa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Proposals */}
        {currentStep === 1 && selectedCompany && (
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Propostas — {companyName}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Escolha a proposta que deseja acessar.
            </p>
            <div className="flex flex-col gap-3">
              {proposals[selectedCompany]?.map((proposal) => (
                <div
                  key={proposal.id}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-sm"
                >
                  <button
                    onClick={() => handleSelectProposal(proposal.id)}
                    className="flex items-center gap-4 flex-1 text-left"
                  >
                    <div className="p-3 rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {proposal.title}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {proposal.date} · {proposal.versionCount} versão{proposal.versionCount !== 1 ? 'ões' : ''}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: 'proposal', id: proposal.id, title: proposal.title });
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir proposta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Versions */}
        {currentStep === 2 && selectedProposal && (
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Versões
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Selecione a versão da proposta e clique em abrir.
            </p>
            <div className="flex flex-col gap-3">
              {versions[selectedProposal]?.map((version) => (
                <div
                  key={version.id}
                  className={`group flex items-center gap-4 rounded-xl border-2 bg-card p-5 transition-all ${
                    selectedVersion === version.id
                      ? 'border-primary shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <button
                    onClick={() => handleSelectVersion(version.id)}
                    className="flex items-center gap-4 flex-1 text-left"
                  >
                    <div
                      className={`p-3 rounded-lg transition-colors ${
                        selectedVersion === version.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                      }`}
                    >
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {version.label}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {version.date}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: 'version', id: version.id, label: version.label });
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir versão"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {selectedVersion === version.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                if (selectedCompany && selectedProposal && selectedVersion) {
                  onOpenProposal(selectedCompany, selectedProposal, selectedVersion);
                }
              }}
              disabled={!selectedVersion}
              className="w-full mt-8"
              size="lg"
            >
              Abrir proposta
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        <button
          onClick={onBack}
          className="mt-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </main>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>{getDeleteMessage()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
