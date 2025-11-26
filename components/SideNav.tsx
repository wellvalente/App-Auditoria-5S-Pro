
import React from 'react';
import { 
  Home, Calendar, BarChart3, CheckCircle, ClipboardCheck, 
  List, Users, Activity, Target, LogOut 
} from 'lucide-react';
import { User } from '../types';

interface SideNavProps {
  currentView: string;
  onChangeView: (view: string) => void;
  currentUser: User;
  isAdmin: boolean;
  onLogout: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ currentView, onChangeView, currentUser, isAdmin, onLogout }) => {
  
  const mainItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'history_list', label: 'Indicadores', icon: BarChart3 },
    { id: 'realizadas', label: 'Realizadas', icon: CheckCircle },
  ];

  const adminItems = [
    { id: 'admin_questions', label: 'Checklists', icon: List },
    { id: 'admin_users', label: 'Usuários', icon: Users },
    { id: 'admin_schedule', label: 'Agendamento', icon: Calendar },
    { id: 'admin_goals', label: 'Metas', icon: Target },
    { id: 'admin_action_plans', label: 'Ações', icon: Activity },
  ];

  const NavItem = ({ item, isSubItem = false }: { item: any, isSubItem?: boolean }) => (
    <button
      onClick={() => onChangeView(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1
        ${currentView === item.id 
          ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}
        ${isSubItem ? 'text-sm pl-4' : ''}
      `}
    >
      <item.icon size={isSubItem ? 18 : 20} />
      <span>{item.label}</span>
    </button>
  );

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      {/* Header / Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <ClipboardCheck size={24} />
        </div>
        <div>
          <h1 className="font-bold text-gray-800 text-lg leading-none">5S Audit Pro</h1>
          <span className="text-[10px] text-gray-400 font-medium">Gestão de Qualidade</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-2 space-y-6">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase px-4 mb-2">Principal</p>
          {mainItems.map(item => <NavItem key={item.id} item={item} />)}
        </div>

        {isAdmin && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase px-4 mb-2">Administração</p>
            {adminItems.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Footer / User */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-sm text-gray-800 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
  );
};

export default SideNav;