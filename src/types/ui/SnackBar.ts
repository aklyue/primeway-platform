export type AlertSeverity = "success" | "error" | "info" | "warning";

export interface SnackBar {
  open: boolean;
  message: string;
  severity: AlertSeverity;
}
