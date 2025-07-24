import { Env, GpuTypes } from "./ModelConfig";

export interface FinetuningConfig {
  job_name: string;
  gpu_types: GpuTypes[];
  base_model: string;
  artifact_name: string;
  custom_dataset: boolean;
  dataset_id: string;
  dataset_name: string;
  disk_space: number;
  creation_timeout: number;
  env: Env[];
}
