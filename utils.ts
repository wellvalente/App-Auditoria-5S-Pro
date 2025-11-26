import { AuditData, Stage, ScoreResult } from './types';

export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('pt-BR');
};

export const calculateScore = (data: AuditData, stages: Stage[]): ScoreResult => {
  let totalScore = 0;
  let validStagesCount = 0;
  
  const breakdown = stages.map(stage => {
    let stageScoreSum = 0;
    let stageValidCount = 0;
    
    stage.questions.forEach(q => {
      const qDepts = q.departments || ['all']; 
      const isRelevant = qDepts.includes('all') || qDepts.includes(data.department);
      
      if (!isRelevant) return; // Ignora perguntas não relevantes para o setor

      const ans = data.answers[q.id];
      
      // Verifica se a pergunta foi respondida e não é N/A
      if (ans && ans.type !== 'NA' && ans.score !== null) {
        stageScoreSum += ans.score;
        stageValidCount++;
      }
    });
    
    // A média do Senso é calculada pela soma das pontuações válidas dividida pelo número de perguntas válidas
    const stageAvg = stageValidCount > 0 ? stageScoreSum / stageValidCount : null;
    
    if (stageAvg !== null) {
      totalScore += stageAvg; 
      validStagesCount++; // Conta apenas os Sensos que têm perguntas válidas
    }
    return { ...stage, score: stageAvg };
  });

  // A nota final é a média das médias dos Sensos aplicáveis
  const finalScore = validStagesCount > 0 ? totalScore / validStagesCount : null;
  return { finalScore, breakdown };
};