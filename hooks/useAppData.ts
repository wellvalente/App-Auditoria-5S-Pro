
import { useState } from 'react';
import { User, AuditRecord, ActionPlan, Stage, Schedule, Goal } from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_DEPARTMENTS, 
  INITIAL_STAGES, 
  INITIAL_ACTION_PLANS, 
  INITIAL_HISTORY,
  INITIAL_GOALS
} from '../constants';

/**
 * Hook personalizado para gerenciar o estado global da aplicação (banco de dados simulado).
 * Separa a lógica de manipulação de dados da interface do usuário.
 */
export const useAppData = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [departments, setDepartments] = useState<string[]>(INITIAL_DEPARTMENTS);
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(INITIAL_ACTION_PLANS);
  const [history, setHistory] = useState<AuditRecord[]>(INITIAL_HISTORY);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);

  // --- Gerenciamento de Usuários ---
  const addUser = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  // --- Gerenciamento de Departamentos ---
  const addDepartment = (dept: string) => {
    if (!departments.includes(dept)) {
      setDepartments([...departments, dept]);
    }
  };

  const deleteDepartment = (dept: string) => {
    setDepartments(prev => prev.filter(d => d !== dept));
  };

  // --- Gerenciamento de Etapas/Perguntas (Checklist) ---
  const updateStages = (newStages: Stage[]) => {
    setStages(newStages);
  };

  // --- Gerenciamento de Planos de Ação ---
  const addActionPlan = (plans: ActionPlan[]) => {
    setActionPlans(prev => [...plans, ...prev]);
  };

  const updateActionPlan = (updatedPlan: ActionPlan) => {
    setActionPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  // --- Gerenciamento de Histórico ---
  const addAuditToHistory = (audit: AuditRecord) => {
    setHistory(prev => [audit, ...prev]);
  };

  // --- Gerenciamento de Agendamentos ---
  const addSchedule = (schedule: Schedule) => {
    setSchedules(prev => [...prev, schedule]);
  };

  const deleteSchedule = (id: number) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // --- Gerenciamento de Metas ---
  const addGoal = (goal: Goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const deleteGoal = (id: number) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return {
    // Dados
    users,
    departments,
    stages,
    actionPlans,
    history,
    schedules,
    goals,
    // Ações
    addUser,
    updateUser,
    deleteUser,
    addDepartment,
    deleteDepartment,
    updateStages,
    addActionPlan,
    updateActionPlan,
    addAuditToHistory,
    addSchedule,
    deleteSchedule,
    addGoal,
    deleteGoal
  };
};
