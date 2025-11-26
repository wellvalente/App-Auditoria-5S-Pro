import React from 'react';
import { ArrowLeft, Printer, Calendar, Check } from 'lucide-react';
import { AuditData, Stage, ScoreResult } from '../types';
import { addDays } from '../utils';

interface MuralReportViewProps {
  auditData: AuditData;
  stages: Stage[];
  calculateScore: (data: AuditData, stages: Stage[]) => ScoreResult;
  onBack: () => void;
  previousScore: number | null;
}

const MuralReportView: React.FC<MuralReportViewProps> = ({ auditData, stages, calculateScore, onBack, previousScore }) => {
  const { finalScore, breakdown } = calculateScore(auditData, stages);
  const deadline = auditData.date ? addDays(auditData.date, 30) : 'N/A';
  const handlePrint = () => window.print();

  const partialItems: Array<{evidence?: string, score: number | null, question: string, stage: string, action?: string}> = [];
  stages.forEach(stage => {
    stage.questions.forEach(q => {
      const qDepts = q.departments || ['all'];
      if (!(qDepts.includes('all') || qDepts.includes(auditData.department))) return;

      const ans = auditData.answers[q.id];
      if (ans && ans.type === 'PARCIAL' && ans.evidence) {
        partialItems.push({ ...ans, question: q.text, stage: stage.title });
      }
    });
  });

  return (
    <div className="fixed inset-0 z-[60] bg-gray-100 overflow-y-auto">
      <div className="sticky top-0 bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg print:hidden z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium hover:text-gray-300">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="flex items-center gap-4">
           <span className="text-sm font-bold">Visualização Mural (Gestão à Vista)</span>
           <button 
            onClick={handlePrint} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
           >
             <Printer size={18} /> Imprimir
           </button>
        </div>
      </div>

      <div className="max-w-[297mm] mx-auto my-8 bg-white shadow-2xl print:shadow-none print:m-0 print:w-full print:h-screen print:landscape p-6 print:p-4 text-black flex flex-col">
        
        <header className="flex justify-between items-stretch border-b-4 border-gray-900 mb-6 pb-4">
          <div className="flex flex-col justify-center">
             <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Relatório 5S</h1>
             <p className="text-lg text-gray-500 font-medium">Gestão à Vista & Melhoria Contínua</p>
          </div>
          
          <div className="flex gap-8 items-center">
             <div className="text-right">
               <div className="text-sm text-gray-400 font-bold uppercase">Setor Auditado</div>
               <div className="text-2xl font-bold text-gray-800">{auditData.department}</div>
               <div className="text-xs text-gray-500">Resp: {auditData.auditee} | Auditor: {auditData.auditor}</div>
             </div>
             <div className="text-center flex gap-4">
               <div>
                  <div className="text-sm text-gray-400 font-bold uppercase mb-1">Nota Geral</div>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-lg ${(finalScore || 0) >= 8 ? 'bg-emerald-600' : (finalScore || 0) >= 6 ? 'bg-yellow-500' : 'bg-red-600'}`}>
                    {finalScore !== null ? finalScore.toFixed(1) : 'NA'}
                  </div>
               </div>
               <div className="flex flex-col justify-center border-l pl-4 border-gray-200">
                  <div className="text-xs text-gray-400 font-bold uppercase">Anterior</div>
                  <div className="text-xl font-bold text-gray-500">{previousScore !== null ? previousScore.toFixed(1) : '-'}</div>
               </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-5 gap-4 mb-8">
           {breakdown.map(stage => (
             <div key={stage.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center flex flex-col items-center justify-between">
               <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded mb-2 ${stage.bgColor} ${stage.color}`}>
                 {stage.title.split(' ')[1]} 
               </span>
               <div className="text-3xl font-bold text-gray-800 mb-2">
                 {stage.score !== null ? stage.score.toFixed(1) : '-'}
               </div>
               <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${stage.barColor}`} style={{ width: `${(stage.score || 0) * 10}%` }}></div>
               </div>
             </div>
           ))}
        </div>

        <div className="flex-1 flex flex-col min-h-0">
           <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase border-l-4 border-red-500 pl-3">
             Evidências de Não Conformidade
           </h3>
           
           {partialItems.length === 0 ? (
             <div className="flex-1 flex items-center justify-center bg-green-50 rounded-2xl border-2 border-dashed border-green-200 text-green-700 font-bold text-xl">
               <Check size={32} className="mr-2" /> Nenhuma não conformidade com foto registrada! Parabéns!
             </div>
           ) : (
             <div className="grid grid-cols-4 gap-4 auto-rows-min">
               {partialItems.slice(0, 8).map((item, idx) => ( 
                 <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
                   <div className="h-32 bg-gray-100 overflow-hidden relative">
                     <img src={item.evidence} className="w-full h-full object-cover" alt="Evidencia" />
                     <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1">
                       Nota: {item.score}
                     </div>
                   </div>
                   <div className="p-2 flex-1 flex flex-col">
                     <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 truncate">{item.stage}</p>
                     <p className="text-xs font-medium text-gray-800 leading-tight line-clamp-3 mb-1 flex-1">
                       "{item.action}"
                     </p>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="mt-auto pt-6">
           <div className="bg-gray-900 text-white rounded-xl p-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <Calendar className="text-yellow-400" size={24} />
               <div>
                 <p className="text-xs text-gray-400 font-bold uppercase">Prazo Limite para Regularização</p>
                 <p className="text-xl font-bold">{deadline} <span className="text-xs font-normal text-gray-400">(30 dias após auditoria)</span></p>
               </div>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-gray-500">Documento gerado em {new Date().toLocaleDateString('pt-BR')}</p>
             </div>
           </div>
        </div>

      </div>
      
      <style>{`
        @media print {
          @page {
              size: landscape;
              margin: 5mm;
          }
          body {
            background-color: white;
            -webkit-print-color-adjust: exact;
          }
          body > *:not(#root) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MuralReportView;