
import { User, Stage, ActionPlan, AuditRecord, Answer, Goal } from './types';

/**
 * --- HISTÓRICO DE VERSÕES ---
 * v1.015: Versão base anterior.
 * v1.016: Exibição da evidência original na tela de execução.
 * v1.016-Fix: Reversão para layout mobile + Correção crítica do SignaturePad e erro de Data.
 * v1.017: Consolidação da versão v1.016-Fix.
 * v1.018: Refatoração completa. Separação de responsabilidades e modularização.
 * v1.019: Correção na funcionalidade de exclusão de departamentos no painel administrativo.
 * v1.020: Correção crítica na renderização da lista de departamentos para permitir exclusão correta (uso de key única).
 * v1.021: Padronização do botão de excluir departamentos usando a mesma lógica (Trash2, sem confirm) das perguntas.
 * v1.022: Adição de confirmação de segurança (window.confirm) para exclusão de Departamentos, Perguntas, Usuários e Agendamentos.
 * v1.023: Substituição do window.confirm (bloqueado em sandboxes) por um Modal de Confirmação customizado (React Component).
 * v1.024: Implementação do Dashboard Analítico (BI) interativo com gráficos e filtragem cruzada na tela de Histórico.
 * v1.025: Ajuste para transformar a tela 'Realizadas' no Dashboard BI.
 * v1.026: Alteração no Dashboard para exibir Planos de Ação no lugar de Histórico de Auditorias, com view detalhada de Timeline.
 * v1.027: Criação da tela dedicada 'Realizadas' com histórico operacional detalhado (Auditorias e Ações com Timeline inline).
 * v1.028: Reformulação da tela de Execução de Plano de Ação para corresponder ao design solicitado (Card de Problema + Evidência + Form).
 * v1.029: Implementação da nova tela "Avaliar Ação" com validação de recusa e cards comparativos (Problema vs Execução).
 * v1.030: Geração automática de histórico de auditorias de 12 meses para todos os departamentos.
 * v1.031: Refatoração do Dashboard de Indicadores: Gráfico de tendência composto (Barras + Linha Média Geral), reposicionamento dos gráficos e correção do ranking.
 * v1.032: Adição de Título e Ícone na tela "Realizadas" para consistência visual.
 * v1.033: Adição do módulo de "Gestão de Metas" no menu Admin para definir metas por Senso e Setor.
 * v1.034: Adição da funcionalidade de Edição de Usuários no painel administrativo.
 * v1.035: Implementação de layout responsivo (Web/Tablet) com Sidebar lateral, grids adaptativos e otimização para telas grandes.
 * v1.036: Implementação da tela de Gestão de Planos de Ação (Admin) que estava faltando.
 * v1.037: Padronização dos cabeçalhos de todas as telas com botão de retornar ao lado do título.
 * v1.038: Centralização de layout (mx-auto) nas telas de Admin, Agenda e Wizard para melhor visualização em PC/Tablet.
 * v1.039: Correção da sobreposição da linha de Meta no gráfico de Tendência (Indicadores), garantindo que fique visível sobre as barras. (Versão Atual)
 */

export const APP_VERSION = "v1.039";

export const INITIAL_DEPARTMENTS = [
  "Produção - Linha A",
  "Produção - Linha B",
  "Manutenção",
  "Almoxarifado",
  "Recursos Humanos",
  "Refeitório"
];

export const INITIAL_USERS: User[] = [
  { id: 1, name: 'Administrador', username: 'admin', password: '123', role: 'admin' },
  { id: 2, name: 'João Auditor', username: 'auditor', password: '123', role: 'auditor' },
  { id: 3, name: 'Maria Gestora', username: 'view', password: '123', role: 'viewer', department: 'Produção - Linha A' },
];

export const INITIAL_STAGES: Stage[] = [
  {
    id: 'seiri',
    title: '1. Seiri (Utilização)',
    description: 'Separar o útil do inútil.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    barColor: 'bg-blue-600',
    questions: [
      { id: 101, text: "Existem materiais ou equipamentos desnecessários na área?", departments: ['all'] },
      { id: 102, text: "Os itens obsoletos ou quebrados foram removidos?", departments: ['all'] },
      { id: 103, text: "O espaço está sendo usado de forma eficiente?", departments: ['all'] },
      { id: 104, text: "Ferramentas especiais estão segregadas corretamente?", departments: ['Manutenção'] }, 
    ]
  },
  {
    id: 'seiton',
    title: '2. Seiton (Organização)',
    description: 'Um lugar para cada coisa.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    barColor: 'bg-green-600',
    questions: [
      { id: 201, text: "Todos os itens têm um local definido e identificado?", departments: ['all'] },
      { id: 202, text: "É fácil encontrar, pegar e devolver os objetos?", departments: ['all'] },
      { id: 203, text: "As áreas de passagem estão desobstruídas?", departments: ['all'] },
    ]
  },
  {
    id: 'seiso',
    title: '3. Seiso (Limpeza)',
    description: 'Limpar e inspecionar.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    barColor: 'bg-yellow-500',
    questions: [
      { id: 301, text: "O chão, paredes e equipamentos estão limpos?", departments: ['all'] },
      { id: 302, text: "As fontes de sujeira foram identificadas?", departments: ['all'] },
      { id: 303, text: "O controle de pragas está em dia?", departments: ['Refeitório', 'Almoxarifado'] }, 
    ]
  },
  {
    id: 'seiketsu',
    title: '4. Seiketsu (Padronização)',
    description: 'Manter os padrões.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    barColor: 'bg-purple-600',
    questions: [
      { id: 401, text: "As regras do 5S estão visíveis?", departments: ['all'] },
      { id: 402, text: "A sinalização visual é padronizada?", departments: ['all'] },
    ]
  },
  {
    id: 'shitsuke',
    title: '5. Shitsuke (Disciplina)',
    description: 'Comprometimento.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    barColor: 'bg-red-600',
    questions: [
      { id: 501, text: "Os colaboradores cumprem as normas?", departments: ['all'] },
      { id: 502, text: "Existe espírito de melhoria contínua?", departments: ['all'] },
    ]
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 1,
    department: 'Produção - Linha A',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    targets: { seiri: 9, seiton: 9, seiso: 9, seiketsu: 8.5, shitsuke: 8.5 }
  }
];

