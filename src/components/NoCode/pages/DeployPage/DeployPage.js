// DeployPage.js
import { Box, Typography } from "@mui/material";
import FineTuneTasksList from "../../FineTuneTasksList";

export default function DeployPage() {
  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Deploy
      </Typography>
      <FineTuneTasksList mode="deploy" />
    </Box>
  );
}
