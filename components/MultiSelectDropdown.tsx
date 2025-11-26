import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckSquare, Square } from 'lucide-react';

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (option: string) => {
    let newSelected;
    if (option === 'all') {
      newSelected = ['all'];
    } else {
      if (selected.includes('all')) {
        newSelected = [option];
      } else {
        if (selected.includes(option)) {
          newSelected = selected.filter(item => item !== option);
        } else {
          newSelected = [...selected, option];
        }
      }
    }
    if (newSelected.length === 0) newSelected = ['all'];
    onChange(newSelected);
  };

  const getLabel = () => {
    if (selected.includes('all')) return 'Para Todos os Setores';
    if (selected.length === 1) return `Apenas: ${selected[0]}`;
    return `${selected.length} setores selecionados`;
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-xs p-2 border rounded bg-white outline-none hover:border-emerald-500 transition-colors"
      >
        <span className="truncate text-gray-700 font-medium">{getLabel()}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in">
          <div 
            onClick={() => handleToggle('all')}
            className="flex items-center gap-2 p-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-100"
          >
            {selected.includes('all') 
              ? <CheckSquare size={16} className="text-emerald-600" /> 
              : <Square size={16} className="text-gray-300" />}
            <span className={`text-xs ${selected.includes('all') ? 'font-bold text-emerald-700' : 'text-gray-600'}`}>
              Para Todos os Setores
            </span>
          </div>
           
          {options.map(opt => (
            <div 
              key={opt}
              onClick={() => handleToggle(opt)}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
            >
               {selected.includes(opt) 
                 ? <CheckSquare size={16} className="text-emerald-600" /> 
                 : <Square size={16} className="text-gray-300" />}
              <span className="text-xs text-gray-700">{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;