
import React, { useState, useMemo } from 'react';
import { FileText, Layout, Eye, CheckCircle, XCircle, Clock, AlertCircle, ChevronLeft } from 'lucide-react';
import { AuditRecord, ActionPlan } from '../../types';

interface RealizadasViewProps {
  history: AuditRecord[];
  actionPlans: ActionPlan[];
  onOpenReport: (audit: AuditRecord) => void;
  onOpenMural: (audit: AuditRecord) => void;
  onViewImage: (url: string) => void;
  onBack: () => void;
}

const RealizadasView: React.FC<RealizadasViewProps> = ({ 
  history, actionPlans, onOpenReport, onOpenMural, onViewImage, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'audits' | 'actions'>('audits');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredHistory = useMemo(() => {
    let data = [...history];
    if (dateStart) data = data.filter(h => new Date(h.date) >= new Date(dateStart));
    if (dateEnd) data = data.filter(h => new Date(h.date) <= new Date(dateEnd));
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history, dateStart, dateEnd]);

  const filteredActionPlans = useMemo(() => {
    let data = [...actionPlans];
    if (dateStart) data = data.filter(p => new Date(p.date) >= new Date(dateStart));
    if (dateEnd) data = data.filter(p => new Date(p.date) <= new Date(dateEnd));
    if (statusFilter !== 'all') data = data.filter(p => p.status === statusFilter);
    
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [actionPlans, dateStart, dateEnd, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'approved': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold text-[10px] uppercase">Aprovado</span>;
        case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold text-[10px] uppercase">Reprovado</span>;
        case 'executed': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold text-[10px] uppercase">Executado</span>;
        default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold text-[10px] uppercase">Pendente</span>;
    }
  };

  return (
    <div className="h-full flex flex-col pb-20 md:pb-0 bg-gray-50">
      {/* Cabeçalho e Abas */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <header className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft size={24}/></button>
          <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <CheckCircle className="text-emerald-600" /> Realizadas
          </h1>
        </header>

        <div className="px-4 pb-4">
          <div className="flex p-1 bg-gray-100 rounded-xl max-w-md">
            <button 
              onClick={() => setActiveTab('audits')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'audits' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Auditorias
            </button>
            <button 
              onClick={() => setActiveTab('actions')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'actions' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Planos de Ação
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 max-w-3xl">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">De</label>
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Até</label>
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg" />
          </div>
          {activeTab === 'actions' && (
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg">
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="executed">Executado</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Reprovado</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo das Listas - Grid Responsivo */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeTab === 'audits' && (
            filteredHistory.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-400">Nenhuma auditoria encontrada.</div>
            ) : (
              filteredHistory.map(audit => (
                <div key={audit.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{audit.department}</h3>
                      <p className="text-xs text-gray-500">{new Date(audit.date).toLocaleDateString('pt-BR')} • {audit.fullData?.auditor || 'N/A'}</p>
                    </div>
                    <div className={`text-sm font-bold px-2 py-1 rounded ${audit.score && audit.score >= 8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {audit.score?.toFixed(1)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => onOpenReport(audit)} 
                      className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-colors border border-gray-100"
                    >
                      <FileText size={14} /> Detalhado
                    </button>
                    <button 
                      onClick={() => onOpenMural(audit)} 
                      className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors border border-emerald-100"
                    >
                      <Layout size={14} /> Mural
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'actions' && (
            filteredActionPlans.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-400">Nenhum plano de ação encontrado.</div>
            ) : (
              filteredActionPlans.map(plan => (
                <div key={plan.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    {getStatusBadge(plan.status)}
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 block">Prazo</span>
                      <span className="text-xs font-bold text-gray-700">{new Date(plan.deadline).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{plan.issueDescription}</h3>
                  <p className="text-xs text-gray-500 mb-3">Setor: {plan.department}</p>
                  
                  {plan.originalEvidence && (
                    <button 
                      onClick={() => onViewImage(plan.originalEvidence!)} 
                      className="text-[10px] font-bold text-red-500 flex items-center gap-1 hover:underline mb-4"
                    >
                      <Eye size={10} /> Ver Foto do Problema
                    </button>
                  )}

                  {/* Timeline Compacta */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Última Atividade</p>
                    {plan.logs && plan.logs.length > 0 ? (
                        <div className="relative pl-3 border-l-2 border-gray-100">
                            {/* Show only the last log for compactness in grid */}
                            {(() => {
                                const log = plan.logs[plan.logs.length - 1];
                                return (
                                    <div>
                                        <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${
                                            log.type === 'approval' ? 'bg-green-500' : 
                                            log.type === 'rejection' ? 'bg-red-500' : 'bg-blue-500'
                                        }`}></div>
                                        <div className="text-xs">
                                            <p className="font-bold text-gray-700">{log.type === 'execution' ? 'Executado' : log.type === 'approval' ? 'Aprovado' : 'Reprovado'}</p>
                                            <p className="text-[10px] text-gray-400">{new Date(log.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 italic">Nenhuma atividade.</span>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RealizadasView;
