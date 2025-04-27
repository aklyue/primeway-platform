// src/components/ModelsDialog.jsx

import React, { useState, useEffect, useContext } from "react";
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
  DialogTitle,
} from "@mui/material";
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
import { AuthContext } from "../AuthContext";

// Импортируем модуль yaml
import yaml from "js-yaml";
import { OrganizationContext } from "./Organization/OrganizationContext";

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
  const { authToken } = useContext(AuthContext); // Получаем токен авторизации
  const { currentOrganization } = useContext(OrganizationContext); // Добавлено для получения текущей организации

  // Состояния
  const [jobDetails, setJobDetails] = useState({ ...model }); // Инициализируем с моделью
  const [configLoading, setConfigLoading] = useState(true);
  const [config, setConfig] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [activeTab, setActiveTab] = useState("events");
  const [jobStatus, setJobStatus] = useState(model.last_execution_status);

  // **Состояния для логов**
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  // **Состояния для расписания**
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);

  const job_id = model.job_id;

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

  // Функция для загрузки деталей задачи из `/jobs/get-organization-jobs`
  const fetchJobDetails = async () => {
    if (!currentOrganization) {
      console.error("Организация не выбрана.");
      return;
    }

    try {
      const response = await axiosInstance.get("/jobs/get-organization-jobs", {
        params: {
          organization_id: currentOrganization.id,
          // Здесь можно добавить дополнительные параметры фильтрации, если необходимо
        },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const jobs = response.data;
      const jobData = jobs.find((job) => job.job_id === job_id);

      if (jobData) {
        setJobDetails(jobData);
        setJobStatus(jobData.last_execution_status);
      } else {
        console.error("Задача не найдена в списке задач организации.");
        showAlert("Задача не найдена в организации.", "error");
      }
    } catch (error) {
      console.error("Ошибка при получении деталей задачи:", error);
      showAlert("Ошибка при получении деталей задачи.", "error");
    }
  };

  // Функция для загрузки расписания задачи
  const fetchSchedule = async () => {
    // setScheduleLoading(true);
    // try {
    //   const response = await axiosInstance.get("/jobs/get-schedule", {
    //     params: { job_id },
    //     headers: { Authorization: `Bearer ${authToken}` },
    //   });
    //   setScheduleData(response.data);
    // } catch (error) {
    //   console.error("Ошибка при получении расписания:", error);
    //   showAlert("Ошибка при получении расписания.", "error");
    //   setScheduleData(null);
    // } finally {
    //   setScheduleLoading(false);
    // }
    console.log(1);
  };

  // Получение деталей задачи, конфигурации и расписания при открытии диалогового окна
  useEffect(() => {
    if (open && job_id) {
      setConfigLoading(true);
      fetchJobDetails();
      fetchConfig();
      fetchSchedule(); // Вызываем функцию для загрузки расписания
    } else {
      setJobDetails(null);
      setConfig("");
      setScheduleData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, job_id]);

  const fetchConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await axiosInstance.get("/jobs/get-config", {
        params: { job_id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // Конвертируем конфигурацию в YAML
      const yamlConfig = yaml.dump(response.data || {});
      setConfig(yamlConfig);
    } catch (error) {
      console.error("Ошибка при получении конфигурации:", error);
      showAlert("Ошибка при получении конфигурации задания.", "error");
      setConfig("");
    } finally {
      setConfigLoading(false);
    }
  };

  // Обработка закрытия оповещения
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handleStartJob = async () => {
    try {
      await axiosInstance.post("/jobs/job-start", null, {
        params: { job_id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showAlert("Задача успешно запущена.", "success");
      setJobStatus("running");
    } catch (error) {
      console.error("Ошибка при запуске задачи:", error);
      showAlert("Ошибка при запуске задачи.", "error");
    }
  };

  const handleStopJob = async () => {
    try {
      await axiosInstance.post("/jobs/job-stop", null, {
        params: { job_id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showAlert("Задача успешно остановлена.", "success");
      setJobStatus("stopped");
    } catch (error) {
      console.error("Ошибка при остановке задачи:", error);
      showAlert("Ошибка при остановке задачи.", "error");
    }
  };

  // **Функция для получения логов задачи**
  const handleLogsClick = async () => {
    setLogsModalOpen(true);
    setLogsLoading(true);
    setCurrentLogs(""); // Сбрасываем предыдущие логи

    try {
      if (!job_id) {
        setCurrentLogs("Идентификатор задачи отсутствует.");
        setLogsLoading(false);
        return;
      }

      const response = await axiosInstance.get("/jobs/job-logs", {
        params: { job_id },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const logs = response.data.logs || "Логи отсутствуют.";
      setCurrentLogs(logs);
    } catch (error) {
      console.error(`Ошибка при получении логов для задачи ${job_id}:`, error);
      const errorMessage =
        error.response?.data?.detail ||
        (error.response?.status === 404
          ? "Логи недоступны."
          : "Ошибка при получении логов.");
      setCurrentLogs(errorMessage);
    } finally {
      setLogsLoading(false);
    }
  };

  if (!jobDetails) {
    // Пока данные задачи не загружены, показываем загрузчик
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
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
        </DialogContent>
      </Dialog>
    );
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
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Левая часть заголовка */}
          <Typography variant="h6" sx={{ fontWeight: "bold", mr: 2 }}>
            {jobDetails.job_name}
          </Typography>

          {/* Разделитель */}
          <Box
            sx={{
              height: "2px",
              flexGrow: 1,
              minWidth: "3px",
              maxWidth: "130px",
              borderRadius: "5px",
              mr: 2,
              bgcolor: "black",
            }}
          />

          <Typography variant="body1" sx={{ mr: 2 }}>
            <strong>{formatDateTime(jobDetails.created_at)}</strong>
          </Typography>
          <Box
            sx={{
              height: "2px",
              flexGrow: 1,
              minWidth: "3px",
              maxWidth: "130px",
              borderRadius: "5px",
              mr: 2,
              bgcolor: "black",
            }}
          />

          {/* Кнопка "Логи" */}
          <Tooltip title="Посмотреть логи">
            <Button
              onClick={handleLogsClick}
              color="primary"
              variant="outlined"
              sx={{
                bgcolor: "#505156",
                color: "#FFFFFF",
                mr: 2,
              }}
            >
              Логи
            </Button>
          </Tooltip>
          <Box
            sx={{
              height: "2px",
              flexGrow: 1,
              minWidth: "3px",
              maxWidth: "130px",
              borderRadius: "5px",
              mr: 2,
              bgcolor: "black",
            }}
          />

          {/* URL задачи */}
          {jobDetails.job_url && (
            <Tooltip title="Скопировать URL">
              <Typography
                variant="body2"
                sx={{
                  padding: "3px 8px",
                  borderRadius: "12px",
                  border: "1px solid #5282ff",
                  backgroundColor: "none",
                  color: "secondary.main",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "200px",
                  "&:hover": {
                    backgroundColor: "#8fa8ea",
                    color: "white",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(jobDetails.job_url);
                }}
              >
                {jobDetails.job_url}
              </Typography>
            </Tooltip>
          )}

          {/* Правая часть заголовка */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Tooltip title="Запустить задачу">
              <span>
                <ActionIconButton
                  onClick={handleStartJob}
                  colorvariant="success"
                  size="small"
                  disabled={jobStatus === "running"}
                  aria-label="Запустить задачу"
                >
                  <PlayCircleFilledIcon
                    sx={{
                      color:
                        jobStatus === "running"
                          ? "text.disabled"
                          : "success.main",
                    }}
                  />
                </ActionIconButton>
              </span>
            </Tooltip>

            <Tooltip title="Остановить задачу">
              <span>
                <ActionIconButton
                  onClick={handleStopJob}
                  colorvariant="error"
                  size="small"
                  disabled={jobStatus !== "running"}
                  aria-label="Остановить задачу"
                >
                  <StopIcon
                    sx={{
                      color:
                        jobStatus === "running"
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
            {/* Левая часть - Детали задачи */}
            <Box sx={{ flex: 1, mr: 2, overflow: "auto" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ textAlign: "center", mb: 2 }}
              >
                Детали задачи
              </Typography>

              {/* Отображение деталей задачи */}
              {jobDetails ? (
                <>
                  <Typography variant="subtitle1">
                    <strong>ID:</strong> {jobDetails.job_id}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Название:</strong> {jobDetails.job_name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Тип задачи:</strong> {jobDetails.job_type || "N/A"}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Статус сборки:</strong>{" "}
                    {jobDetails.build_status || "N/A"}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Последний статус выполнения:</strong>{" "}
                    {jobDetails.last_execution_status || "N/A"}
                  </Typography>
                </>
              ) : (
                "Нет задачи"
              )}
              {/* Дополнительно можно добавить другие параметры задачи */}
            </Box>

            {/* Разделитель */}
            <Divider orientation="vertical" flexItem />

            {/* Правая часть - Конфигурация и расписание */}
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
                  {scheduleLoading ? (
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
                  ) : scheduleData ? (
                    <Box>
                      <Typography variant="body1">
                        <strong>Начало:</strong>{" "}
                        {formatDateTime(scheduleData.start_date)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Конец:</strong>{" "}
                        {formatDateTime(scheduleData.end_date)}
                      </Typography>
                      {scheduleData.days_of_week && (
                        <Typography variant="body1">
                          <strong>Дни недели:</strong>{" "}
                          {scheduleData.days_of_week.join(", ")}
                        </Typography>
                      )}
                      {scheduleData.interval && (
                        <Typography variant="body1">
                          <strong>Интервал:</strong> {scheduleData.interval}{" "}
                          минут
                        </Typography>
                      )}
                      {/* Добавьте отображение других данных расписания по необходимости */}
                    </Box>
                  ) : (
                    <Typography>
                      Расписание не настроено для этой задачи.
                    </Typography>
                  )}

                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      // Открыть диалог настройки расписания
                      showAlert(
                        "Функция редактирования расписания не реализована."
                      );
                    }}
                  >
                    Добавить/Изменить расписание
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
              {activeTab === "events" && <JobEvents jobId={job_id} />}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно логов задачи */}
      <Dialog
        open={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Логи задачи: ${jobDetails.job_name}`}</DialogTitle>
        <DialogContent dividers>
          {logsLoading ? (
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
            <Typography
              variant="body2"
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            >
              {currentLogs}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsModalOpen(false)}>Закрыть</Button>
          <Button
            onClick={() => {
              // Копирование логов в буфер обмена
              handleCopy(currentLogs);
            }}
          >
            Скопировать Логи
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
