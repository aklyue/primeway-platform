export interface TabbySession {
  id: string;
  tabby_name: string;
  user_id: string;
  organization_id: string;
  inference_job_id: string;
  embedding_job_id: string;
  status:
    | "running"
    | "starting"
    | "queued"
    | "creating"
    | "provisioning"
    | "pending";
  endpoint_url: string;
  config_path: string;
  created_at: string;
}
