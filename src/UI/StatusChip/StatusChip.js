import { Chip } from "@mui/material";

const palette = {
  success:  { bg: "#d9f5dc", color: "#087443" },
  running:  { bg: "#e3f2ff", color: "#0b62c5" },
  failed:   { bg: "#fde7e7", color: "#991b1b" },
  "invalid input": { bg: "#ffece5", color: "#c2410c" },
};

export default function StatusChip({ status }) {
  const key = status.toLowerCase();
  const { bg, color } = palette[key] ?? { bg: "#f1f5f9", color: "#475569" };

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
