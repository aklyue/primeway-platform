// components/GPUList.js
import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";

const gpuData = [
  { id: "gpu1", name: "NVIDIA RTX 3090", price: "1099" },
  { id: "gpu2", name: "NVIDIA RTX 3080", price: "699" },
  { id: "gpu3", name: "AMD Radeon RX 5900 XT", price: "999" },
  { id: "gpu4", name: "NVIDIA RTX 3070", price: "599" },
  { id: "gpu5", name: "AMD Radeon RX 6900", price: "959" },
  { id: "gpu6", name: "AMD Radeon RX 6900 XT", price: "999" },
];

const GPUList = () => {
  const [copiedId, setCopiedId] = React.useState(null);

  return (
    <Box sx={{ padding: { xs: "15px", sm: "25px" } }}>
      <Typography variant="h4" gutterBottom>
        Доступные GPU
      </Typography>
      <Typography variant="body1" paragraph>
        Ознакомьтесь с доступными GPU и их характеристиками. Используйте
        указанные ID в вашем конфиге для настройки.
      </Typography>

      <Grid container spacing={3.5} justifyContent="flex-start" sx={{ mt: 2 }}>
        {gpuData.map((gpu) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={gpu.id}>
            <Card
              sx={{
                backgroundColor: "#F5F5F5",
                borderRadius: "15px",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s, box-shadow 0.3s",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  padding: "24px",
                }}
              >
                <Typography variant="h5" component="div" gutterBottom>
                  {gpu.name}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Цена: {gpu.price} ₽/час
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    ID: <b>{gpu.id}</b>
                  </Typography>
                  <CopyToClipboard
                    text={gpu.id}
                    onCopy={() => setCopiedId(gpu.id)}
                  >
                    <Tooltip
                      title={
                        copiedId === gpu.id ? "Скопировано!" : "Скопировать ID"
                      }
                      arrow
                    >
                      <IconButton
                        size="small"
                        sx={{ ml: 0.5 }}
                        onMouseLeave={() => setCopiedId(null)} // Сбрасываем состояние после ухода курсора
                      >
                        <ContentCopyIcon fontSize="small" sx={{fontSize:'1rem'}} />
                      </IconButton>
                    </Tooltip>
                  </CopyToClipboard>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GPUList;