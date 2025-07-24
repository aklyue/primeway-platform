import { AVAILABLE_GPUS } from "../../constants/AVAILABLE_GPUS";

export interface TimeWindow {
  start: string;
  end: string;
}

export interface SpecificDay {
  time_windows: TimeWindow[];
  date: string | number;
}

export interface Schedule {
  specific_days: SpecificDay[];
  workdays: TimeWindow[];
  weekends: TimeWindow[];
}

export type AvailableGpuType = keyof typeof AVAILABLE_GPUS;

export interface GpuTypes {
  type: AvailableGpuType;
  count: number | string;
  memory?: number | string;
}

export interface Env {
  name: string;
  value: string;
}

export interface ModelConfig {
  job_name: string;
  health_check_timeout: string | number;
  port: string | number;
  autoscaler_timeout: string | number;
  disk_space: string | number;
  gpu_types: GpuTypes[];
  schedule?: Schedule;
  env?: Env[];
  name?: string;
  max_requests: number | string;
  min_gpu_count: number | string;
  max_gpu_count: number | string;
}

export interface VllmConfig {
  model: string;
  args: Record<string, string>;
  flags: Record<string, string>;
  finetuned_job_id?: string;
}

export interface AdditionalFields {
  key: string;
  value: string;
}

export interface Model {
  modelName: string;
  modelConfig: ModelConfig;
  args: AdditionalFields[];
  flags: AdditionalFields[];
  finetuned_job_id?: string;
}
