import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TableBody,
  Tooltip,
  IconButton,
} from "@mui/material";
import { ContentCopy, DeveloperBoard } from "@mui/icons-material";

import axiosInstance from "../../api";

const GPUList = ({ isMobile, isTablet }) => {
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
      console.log(data);
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          height: "80dvh",
          alignItems: "center",
        }}
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
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <DeveloperBoard />
        <Typography fontSize={"1.25rem"} fontWeight={500} sx={{ ml: 1 }}>
          Доступные GPU
        </Typography>
      </Box>

      <Typography variant="body1" paragraph>
        Ознакомьтесь с доступными GPU и их характеристиками. Кликните по имени
        GPU, чтобы скопировать его для использования в конфиге.
      </Typography>

      <Paper
        sx={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "none",
        }}
      >
        <Table size={"medium"}>
          <TableHead sx={{ backgroundColor: "rgba(102,179,238,0.1)" }}>
            <TableRow>
              <TableCell>GPU</TableCell>
              {!isMobile && <TableCell>ПАМЯТЬ</TableCell>}
              <TableCell>СТОИМОСТЬ</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {gpuData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Нет доступных GPU.
                </TableCell>
              </TableRow>
            ) : (
              gpuData.map((gpu, index) => (
                <TableRow
                  key={gpu.name || index}
                  hover
                  onClick={() => handleCopy(gpu.name)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      background: "rgba(102, 179, 238, 0.2) !important",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: 13,
                    }}
                  >
                    <Tooltip title="Нажмите, чтобы скопировать имя GPU">
                      <span>{gpu.name}</span>
                    </Tooltip>
                  </TableCell>

                  {!isMobile && (
                    <TableCell sx={{ fontSize: 13 }}>
                      {gpu.memoryInGb} GB
                    </TableCell>
                  )}

                  <TableCell sx={{ fontSize: 13 }}>
                    {gpu.costPerHour} ₽/час
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

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
