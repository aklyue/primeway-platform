// components/GPUList.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";


import NvidiaIcon from "./NvidiaIcon";
import axiosInstance from "../api";

const GPUList = () => {
  const [gpuData, setGpuData] = useState([]);
  const [copiedName, setCopiedName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGpuData();
  }, []);

  const fetchGpuData = async () => {
    try {
      const response = await axiosInstance.get("/jobs/get-gpu-list");
      const data = response.data || [];
      setGpuData(data);
      setLoading(false);
    } catch (err) {
      console.error("Ошибка при получении списка GPU:", err);
      setError(
        err.response?.data?.detail || "Не удалось загрузить список GPU."
      );
      setLoading(false);
    }
  };

  const handleCopy = (name) => {
    navigator.clipboard.writeText(name).then(
      () => {
        setCopiedName(name);
      },
      (err) => {
        console.error("Ошибка при копировании имени:", err);
      }
    );
  };

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", mt: 4 }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: { xs: "15px", sm: "25px" } }}>
      <Typography variant="h4" gutterBottom>
        Доступные GPU
      </Typography>
      <Typography variant="body1" paragraph>
        Ознакомьтесь с доступными GPU и их характеристиками. Используйте
        указанные имена в вашем конфиге для настройки.
      </Typography>

      <Grid container spacing={5} justifyContent="flex-start" sx={{ mt: 2 }}>
        {gpuData.map((gpu, index) => (
          <Grid item xs={12} sm={6} md={5} lg={4} key={gpu.name || index}>
            <Card
              sx={{
                position: "relative", // Это важно для позиционирования иконки копирования
                backgroundColor: "#FFFFFF",
                borderRadius: "15px",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
                transition: "transform 0.3s, box-shadow 0.3s",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Иконка копирования в правом верхнем углу */}
              <Tooltip
                title={
                  copiedName === gpu.name ? "Скопировано!" : "Скопировать имя"
                }
                arrow
              >
                <IconButton
                  size="small"
                  onClick={() => handleCopy(gpu.name)}
                  onMouseLeave={() => setCopiedName(null)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 1,
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <CardContent
                sx={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "8px",
                }}
              >
                {/* Используем компонент NvidiaIcon */}
                <NvidiaIcon />

                <Typography variant="h5" component="div" gutterBottom>
                  {gpu.name}
                </Typography>

                <Typography variant="h6" color="textSecondary">
                  <strong>Память:</strong> {gpu.memoryInGb} GB
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 1, mt:1 }}
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
                    {gpu.costPerHour} ₽/час
                  </Box>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GPUList;