import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import NvidiaIcon from "./NvidiaIcon";
import axiosInstance from "../api";

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
    <Box sx={{ padding: { xs: "15px", sm: "25px" } }}>
      <Typography variant="h4" gutterBottom>
        Доступные GPU
      </Typography>
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

// Отдельный компонент для карточки GPU
const GpuCard = ({ gpu, onCopy }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onCopy(gpu.name)}
        sx={{
          position: "relative",
          borderRadius: "15px",
          transition: "transform 0.3s",
          backgroundColor: "#060606",
          color: "#fff",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          cursor: "pointer", // Курсор меняется на указатель
        }}
      >
        {/* Иконка копирования в правом верхнем углу при наведении */}
        {isHovered && (
          <Tooltip title="Скопировать имя" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Чтобы клик не срабатывал на карточке
                onCopy(gpu.name);
              }}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 2,
                color: "#fff",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

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

          <Typography
            sx={{ fontSize: "15px", fontWeight: "bold", color: "#fff" }}
            component="div"
            gutterBottom
          >
            {gpu.name}
          </Typography>

          <Typography
            sx={{ fontSize: "14px", color: "#fff" }}
            color="textSecondary"
          >
            <strong>Память:</strong> {gpu.memoryInGb} GB
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 1, mt: 1 }}
          >
            <Box
              component="span"
              sx={{
                color: "#0bff04",
                padding: "5px 20px",
                borderRadius: "5px",
                fontSize: "15px",
              }}
            >
              <strong>{gpu.costPerHour}</strong> ₽/час
            </Box>
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default GPUList;
