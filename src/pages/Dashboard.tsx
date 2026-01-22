import { FileText, BarChart3, Users, Settings, Briefcase, Target, TrendingUp, Lightbulb, BookOpen, Shield, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';

interface ModuleCard {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

interface ModuleSection {
  title: string;
  modules: ModuleCard[];
}

const moduleSections: ModuleSection[] = [
  {
    title: 'Módulo Principal',
    modules: [
      {
        id: 'proposal-generator',
        name: 'Gerador de Propostas',
        icon: <FileText className="w-6 h-6" />,
        description: 'Crie propostas comerciais profissionais',
        available: true,
      },
    ],
  },
  {
    title: 'Análise & Métricas',
    modules: [
      {
        id: 'impact-analysis',
        name: 'Análise de Impacto',
        icon: <BarChart3 className="w-6 h-6" />,
        description: 'Avalie o impacto social dos projetos',
        available: false,
      },
      {
        id: 'sroi-calculator',
        name: 'Calculadora SROI',
        icon: <TrendingUp className="w-6 h-6" />,
        description: 'Calcule o retorno social do investimento',
        available: false,
      },
    ],
  },
  {
    title: 'Gestão de Projetos',
    modules: [
      {
        id: 'project-management',
        name: 'Gestão de Projetos',
        icon: <Briefcase className="w-6 h-6" />,
        description: 'Gerencie seus projetos sociais',
        available: false,
      },
      {
        id: 'stakeholders',
        name: 'Stakeholders',
        icon: <Users className="w-6 h-6" />,
        description: 'Gerencie partes interessadas',
        available: false,
      },
      {
        id: 'goals-tracking',
        name: 'Metas & ODS',
        icon: <Target className="w-6 h-6" />,
        description: 'Acompanhe metas e ODS',
        available: false,
      },
    ],
  },
  {
    title: 'Recursos & Configurações',
    modules: [
      {
        id: 'knowledge-base',
        name: 'Base de Conhecimento',
        icon: <BookOpen className="w-6 h-6" />,
        description: 'Documentação e guias',
        available: false,
      },
      {
        id: 'insights',
        name: 'Insights IA',
        icon: <Lightbulb className="w-6 h-6" />,
        description: 'Recomendações inteligentes',
        available: false,
      },
      {
        id: 'compliance',
        name: 'Compliance',
        icon: <Shield className="w-6 h-6" />,
        description: 'Conformidade e regulatório',
        available: false,
      },
      {
        id: 'settings',
        name: 'Configurações',
        icon: <Settings className="w-6 h-6" />,
        description: 'Personalize sua experiência',
        available: false,
      },
    ],
  },
];

interface DashboardProps {
  onNavigateToModule: (moduleId: string) => void;
}

export function Dashboard({ onNavigateToModule }: DashboardProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {moduleSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              {section.title}
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {section.modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => module.available && onNavigateToModule(module.id)}
                  disabled={!module.available}
                  className={`
                    group relative flex flex-col items-center justify-center
                    aspect-square rounded-2xl border-2 p-4 transition-all duration-200
                    ${module.available 
                      ? 'border-primary/30 bg-card hover:border-primary hover:shadow-brand cursor-pointer' 
                      : 'border-border bg-muted/30 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  {/* Icon */}
                  <div className={`
                    mb-2 p-3 rounded-xl transition-colors
                    ${module.available 
                      ? 'text-primary group-hover:bg-primary/10' 
                      : 'text-muted-foreground'
                    }
                  `}>
                    {module.icon}
                  </div>
                  
                  {/* Name */}
                  <span className={`
                    text-xs font-medium text-center leading-tight
                    ${module.available ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {module.name}
                  </span>

                  {/* Available badge */}
                  {module.available && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}

                  {/* Coming soon badge */}
                  {!module.available && (
                    <span className="absolute top-2 right-2 text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      Em breve
                    </span>
                  )}

                  {/* Hover arrow for available modules */}
                  {module.available && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {sectionIndex < moduleSections.length - 1 && (
              <div className="mt-8 border-b border-border" />
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default Dashboard;
