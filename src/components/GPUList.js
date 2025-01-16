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

import NvidiaIcon from "./NvidiaIcon";

const gpuData = [
  { id: "DFdef12d", name: "RTX 3090", price: "1099" },
  { id: "gpu2", name: "RTX 3080", price: "699" },
  { id: "gpu3", name: "RTX 3070", price: "599" },
  { id: "gpu4", name: "A40", price: "959" },
  { id: "gpu5", name: "RTX 4060", price: "1299" },
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

      <Grid container spacing={4} justifyContent="flex-start" sx={{ mt: 2 }}>
        {gpuData.map((gpu) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={gpu.id}>
            <Card
              sx={{
                position: "relative",
                backgroundColor: "#FFFFFF",
                borderRadius: "15px",
                // border:'1px solid rgba(116, 183, 27, 0.3)',
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
                transition: "transform 0.3s, box-shadow 0.3s",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <CardContent
                sx={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center", // Выравниваем содержимое по центру
                  textAlign: "center",
                  gap: "8px",
                }}
              >
                {/* Используем компонент NvidiaIcon */}
                <NvidiaIcon />

                <Typography variant="h5" component="div" gutterBottom>
                  {gpu.name}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  <Box
                    component="span"
                    sx={{
                      color: "rgba(116, 183, 27, 0.9)",
                      padding: "5px 20px",
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      borderRadius: "5px",
                    }}
                  >
                    {gpu.price} ₽/час
                  </Box>
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
                        onMouseLeave={() => setCopiedId(null)}
                      >
                        <ContentCopyIcon
                          fontSize="small"
                          sx={{ fontSize: "1rem" }}
                        />
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
