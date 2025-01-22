// src/components/JobDetailsDialog.js

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
  DialogTitle,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  BugReport as BugReportIcon,
} from "@mui/icons-material";
import { format, parseISO, isValid } from "date-fns";
import axiosInstance from "../../api"; // Импортируем axiosInstance
import TasksActions from "../Tasks/TasksActions"; // Импортируем кнопки из TasksActions
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale";

function JobDetailsDialog({
  open,
  onClose,
  job,
  getStatusIndicator,
  useMockData,
}) {
  // Состояния компонента
  const [executions, setExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(true);
  const [executionsError, setExecutionsError] = useState(null);

  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [schedulesError, setSchedulesError] = useState(null);

  const [config, setConfig] = useState("");
  const [configLoading, setConfigLoading] = useState(true);
  const [configEditing, setConfigEditing] = useState(false);

  // Состояния для кнопок и логов
  const [logsLoading, setLogsLoading] = useState(false);
  const [buildLogsLoading, setBuildLogsLoading] = useState(false);
  const [buildLogsModalOpen, setBuildLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [currentJobName, setCurrentJobName] = useState("");
  const [logsModalOpen, setLogsModalOpen] = useState(false);

  // Состояния для расписания
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    workdays: [],
    weekends: [],
    specific_days: [],
  });

  // Состояния для оповещений
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const formatJobExecutionId = (id) => {
    if (!id) return "N/A";
    return id.length > 12 ? `${id.slice(0, 3)}**${id.slice(-3)}` : id;
  };

  // Функции-обработчики
  const handleLogsClick = (execution = null) => {
    setLogsLoading(true);
    setCurrentJobName(job.job_name || "N/A");

    const params = execution
      ? { job_execution_id: execution.job_execution_id }
      : { job_id: job.job_id };

    // Получение логов выполнения задачи
    axiosInstance
      .get("/jobs/job-logs", { params })
      .then((response) => {
        const logs = response.data.logs || "Логи отсутствуют.";
        setCurrentLogs(logs);
      })
      .catch((error) => {
        console.error("Ошибка при получении логов задачи:", error);
        const errorMessage =
          error.response?.data?.detail || "Ошибка при получении логов задачи.";
        setCurrentLogs(errorMessage);
      })
      .finally(() => {
        setLogsLoading(false);
        setLogsModalOpen(true);
      });
  };

  const handleBuildLogsClick = () => {
    setBuildLogsLoading(true);
    setCurrentJobName(job.job_name || "N/A");

    // Получение логов сборки
    axiosInstance
      .get("/jobs/build-logs", { params: { job_id: job.job_id } })
      .then((response) => {
        const logs = response.data.build_logs || "Логи сборки отсутствуют.";
        setCurrentLogs(logs);
      })
      .catch((error) => {
        console.error("Ошибка при получении логов сборки задачи:", error);
        const errorMessage =
          error.response?.data?.detail || "Ошибка при получении логов сборки.";
        setCurrentLogs(errorMessage);
      })
      .finally(() => {
        setBuildLogsLoading(false);
        setBuildLogsModalOpen(true);
      });
  };

  const handleDownloadArtifacts = (job, execution = null) => {
    console.log("Скачать артефакты для задачи:", job);

    if (useMockData) {
      alert(
        `Скачивание артефактов для задачи ${job.job_name} (ID: ${job.job_id})`
      );
    } else {
      // Проверяем, что задача имеет тип "run"
      if (job.job_type !== "run") {
        alert("Артефакты доступны только для задач типа 'run'.");
        return;
      }

      const params = {};

      // Используем job_execution_id выполнения
      if (execution && execution.job_execution_id) {
        params.job_execution_id = execution.job_execution_id;
      } else if (job.last_execution_id) {
        // Если у вас есть идентификатор последнего выполнения
        params.job_execution_id = job.last_execution_id;
      } else if (job.job_id) {
        params.job_id = job.job_id;
      } else {
        alert("Не указан идентификатор задачи или выполнения.");
        return;
      }

      axiosInstance
        .get("/jobs/get-job-artifacts", {
          params: params,
          responseType: "blob", // Ожидаем файл в ответе
        })
        .then((response) => {
          // Логика для обработки ответа и скачивания артефактов
        })
        .catch((error) => {
          console.error(
            `Ошибка при скачивании артефактов для задачи ${job.job_id}:`,
            error
          );
          const errorMessage =
            error.response?.data?.detail || "Ошибка при скачивании артефактов.";
          alert(errorMessage);
        });
    }
  };

  const handleStopClick = (jobExecutionId = null) => {
    // Если jobExecutionId не предоставлен, попробовать использовать last_execution_id
    const executionId = jobExecutionId || job.last_execution_id;

    if (!executionId) {
      showAlert("Нет выполнения для остановки.", "error");
      return;
    }

    // Отправляем POST-запрос для остановки выполнения задачи
    axiosInstance
      .post("/jobs/job-stop", null, {
        params: { job_execution_id: executionId },
      })
      .then((response) => {
        const message =
          response.data.message ||
          `Выполнение задачи ${executionId} успешно остановлено.`;
        showAlert(message, "success");
        // Обновляем список выполнений, чтобы отразить изменения
        fetchExecutions();
      })
      .catch((error) => {
        handleApiError(
          error,
          `Ошибка при остановке выполнения задачи ${executionId}.`
        );
      });
  };

  // Функция для получения списка выполнений задачи
  const fetchExecutions = async () => {
    setExecutionsLoading(true);
    setExecutionsError(null);
    try {
      const response = await axiosInstance.get("/jobs/executions", {
        params: { job_id: job.job_id },
      });
      const data = response.data || [];
      setExecutions(data);
    } catch (error) {
      console.error("Ошибка при получении выполнений:", error);
      setExecutionsError("Ошибка при загрузке выполнений");
    } finally {
      setExecutionsLoading(false);
    }
  };

  // Функция для получения расписаний задачи
  const fetchSchedules = async () => {
    setSchedulesLoading(true);
    setSchedulesError(null);
    try {
      const response = await axiosInstance.get("/jobs/get-schedules", {
        params: { job_id: job.job_id },
      });
      const data = response.data || [];
      setSchedules(data);
    } catch (error) {
      console.error("Ошибка при получении расписаний:", error);
      setSchedulesError("Ошибка при загрузке расписаний");
    } finally {
      setSchedulesLoading(false);
    }
  };

  // Функция для получения конфигурации задачи
  const fetchConfig = () => {
    setConfigLoading(true);
    axiosInstance
      .get("/jobs/get-config", { params: { job_id: job.job_id } })
      .then((response) => {
        setConfig(JSON.stringify(response.data || {}, null, 2));
      })
      .catch((error) => {
        console.error("Ошибка при получении конфигурации:", error);
        showAlert("Ошибка при получении конфигурации задания.", "error");
        setConfig("");
      })
      .finally(() => {
        setConfigLoading(false);
      });
  };

  useEffect(() => {
    if (job && open) {
      // При открытии диалога получаем данные из API
      fetchExecutions();
      fetchSchedules();
      fetchConfig();
    }
  }, [job, open]);

  // Функция для отображения оповещений
  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // Функция для копирования текста в буфер обмена
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showAlert("Скопировано в буфер обмена.");
  };

  // Функция для форматирования даты и времени
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = parseISO(dateTimeString);
      return format(date, "dd.MM.yyyy HH:mm:ss");
    } catch (error) {
      console.error("Ошибка при форматировании даты:", error);
      return dateTimeString;
    }
  };

  // Функция для отображения деталей расписания
  const renderScheduleDetails = (schedule) => {
    const { schedule_type, start_time, end_time, day_of_week } = schedule;
    return (
      <Box>
        <Typography variant="subtitle1">
          Тип расписания: {schedule_type}
        </Typography>
        <Typography variant="body1">Время начала: {start_time}</Typography>
        <Typography variant="body1">
          Время окончания: {end_time || "run"}
        </Typography>
        {day_of_week !== null && (
          <Typography variant="body1">День недели: {day_of_week}</Typography>
        )}
      </Box>
    );
  };

  // Функция для добавления расписания
  const handleAddSchedule = () => {
    setIsEditingSchedule(false);
    setNewSchedule({
      workdays: [],
      weekends: [],
      specific_days: [],
    });
    setScheduleFormOpen(true);
  };

  // Функция для закрытия формы расписания
  const handleScheduleFormClose = () => {
    setScheduleFormOpen(false);
  };

  // Добавить новое временное окно для рабочих дней
  const addWorkdayWindow = () => {
    setNewSchedule((prev) => ({
      ...prev,
      workdays: [...prev.workdays, { start: "", end: "" }],
    }));
  };

  // Удалить временное окно из рабочих дней
  const removeWorkdayWindow = (index) => {
    setNewSchedule((prev) => {
      const updatedWorkdays = [...prev.workdays];
      updatedWorkdays.splice(index, 1);
      return {
        ...prev,
        workdays: updatedWorkdays,
      };
    });
  };

  // Добавить новое временное окно для выходных дней
  const addWeekendWindow = () => {
    setNewSchedule((prev) => ({
      ...prev,
      weekends: [...prev.weekends, { start: "", end: "" }],
    }));
  };

  // Удалить временное окно из выходных дней
  const removeWeekendWindow = (index) => {
    setNewSchedule((prev) => {
      const updatedWeekends = [...prev.weekends];
      updatedWeekends.splice(index, 1);
      return {
        ...prev,
        weekends: updatedWeekends,
      };
    });
  };

  // Добавить новую конкретную дату
  const handleAddSpecificDay = () => {
    setNewSchedule((prev) => ({
      ...prev,
      specific_days: [
        ...prev.specific_days,
        { day: "", windows: [{ start: "", end: "" }] },
      ],
    }));
  };

  // Удалить конкретную дату
  const handleRemoveSpecificDay = (index) => {
    setNewSchedule((prev) => {
      const specific_days = [...prev.specific_days];
      specific_days.splice(index, 1);
      return { ...prev, specific_days };
    });
  };

  // Обновить конкретную дату
  const handleSpecificDayChange = (index, field, value) => {
    setNewSchedule((prev) => {
      const specific_days = [...prev.specific_days];
      specific_days[index][field] = value;
      return { ...prev, specific_days };
    });
  };

  // Обновить временные окна конкретной даты
  const handleSpecificDayWindowsChange = (index, windows) => {
    setNewSchedule((prev) => {
      const specific_days = [...prev.specific_days];
      specific_days[index].windows = windows;
      return { ...prev, specific_days };
    });
  };

  // Валидация расписания перед отправкой
  const validateSchedule = () => {
    const { workdays, weekends, specific_days } = newSchedule;

    if (
      (!workdays || workdays.length === 0) &&
      (!weekends || weekends.length === 0) &&
      (!specific_days || specific_days.length === 0)
    ) {
      showAlert(
        "Необходимо заполнить хотя бы одно из расписаний: рабочие дни, выходные или конкретные даты.",
        "error"
      );
      return false;
    }

    return true;
  };

  // Обработка ошибок API
  const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    const errorDetail = error.response?.data;
    console.log("Детали ошибки:", errorDetail);

    let errorMessage = defaultMessage;

    if (Array.isArray(errorDetail?.detail)) {
      errorMessage = errorDetail.detail.map((err) => err.msg).join(", ");
    } else if (typeof errorDetail?.detail === "string") {
      errorMessage = errorDetail.detail;
    } else if (typeof errorDetail === "object" && errorDetail !== null) {
      errorMessage = errorDetail.detail?.msg || JSON.stringify(errorDetail);
    }

    showAlert(errorMessage, "error");
  };

  // Отправка формы расписания на сервер
  const handleScheduleFormSubmit = () => {
    if (!validateSchedule()) {
      return;
    }

    // Логика для создания расписания
    const scheduleData = {};

    if (newSchedule.workdays && newSchedule.workdays.length > 0) {
      scheduleData.workdays = newSchedule.workdays.map((window) => ({
        start: window.start,
        end: window.end,
      }));
    }

    if (newSchedule.weekends && newSchedule.weekends.length > 0) {
      scheduleData.weekends = newSchedule.weekends.map((window) => ({
        start: window.start,
        end: window.end,
      }));
    }

    if (newSchedule.specific_days && newSchedule.specific_days.length > 0) {
      scheduleData.specific_days = newSchedule.specific_days.map((day) => ({
        day: day.day,
        windows: day.windows.map((window) => ({
          start: window.start,
          end: window.end,
        })),
      }));
    }

    console.log("Отправка scheduleData при создании:", scheduleData);

    // Отправляем данные на сервер
    const requestConfig = {
      params: { job_id: job.job_id },
      headers: { "Content-Type": "application/json" },
    };

    axiosInstance
      .post("/jobs/create-schedules", scheduleData, requestConfig)
      .then(() => {
        showAlert("Расписание успешно добавлено.");
        fetchSchedules();
        setScheduleFormOpen(false);
      })
      .catch((error) => {
        handleApiError(error, "Ошибка при добавлении расписания.");
      });
  };

  // Обработка удаления расписания
  const handleDeleteSchedule = async (scheduleId) => {
    try {
      // Отправляем DELETE-запрос на сервер
      await axiosInstance.delete("/jobs/delete-schedules", {
        params: {
          job_id: job.job_id,
          schedule_id: scheduleId,
        },
      });

      // Показываем уведомление об успешном удалении
      showAlert(`Расписание ${scheduleId} успешно удалено.`);

      // Обновляем список расписаний, чтобы отразить изменения
      fetchSchedules();
    } catch (error) {
      handleApiError(error, `Ошибка при удалении расписания ${scheduleId}.`);
    }
  };

  // Обработка редактирования конфигурации
  const handleEditConfig = () => {
    setConfigEditing(true);
  };

  // Сохранение конфигурации
  const handleSaveConfig = () => {
    let configData;
    try {
      configData = JSON.parse(config);
    } catch (error) {
      showAlert("Ошибка в формате JSON конфигурации.", "error");
      return;
    }

    // Обновление конфигурации
    const updateData = configData;

    axiosInstance
      .put("/jobs/update-config", updateData, {
        params: { job_id: job.job_id },
      })
      .then(() => {
        showAlert("Конфигурация успешно обновлена.");
        setConfigEditing(false);
      })
      .catch((error) => {
        handleApiError(error, "Ошибка при обновлении конфигурации.");
      });
  };

  // Проверка наличия задания
  if (!job) {
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
            height: "90vh",
          },
        }}
      >
        {/* Заголовок и информация о задаче */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-around",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 9,
              left: 9,
            }}
          >
            {getStatusIndicator(job.last_execution_status)}
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Название задачи */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {job.job_name}
              </Typography>
            </Box>
            <Box sx={{ height: "1px", width: "110px", bgcolor: "black" }} />
            {/* Тип задачи */}
            <Box>
              <Typography variant="body1">
                <strong>{job.job_type}</strong>
              </Typography>
            </Box>
            <Box sx={{ height: "1px", width: "110px", bgcolor: "black" }} />
            {/* Дата создания */}
            <Box>
              <Typography variant="body1">
                <strong>{formatDateTime(job.created_at)}</strong>
              </Typography>
            </Box>
            <Box sx={{ height: "1px", width: "100px", bgcolor: "black" }} />
            <Box>
              <Typography variant="body1">
                <strong>{job.build_status}</strong>
              </Typography>
              {job.build_status === "building" && (
                <CircularProgress size={16} />
              )}
            </Box>
            <Box sx={{ height: "1px", width: "100px", bgcolor: "black" }} />
            <Button
              sx={{
                border: "1px solid rgba(0,0,0,0.3)",
                borderRadius: "12px",
                padding: "4px 7px",
              }}
              startIcon={<BugReportIcon />}
              onClick={handleBuildLogsClick}
            >
              Build Логи
            </Button>
          </Stack>

          {/* Кнопки */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TasksActions
              job={job}
              onLogsClick={() => handleLogsClick()}
              onDownloadArtifacts={() => handleDownloadArtifacts(job)}
              onStopClick={() => handleStopClick()}
            />
          </Box>
        </Box>

        <Divider />

        {/* Содержимое */}
        <DialogContent dividers>
          <Box sx={{ display: "flex", height: "100%", mt: 1 }}>
            {/* Левая часть - Выполнения */}
            <Box sx={{ flex: 1.2, mr: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ textAlign: "center", mb: 2 }}
              >
                Выполнения
              </Typography>
              {executionsLoading ? (
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
              ) : executionsError ? (
                <Typography color="error">{executionsError}</Typography>
              ) : executions.length > 0 ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {/* Заголовки столбцов */}
                    <Grid container spacing={1}>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Job Exec id
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Создано
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Статус
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Начало
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Конец
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          GPU
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Health
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Действия
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* Данные */}
                  {executions.map((execution) => (
                    <Grid item xs={12} key={execution.job_execution_id}>
                      <Paper variant="outlined" sx={{ p: 1 }}>
                        <Grid
                          container
                          spacing={1}
                          alignItems="center"
                          sx={{ textAlign: "center" }}
                        >
                          <Grid item xs>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="body2">
                                {formatJobExecutionId(
                                  execution.job_execution_id
                                )}
                              </Typography>
                              <Tooltip title="Скопировать ID выполнения">
                                <IconButton
                                  onClick={() =>
                                    handleCopy(execution.job_execution_id)
                                  }
                                  size="small"
                                >
                                  <ContentCopyIcon
                                    fontSize="small"
                                    sx={{ fontSize: "1rem" }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {formatDateTime(execution.created_at)}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {execution.status}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {formatDateTime(execution.start_time)}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {formatDateTime(execution.end_time)}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {execution.gpu_info?.type || "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {execution.health_status || "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            {/* Кнопки действий */}
                            <TasksActions
                              job={job}
                              onLogsClick={() => handleLogsClick(execution)}
                              onDownloadArtifacts={() =>
                                handleDownloadArtifacts(job, execution)
                              }
                              onStopClick={() =>
                                handleStopClick(execution.job_execution_id)
                              }
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography>Нет выполнений для этой задачи.</Typography>
              )}
            </Box>

            {/* Разделитель */}
            <Divider orientation="vertical" flexItem />

            {/* Правая часть - Расписание и Конфиг */}
            <Box
              sx={{ flex: 0.7, ml: 2, display: "flex", flexDirection: "row" }}
            >
              {/* Расписание */}
              <Box sx={{ flex: 1, mr: 1 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ textAlign: "center", mb: 2 }}
                >
                  Расписание
                </Typography>
                {schedulesLoading ? (
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
                ) : schedulesError ? (
                  <Typography color="error">{schedulesError}</Typography>
                ) : schedules.length > 0 ? (
                  <List
                    dense={true}
                    sx={{ maxHeight: "510px", overflow: "auto" }}
                  >
                    {schedules.map((schedule) => (
                      <ListItem key={schedule.schedule_id}>
                        <ListItemText
                          primary={`ID: ${schedule.schedule_id}`}
                          secondary={renderScheduleDetails(schedule)}
                          secondaryTypographyProps={{ component: "div" }}
                        />
                        {/* Кнопки действий */}
                        <Tooltip title="Редактировать расписание">
                          <IconButton
                            onClick={() => {
                              showAlert(
                                `Функция редактирования расписания ${schedule.schedule_id} недоступна.`
                              );
                            }}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить расписание">
                          <IconButton
                            onClick={() =>
                              handleDeleteSchedule(schedule.schedule_id)
                            }
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>Нет расписаний для этой задачи.</Typography>
                )}
                <Button
                  variant="outlined"
                  onClick={handleAddSchedule}
                  sx={{ mt: 2 }}
                >
                  Добавить расписание
                </Button>
              </Box>

              {/* Конфигурация */}
              <Box sx={{ flex: 0.8, ml: 1 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ textAlign: "center", mb: 2 }}
                >
                  Конфигурация
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
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      minRows={10}
                      variant="outlined"
                      value={config}
                      onChange={(e) => setConfig(e.target.value)}
                      InputProps={{
                        readOnly: !configEditing,
                      }}
                      sx={{ flexGrow: 1, maxHeight: "445px", overflow: "auto" }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 2,
                      }}
                    >
                      {configEditing ? (
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveConfig}
                        >
                          Сохранить
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => setConfigEditing(true)}
                        >
                          Редактировать
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно с формой расписания */}
      <Dialog
        open={scheduleFormOpen}
        onClose={handleScheduleFormClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditingSchedule
            ? "Редактировать расписание"
            : "Добавить новое расписание"}
        </DialogTitle>
        <DialogContent>
          {/* Форма расписания */}
          {/* Рабочие дни */}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Рабочие дни:
          </Typography>
          <Button onClick={addWorkdayWindow} sx={{ mt: 1 }}>
            Добавить временное окно
          </Button>
          {newSchedule.workdays.map((window, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", mt: 1 }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns} locale={ru}>
                <TimePicker
                  label="Начало"
                  value={
                    window.start ? new Date(`1970-01-01T${window.start}`) : null
                  }
                  onChange={(time) => {
                    if (time && isValid(time)) {
                      const formattedTime = format(time, "HH:mm:ss");
                      const updatedWorkdays = [...newSchedule.workdays];
                      updatedWorkdays[index].start = formattedTime;
                      setNewSchedule((prev) => ({
                        ...prev,
                        workdays: updatedWorkdays,
                      }));
                    } else {
                      const updatedWorkdays = [...newSchedule.workdays];
                      updatedWorkdays[index].start = "";
                      setNewSchedule((prev) => ({
                        ...prev,
                        workdays: updatedWorkdays,
                      }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} sx={{ mr: 1 }} fullWidth />
                  )}
                />
                <TimePicker
                  label="Конец"
                  value={
                    window.end ? new Date(`1970-01-01T${window.end}`) : null
                  }
                  onChange={(time) => {
                    if (time && isValid(time)) {
                      const formattedTime = format(time, "HH:mm:ss");
                      const updatedWorkdays = [...newSchedule.workdays];
                      updatedWorkdays[index].end = formattedTime;
                      setNewSchedule((prev) => ({
                        ...prev,
                        workdays: updatedWorkdays,
                      }));
                    } else {
                      const updatedWorkdays = [...newSchedule.workdays];
                      updatedWorkdays[index].end = "";
                      setNewSchedule((prev) => ({
                        ...prev,
                        workdays: updatedWorkdays,
                      }));
                    }
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              <IconButton onClick={() => removeWorkdayWindow(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Выходные дни */}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Выходные дни:
          </Typography>
          <Button onClick={addWeekendWindow} sx={{ mt: 1 }}>
            Добавить временное окно
          </Button>
          {newSchedule.weekends.map((window, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", mt: 1 }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns} locale={ru}>
                <TimePicker
                  label="Начало"
                  value={
                    window.start ? new Date(`1970-01-01T${window.start}`) : null
                  }
                  onChange={(time) => {
                    if (time && isValid(time)) {
                      const formattedTime = format(time, "HH:mm:ss");
                      const updatedWeekends = [...newSchedule.weekends];
                      updatedWeekends[index].start = formattedTime;
                      setNewSchedule((prev) => ({
                        ...prev,
                        weekends: updatedWeekends,
                      }));
                    } else {
                      const updatedWeekends = [...newSchedule.weekends];
                      updatedWeekends[index].start = "";
                      setNewSchedule((prev) => ({
                        ...prev,
                        weekends: updatedWeekends,
                      }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} sx={{ mr: 1 }} fullWidth />
                  )}
                />
                <TimePicker
                  label="Конец"
                  value={
                    window.end ? new Date(`1970-01-01T${window.end}`) : null
                  }
                  onChange={(time) => {
                    if (time && isValid(time)) {
                      const formattedTime = format(time, "HH:mm:ss");
                      const updatedWeekends = [...newSchedule.weekends];
                      updatedWeekends[index].end = formattedTime;
                      setNewSchedule((prev) => ({
                        ...prev,
                        weekends: updatedWeekends,
                      }));
                    } else {
                      const updatedWeekends = [...newSchedule.weekends];
                      updatedWeekends[index].end = "";
                      setNewSchedule((prev) => ({
                        ...prev,
                        weekends: updatedWeekends,
                      }));
                    }
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              <IconButton onClick={() => removeWeekendWindow(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Конкретные даты */}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Конкретные даты:
          </Typography>
          <Button onClick={handleAddSpecificDay} sx={{ mt: 1 }}>
            Добавить дату
          </Button>
          {newSchedule.specific_days.map((day, index) => (
            <Box key={index} sx={{ mt: 1, border: "1px solid #ccc", p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  label="День (например, 'friday' или '2023-12-31')"
                  value={day.day}
                  onChange={(e) =>
                    handleSpecificDayChange(index, "day", e.target.value)
                  }
                  fullWidth
                  sx={{ mr: 1 }}
                />
                <IconButton onClick={() => handleRemoveSpecificDay(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Временные окна:
              </Typography>
              {day.windows.map((window, wIndex) => (
                <Box
                  key={wIndex}
                  sx={{ display: "flex", alignItems: "center", mt: 1 }}
                >
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    locale={ru}
                  >
                    <TimePicker
                      label="Начало"
                      value={
                        window.start
                          ? new Date(`1970-01-01T${window.start}`)
                          : null
                      }
                      onChange={(time) => {
                        if (time && isValid(time)) {
                          const formattedTime = format(time, "HH:mm:ss");
                          const updatedWindows = [...day.windows];
                          updatedWindows[wIndex].start = formattedTime;
                          handleSpecificDayWindowsChange(index, updatedWindows);
                        } else {
                          const updatedWindows = [...day.windows];
                          updatedWindows[wIndex].start = "";
                          handleSpecificDayWindowsChange(index, updatedWindows);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField {...params} sx={{ mr: 1 }} fullWidth />
                      )}
                    />
                    <TimePicker
                      label="Конец"
                      value={
                        window.end ? new Date(`1970-01-01T${window.end}`) : null
                      }
                      onChange={(time) => {
                        if (time && isValid(time)) {
                          const formattedTime = format(time, "HH:mm:ss");
                          const updatedWindows = [...day.windows];
                          updatedWindows[wIndex].end = formattedTime;
                          handleSpecificDayWindowsChange(index, updatedWindows);
                        } else {
                          const updatedWindows = [...day.windows];
                          updatedWindows[wIndex].end = "";
                          handleSpecificDayWindowsChange(index, updatedWindows);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                  <IconButton
                    onClick={() => {
                      const updatedWindows = [...day.windows];
                      updatedWindows.splice(wIndex, 1);
                      handleSpecificDayWindowsChange(index, updatedWindows);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                onClick={() => {
                  const updatedWindows = [
                    ...day.windows,
                    { start: "", end: "" },
                  ];
                  handleSpecificDayWindowsChange(index, updatedWindows);
                }}
                sx={{ mt: 1 }}
              >
                Добавить временное окно
              </Button>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleFormClose}>Отмена</Button>
          <Button onClick={handleScheduleFormSubmit}>Добавить</Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно с логами */}
      <Dialog
        open={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Логи: ${currentJobName}`}</DialogTitle>
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
              handleCopy(currentLogs);
            }}
          >
            Скопировать Логи
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно с логами сборки */}
      <Dialog
        open={buildLogsModalOpen}
        onClose={() => setBuildLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Build Логи: ${currentJobName}`}</DialogTitle>
        <DialogContent dividers>
          {buildLogsLoading ? (
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
          <Button onClick={() => setBuildLogsModalOpen(false)}>Закрыть</Button>
          <Button
            onClick={() => {
              handleCopy(currentLogs);
            }}
          >
            Скопировать Логи
          </Button>
        </DialogActions>
      </Dialog>

      {/* Оповещения */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default JobDetailsDialog;
