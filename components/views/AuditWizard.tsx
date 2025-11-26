
import React from 'react';
import { ChevronLeft, ChevronRight, PenTool, Filter, Check, AlertTriangle, Ban, Camera } from 'lucide-react';
import { AuditData, Stage, Answer } from '../../types';
import MultiSelectDropdown from '../MultiSelectDropdown';

interface AuditWizardProps {
  currentStep: number;
  stages: Stage[];
  departments: string[];
  auditData: AuditData;
  setAuditData: React.Dispatch<React.SetStateAction<AuditData>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onCancel: () => void;
  onFinishWizard: () => void;
}

const AuditWizard: React.FC<AuditWizardProps> = ({
  currentStep, stages, departments, auditData, setAuditData, setCurrentStep, onCancel, onFinishWizard
}) => {
  
  // Helpers para manipulação de respostas
  const handleAnswerType = (qId: number, type: 'OK' | 'PARCIAL' | 'NA') => {
    let newAnswer: Answer = { type, score: 0, action: '', evidence: '' };
    if (type === 'OK') newAnswer.score = 10;
    if (type === 'NA') newAnswer.score = null; 
    if (type === 'PARCIAL') newAnswer.score = 5; 

    setAuditData(prev => ({
      ...prev,
      answers: { ...prev.answers, [qId]: newAnswer }
    }));
  };

  const updatePartialDetails = (qId: number, field: keyof Answer, value: string | number) => {
    setAuditData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [qId]: { ...prev.answers[qId], [field]: value as any }
      }
    }));
  };

  // Renderização da Etapa Inicial (Configuração)
  if (currentStep === -1) {
    return (
      <div className="h-full flex flex-col p-6 bg-gray-50 animate-fade-in">
        <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
            <header className="flex items-center gap-3 mb-8">
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24}/></button>
            <h1 className="text-2xl font-bold text-gray-800">Nova Auditoria</h1>
            </header>
            <div className="space-y-4 flex-1">
                <div>
                <label className="text-sm font-bold text-gray-700">Departamento Auditado</label>
                <select 
                    className="w-full p-4 mt-1 border border-gray-300 rounded-xl bg-white text-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    value={auditData.department}
                    onChange={(e) => setAuditData({...auditData, department: e.target.value})}
                >
                    <option value="">Selecione...</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                </div>
                <div>
                <label className="text-sm font-bold text-gray-700">Responsável pelo Setor (Acompanhante)</label>
                <input 
                    type="text" 
                    className="w-full p-4 mt-1 border border-gray-300 rounded-xl bg-white text-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nome do acompanhante"
                    value={auditData.auditee || ''}
                    onChange={(e) => setAuditData({...auditData, auditee: e.target.value})}
                />
                </div>
                <div>
                <label className="text-sm font-bold text-gray-700">Auditor</label>
                <input 
                    type="text" 
                    className="w-full p-4 mt-1 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 text-lg outline-none"
                    value={auditData.auditor}
                    readOnly
                />
                </div>
            </div>
            <button 
            disabled={!auditData.department || !auditData.auditee}
            onClick={() => setCurrentStep(0)} 
            className="w-full bg-emerald-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 mt-6"
            >
            Iniciar Check-list <ChevronRight size={20} />
            </button>
        </div>
      </div>
    );
  }

  // Renderização das Etapas de Perguntas
  const stage = stages[currentStep];
  const isLastStep = currentStep === stages.length - 1;
  const currentDepartmentQuestions = stage.questions.filter(q => { const qDepts = q.departments || ['all']; return qDepts.includes('all') || qDepts.includes(auditData.department); });
  const isStepValid = currentDepartmentQuestions.every(q => { 
    const answer = auditData.answers[q.id]; 
    if (!answer?.type) return false; 
    if (answer.type === 'PARCIAL') { 
      if (!answer.action || answer.action.trim() === '') return false; 
      if (stage.id !== 'shitsuke' && !answer.evidence) return false; 
    } 
    return true; 
  });

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-full relative">
        <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
            <button onClick={() => setCurrentStep(prev => prev - 1)} className="text-gray-500 hover:text-gray-800 flex items-center"><ChevronLeft size={20} /> Voltar</button>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Etapa {currentStep + 1}/{stages.length}</span>
            </div>
            <div className={`p-4 rounded-xl border-l-4 ${stage.borderColor} ${stage.bgColor} mb-2 shadow-sm`}>
            <h2 className={`text-lg font-bold ${stage.color}`}>{stage.title}</h2>
            <p className="text-xs text-gray-600 mt-1">{stage.description}</p>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500"><Filter size={10} /> Setor: <span className="font-bold">{auditData.department}</span></div>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-24 space-y-6 pr-1">
            {currentDepartmentQuestions.length === 0 ? (<div className="text-center py-10 text-gray-400 italic">Nenhuma pergunta aplicável a este setor nesta etapa.</div>) : (
            currentDepartmentQuestions.map((q) => {
                const answer = auditData.answers[q.id];
                const isParcial = answer?.type === 'PARCIAL';
                const qDepts = q.departments || ['all'];
                return (
                <div key={q.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm relative">
                    {!qDepts.includes('all') && (<div className="absolute top-2 right-2 flex gap-1"><span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase font-bold tracking-wider">Exclusivo</span></div>)}
                    <p className="font-medium text-gray-800 mb-3 text-sm leading-relaxed pr-12">{q.text}</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                    <button onClick={() => handleAnswerType(q.id, 'OK')} className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 border transition-all ${answer?.type === 'OK' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}><Check size={16} /> OK</button>
                    <button onClick={() => handleAnswerType(q.id, 'PARCIAL')} className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 border transition-all ${answer?.type === 'PARCIAL' ? 'bg-yellow-500 text-white border-yellow-500 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}><AlertTriangle size={16} /> Parcial</button>
                    <button onClick={() => handleAnswerType(q.id, 'NA')} className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 border transition-all ${answer?.type === 'NA' ? 'bg-gray-600 text-white border-gray-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}><Ban size={16} /> N/A</button>
                    </div>
                    {isParcial && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 animate-fade-in relative">
                        <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 bg-yellow-50 border-l border-t border-yellow-200 transform rotate-45"></div>
                        <div className="mb-3"><label className="flex justify-between text-xs font-bold text-yellow-800 mb-1">Nota (0 a 9): <span className="text-lg">{answer?.score}</span></label><input type="range" min="0" max="9" step="1" value={answer?.score || 0} onChange={(e) => updatePartialDetails(q.id, 'score', parseInt(e.target.value))} className="w-full accent-yellow-600 h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer" /></div>
                        <div className="mb-3"><textarea placeholder="Descreva a Ação de Melhoria Obrigatória..." className={`w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 transition-all ${(!answer?.action || answer.action.trim() === '') ? 'border-red-300 focus:ring-red-200 placeholder-red-300' : 'border-yellow-300 focus:border-yellow-600 focus:ring-yellow-200'}`} rows={2} value={answer?.action || ''} onChange={(e) => updatePartialDetails(q.id, 'action', e.target.value)} />{(!answer?.action || answer.action.trim() === '') && (<p className="text-[10px] text-red-500 mt-1 font-medium">* Obrigatório preencher a ação</p>)}</div>
                        <button className={`w-full py-2 rounded border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${answer?.evidence ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-100'}`} onClick={() => updatePartialDetails(q.id, 'evidence', 'https://picsum.photos/400/300?random=' + q.id)}><Camera size={16} /> {answer?.evidence ? 'Evidência Anexada' : 'Registrar Evidência (Foto)'}</button>
                        {!answer?.evidence && stage.id !== 'shitsuke' && (<p className="text-[10px] text-red-500 mt-1 font-medium text-center">* Obrigatório anexar foto</p>)}
                        {!answer?.evidence && stage.id === 'shitsuke' && (<p className="text-[10px] text-gray-400 mt-1 font-medium text-center italic">(Foto opcional para Shitsuke)</p>)}
                    </div>
                    )}
                </div>
                );
            })
            )}
        </div>
        <div className="fixed md:absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button 
            disabled={currentDepartmentQuestions.length > 0 && !isStepValid} 
            onClick={() => isLastStep ? onFinishWizard() : setCurrentStep(prev => prev + 1)} 
            className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${(currentDepartmentQuestions.length === 0 || isStepValid) ? 'bg-gray-900 text-white active:scale-95 hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
            {isLastStep ? 'Ir para Assinaturas' : 'Próxima Etapa'} {isLastStep ? <PenTool size={20} /> : <ChevronRight size={20} />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuditWizard;
