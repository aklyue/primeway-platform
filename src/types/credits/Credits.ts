export interface CreditEntry {
  job_execution_id?: string;
  credits: number;
  created_at: string;
}

export interface Credits {
  [jobId: string]: CreditEntry[];
}

export interface DailyCreditUsage {
  date: string;
  credits: number;
}
