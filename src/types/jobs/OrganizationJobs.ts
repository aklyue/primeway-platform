import { FinetuningConfig } from "../model/FinetuningConfig";
import { GpuTypes } from "../model/ModelConfig";

export interface OrganizationJob {
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
