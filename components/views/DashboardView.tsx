
import React, { useRef, useState, useEffect } from 'react';
import { 
  ClipboardCheck, BarChart3, Shield, List, Users, Calendar, Activity, LogOut, 
  RotateCw, PenTool, CheckSquare, ArrowLeft, AlertTriangle, Plus, Clock, User as UserIcon, Eye, Target, Menu
} from 'lucide-react';
import { User, AuditRecord, Schedule, ActionPlan } from '../../types';

interface DashboardViewProps {
  currentUser: User;
  history: AuditRecord[];
  schedules: Schedule[];
  actionPlans: ActionPlan[];
  isAdmin: boolean;
  isViewer: boolean;
  canAudit: boolean;
  onNavigate: (view: string) => void;
  onStartAudit: (data?: any) => void;
  onLogout: () => void;
  onOpenExecution: (plan: ActionPlan) => void;
  onOpenApproval: (plan: ActionPlan) => void;
}

const getRoleBadge = (user: User) => {
  switch(user.role) {
    case 'admin': return <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1"><Shield size={10}/> Admin</span>;
    case 'auditor': return <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1"><ClipboardCheck size={10}/> Auditor</span>;
    case 'viewer': return (
      <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
        <Eye size={10}/> {user.department ? `Vis. ${user.department}` : 'Visualizador'}
      </span>
    );
    default: return null;
  }
};

