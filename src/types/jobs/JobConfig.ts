import { Env, GpuTypes, Schedule } from "../model/ModelConfig";

export interface JobConfig {
  job_name: string;
  job_type: string;
  docker_image: string;
  artifacts_path: string;
  context: string;
  command: string;
  args: string;
  disk_space: number;
  gpu_types: GpuTypes[];
  job_timeout: number;
  creation_timeout: number;
  health_check_timeout: number;
  request_input_dir: string;
  port: number;
  env: Env[];
  requirements: string[];
  apt_packages: string[];
  health_endpoint: string;
  schedule: Schedule;
  autoscaler_timeout: number;
  primeway_api_token: string;
}
