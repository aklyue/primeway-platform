import { FinetuningConfig } from "../model/FinetuningConfig";
import { Env, GpuTypes } from "../model/ModelConfig";

export interface RunningJob {
  job_id: string;
  job_name: string;
  job_type: string;
  created_at: string;
  build_status: string;
  last_execution_status: string;
  last_execution_start_time: string;
  last_execution_end_time: string;
  gpu_type: GpuTypes;
  job_url: string;
  health_status: string;
  suffix: string;
  finetuning_config: FinetuningConfig;
  base_model: string;
  run_time: string;
}

export type RunningJobs = RunningJob[];

export interface MappedRunningJob {
  id: string;
  baseModel: string;
  suffix: string;
  lastExecutionStatus: string;
  runTime: string;
  createdAt: string;
}
