import { GpuTypes, Model } from "./ModelConfig";

export interface BasicModel {
  id: string;
  name: string;
  isBasic: boolean;
  type: string;
  description: string;
  defaultConfig: Model;
  job_id?: string;
  job_name?: string;
  base_model?: string;
  created_at?: string;
  author?: string;
  last_execution_status?: string;
  artifact_name?: string;
  status?: string;
  dataset_id?: string;
  job_url?: string;
  gpu_type?: GpuTypes;
  health_status?: string;
}
