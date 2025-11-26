
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, Cell, ComposedChart 
} from 'recharts';
import { ClipboardCheck, BarChart3, X, ChevronRight, Activity, AlertCircle, CheckCircle, Clock, ChevronLeft } from 'lucide-react';
import { AuditRecord, Stage, ActionPlan } from '../../types';

interface AnalyticsDashboardProps {
  history: AuditRecord[];
  stages: Stage[];
  actionPlans: ActionPlan[];
  onViewActionPlan: (plan: ActionPlan) => void;
  onBack: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ history, stages, actionPlans, onViewActionPlan, onBack }) => {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // --- Processamento de Dados ---

  const filteredHistory = useMemo(() => {
    let data = [...history];
    if (selectedSector) {
      data = data.filter(h => h.department === selectedSector);
    }
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history, selectedSector]);

  const filteredActionPlans = useMemo(() => {
    let data = [...actionPlans];
    if (selectedSector) {
      data = data.filter(p => p.department === selectedSector);
    }
    return data.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [actionPlans, selectedSector]);

  const kpis = useMemo(() => {
    const totalAudits = filteredHistory.length;
    const avgScore = totalAudits > 0 
      ? filteredHistory.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalAudits 
      : 0;
    
    const globalTotal = history.length;
    const globalAvg = globalTotal > 0 ? history.reduce((acc, curr) => acc + (curr.score || 0), 0) / globalTotal : 0;

    return { totalAudits, avgScore, globalAvg };
  }, [filteredHistory, history]);

  const trendData = useMemo(() => {
    const grouped: Record<string, { sum: number; count: number; globalSum: number; globalCount: number; date: Date }> = {};
    
    history.forEach(h => {
        const date = new Date(h.date);
        const key = `${date.getMonth()}/${date.getFullYear()}`;
        if (!grouped[key]) grouped[key] = { sum: 0, count: 0, globalSum: 0, globalCount: 0, date };
        grouped[key].globalSum += h.score || 0;
        grouped[key].globalCount += 1;
    });

    filteredHistory.forEach(h => {
        const date = new Date(h.date);
        const key = `${date.getMonth()}/${date.getFullYear()}`;
        if (grouped[key]) {
            grouped[key].sum += h.score || 0;
            grouped[key].count += 1;
        }
    });

    return Object.keys(grouped)
      .sort((a, b) => grouped[a].date.getTime() - grouped[b].date.getTime())
      .map(key => {
          const item = grouped[key];
          return {
            name: item.date.toLocaleDateString('pt-BR', { month: 'short' }),
            notaSetor: item.count > 0 ? parseFloat((item.sum / item.count).toFixed(1)) : 0,
            notaGeral: item.globalCount > 0 ? parseFloat((item.globalSum / item.globalCount).toFixed(1)) : 0,
            meta: 8.0
          };
      });
  }, [filteredHistory, history]);

  const rankingData = useMemo(() => {
    const grouped: Record<string, { sum: number; count: number }> = {};
    history.forEach(h => {
      if (!grouped[h.department]) grouped[h.department] = { sum: 0, count: 0 };
      grouped[h.department].sum += h.score || 0;
      grouped[h.department].count += 1;
    });

    return Object.keys(grouped).map(dept => ({
      name: dept,
      nota: parseFloat((grouped[dept].sum / grouped[dept].count).toFixed(1))
    })).sort((a, b) => b.nota - a.nota);
  }, [history]);

  const senseData = useMemo(() => {
    const counts: Record<string, { sum: number; count: number }> = {};
    
    stages.forEach(s => counts[s.title.split('.')[1].trim()] = { sum: 0, count: 0 }); 

    filteredHistory.forEach(h => {
      if (h.fullData) {
        stages.forEach(stage => {
            let stageSum = 0;
            let stageCount = 0;
            const senseName = stage.title.split('.')[1].trim();

            stage.questions.forEach(q => {
               const qDepts = q.departments || ['all'];
               if(qDepts.includes('all') || qDepts.includes(h.department)) {
                   const ans = h.fullData?.answers[q.id];
                   if (ans && ans.score !== null) {
                       stageSum += ans.score;
                       stageCount++;
                   }
               }
            });

            if (stageCount > 0) {
                if(!counts[senseName]) counts[senseName] = {sum:0, count:0}; 
                counts[senseName].sum += (stageSum / stageCount); 
                counts[senseName].count += 1;
            }
        });
      }
    });

    return Object.keys(counts).map(sense => ({
        name: sense,
        nota: counts[sense].count > 0 ? parseFloat((counts[sense].sum / counts[sense].count).toFixed(1)) : 0
    }));

  }, [filteredHistory, stages]);

  const getBarColor = (score: number) => {
    if (score >= 9) return '#059669'; 
    if (score >= 7) return '#3b82f6'; 
    return '#dc2626'; 
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
        case 'approved': return <CheckCircle size={16} className="text-green-600" />;
        case 'rejected': return <X size={16} className="text-red-600" />;
        case 'executed': return <Clock size={16} className="text-blue-600" />;
        default: return <AlertCircle size={16} className="text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'approved': return 'Aprovado';
          case 'rejected': return 'Rejeitado';
          case 'executed': return 'Executado';
          default: return 'Pendente';
      }
  };

  return (
    <div className="h-full flex flex-col pb-20 md:pb-0 bg-gray-50">
      <header className="flex items-center justify-between gap-3 mb-4 px-4 mt-4">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft size={24}/></button>
            <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <BarChart3 className="text-emerald-600" /> Indicadores
            </h1>
        </div>
        {selectedSector && (
          <button 
            onClick={() => setSelectedSector(null)}
            className="text-xs flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-bold hover:bg-red-200 transition-colors"
          >
            <X size={12} /> Limpar Filtro: {selectedSector}
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 px-4 pb-6">
        
        {/* KPIs - Grid Responsive */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
          <div className="bg-emerald-700 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-1 mb-1 opacity-80 text-xs font-medium">
              <ClipboardCheck size={14} /> Auditorias
            </div>
            <div className="text-2xl font-bold">{kpis.totalAudits}</div>
            <div className="text-[10px] opacity-70">Total Filtrado</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 mb-1 text-gray-500 text-xs font-bold">
              <BarChart3 size={14} /> Média Geral
            </div>
            <div className="text-2xl font-bold text-gray-800">{kpis.globalAvg.toFixed(1)}</div>
            <div className="text-[10px] text-gray-400">Todas Auditorias</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
             <div className="flex items-center gap-1 mb-1 text-gray-500 text-xs font-bold">
              <BarChart3 size={14} /> Média Setor
            </div>
            <div className={`text-2xl font-bold ${selectedSector ? 'text-blue-600' : 'text-gray-400'}`}>
                {selectedSector ? kpis.avgScore.toFixed(1) : '-'}
            </div>
            <div className="text-[10px] text-gray-400 truncate max-w-[80px]">{selectedSector || 'Geral'}</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Tendência */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 col-span-1 lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Histórico Avaliação 5S (Tendência)</h3>
            <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dy={10} />
                        <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                            cursor={{ fill: '#f3f4f6' }}
                        />
                        <Bar dataKey="notaSetor" name="Nota Setor" barSize={20} fill="#60a5fa" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="notaGeral" name="Média Geral" stroke="#059669" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        {/* ReferenceLine movida para o final para garantir sobreposição (SVG z-index) */}
                        <ReferenceLine y={8} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Meta 8.0', position: 'insideTopRight', fill: '#dc2626', fontSize: 10 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            </div>

            {/* Gráfico Média por Senso */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Média da nota por Senso</h3>
                <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={senseData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                <XAxis type="number" domain={[0, 10]} hide />
                                <YAxis dataKey="name" type="category" width={60} tick={{fill: '#4b5563'}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                                <Bar dataKey="nota" radius={[0, 4, 4, 0]} barSize={20}>
                                {senseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#2563eb', '#059669', '#ca8a04', '#9333ea', '#dc2626'][index % 5]} />
                                ))}
                                </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfico Ranking de Setores */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-1">Ranking dos Setores</h3>
                <p className="text-[10px] text-gray-400 mb-4">Toque na barra para filtrar o dashboard</p>
                <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            layout="vertical" 
                            data={rankingData} 
                            margin={{ top: 0, right: 30, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                            <XAxis type="number" domain={[0, 10]} hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={100} 
                                tick={{fill: '#4b5563', fontSize: 10, fontWeight: 500}} 
                                axisLine={false} 
                                tickLine={false}
                            />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                            <Bar dataKey="nota" radius={[0, 4, 4, 0]} barSize={20} onClick={(data) => setSelectedSector(data.name === selectedSector ? null : data.name)}>
                                {rankingData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.name === selectedSector ? '#059669' : getBarColor(entry.nota)} 
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                        style={{ filter: selectedSector && entry.name !== selectedSector ? 'grayscale(100%) opacity(0.3)' : 'none' }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* LISTA DE AÇÕES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-emerald-600" />
                    <h3 className="font-bold text-sm text-gray-800">Histórico de Ações</h3>
                </div>
                <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-500 font-medium">
                    {filteredActionPlans.length} ações
                </span>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {filteredActionPlans.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Nenhuma ação encontrada para este filtro.</div>
                ) : (
                    filteredActionPlans.map(plan => (
                        <div key={plan.id} onClick={() => onViewActionPlan(plan)} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center">
                            <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2 mb-1">
                                    {getStatusIcon(plan.status)}
                                    <span className="text-xs font-bold uppercase text-gray-700">{getStatusLabel(plan.status)}</span>
                                    <span className="text-[10px] text-gray-400">• {new Date(plan.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <p className="font-medium text-xs text-gray-800 line-clamp-2">{plan.issueDescription}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">{plan.department}</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
