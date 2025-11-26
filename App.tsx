
import React, { useState } from 'react';
import { User, AuditData, ActionPlan, AuditRecord, Schedule, Answer } from './types';
import { calculateScore } from './utils';
import { useAppData } from './hooks/useAppData';

// Components
import SignaturePad from './components/SignaturePad';
import ImageViewerModal from './components/ImageViewerModal';
import ReportView from './components/ReportView';
import MuralReportView from './components/MuralReportView';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import ConfirmationModal from './components/ConfirmationModal';
import AnalyticsDashboard from './components/views/AnalyticsDashboard';
import RealizadasView from './components/views/RealizadasView';

// Views
import LoginView from './components/views/LoginView';
import DashboardView from './components/views/DashboardView';
import AuditWizard from './components/views/AuditWizard';
import AdminQuestions from './components/views/admin/AdminQuestions';
import AdminGoals from './components/views/admin/AdminGoals';

import { 
  ChevronLeft, Calendar, Users, Trash2, Plus, ChevronDown, UserPlus, 
  Activity, ClipboardCheck, CalendarDays, Home, FileText, Layout, 
  Eye, CheckCircle, XCircle, AlertCircle, Clock, Camera, ImageIcon, Save, X
} from 'lucide-react';

export default function App() {
  const { 
    users, departments, stages, actionPlans, history, schedules, goals,
    addUser, deleteUser, updateUser, addDepartment, deleteDepartment, updateStages, addActionPlan, updateActionPlan,
    addAuditToHistory, addSchedule, deleteSchedule, addGoal, deleteGoal
  } = useAppData();

  const [currentView, setCurrentView] = useState('login'); 
  const [previousView, setPreviousView] = useState('dashboard'); 
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  
  const [auditData, setAuditData] = useState<AuditData>({
    department: '',
    auditor: '',
    auditee: '', 
    date: '',
    answers: {},
    signatures: { auditor: null, auditee: null },
    scheduleId: null
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [signatureStep, setSignatureStep] = useState<'auditor' | 'auditee' | null>(null);

  const [selectedActionPlan, setSelectedActionPlan] = useState<ActionPlan | null>(null); 
  const [executionData, setExecutionData] = useState<{text: string, evidence: string}>({ text: '', evidence: '' });
  const [approvalNote, setApprovalNote] = useState('');

  // Filters Admin Action Plans
  const [actionFilterDept, setActionFilterDept] = useState('');
  const [actionFilterAuditor, setActionFilterAuditor] = useState('');

  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [reportPreviousScore, setReportPreviousScore] = useState<number | null>(null);
  
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', username: '', password: '', role: 'auditor', department: '' });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newSchedule, setNewSchedule] = useState({ department: '', auditor: '', date: '' });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'user' | 'schedule';
    id: number;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'user',
    id: 0,
    title: '',
    message: ''
  });

  const isAdmin = currentUser?.role === 'admin';
  const canAudit = currentUser?.role === 'admin' || currentUser?.role === 'auditor';
  const isViewer = currentUser?.role === 'viewer';

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    if(user.role === 'auditor') {
      setAuditData(prev => ({ ...prev, auditor: user.name }));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const startAudit = (schedule?: Schedule) => {
    setAuditData({
      department: schedule?.department || '',
      auditor: currentUser?.role === 'auditor' ? currentUser.name : (schedule?.auditor || ''),
      auditee: '', 
      date: schedule ? schedule.date : new Date().toISOString().split('T')[0],
      answers: {},
      signatures: { auditor: null, auditee: null },
      scheduleId: schedule?.id || null
    });
    setCurrentStep(-1);
    setCurrentView('audit');
  };

  const finishAudit = (finalData = auditData) => {
    let validDate = finalData.date;
    if (!validDate) {
        validDate = new Date().toISOString().split('T')[0];
        finalData.date = validDate;
    }

    const { finalScore } = calculateScore(finalData, stages);
    let status = 'NA';
    
    if (finalScore !== null) {
        status = finalScore >= 9 ? 'Excelente' : finalScore >= 7 ? 'Bom' : 'Crítico';
    }
    const newAudit: AuditRecord = {
      id: Date.now(),
      date: validDate,
      department: finalData.department,
      score: finalScore,
      status: status,
      fullData: finalData
    };
    
    addAuditToHistory(newAudit);
    
    const newActionPlans: ActionPlan[] = [];
    const deadlineDate = new Date(validDate);
    deadlineDate.setDate(deadlineDate.getDate() + 30);
    const deadline = deadlineDate.toISOString().split('T')[0];
    
    Object.entries(finalData.answers).forEach(([qId, val]) => {
      const ans = val as Answer;
      if (ans.type === 'PARCIAL') {
        let qText = '';
        stages.forEach(s => {
           const q = s.questions.find(qu => qu.id.toString() === qId);
           if(q) qText = q.text;
        });
        newActionPlans.push({
          id: `${Date.now()}_${qId}`,
          auditId: newAudit.id,
          date: validDate,
          deadline: deadline, 
          department: finalData.department,
          auditor: finalData.auditor,
          questionText: qText,
          issueDescription: ans.action || '',
          originalEvidence: ans.evidence, 
          status: 'pending', 
          executionText: '',
          executionEvidence: '',
          logs: []
        });
      }
    });
    if(newActionPlans.length > 0) {
      addActionPlan(newActionPlans);
    }

    if (finalData.scheduleId) {
      deleteSchedule(finalData.scheduleId);
    }

    setCurrentView('results');
    setPreviousView('results');
  };

  const handleSignatureSave = (dataUrl: string) => {
    if (signatureStep === 'auditor') {
      setAuditData(prev => ({ ...prev, signatures: { ...prev.signatures, auditor: dataUrl } }));
      setSignatureStep('auditee');
    } else if (signatureStep === 'auditee') {
      const finalData = { ...auditData, signatures: { ...auditData.signatures, auditee: dataUrl } };
      setAuditData(finalData); 
      finishAudit(finalData);
    }
  };

  const handleOpenReport = (audit: AuditRecord) => {
    const previousAudit = history.filter(h => h.department === audit.department && new Date(h.date) <= new Date(audit.date) && h.id !== audit.id).sort((a, b) => b.id - a.id)[0];
    setReportPreviousScore(previousAudit ? previousAudit.score : null);
    if (audit.fullData) {
        setAuditData(audit.fullData);
        setPreviousView(currentView);
        setCurrentView('report');
    } else {
        alert('Dados detalhados não disponíveis.');
    }
  };

  const handleOpenMural = (audit: AuditRecord) => {
    const previousAudit = history.filter(h => h.department === audit.department && new Date(h.date) <= new Date(audit.date) && h.id !== audit.id).sort((a, b) => b.id - a.id)[0];
    setReportPreviousScore(previousAudit ? previousAudit.score : null);
    if (audit.fullData) {
        setAuditData(audit.fullData);
        setPreviousView(currentView);
        setCurrentView('muralReport');
    } else {
        alert('Dados detalhados não disponíveis.');
    }
  };

  const handleOpenExecution = (plan: ActionPlan) => {
    setSelectedActionPlan(plan);
    setExecutionData({ text: '', evidence: '' });
    setCurrentView('execute_action');
  };

  const handleSubmitExecution = () => {
    if (!selectedActionPlan) return;
    
    if (!executionData.text || !executionData.evidence) {
        alert("Preencha a descrição e anexe a evidência.");
        return;
    }

    updateActionPlan({
        ...selectedActionPlan, 
        status: 'executed', 
        executionText: executionData.text,
        executionEvidence: executionData.evidence,
        logs: [
            ...selectedActionPlan.logs, 
            { 
                type: 'execution', 
                user: currentUser?.name || '', 
                date: new Date().toISOString(), 
                text: executionData.text,
                evidence: executionData.evidence
            }
        ]
    });
    setCurrentView('dashboard');
  };

  const handleApprovalDecision = (decision: 'approved' | 'rejected') => {
    if (!selectedActionPlan) return;

    if (decision === 'rejected' && !approvalNote.trim()) {
        alert("Para reprovar, é OBRIGATÓRIO informar o motivo da devolução.");
        return;
    }

    updateActionPlan({
        ...selectedActionPlan, 
        status: decision, 
        logs: [
            ...selectedActionPlan.logs, 
            { 
                type: decision === 'approved' ? 'approval' : 'rejection', 
                user: currentUser?.name || '', 
                date: new Date().toISOString(),
                text: approvalNote 
            }
        ]
    });
    setCurrentView('dashboard');
    setSelectedActionPlan(null);
  };

  const handleSaveUser = () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
        alert("Preencha todos os campos obrigatórios");
        return;
    }
    if (newUser.role === 'viewer' && !newUser.department) {
        alert("Selecione um setor para o visualizador");
        return;
    }

    if (editingUserId) {
        updateUser({ ...newUser, id: editingUserId } as User);
        setEditingUserId(null);
    } else {
        if (users.some(u => u.username === newUser.username)) {
            alert("Nome de usuário já existe");
            return;
        }
        addUser({ ...newUser, id: Date.now() } as User);
    }
    setNewUser({ name: '', username: '', password: '', role: 'auditor', department: '' });
  };

  const startEditingUser = (user: User) => {
    setNewUser(user);
    setEditingUserId(user.id);
  };

  const cancelEditingUser = () => {
    setNewUser({ name: '', username: '', password: '', role: 'auditor', department: '' });
    setEditingUserId(null);
  };

  const requestDeleteUser = (user: User) => {
    setConfirmModal({
        isOpen: true,
        type: 'user',
        id: user.id,
        title: 'Excluir Usuário',
        message: `Tem certeza que deseja excluir o usuário "${user.name}"?`
    });
  };

  const requestDeleteSchedule = (scheduleId: number) => {
    setConfirmModal({
        isOpen: true,
        type: 'schedule',
        id: scheduleId,
        title: 'Excluir Agendamento',
        message: 'Tem certeza que deseja excluir este agendamento?'
    });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.type === 'user') {
        deleteUser(confirmModal.id);
    } else if (confirmModal.type === 'schedule') {
        deleteSchedule(confirmModal.id);
    }
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const renderResults = () => {
    const { finalScore } = calculateScore(auditData, stages);
    const isNA = finalScore === null;
    const statusColor = (finalScore || 0) >= 9 ? 'text-emerald-600' : (finalScore || 0) >= 7 ? 'text-blue-600' : 'text-red-600';
    const statusText = isNA ? 'NÃO APLICÁVEL' : ((finalScore || 0) >= 9 ? 'EXCELENTE' : (finalScore || 0) >= 7 ? 'BOM / APROVADO' : 'CRÍTICO / REPROVADO');

    return (
      <div className="animate-fade-in pb-20 md:pb-0">
        <header className="mb-6 flex items-center gap-3">
            <button onClick={() => setCurrentView('dashboard')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ChevronLeft size={24} /></button>
            <h1 className="text-xl font-bold">Relatório da Auditoria</h1>
        </header>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center mb-6 max-w-2xl mx-auto">
           <p className="text-sm text-gray-500 mb-1">{auditData.department}</p>
           <p className="text-xs text-gray-400 mb-4">Resp: {auditData.auditee}</p>
           <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 mb-4 ${isNA ? 'border-gray-300 text-gray-400' : statusColor.replace('text', 'border')}`}>
              <span className={`text-5xl font-bold ${statusColor}`}>{isNA ? 'NA' : finalScore?.toFixed(1)}</span>
           </div>
           <p className={`font-bold text-lg ${statusColor}`}>{statusText}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 mt-6 max-w-2xl mx-auto">
           <button onClick={() => {
               const previousAudit = history.filter(h => h.department === auditData.department && new Date(h.date) <= new Date(auditData.date)).sort((a, b) => b.id - a.id)[0];
               setReportPreviousScore(previousAudit ? previousAudit.score : null);
               setPreviousView(currentView);
               setCurrentView('report');
           }} className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"><FileText size={18} /> Relatório Detalhado</button>
           <button onClick={() => {
               const previousAudit = history.filter(h => h.department === auditData.department && new Date(h.date) <= new Date(auditData.date)).sort((a, b) => b.id - a.id)[0];
               setReportPreviousScore(previousAudit ? previousAudit.score : null);
               setPreviousView(currentView);
               setCurrentView('muralReport');
           }} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"><Layout size={18} /> Relatório Mural</button>
           <button onClick={() => setCurrentView('dashboard')} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-gray-200"><Home size={18} /> Página Inicial</button>
        </div>
      </div>
    );
  };

  const renderAdminSchedule = () => (
    <div className="h-full flex flex-col pb-20 md:pb-0">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex items-center gap-3 mb-6"><button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button><h1 className="text-xl font-bold">Gestão de Auditorias</h1></header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 h-fit">
                <div className="flex items-center gap-2 mb-4 text-emerald-600"><Calendar size={20} /><h3 className="font-bold text-gray-800">Agendar Próxima Auditoria</h3></div>
                <div className="space-y-3">
                <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Setor / Departamento</label><div className="relative mt-1"><select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none appearance-none" value={newSchedule.department} onChange={(e) => setNewSchedule({...newSchedule, department: e.target.value})}><option value="">Selecione...</option>{departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}</select><ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} /></div></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Auditor Responsável</label><div className="relative mt-1"><select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none appearance-none" value={newSchedule.auditor} onChange={(e) => setNewSchedule({...newSchedule, auditor: e.target.value})}><option value="">Selecione o auditor...</option>{users.filter(u => u.role === 'auditor').map(auditor => (<option key={auditor.id} value={auditor.name}>{auditor.name}</option>))}</select><ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} /></div></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Data Prevista</label><input type="date" className="w-full p-3 border border-gray-200 rounded-lg outline-none mt-1" value={newSchedule.date} onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})} /></div>
                <button onClick={() => { if(newSchedule.department && newSchedule.auditor && newSchedule.date) { addSchedule({...newSchedule, id: Date.now()}); setNewSchedule({department:'', auditor:'', date:''}); } else alert('Preencha tudo'); }} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold mt-2 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"><Plus size={18} /> Agendar</button>
                </div>
            </div>
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 ml-1">Agendamentos ({schedules.length})</h3>
                <div className="flex-1 overflow-y-auto space-y-3 max-h-[600px]">{schedules.length === 0 ? (<div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200"><p>Nenhuma auditoria agendada.</p></div>) : (schedules.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((schedule) => (<div key={schedule.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 flex justify-between items-center"><div><p className="font-bold text-gray-800">{schedule.department}</p><div className="flex items-center text-sm text-gray-500 gap-2 mt-1"><Users size={14} /><span>{schedule.auditor}</span></div><div className="flex items-center text-sm text-emerald-600 font-medium gap-2 mt-1"><Calendar size={14} /><span>{new Date(schedule.date + 'T00:00:00').toLocaleDateString()}</span></div></div>
                <button onClick={() => requestDeleteSchedule(schedule.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Excluir Agendamento"><Trash2 size={18} /></button></div>)))}</div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderAdminUsers = () => (
    <div className="h-full flex flex-col pb-20 md:pb-0">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex items-center gap-3 mb-6"><button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button><h1 className="text-xl font-bold">Gerenciar Usuários</h1></header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 h-fit">
                <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 ${editingUserId ? 'text-blue-600' : 'text-purple-600'}`}>
                        <UserPlus size={20} />
                        <h3 className="font-bold text-gray-800">{editingUserId ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</h3>
                    </div>
                    {editingUserId && (
                        <button onClick={cancelEditingUser} className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100">Cancelar Edição</button>
                    )}
                </div>
                <div className="space-y-3">
                <input type="text" placeholder="Nome Completo" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-purple-500" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
                <div className="flex gap-2"><input type="text" placeholder="Usuário (Login)" className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:border-purple-500" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} /><input type="text" placeholder="Senha" className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:border-purple-500" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Perfil de Acesso</label><div className="grid grid-cols-3 gap-2">{['admin', 'auditor', 'viewer'].map((role) => (<button key={role} onClick={() => setNewUser({...newUser, role: role as User['role']})} className={`p-2 rounded-lg text-xs font-bold border capitalize ${newUser.role === role ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{role === 'viewer' ? 'Visualizador' : role}</button>))}</div></div>
                {newUser.role === 'viewer' && (<div className="mt-3 animate-fade-in"><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Setor do Visualizador</label><div className="relative"><select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none appearance-none" value={newUser.department || ''} onChange={(e) => setNewUser({...newUser, department: e.target.value})}><option value="">Selecione o setor...</option>{departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}</select><ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} /></div></div>)}
                
                <button 
                    onClick={handleSaveUser} 
                    className={`w-full text-white py-3 rounded-lg font-bold mt-2 flex items-center justify-center gap-2 transition-colors ${editingUserId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {editingUserId ? <Save size={18} /> : <Plus size={18} />} 
                    {editingUserId ? 'Salvar Alterações' : 'Adicionar Usuário'}
                </button>
                </div>
            </div>
            
            <div className="flex flex-col h-full">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 ml-1">Usuários Cadastrados ({users.length})</h3>
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[600px]">
                    {users.map((user) => (
                        <div 
                            key={user.id} 
                            onClick={() => startEditingUser(user)}
                            className={`bg-white p-3 rounded-xl shadow-sm border flex justify-between items-center cursor-pointer transition-all ${editingUserId === user.id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'border-gray-100 hover:border-purple-200'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${editingUserId === user.id ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800">{user.name}</p>
                                    <div className="flex items-center gap-2"><span className="text-xs text-gray-500">@{user.username}</span></div>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    requestDeleteUser(user);
                                }} 
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" 
                                title="Excluir Usuário"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderAdminActionPlans = () => {
    const filteredPlans = actionPlans.filter(p => {
      if (actionFilterDept && p.department !== actionFilterDept) return false;
      if (actionFilterAuditor && p.auditor !== actionFilterAuditor) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const clearFilters = () => {
        setActionFilterDept('');
        setActionFilterAuditor('');
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'approved': return <CheckCircle size={16} className="text-green-600" />;
            case 'rejected': return <XCircle size={16} className="text-red-600" />;
            case 'executed': return <Clock size={16} className="text-blue-600" />;
            default: return <AlertCircle size={16} className="text-yellow-600" />;
        }
    };

    return (
    <div className="h-full flex flex-col pb-20 md:pb-0">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
        <header className="flex items-center gap-3 mb-6">
            <button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button>
            <h1 className="text-xl font-bold">Gestão de Planos de Ação</h1>
        </header>

        <div className="flex gap-2 mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm items-end w-full mx-auto">
            <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Setor</label>
                <select 
                    value={actionFilterDept} 
                    onChange={(e) => setActionFilterDept(e.target.value)}
                    className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none"
                >
                    <option value="">Todos</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Auditor</label>
                <select 
                    value={actionFilterAuditor} 
                    onChange={(e) => setActionFilterAuditor(e.target.value)}
                    className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none"
                >
                    <option value="">Todos</option>
                    {users.filter(u => u.role === 'auditor').map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
            </div>
            {(actionFilterDept || actionFilterAuditor) && (
                <button onClick={clearFilters} className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-[34px] flex items-center justify-center border border-transparent hover:border-red-100">
                    <X size={16} />
                </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 w-full mx-auto">
            {filteredPlans.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200"><p>Nenhum plano de ação encontrado.</p></div>
            ) : (
            filteredPlans.map(plan => (
                <div key={plan.id} onClick={() => { setSelectedActionPlan(plan); setPreviousView('admin_action_plans'); setCurrentView('action_plan_details'); }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-emerald-200 cursor-pointer transition-all">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(plan.status)}
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${plan.status === 'approved' ? 'bg-green-100 text-green-700' : plan.status === 'rejected' ? 'bg-red-100 text-red-700' : plan.status === 'executed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {plan.status === 'approved' ? 'Aprovado' : plan.status === 'rejected' ? 'Reprovado' : plan.status === 'executed' ? 'Executado' : 'Pendente'}
                            </span>
                        </div>
                        <p className="font-bold text-gray-800 text-sm line-clamp-2">{plan.issueDescription}</p>
                        <p className="text-xs text-gray-500 mt-1">{plan.department} • Auditor: {plan.auditor}</p>
                    </div>
                    <div className="text-right pl-2">
                        <p className="text-[10px] text-gray-500 font-bold">Prazo</p>
                        <p className="text-xs font-medium text-gray-700">{new Date(plan.deadline).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                </div>
            ))
            )}
        </div>
      </div>
    </div>
    );
  };

  const renderAgenda = () => {
    const allItems = [
      ...schedules.map(s => ({ ...s, type: 'audit' as const })),
      ...actionPlans.filter(p => p.status !== 'approved' && p.status !== 'executed').map(p => ({ id: p.id, department: p.department, auditor: p.auditor, date: p.deadline, type: 'action_plan' as const, issue: p.issueDescription }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="h-full flex flex-col pb-20 md:pb-0">
        <header className="flex items-center gap-3 mb-6">
            <button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button>
            <h1 className="text-xl font-bold flex items-center gap-2"><CalendarDays className="text-emerald-600" /> Agenda</h1>
        </header>
        <div className="flex-1 overflow-y-auto space-y-4 w-full">
          {allItems.length === 0 ? <p className="text-center text-gray-400">Vazio</p> : allItems.map((item, idx) => (
             <div key={idx} className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
                 <div className="flex flex-col items-center w-16 border-r border-gray-100 pr-4">
                    <span className="text-xs font-bold text-gray-500 uppercase">{new Date(item.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                    <span className="text-2xl font-bold text-gray-600">{new Date(item.date).getDate()}</span>
                 </div>
                 <div className="flex-1 pl-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.type === 'audit' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.type === 'audit' ? 'Auditoria' : 'Ação'}
                        </span>
                    </div>
                    <p className="font-bold text-gray-800">{item.department}</p>
                    {item.type === 'action_plan' && <p className="text-xs text-gray-500 mt-1">{item.issue}</p>}
                 </div>
                 <div className="text-right text-xs text-gray-400 hidden sm:block">
                    {item.auditor}
                 </div>
             </div>
          ))}
        </div>
      </div>
    );
  };

  const showBottomNav = ['dashboard', 'agenda', 'history_list', 'realizadas'].includes(currentView);

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex justify-center">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
           <LoginView users={users} onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
      {/* Sidebar for Tablet/Desktop */}
      {currentUser && (
        <SideNav 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          currentUser={currentUser}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 overflow-y-auto scrollbar-hide print:overflow-visible p-5">
          <div className="max-w-7xl mx-auto h-full"> {/* Container for large screens */}
            {currentView === 'dashboard' && currentUser && (
                <DashboardView 
                currentUser={currentUser}
                history={history}
                schedules={schedules}
                actionPlans={actionPlans}
                isAdmin={isAdmin}
                isViewer={isViewer}
                canAudit={canAudit}
                onNavigate={setCurrentView}
                onStartAudit={startAudit}
                onLogout={handleLogout}
                onOpenExecution={handleOpenExecution}
                onOpenApproval={(plan) => { setSelectedActionPlan(plan); setApprovalNote(''); setCurrentView('approve_action'); }}
                />
            )}

            {currentView === 'audit' && (
                <AuditWizard 
                currentStep={currentStep}
                stages={stages}
                departments={departments}
                auditData={auditData}
                setAuditData={setAuditData}
                setCurrentStep={setCurrentStep}
                onCancel={() => setCurrentView('dashboard')}
                onFinishWizard={() => { setSignatureStep('auditor'); setCurrentView('signatures'); }}
                />
            )}

            {currentView === 'signatures' && (
                <SignaturePad 
                key={signatureStep} 
                title={signatureStep === 'auditor' ? "Assinatura do Auditor" : "Assinatura do Responsável"}
                assigneeName={signatureStep === 'auditor' ? auditData.auditor : auditData.auditee}
                onSave={handleSignatureSave}
                onBack={() => signatureStep === 'auditor' ? setCurrentView('audit') : setSignatureStep('auditor')}
                />
            )}

            {currentView === 'results' && renderResults()}
            
            {currentView === 'report' && (
                <ReportView 
                    auditData={auditData} 
                    stages={stages} 
                    calculateScore={calculateScore} 
                    onBack={() => setCurrentView(previousView || 'dashboard')} 
                    previousScore={reportPreviousScore} 
                />
            )}
            
            {currentView === 'muralReport' && (
                <MuralReportView 
                    auditData={auditData} 
                    stages={stages} 
                    calculateScore={calculateScore} 
                    onBack={() => setCurrentView(previousView || 'dashboard')} 
                    previousScore={reportPreviousScore} 
                />
            )}

            {/* Admin Views */}
            {currentView === 'admin_questions' && (
                <AdminQuestions 
                departments={departments}
                stages={stages}
                onAddDepartment={addDepartment}
                onRemoveDepartment={deleteDepartment}
                onUpdateStages={updateStages}
                onNavigate={setCurrentView}
                />
            )}
            {currentView === 'admin_goals' && (
                <AdminGoals 
                departments={departments}
                goals={goals}
                onAddGoal={addGoal}
                onDeleteGoal={deleteGoal}
                onNavigate={setCurrentView}
                />
            )}
            {currentView === 'admin_users' && renderAdminUsers()}
            {currentView === 'admin_schedule' && renderAdminSchedule()}
            {currentView === 'admin_action_plans' && renderAdminActionPlans()}
            
            {/* Main Tabs */}
            {currentView === 'agenda' && renderAgenda()}
            
            {/* Analytics Dashboard (BI) */}
            {currentView === 'history_list' && (
                <AnalyticsDashboard 
                history={history}
                stages={stages}
                actionPlans={actionPlans}
                onBack={() => setCurrentView('dashboard')}
                onViewActionPlan={(plan) => {
                    setSelectedActionPlan(plan);
                    setPreviousView('history_list');
                    setCurrentView('action_plan_details');
                }}
                />
            )}

            {/* New Realizadas List View */}
            {currentView === 'realizadas' && (
                <RealizadasView 
                history={history}
                actionPlans={actionPlans}
                onOpenReport={handleOpenReport}
                onOpenMural={handleOpenMural}
                onViewImage={(url) => setViewingImage(url)}
                onBack={() => setCurrentView('dashboard')}
                />
            )}

            {/* New Action Plan Details View (Timeline) */}
            {currentView === 'action_plan_details' && selectedActionPlan && (
                <div className="h-full flex flex-col pb-20 md:pb-0 bg-gray-50">
                    <header className="flex items-center gap-3 mb-6">
                        <button onClick={() => setCurrentView(previousView === 'admin_action_plans' ? 'admin_action_plans' : 'history_list')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button>
                        <h1 className="text-xl font-bold">Detalhes da Ação</h1>
                    </header>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
                        {/* Status Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                {selectedActionPlan.status === 'approved' ? <CheckCircle className="text-green-600" size={20}/> :
                                selectedActionPlan.status === 'rejected' ? <XCircle className="text-red-600" size={20}/> :
                                selectedActionPlan.status === 'executed' ? <Clock className="text-blue-600" size={20}/> :
                                <AlertCircle className="text-yellow-600" size={20}/> }
                                <span className="font-bold uppercase text-sm text-gray-700">
                                    {selectedActionPlan.status === 'approved' ? 'Aprovado' : 
                                    selectedActionPlan.status === 'rejected' ? 'Rejeitado' :
                                    selectedActionPlan.status === 'executed' ? 'Executado' : 'Pendente'}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedActionPlan.issueDescription}</h3>
                            <p className="text-sm text-gray-500">{selectedActionPlan.questionText}</p>
                        </div>

                        {/* Basic Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-sm">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><span className="text-gray-400 font-bold block text-xs uppercase">Departamento</span>{selectedActionPlan.department}</div>
                                <div><span className="text-gray-400 font-bold block text-xs uppercase">Auditor</span>{selectedActionPlan.auditor}</div>
                                <div><span className="text-gray-400 font-bold block text-xs uppercase">Prazo</span>{new Date(selectedActionPlan.deadline).toLocaleDateString('pt-BR')}</div>
                                <div><span className="text-gray-400 font-bold block text-xs uppercase">Criado em</span>{new Date(selectedActionPlan.date).toLocaleDateString('pt-BR')}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Evidences */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2"><Eye size={16}/> Evidências</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedActionPlan.originalEvidence && (
                                        <div onClick={() => setViewingImage(selectedActionPlan.originalEvidence || null)} className="cursor-pointer">
                                            <div className="h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative mb-1">
                                                <img src={selectedActionPlan.originalEvidence} className="w-full h-full object-cover" alt="Original" />
                                            </div>
                                            <span className="text-[10px] font-bold text-red-500 uppercase">Antes (Problema)</span>
                                        </div>
                                    )}
                                    {selectedActionPlan.executionEvidence && (
                                        <div onClick={() => setViewingImage(selectedActionPlan.executionEvidence || null)} className="cursor-pointer">
                                            <div className="h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative mb-1">
                                                <img src={selectedActionPlan.executionEvidence} className="w-full h-full object-cover" alt="Execução" />
                                            </div>
                                            <span className="text-[10px] font-bold text-green-500 uppercase">Depois (Execução)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-2"><Activity size={16}/> Linha do Tempo</h4>
                                <div className="border-l-2 border-gray-100 pl-4 space-y-6">
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-300 border-2 border-white shadow-sm"></div>
                                        <div className="text-xs">
                                            <p className="font-bold text-gray-800">Ação Criada</p>
                                            <p className="text-gray-400">{new Date(selectedActionPlan.date).toLocaleString('pt-BR')}</p>
                                            <p className="text-gray-500 mt-1 italic">Identificado na auditoria</p>
                                        </div>
                                    </div>
                                    
                                    {selectedActionPlan.logs && selectedActionPlan.logs.map((log, idx) => (
                                        <div key={idx} className="relative">
                                            <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                                log.type === 'approval' ? 'bg-green-500' : 
                                                log.type === 'rejection' ? 'bg-red-500' : 'bg-blue-500'
                                            }`}></div>
                                            <div className="text-xs">
                                                <p className="font-bold text-gray-800">
                                                    {log.type === 'execution' ? 'Execução' : log.type === 'approval' ? 'Aprovação' : 'Rejeição'}
                                                </p>
                                                <p className="text-gray-400">{new Date(log.date).toLocaleString('pt-BR')} • {log.user}</p>
                                                {log.text && <p className="text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-100">"{log.text}"</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Plans Operations - Centered for Desktop */}
            {currentView === 'execute_action' && selectedActionPlan && (
                <div className="h-full flex flex-col p-6 bg-gray-50 animate-fade-in items-center">
                    <div className="w-full max-w-2xl flex flex-col h-full">
                        <header className="flex items-center gap-3 mb-6 w-full">
                            <button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24}/></button>
                            <h1 className="text-xl font-bold text-gray-800">Executar Plano de Ação</h1>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto pb-6 space-y-4 w-full">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">PROBLEMA IDENTIFICADO</p>
                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{selectedActionPlan.issueDescription}</h3>
                                <p className="text-xs text-gray-500 border-b border-gray-100 pb-3">Referente a: {selectedActionPlan.questionText}</p>
                                
                                {selectedActionPlan.originalEvidence && (
                                    <div className="pt-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><Camera size={10}/> FOTO DO PROBLEMA (AUDITORIA)</p>
                                        <div onClick={() => setViewingImage(selectedActionPlan.originalEvidence!)} className="h-64 w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative cursor-pointer group">
                                            <img src={selectedActionPlan.originalEvidence} className="w-full h-full object-cover" alt="Problema" />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                                <Eye className="text-white opacity-0 group-hover:opacity-100 drop-shadow-lg" size={32} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">O que foi feito?</label>
                                    <textarea 
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-32 text-sm"
                                        placeholder="Descreva a ação corretiva..."
                                        value={executionData.text}
                                        onChange={(e) => setExecutionData({...executionData, text: e.target.value})}
                                    />
                                </div>
                                
                                <button 
                                    className={`w-full py-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${executionData.evidence ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                    onClick={() => setExecutionData(prev => ({...prev, evidence: 'https://picsum.photos/400/300?random=' + Date.now()}))}
                                >
                                    <Camera size={18} />
                                    {executionData.evidence ? 'Evidência Anexada' : 'Anexar Foto da Execução'}
                                </button>
                                
                                {executionData.evidence && (
                                    <div className="relative h-48 w-full rounded-lg overflow-hidden border border-green-200">
                                        <img src={executionData.evidence} className="w-full h-full object-cover" alt="Preview" />
                                        <button onClick={() => setExecutionData(prev => ({...prev, evidence: ''}))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><XCircle size={16}/></button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 bg-gray-50 w-full">
                            <button 
                                onClick={handleSubmitExecution} 
                                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20} /> Concluir Execução
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {currentView === 'approve_action' && selectedActionPlan && (
                <div className="h-full flex flex-col p-6 bg-gray-50 animate-fade-in items-center">
                    <div className="w-full max-w-2xl flex flex-col h-full">
                        <header className="flex items-center gap-3 mb-6 w-full">
                            <button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24}/></button>
                            <h1 className="text-xl font-bold text-gray-800">Avaliar Ação</h1>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto pb-6 space-y-4 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-400 h-full">
                                    <p className="text-[10px] text-red-400 font-bold uppercase mb-2">PROBLEMA ORIGINAL</p>
                                    <p className="font-bold text-gray-800 text-lg mb-3">{selectedActionPlan.issueDescription}</p>
                                    {selectedActionPlan.originalEvidence && (
                                        <button 
                                            onClick={() => setViewingImage(selectedActionPlan.originalEvidence!)} 
                                            className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline"
                                        >
                                            <Eye size={12} /> Ver Foto do Problema
                                        </button>
                                    )}
                                </div>

                                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 h-full">
                                    <p className="text-[10px] text-green-600 font-bold uppercase mb-2">EXECUÇÃO REALIZADA</p>
                                    <p className="font-medium text-gray-800 mb-3 text-sm">{selectedActionPlan.executionText}</p>
                                    {selectedActionPlan.executionEvidence && (
                                        <div 
                                            onClick={() => setViewingImage(selectedActionPlan.executionEvidence!)}
                                            className="h-32 bg-gray-100 rounded-lg border border-dashed border-gray-300 relative group cursor-pointer overflow-hidden"
                                        >
                                            <img src={selectedActionPlan.executionEvidence} className="w-full h-full object-cover" alt="Evidência Execução" />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                                <Eye className="text-white opacity-0 group-hover:opacity-100 drop-shadow-lg" size={32} />
                                            </div>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setViewingImage(selectedActionPlan.executionEvidence || null)} 
                                        className="mt-2 text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <Eye size={12} /> Visualizar Foto Ampliada
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">OBSERVAÇÕES / MOTIVO DA DEVOLUÇÃO</label>
                                <textarea 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                    rows={3}
                                    placeholder="Obrigatório em caso de recusa..."
                                    value={approvalNote}
                                    onChange={(e) => setApprovalNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 bg-gray-50 w-full">
                            <button 
                                onClick={() => handleApprovalDecision('rejected')} 
                                className="py-3 rounded-xl border border-red-200 bg-white text-red-700 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-red-50"
                            >
                                <XCircle size={20} /> Recusar
                            </button>
                            <button 
                                onClick={() => handleApprovalDecision('approved')} 
                                className="py-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform hover:bg-emerald-700"
                            >
                                <CheckCircle size={20} /> Aprovar
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </main>
        {showBottomNav && <BottomNav currentView={currentView} onChangeView={(view) => { setPreviousView(view); setCurrentView(view); }} />}
        
        <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
        
        <ConfirmationModal 
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
}
