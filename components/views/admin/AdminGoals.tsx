
import React, { useState } from 'react';
import { ChevronLeft, Target, Plus, Trash2, Calendar } from 'lucide-react';
import { Goal } from '../../../types';
import ConfirmationModal from '../../ConfirmationModal';

interface AdminGoalsProps {
  departments: string[];
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onDeleteGoal: (id: number) => void;
  onNavigate: (view: string) => void;
}

const AdminGoals: React.FC<AdminGoalsProps> = ({ departments, goals, onAddGoal, onDeleteGoal, onNavigate }) => {
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    department: '',
    startDate: '',
    endDate: '',
    targets: { seiri: 0, seiton: 0, seiso: 0, seiketsu: 0, shitsuke: 0 }
  });

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

  const handleTargetChange = (sense: keyof Goal['targets'], value: string) => {
    const numValue = Math.min(10, Math.max(0, parseFloat(value) || 0));
    setNewGoal(prev => ({
      ...prev,
      targets: { ...prev.targets!, [sense]: numValue }
    }));
  };

  const handleAdd = () => {
    if (newGoal.department && newGoal.startDate && newGoal.endDate) {
      onAddGoal({ ...newGoal, id: Date.now() } as Goal);
      setNewGoal({
        department: '',
        startDate: '',
        endDate: '',
        targets: { seiri: 0, seiton: 0, seiso: 0, seiketsu: 0, shitsuke: 0 }
      });
    } else {
      alert("Preencha todos os campos obrigatórios (Departamento e Datas).");
    }
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="h-full flex flex-col pb-20">
      <div className="w-full max-w-4xl mx-auto">
        <header className="flex items-center gap-3 mb-6">
            <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button>
            <h1 className="text-xl font-bold">Gestão de Metas</h1>
        </header>

        {/* Formulário de Cadastro */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <Target size={20} />
            <h3 className="font-bold text-gray-800">Cadastrar Nova Meta</h3>
            </div>

            <div className="space-y-4">
            {/* Seleção de Setor */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Setor / Departamento</label>
                <select 
                className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                value={newGoal.department}
                onChange={(e) => setNewGoal({ ...newGoal, department: e.target.value })}
                >
                <option value="">Selecione...</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Início</label>
                <input 
                    type="date" 
                    className="w-full p-2 mt-1 border border-gray-200 rounded-lg outline-none text-sm"
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                />
                </div>
                <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fim</label>
                <input 
                    type="date" 
                    className="w-full p-2 mt-1 border border-gray-200 rounded-lg outline-none text-sm"
                    value={newGoal.endDate}
                    onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                />
                </div>
            </div>

            {/* Inputs das Metas por Senso */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">Meta por Senso (0 - 10)</label>
                <div className="grid grid-cols-5 gap-2">
                {[
                    { key: 'seiri', label: 'Seiri', color: 'blue' },
                    { key: 'seiton', label: 'Seiton', color: 'green' },
                    { key: 'seiso', label: 'Seiso', color: 'yellow' },
                    { key: 'seiketsu', label: 'Seik.', color: 'purple' },
                    { key: 'shitsuke', label: 'Shit.', color: 'red' }
                ].map((sense) => (
                    <div key={sense.key} className="flex flex-col items-center">
                    <span className={`text-[10px] font-bold text-${sense.color}-600 mb-1`}>{sense.label}</span>
                    <input 
                        type="number" 
                        min="0" max="10" step="0.1"
                        className={`w-full p-2 text-center border-2 border-${sense.color}-100 rounded-lg focus:border-${sense.color}-500 outline-none text-sm font-bold text-gray-700`}
                        value={newGoal.targets?.[sense.key as keyof Goal['targets']] || 0}
                        onChange={(e) => handleTargetChange(sense.key as keyof Goal['targets'], e.target.value)}
                    />
                    </div>
                ))}
                </div>
            </div>

            <button 
                onClick={handleAdd} 
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold mt-2 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md"
            >
                <Plus size={18} /> Salvar Meta
            </button>
            </div>
        </div>

        {/* Lista de Metas */}
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 ml-1">Metas Cadastradas ({goals.length})</h3>
        <div className="flex-1 overflow-y-auto space-y-3">
            {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p>Nenhuma meta cadastrada.</p>
            </div>
            ) : (
            goals.map((goal) => (
                <div key={goal.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                <div className="flex justify-between items-start mb-2 pr-8">
                    <h4 className="font-bold text-gray-800 text-sm">{goal.department}</h4>
                    <button 
                    onClick={() => setConfirmModal({ isOpen: true, id: goal.id })} 
                    className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                    <Trash2 size={16} />
                    </button>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar size={12} />
                    <span>{formatDate(goal.startDate)} até {formatDate(goal.endDate)}</span>
                </div>

                <div className="grid grid-cols-5 gap-1 text-center">
                    <div className="bg-blue-50 rounded py-1 border border-blue-100"><div className="text-[9px] text-blue-400 font-bold">Seiri</div><div className="text-xs font-bold text-blue-700">{goal.targets.seiri}</div></div>
                    <div className="bg-green-50 rounded py-1 border border-green-100"><div className="text-[9px] text-green-400 font-bold">Seiton</div><div className="text-xs font-bold text-green-700">{goal.targets.seiton}</div></div>
                    <div className="bg-yellow-50 rounded py-1 border border-yellow-100"><div className="text-[9px] text-yellow-600 font-bold">Seiso</div><div className="text-xs font-bold text-yellow-700">{goal.targets.seiso}</div></div>
                    <div className="bg-purple-50 rounded py-1 border border-purple-100"><div className="text-[9px] text-purple-400 font-bold">Seik.</div><div className="text-xs font-bold text-purple-700">{goal.targets.seiketsu}</div></div>
                    <div className="bg-red-50 rounded py-1 border border-red-100"><div className="text-[9px] text-red-400 font-bold">Shit.</div><div className="text-xs font-bold text-red-700">{goal.targets.shitsuke}</div></div>
                </div>
                </div>
            ))
            )}
        </div>
      </div>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title="Excluir Meta"
        message="Tem certeza que deseja excluir esta meta?"
        onConfirm={() => {
          if (confirmModal.id) onDeleteGoal(confirmModal.id);
          setConfirmModal({ isOpen: false, id: null });
        }}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default AdminGoals;
