export const statusOptions = [
  "running",
  "stopped",
  "terminated",
  "completed",
  "failed",
  "creating",
  "provisioning",
  "pending",
];
export const statusColors = {
  running: "#28a745", // зеленый
  stopped: "#dc3545", // красный
  terminated: "#6c757d", // серый
  completed: "#007bff", // синий
  failed: "#dc3545",
  creating: "#fd7e14", // оранжевый
  provisioning: "#ffc107", // желтый
  pending: "#17a2b8", // голубой
};

export const buildStatusColors = {
  success: "#28a745", // зеленый
  failed: "#dc3545", // красный
  building: "#007bff", // синий
};
