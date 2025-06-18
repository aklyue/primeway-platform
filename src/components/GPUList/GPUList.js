import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DeveloperBoard } from "@mui/icons-material";

import axiosInstance from "../../api";
import GpuCard from "../GpuCard";

const GPUList = () => {
  const [gpuData, setGpuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояние для управления отображением сообщения о копировании
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [copiedName, setCopiedName] = useState("");

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
        // После успешного копирования устанавливаем имя и показываем Snackbar
        setCopiedName(name);
        setSnackbarOpen(true);
      },
      (err) => {
        console.error("Ошибка при копировании имени:", err);
      }
    );
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <DeveloperBoard />
        <Typography fontSize={"1.25rem"} fontWeight={500} sx={{ ml: 1 }}>
          Доступные GPU
        </Typography>
      </Box>
      <Typography variant="body1" paragraph>
        Ознакомьтесь с доступными GPU и их характеристиками. Кликните по
        карточке, чтобы скопировать имя и использовать его в вашем конфиге.
      </Typography>

      <Grid container spacing={4.5} justifyContent="flex-start" sx={{ mt: 2 }}>
        {gpuData.map((gpu, index) => (
          <GpuCard key={gpu.name || index} gpu={gpu} onCopy={handleCopy} />
        ))}
      </Grid>

      {/* Snackbar для отображения сообщения о копировании */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {`Имя GPU "${copiedName}" скопировано в буфер обмена!`}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GPUList;
