import React, { useState } from 'react';
import { ClipboardCheck, User as UserIcon, Lock, ChevronRight } from 'lucide-react';
import { User } from '../../types';
import { APP_VERSION } from '../../constants';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      alert('Credenciais inválidas. Tente admin/123, auditor/123 ou view/123');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 bg-white animate-fade-in">
      <div className="flex flex-col items-center mb-12">
        <div className="bg-emerald-100 p-6 rounded-3xl mb-4 shadow-sm">
          <ClipboardCheck size={64} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Auditoria 5S Pro <span className="text-xs text-gray-400 font-normal block text-center mt-1">{APP_VERSION}</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Gestão da Qualidade Total</p>
      </div>
      <div className="w-full space-y-4 mb-8">
        <div className="relative group">
          <UserIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Usuário" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="w-full pl-12 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
          />
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full pl-12 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
          />
        </div>
      </div>
      <button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2">
        Acessar Sistema <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default LoginView;
