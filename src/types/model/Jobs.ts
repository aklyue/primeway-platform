import { JobConfig } from "../jobs/JobConfig";
import { FinetuningConfig } from "./FinetuningConfig";
import { GpuTypes, Model } from "./ModelConfig";

export interface Job {
  job_id: string;
  job_name: string;
  last_execution_status?: string;
  last_execution_start_time: string;
  last_execution_end_time: string;
  gpu_type: GpuTypes;
  job_url: string;
  health_status: string;
  last_execution_id?: string;
  job_type?: string;
  execution_id?: string;
  finetuning_config?: FinetuningConfig;
  suffix?: string;
  run_time?: string;
  build_status?: string;
  created_at?: string;
  id?: string;
  defaultConfig?: Model;
  artifact_name?: string;
  base_model?: string;
  status?: string;
  dataset_id?: string;
  type?: string;
  description?: string;
  config?: JobConfig;
  job_execution_id?: string;
  is_scheduled?: boolean;
  gpu_info?: GpuTypes;
  start_time: string;
  end_time: string;
}
