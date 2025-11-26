
import React, { useState } from 'react';
import { ChevronLeft, Settings, Plus, Edit2, Trash2 } from 'lucide-react';
import { Stage } from '../../../types';
import MultiSelectDropdown from '../../MultiSelectDropdown';
import ConfirmationModal from '../../ConfirmationModal';

interface AdminQuestionsProps {
  departments: string[];
  stages: Stage[];
  onAddDepartment: (dept: string) => void;
  onRemoveDepartment: (dept: string) => void;
  onUpdateStages: (stages: Stage[]) => void;
  onNavigate: (view: string) => void;
}

const AdminQuestions: React.FC<AdminQuestionsProps> = ({ 
  departments, stages, onAddDepartment, onRemoveDepartment, onUpdateStages, onNavigate 
}) => {
  const [newDept, setNewDept] = useState('');
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionDepts, setNewQuestionDepts] = useState<string[]>(['all']);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'department' | 'question';
    id: string | number; 
    stageId?: string; 
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'department',
    id: '',
    title: '',
    message: ''
  });

  const handleAddDepartment = () => {
    if (newDept && !departments.includes(newDept)) {
      onAddDepartment(newDept);
      setNewDept('');
    }
  };

  const addQuestionToStage = (stageId: string) => {
    if (!newQuestionText) return;
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          questions: [
            ...s.questions, 
            { id: Date.now(), text: newQuestionText, departments: newQuestionDepts }
          ]
        };
      }
      return s;
    });
    onUpdateStages(updatedStages);
    setNewQuestionText('');
    setNewQuestionDepts(['all']); 
  };

  const removeQuestion = (stageId: string, qId: number) => {
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return { ...s, questions: s.questions.filter(q => q.id !== qId) };
      }
      return s;
    });
    onUpdateStages(updatedStages);
  };

  const requestDeleteDepartment = (dept: string) => {
    setConfirmModal({
        isOpen: true,
        type: 'department',
        id: dept,
        title: 'Excluir Departamento',
        message: `Tem certeza que deseja excluir o departamento "${dept}"? Essa ação não pode ser desfeita.`
    });
  };

  const requestDeleteQuestion = (stageId: string, qId: number) => {
    setConfirmModal({
        isOpen: true,
        type: 'question',
        id: qId,
        stageId: stageId,
        title: 'Excluir Pergunta',
        message: 'Tem certeza que deseja excluir esta pergunta do checklist?'
    });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.type === 'department') {
        onRemoveDepartment(confirmModal.id as string);
    } else if (confirmModal.type === 'question' && confirmModal.stageId) {
        removeQuestion(confirmModal.stageId, confirmModal.id as number);
    }
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="w-full max-w-4xl mx-auto">
        <header className="flex items-center gap-3 mb-4">
            <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button>
            <h1 className="text-xl font-bold">Lista e Perguntas</h1>
        </header>
        
        {/* Gerenciamento de Departamentos */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Settings size={18} className="text-emerald-600" /> Departamentos</h3>
            <div className="flex gap-2 mb-3">
            <input value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="Novo departamento..." className="flex-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500" />
            <button onClick={handleAddDepartment} className="bg-emerald-600 text-white p-2 rounded-lg"><Plus size={20} /></button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2">
            {departments.map((dept) => (
                <div key={dept} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-sm">
                {dept}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        requestDeleteDepartment(dept);
                    }} 
                    type="button"
                    className="text-red-400 hover:bg-red-50 p-1 rounded transition-colors"
                    title="Excluir"
                >
                    <Trash2 size={16} />
                </button>
                </div>
            ))}
            </div>
        </div>

        {/* Gerenciamento de Perguntas */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Edit2 size={18} className="text-emerald-600" /> Checklist por Senso</h3>
            <div className="space-y-4">
            {stages.map(stage => (
                <div key={stage.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold text-sm ${stage.color}`}>{stage.title}</span>
                    <button onClick={() => setEditingStage(editingStage === stage.id ? null : stage.id)} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {editingStage === stage.id ? 'Fechar' : 'Editar'}
                    </button>
                </div>
                {editingStage === stage.id && (
                    <div className="mt-2 bg-gray-50 p-2 rounded animate-fade-in">
                    <div className="space-y-2 mb-3">
                        {stage.questions.map(q => (
                        <div key={q.id} className="flex flex-col gap-1 bg-white p-2 border border-gray-100 rounded shadow-sm">
                            <div className="flex gap-2 text-sm items-start">
                            <span className="flex-1 text-gray-600">{q.text}</span>
                            <button 
                                onClick={() => requestDeleteQuestion(stage.id, q.id)} 
                                className="text-red-400"
                                title="Excluir Pergunta"
                            >
                                <Trash2 size={14} />
                            </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                            {(q.departments || ['all']).map(d => <span key={d} className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${d !== 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{d === 'all' ? 'Todos' : d}</span>)}
                            </div>
                        </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                        <input value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} className="w-full text-sm p-2 border rounded outline-none focus:border-emerald-500" placeholder="Nova pergunta..." />
                        <div className="flex gap-2 items-center">
                        <MultiSelectDropdown options={departments} selected={newQuestionDepts} onChange={setNewQuestionDepts} />
                        <button onClick={() => addQuestionToStage(stage.id)} className="bg-emerald-600 text-white px-4 py-2 rounded h-full text-sm font-medium flex items-center gap-1"><Plus size={16} /></button>
                        </div>
                    </div>
                    </div>
                )}
                </div>
            ))}
            </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AdminQuestions;
