export type JobStatus =
  | "running"
  | "stopped"
  | "terminated"
  | "completed"
  | "failed"
  | "creating"
  | "provisioning"
  | "pending";

export const statusColors: Record<JobStatus, string> = {
  running: "#28a745",
  stopped: "#dc3545",
  terminated: "#6c757d",
  completed: "#007bff",
  failed: "#dc3545",
  creating: "#fd7e14",
  provisioning: "#ffc107",
  pending: "#17a2b8",
};