export const INITIAL_ACTION_PLANS: ActionPlan[] = [
  {
    id: 'mock_1',
    auditId: 1,
    date: '2023-10-15',
    deadline: '2023-11-14',
    department: 'Produção - Linha A',
    auditor: 'João Auditor',
    questionText: 'As áreas de passagem estão desobstruídas?',
    issueDescription: 'Caixas de papelão bloqueando o corredor principal.',
    originalEvidence: 'https://picsum.photos/400/300?random=1', 
    status: 'pending', 
    executionText: '',
    executionEvidence: '',
    logs: [] 
  },
  {
    id: 'mock_2',
    auditId: 1,
    date: '2023-10-15',
    deadline: '2023-11-14',
    department: 'Produção - Linha A',
    auditor: 'João Auditor',
    questionText: 'O chão, paredes e equipamentos estão limpos?',
    issueDescription: 'Mancha de óleo próxima à máquina 3.',
    originalEvidence: 'https://picsum.photos/400/300?random=2',
    status: 'approved',
    executionText: 'Limpeza realizada com desengraxante e contenção instalada.',
    executionEvidence: 'https://picsum.photos/400/300?random=3',
    logs: [
      { type: 'execution', user: 'Maria Gestora', date: '2023-10-16T10:00:00', text: 'Tentativa de limpeza com água.', evidence: 'https://picsum.photos/400/300?random=4' },
      { type: 'rejection', user: 'João Auditor', date: '2023-10-16T14:00:00', note: 'Ainda está oleoso.' },
      { type: 'execution', user: 'Maria Gestora', date: '2023-10-17T09:00:00', text: 'Limpeza realizada com desengraxante e contenção instalada.', evidence: 'https://picsum.photos/400/300?random=5' },
      { type: 'approval', user: 'João Auditor', date: '2023-10-17T16:00:00' }
    ]
  }
];

// --- GERADOR DE DADOS HISTÓRICOS DE 12 MESES ---
const generateMockHistory = (): AuditRecord[] => {
  const history: AuditRecord[] = [];
  const today = new Date();
  const auditors = ['João Auditor', 'Maria Gestora', 'Carlos Supervisor'];
  
  INITIAL_DEPARTMENTS.forEach((dept, deptIdx) => {
    // Gerar 12 meses de histórico para cada departamento
    for (let i = 0; i < 12; i++) {
      const auditDate = new Date(today.getFullYear(), today.getMonth() - i, 15); // Dia 15 de cada mês
      const dateStr = auditDate.toISOString().split('T')[0];
      
      // Gerar nota aleatória com tendência (entre 6.0 e 10.0)
      // Adiciona um "noise" aleatório para não ficar linear
      const baseScore = 6.5 + (Math.random() * 3.5); 
      const roundedScore = parseFloat(Math.min(10, baseScore).toFixed(1));
      
      let status = 'Crítico';
      if (roundedScore >= 9) status = 'Excelente';
      else if (roundedScore >= 7) status = 'Bom';

      // Gerar respostas mock para o relatório detalhado funcionar
      const answers: Record<string, Answer> = {};
      INITIAL_STAGES.forEach(stage => {
        stage.questions.forEach(q => {
           const isOk = Math.random() < (roundedScore / 10); // Probabilidade baseada na nota
           answers[q.id] = {
             type: isOk ? 'OK' : 'PARCIAL',
             score: isOk ? 10 : 5,
             action: isOk ? undefined : `Correção necessária no item ${q.id}`,
             evidence: isOk ? undefined : `https://picsum.photos/400/300?random=${q.id}${i}`
           };
        });
      });

      history.push({
        id: parseInt(`${deptIdx}${i}${auditDate.getTime()}`),
        date: dateStr,
        department: dept,
        score: roundedScore,
        status: status,
        fullData: {
          department: dept,
          auditor: auditors[i % auditors.length],
          auditee: 'Responsável do Setor',
          date: dateStr,
          answers: answers,
          signatures: { 
            auditor: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 
            auditee: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' 
          }
        }
      });
    }
  });
  
  return history;
};

export const INITIAL_HISTORY: AuditRecord[] = generateMockHistory();
