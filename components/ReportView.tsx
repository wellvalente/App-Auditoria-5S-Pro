import React from 'react';
import { ArrowLeft, Printer, ClipboardCheck } from 'lucide-react';
import { AuditData, Stage, ScoreResult } from '../types';
import { addDays } from '../utils';

interface ReportViewProps {
  auditData: AuditData;
  stages: Stage[];
  calculateScore: (data: AuditData, stages: Stage[]) => ScoreResult;
  onBack: () => void;
  previousScore: number | null;
}

const ReportView: React.FC<ReportViewProps> = ({ auditData, stages, calculateScore, onBack, previousScore }) => {
  const { finalScore, breakdown } = calculateScore(auditData, stages);
  const reportDate = auditData.date ? new Date(auditData.date) : new Date();
  const deadline = auditData.date ? addDays(auditData.date, 30) : addDays(new Date().toISOString(), 30);
   
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[60] bg-gray-100 overflow-y-auto">
      <div className="sticky top-0 bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg print:hidden z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium hover:text-gray-300">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="flex items-center gap-4">
           <span className="text-sm font-bold">Relatório Detalhado</span>
           <button 
            onClick={handlePrint} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
           >
             <Printer size={18} /> Imprimir
           </button>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto my-8 bg-white shadow-2xl print:shadow-none print:m-0 print:w-full min-h-[297mm] p-8 print:p-4 text-black">
        <header className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-gray-800 text-white flex items-center justify-center rounded-lg">
               <ClipboardCheck size={28} />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Relatório de Auditoria 5S</h1>
               <p className="text-xs text-gray-500">Controle de Qualidade Detalhado</p>
             </div>
          </div>
          <div className="text-right text-xs">
            <p><span className="font-bold">Data:</span> {reportDate.toLocaleDateString('pt-BR')}</p>
            <p><span className="font-bold">Setor:</span> {auditData.department}</p>
            <p><span className="font-bold">Nota Final:</span> <span className="text-lg font-bold">{finalScore !== null ? finalScore.toFixed(1) : 'NA'}</span></p>
            <p><span className="font-bold text-gray-500">Nota Anterior:</span> <span className="font-medium">{previousScore !== null ? previousScore.toFixed(1) : '-'}</span></p>
          </div>
        </header>

        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 text-xs text-red-700 font-bold">
          PRAZO LIMITE PARA AÇÕES CORRETIVAS: {deadline}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-xs border border-gray-200 rounded p-2 bg-gray-50">
          <div><span className="font-bold text-gray-600 block">Auditor:</span>{auditData.auditor}</div>
          <div><span className="font-bold text-gray-600 block">Responsável:</span>{auditData.auditee}</div>
        </div>

        <div className="space-y-6">
          {breakdown.map((stage) => {
             const questions = stage.questions.filter(q => {
                const qDepts = q.departments || ['all'];
                return qDepts.includes('all') || qDepts.includes(auditData.department);
             });
             
             if (questions.length === 0) return null;

             return (
              <div key={stage.id} className="break-inside-avoid">
                <div className="flex justify-between items-end border-b-2 border-gray-200 mb-2 pb-1">
                  <h3 className="font-bold text-sm uppercase flex items-center gap-2 text-gray-800">
                    <span className={`w-3 h-3 rounded-full ${stage.color.replace('text', 'bg')}`}></span>
                    {stage.title}
                  </h3>
                  <span className="text-xs font-bold bg-gray-100 px-2 rounded">Média: {stage.score !== null ? stage.score.toFixed(1) : '-'}</span>
                </div>

                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="py-1 font-medium w-[40%]">Item Avaliado</th>
                      <th className="py-1 font-medium w-[10%] text-center">Nota</th>
                      <th className="py-1 font-medium w-[50%]">Plano de Ação & Evidência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map(q => {
                      const ans = auditData.answers[q.id];
                      const isParcial = ans?.type === 'PARCIAL';
                      return (
                        <tr key={q.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 pr-2 align-top text-gray-700">{q.text}</td>
                          <td className="py-2 align-top text-center">
                             <span className={`px-2 py-0.5 rounded font-bold ${ans?.type === 'OK' ? 'bg-green-100 text-green-700' : ''} ${ans?.type === 'NA' ? 'bg-gray-100 text-gray-500' : ''} ${ans?.type === 'PARCIAL' ? 'bg-yellow-100 text-yellow-700' : ''}`}>
                               {ans?.type === 'OK' ? '10' : ans?.type === 'NA' ? 'NA' : ans?.score}
                             </span>
                          </td>
                          <td className="py-2 align-top pl-2">
                            {isParcial ? (
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <span className="block font-bold text-[10px] text-red-500 uppercase">Ação:</span>
                                  <p className="italic text-gray-600 leading-tight">{ans?.action}</p>
                                </div>
                                {ans?.evidence && <div className="w-16 h-16 border border-gray-200 rounded bg-gray-50 flex-shrink-0 overflow-hidden"><img src={ans.evidence} className="w-full h-full object-cover" alt="Evidência" /></div>}
                              </div>
                            ) : <span className="text-gray-300">-</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
             );
          })}
        </div>

        <div className="mt-8 pt-4 border-t-2 border-gray-800 break-inside-avoid">
          <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 text-center">Validação</h4>
          <div className="flex justify-around items-end">
             <div className="text-center w-1/3">
               <div className="h-16 border-b border-gray-400 mb-1 flex items-end justify-center pb-1">
                 {auditData.signatures.auditor && <img src={auditData.signatures.auditor} className="max-h-14" alt="Assinatura" />}
               </div>
               <p className="font-bold text-xs">{auditData.auditor}</p>
               <p className="text-[10px] text-gray-500">Auditor</p>
             </div>
             <div className="text-center w-1/3">
               <div className="h-16 border-b border-gray-400 mb-1 flex items-end justify-center pb-1">
                 {auditData.signatures.auditee && <img src={auditData.signatures.auditee} className="max-h-14" alt="Assinatura" />}
               </div>
               <p className="font-bold text-xs">{auditData.auditee}</p>
               <p className="text-[10px] text-gray-500">Responsável</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;