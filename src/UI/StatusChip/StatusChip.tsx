import { Chip } from "@mui/material";

const palette = {
  success: { bg: "#d9f5dc", color: "#087443" },
  running: { bg: "#e3f2ff", color: "#0b62c5" },
  failed: { bg: "#fde7e7", color: "#991b1b" },
  "invalid input": { bg: "#ffece5", color: "#c2410c" },
};

const validStatuses = [
  "success",
  "running",
  "failed",
  "invalid input",
] as const;
type ValidStatus = (typeof validStatuses)[number];

function isValidStatus(status: string): status is ValidStatus {
  return validStatuses.includes(status as ValidStatus);
}

interface StatusChipProps {
  status: string;
}

export default function StatusChip({ status }: StatusChipProps) {
  const { bg, color } = isValidStatus(status)
    ? palette[status]
    : { bg: "#f1f5f9", color: "#475569" };

  return (
    <Chip
      label={status.toUpperCase()}
      size="small"
      sx={{
        fontWeight: 500,
        letterSpacing: 0.25,
        bgcolor: bg,
        color,
        borderRadius: "8px",
      }}
    />
  );
}
