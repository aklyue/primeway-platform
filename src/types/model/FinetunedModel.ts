import { GpuTypes, Model } from "./ModelConfig";

export interface FinetunedModel {
  job_id: string;
  artifact_name: string;
  artifact_key: string;
  base_model: string;
  dataset_name: string;
  dataset_id: string;
  defaultConfig: Model;
  status: string;
  created_at: string;
  job_name: string;
  last_execution_status?: string;
  job_url: string;
  gpu_type: GpuTypes;
  health_status: string;
  id: string;
  type: string;
  description: string;
}
