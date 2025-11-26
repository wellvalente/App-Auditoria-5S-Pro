
export interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'auditor' | 'viewer';
  department?: string;
}

export interface Question {
  id: number;
  text: string;
  departments: string[];
}

export interface Stage {
  id: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
  questions: Question[];
  score?: number | null;
}

export interface Answer {
  type: 'OK' | 'PARCIAL' | 'NA';
  score: number | null;
  action?: string;
  evidence?: string;
}

export interface SignatureData {
  auditor: string | null;
  auditee: string | null;
}

export interface AuditData {
  department: string;
  auditor: string;
  auditee: string;
  date: string;
  answers: Record<string, Answer>;
  signatures: SignatureData;
  scheduleId?: number | null;
}

export interface AuditRecord {
  id: number;
  date: string;
  department: string;
  score: number | null;
  status: string;
  fullData?: AuditData;
}

export interface LogEntry {
  type: 'execution' | 'approval' | 'rejection';
  user: string;
  date: string;
  text?: string;
  evidence?: string;
  note?: string;
}

export interface ActionPlan {
  id: string;
  auditId: number;
  date: string;
  deadline: string;
  department: string;
  auditor: string;
  questionText: string;
  issueDescription: string;
  originalEvidence?: string;
  status: 'pending' | 'executed' | 'approved' | 'rejected';
  executionText?: string;
  executionEvidence?: string;
  logs: LogEntry[];
  issue?: string; // For agenda mapping convenience
}

export interface Schedule {
  id: number;
  department: string;
  auditor: string;
  date: string;
}

export interface Goal {
  id: number;
  department: string;
  startDate: string;
  endDate: string;
  targets: {
    seiri: number;
    seiton: number;
    seiso: number;
    seiketsu: number;
    shitsuke: number;
  };
}

export interface ScoreResult {
  finalScore: number | null;
  breakdown: Stage[];
}
