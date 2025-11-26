
import React from 'react';
import { Home, Calendar, BarChart3, CheckCircle } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'history_list', label: 'Indicadores', icon: BarChart3 },
    { id: 'realizadas', label: 'Realizadas', icon: CheckCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-around items-center h-16 z-50 print:hidden md:hidden">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onChangeView(item.id)}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors
            ${currentView === item.id ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}
          `}
        >
          <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;