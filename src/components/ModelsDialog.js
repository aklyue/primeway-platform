import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import axiosInstance from "../api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { styled } from "@mui/material/styles";
import {
  PlayCircleFilled as PlayCircleFilledIcon,
  Stop as StopIcon,
} from "@mui/icons-material";
import JobEvents from "./Tasks/JobEvents";

const ActionIconButton = styled(IconButton)(({ theme, colorvariant }) => ({
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.1)",
    backgroundColor:
      colorvariant === "error"
        ? theme.palette.error.light
        : theme.palette.success.light,
  },
  "&.Mui-disabled": {
    opacity: 0.5,
    transform: "none",
  },
}));

function ModelsDialog({ open, onClose, model }) {
  // Состояния
  const [modelDetails, setModelDetails] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [config, setConfig] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [activeTab, setActiveTab] = useState("events");
  const [modelStatus, setModelStatus] = useState(
    model.health_status || "running"
  );

  // Функция для форматирования даты и времени
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = parseISO(dateTimeString);
      return format(date, "dd.MM.yyyy HH:mm:ss", { locale: ru });
    } catch (error) {
      console.error("Ошибка при форматировании даты:", error);
      return dateTimeString;
    }
  };

  // Функция для отображения оповещений
  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showAlert("Скопировано в буфер обмена.");
  };

  // Получение деталей модели при открытии диалогового окна
  useEffect(() => {
    if (open && model) {
      setConfigLoading(true);
      setModelDetails(model);
      setConfig(JSON.stringify(model.defaultConfig, null, 2));
      setModelStatus(model.health_status || "running");
      setConfigLoading(false);
    } else {
      setModelDetails(null);
      setConfig("");
    }
  }, [open, model]);

  // Обработка закрытия оповещения
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handleStartModel = async () => {
    try {
      await axiosInstance.post("/jobs/job-start", null, {
        params: { job_id: model.job_id },
      });
      showAlert("Модель успешно запущена.", "success");
      setModelStatus("running");
    } catch (error) {
      console.error("Ошибка при запуске модели:", error);
      showAlert("Ошибка при запуске модели.", "error");
    }
  };

  const handleStopModel = async () => {
    console.log();
    try {
      await axiosInstance.post("/jobs/job-stop", null, {
        params: { job_id: model.job_id },
      });
      showAlert("Модель успешно остановлена.", "success");
      setModelStatus("stopped");
    } catch (error) {
      console.error("Ошибка при остановке модели:", error);
      showAlert("Ошибка при остановке модели.", "error");
    }
  };

  if (!model) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        scroll="paper"
        PaperProps={{
          style: {
            height: "92vh",
            borderRadius: "15px",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {model.job_name}
          </Typography>
          <Box
            sx={{
              height: "2px",
              flexGrow: 1,
              minWidth: "3px",
              maxWidth: "230px",
              borderRadius: "5px",
              ml: 1,
              mr: 1,
              bgcolor: "black",
            }}
          />
          <Box>
            <Typography variant="body1">
              <strong>{model.created_at}</strong>
            </Typography>
          </Box>
          <Box
            sx={{
              height: "2px",
              flexGrow: 1,
              minWidth: "3px",
              maxWidth: "230px",
              borderRadius: "5px",
              ml: 1,
              mr: 1,
              bgcolor: "black",
            }}
          />
          {model.job_url && (
            <Tooltip title="Скопировать URL">
              <Typography
                variant="body2"
                sx={{
                  marginLeft: 2,
                  padding: "3px 8px",
                  borderRadius: "12px",
                  border: "1px solid #5282ff",
                  backgroundColor: "none",
                  color: "secondary.main",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    backgroundColor: "#8fa8ea",
                    color: "white",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(model.job_url);
                }}
              >
                {model.job_url}
              </Typography>
            </Tooltip>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Tooltip title="Запустить модель">
              <span>
                <ActionIconButton
                  onClick={handleStartModel}
                  colorvariant="success"
                  size="small"
                  disabled={modelStatus === "running"}
                  aria-label="Запустить модель"
                >
                  <PlayCircleFilledIcon
                    sx={{
                      color:
                        modelStatus === "running"
                          ? "text.disabled"
                          : "success.main",
                    }}
                  />
                </ActionIconButton>
              </span>
            </Tooltip>
            <Tooltip title="Остановить модель">
              <span>
                <ActionIconButton
                  onClick={handleStopModel}
                  colorvariant="error"
                  size="small"
                  disabled={modelStatus !== "running"}
                  aria-label="Остановить модель"
                >
                  <StopIcon
                    sx={{
                      color:
                        modelStatus === "running"
                          ? "error.main"
                          : "text.disabled",
                    }}
                  />
                </ActionIconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Divider />

        {/* Содержимое */}
        <DialogContent dividers>
          <Box sx={{ display: "flex", height: "100%", mt: 1 }}>
            {/* Левая часть - Детали модели */}
            <Box sx={{ flex: 1, mr: 2, overflow: "auto" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ textAlign: "center", mb: 2 }}
              >
                Детали модели
              </Typography>

              {configLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {/* Отображение деталей модели */}
                  <Typography variant="subtitle1">
                    <strong>ID:</strong> {model.job_id}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Название:</strong> {model.job_name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Тип:</strong> {model.gpu_type?.type || "N/A"}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Статус:</strong> {modelStatus}
                  </Typography>
                  {/* Дополнительные параметры модели */}
                </Box>
              )}
            </Box>

            {/* Разделитель */}
            <Divider orientation="vertical" flexItem />

            {/* Правая часть - Конфигурация модели */}
            <Box sx={{ flex: 1, ml: 2, overflow: "auto" }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Button
                  variant={"outlined"}
                  onClick={() => setActiveTab("schedule")}
                  sx={{
                    mr: 1,
                    backgroundColor:
                      activeTab === "schedule" ? "#c0c0c5" : "#ececf1",
                  }}
                >
                  Расписание
                </Button>
                <Button
                  variant={"outlined"}
                  onClick={() => setActiveTab("config")}
                  sx={{
                    mr: 1,
                    backgroundColor:
                      activeTab === "config" ? "#c0c0c5" : "#ececf1",
                  }}
                >
                  Конфигурация
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setActiveTab("events")}
                  sx={{
                    backgroundColor:
                      activeTab === "events" ? "#c0c0c5" : "#ececf1",
                  }}
                >
                  События
                </Button>
              </Box>

              {activeTab === "schedule" && (
                <Box sx={{ height: "100%", overflow: "auto" }}>
                  <Typography>Нет расписаний для этой задачи.</Typography>

                  <Button variant="outlined" sx={{ mt: 2 }}>
                    Добавить расписание
                  </Button>
                </Box>
              )}

              {activeTab === "config" && (
                <Box
                  sx={{
                    height: "500px",
                    overflow: "auto",
                    borderRadius: "10px",
                  }}
                >
                  {configLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "200px",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <SyntaxHighlighter
                      language="yaml"
                      style={coy}
                      showLineNumbers
                      customStyle={{ borderRadius: "10px" }}
                    >
                      {config}
                    </SyntaxHighlighter>
                  )}
                </Box>
              )}
              {activeTab === "events" && <JobEvents jobId={model.job_id} />}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Оповещение */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ModelsDialog;
