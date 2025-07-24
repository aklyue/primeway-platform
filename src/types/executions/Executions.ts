import { GpuTypes } from "../model/ModelConfig";

export interface ApiErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiErrorResponse {
  detail: ApiErrorDetail[] | { msg?: string };
}

export interface ExecutionLogState {
  logs: string;
  loading: boolean;
}

export interface Execution {
  job_execution_id?: string;
  execution_id?: string;
  job_id?: string;
  id?: string;
  created_at?: string;
  status?: string;
  start_time: string;
  end_time: string;
  health_status?: string;
  gpu_info?: GpuTypes;
}