const DashboardView: React.FC<DashboardViewProps> = ({ 
  currentUser, history, schedules, actionPlans, isAdmin, isViewer, canAudit,
  onNavigate, onStartAudit, onLogout, onOpenExecution, onOpenApproval
}) => {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueSchedules = schedules.filter(s => {
    const auditDate = new Date(s.date + 'T00:00:00');
    const isLate = auditDate < today;
    if (!isLate) return false;
    if (isAdmin) return true;
    if (currentUser.role === 'auditor') return s.auditor === currentUser.name;
    if (currentUser.role === 'viewer') return s.department === currentUser.department;
    return false;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const mySchedules = schedules.filter(s => {
    const auditDate = new Date(s.date + 'T00:00:00');
    const isUpcoming = auditDate >= today;
    if (!isUpcoming) return false;
    if (isAdmin) return true;
    if (currentUser.role === 'auditor') return s.auditor === currentUser.name;
    if (currentUser.role === 'viewer') return s.department === currentUser.department;
    return false;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);

  const myPendingActions = actionPlans.filter(p => {
    if (isViewer) return p.department === currentUser.department && (p.status === 'pending' || p.status === 'rejected');
    return false; 
  });

  const myApprovals = actionPlans.filter(p => {
    if (isAdmin) return p.status === 'executed'; 
    if (currentUser.role === 'auditor') return p.auditor === currentUser.name && p.status === 'executed';
    return false;
  });

  return (
    <div className="space-y-6 animate-fade-in relative h-full">
      <header className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Olá, {currentUser.name}</h1>
          <div className="flex items-center gap-2 mt-1">{getRoleBadge(currentUser)}</div>
        </div>
        
        {/* Mobile Admin Menu (Hidden on Desktop because SideNav handles it) */}
        <div className="flex gap-2 relative md:hidden" ref={menuRef}>
            {isAdmin && (
              <>
                <button onClick={() => setShowAdminMenu(!showAdminMenu)} className={`p-2 rounded-full transition-colors ${showAdminMenu ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'}`}><Shield size={20} /></button>
                {showAdminMenu && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-gray-50 bg-gray-50"><p className="text-xs font-bold text-gray-500 uppercase">Menu do Admin</p></div>
                    <div className="py-1">
                      <button onClick={() => { onNavigate('admin_questions'); setShowAdminMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2 border-b border-gray-50"><List size={16} className="text-blue-500"/> Gerenciar Lista e Perguntas</button>
                      <button onClick={() => { onNavigate('admin_users'); setShowAdminMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2 border-b border-gray-50"><Users size={16} className="text-purple-500"/> Gerenciamento de Usuários</button>
                      <button onClick={() => { onNavigate('admin_schedule'); setShowAdminMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2 border-b border-gray-50"><Calendar size={16} className="text-orange-500"/> Gestão de Auditorias</button>
                      <button onClick={() => { onNavigate('admin_goals'); setShowAdminMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2 border-b border-gray-50"><Target size={16} className="text-indigo-500"/> Gestão de Metas</button>
                      <button onClick={() => { onNavigate('admin_action_plans'); setShowAdminMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2"><Activity size={16} className="text-red-500"/> Planos de Ação</button>
                    </div>
                  </div>
                )}
              </>
            )}
            <button onClick={onLogout} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-500"><LogOut size={20} /></button>
        </div>
      </header>

      {/* Estatísticas Rápidas - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-4 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-90"><ClipboardCheck size={18} /><span className="text-sm font-medium">Auditorias</span></div>
          <div className="text-3xl font-bold">{history.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500"><BarChart3 size={18} /><span className="text-sm font-medium">Média Geral</span></div>
          <div className="text-3xl font-bold text-gray-800">
            {(() => { const validAudits = history.filter(h => h.score !== null); if (validAudits.length === 0) return 'NA'; const avg = validAudits.reduce((acc, cur) => acc + (cur.score || 0), 0) / validAudits.length; return avg.toFixed(1); })()}
          </div>
        </div>
      </div>

      {/* Layout Grid for Main Action Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pendências do Visualizador */}
        {isViewer && (
          <div className="space-y-4">
              {myPendingActions.length > 0 && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 shadow-sm animate-in fade-in h-full">
                  <h2 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2 uppercase tracking-wide"><RotateCw size={16} /> Planos de Ação Pendentes ({myPendingActions.length})</h2>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {myPendingActions.map(plan => (
                      <div key={plan.id} className="bg-white p-3 rounded-lg border-l-4 border-purple-500 shadow-sm">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">{plan.questionText}</p>
                        <p className="font-bold text-gray-800 text-sm mb-2">{plan.issueDescription}</p>
                        <button onClick={() => onOpenExecution(plan)} className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors flex items-center justify-center gap-1">
                          <PenTool size={12} /> Executar Ação
                        </button>
                        {plan.status === 'rejected' && <p className="text-[10px] text-red-500 mt-1 font-bold text-center">Ação anterior recusada. Refazer.</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Aprovações Pendentes (Admin/Auditor) */}
        {(canAudit) && myApprovals.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm animate-in fade-in h-full">
            <h2 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2 uppercase tracking-wide"><CheckSquare size={16} /> Aprovações Pendentes ({myApprovals.length})</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {myApprovals.map(plan => (
                <div key={plan.id} className="bg-white p-3 rounded-lg border-l-4 border-blue-500 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div><p className="font-bold text-gray-800 text-sm">{plan.department}</p><p className="text-xs text-gray-500">{plan.issueDescription}</p></div>
                    <button onClick={() => onOpenApproval(plan)} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"><ArrowLeft size={16} className="rotate-180" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auditorias Atrasadas */}
        {overdueSchedules.length > 0 && (
          <div className="bg-red-50 border-2 border-red-100 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 h-full">
            <h2 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2 uppercase tracking-wide"><AlertTriangle size={16} /> Atrasadas ({overdueSchedules.length})</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {overdueSchedules.map((s) => (
                <div key={s.id} className="bg-white p-3 rounded-lg border-l-4 border-red-500 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{s.department}</p>
                    <div className="flex items-center gap-2 text-xs text-red-600 font-bold mt-1"><Calendar size={12} /> {new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                    {isAdmin && <div className="text-[10px] text-gray-400 mt-0.5">Auditor: {s.auditor}</div>}
                  </div>
                  {(!isAdmin && currentUser.role === 'auditor' && s.auditor === currentUser.name) && (
                    <button onClick={() => onStartAudit(s)} className="bg-red-100 text-red-700 p-2 rounded-full hover:bg-red-200 transition-colors animate-pulse" title="Realizar Auditoria Atrasada"><Plus size={16} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Próximas Auditorias */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 shadow-sm h-full">
          <h2 className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2 uppercase tracking-wide"><Clock size={16} /> Próximas Auditorias {isAdmin ? '(Todas)' : '(Suas)'}</h2>
          {mySchedules.length === 0 ? (
            <div className="text-center py-4 text-orange-400 text-xs italic bg-white bg-opacity-50 rounded-lg border border-dashed border-orange-200">Nenhum agendamento futuro encontrado.</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {mySchedules.map((s) => (
                <div key={s.id} className="bg-white p-3 rounded-lg border-l-4 border-orange-500 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{s.department}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1"><Calendar size={12} /> {new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR')}{isAdmin && <><span className="text-gray-300">|</span> <UserIcon size={12}/> {s.auditor}</>}</div>
                  </div>
                  {(!isAdmin && currentUser.role === 'auditor' && s.auditor === currentUser.name) && (
                    <button onClick={() => onStartAudit(s)} className="bg-orange-100 text-orange-700 p-2 rounded-full hover:bg-orange-200 transition-colors" title="Iniciar Agora"><Plus size={16} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {canAudit && (
        <button onClick={() => onStartAudit()} className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-gray-800"><Plus size={20} /> Nova Auditoria Avulsa</button>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Histórico Recente</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {history.slice(0, 3).map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div><h3 className="font-medium text-gray-800">{item.department}</h3><p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('pt-BR')}</p></div>
              <div className="text-right"><div className="text-lg font-bold text-emerald-600">{item.score !== null ? item.score.toFixed(1) : 'NA'}</div><span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{item.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;