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
  TextField,
  Divider,
  Stack,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format, parseISO, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import axiosInstance from "../api"; // Предполагается, что у вас есть axiosInstance для запросов
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism";
import ConfigureModelForm from "./ConfigureModelForm";
import { useTheme } from "@mui/material/styles";

function ModelsDialog({ open, onClose, model }) {
  // Состояния
  const [modelDetails, setModelDetails] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [config, setConfig] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [activeTab, setActiveTab] = useState("config");

  const theme = useTheme();

  // Функция для форматирования даты и времени (при необходимости)
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

  // Получение деталей модели при открытии диалогового окна
  useEffect(() => {
    if (open && model) {
      setConfigLoading(true);
      // Например, если у вас есть API для получения деталей модели
      // axiosInstance.get(`/models/${model.id}`)
      //   .then(response => {
      //     setModelDetails(response.data);
      //     setConfig(JSON.stringify(response.data.defaultConfig, null, 2));
      //   })
      //   .catch(error => {
      //     console.error("Ошибка при получении деталей модели:", error);
      //     showAlert("Ошибка при загрузке деталей модели.", "error");
      //   })
      //   .finally(() => {
      //     setConfigLoading(false);
      //   });

      // Для примера используем данные из переданного объекта model
      setModelDetails(model);
      setConfig(JSON.stringify(model.defaultConfig, null, 2));
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

  // Обработка запуска модели (если требуется)
  const handleRunModel = async () => {
    // Здесь вы можете реализовать запуск модели
    showAlert("Модель успешно запущена.", "success");
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

            alignItems: "center",
            position: "relative",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {model.name}
          </Typography>
          <Box
            sx={{
              height: "2px",
              flexGrow: 1,
              minWidth: "3px",
              maxWidth: "200px",
              borderRadius: "5px",
              ml: 1,
              mr: 1,
              bgcolor: "black",
            }}
          />
          <Box>
            <Typography variant="body1">
              <strong>21.04.2025 15:46:58</strong>
            </Typography>
          </Box>

          <IconButton
            sx={{ position: "absolute", right: 8, top: 10 }}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
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
                    <strong>ID:</strong> {model.id}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Название:</strong> {model.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Тип:</strong> {model.type}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Описание:</strong> {model.description}
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
                  data-testid="tab-schedule"
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
              {activeTab === "events" && "<JobEvents />"}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
          <Button
            onClick={handleRunModel}
            variant="contained"
            color="primary"
            sx={{ color: "white", padding: "8px 16px" }}
          >
            Запустить модель
          </Button>
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
