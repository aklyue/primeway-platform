// src/components/JobDetailsDialog.js

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import {
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale";
import { format } from "date-fns";
import axiosInstance from "../api";

function JobDetailsDialog({ open, onClose, job }) {
  // Состояния компонента
  const [tabValue, setTabValue] = useState(0);
  const [executions, setExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [config, setConfig] = useState("");
  const [configLoading, setConfigLoading] = useState(true);
  const [configEditing, setConfigEditing] = useState(false);

  // Состояния для управления расписанием
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

  useEffect(() => {
    if (job && open) {
      // Получение данных при открытии диалога
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

  // Получение выполнений задачи
  const fetchExecutions = () => {
    setExecutionsLoading(true);
    axiosInstance
      .get("/jobs/executions", { params: { job_id: job.job_id } })
      .then((response) => {
        setExecutions(response.data || []);
      })
      .catch((error) => {
        console.error("Ошибка при получении выполнений:", error);
        showAlert("Ошибка при получении выполнений задания.", "error");
        setExecutions([]);
      })
      .finally(() => {
        setExecutionsLoading(false);
      });
  };

  // Получение расписаний задачи
  const fetchSchedules = () => {
    setSchedulesLoading(true);
    axiosInstance
      .get("/jobs/get-schedules", { params: { job_id: job.job_id } })
      .then((response) => {
        setSchedules(response.data || []);
      })
      .catch((error) => {
        console.error("Ошибка при получении расписаний:", error);
        showAlert("Ошибка при получении расписаний задания.", "error");
        setSchedules([]);
      })
      .finally(() => {
        setSchedulesLoading(false);
      });
  };

  // Получение конфигурации задачи
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

  // Обработка изменения вкладки
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Копирование текста в буфер обмена
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showAlert("Скопировано в буфер обмена.");
  };

  // Остановить выполнение задачи
  const handleStopExecution = (executionId) => {
    axiosInstance
      .post("/jobs/job-stop", null, {
        params: { job_execution_id: executionId },
      })
      .then(() => {
        showAlert(`Выполнение ${executionId} успешно остановлено.`);
        fetchExecutions(); // Обновить выполнения
      })
      .catch((error) => {
        handleApiError(error, "Ошибка при остановке выполнения.");
      });
  };

  // Удалить расписание
  const handleDeleteSchedule = (scheduleId) => {
    axiosInstance
      .delete("/jobs/delete-schedules", {
        data: {
          job_id: job.job_id,
          schedule_id: scheduleId,
        },
      })
      .then(() => {
        showAlert(`Расписание ${scheduleId} успешно удалено.`);
        fetchSchedules(); // Обновить расписания
      })
      .catch((error) => {
        handleApiError(error, "Ошибка при удалении расписания.");
      });
  };

  // Открыть форму добавления расписания
  const handleAddSchedule = () => {
    setIsEditingSchedule(false);
    setNewSchedule({
      workdays: [],
      weekends: [],
      specific_days: [],
    });
    setScheduleFormOpen(true);
  };

  // Открыть форму редактирования расписания
  const handleEditSchedule = (schedule) => {
    setIsEditingSchedule(true);
    setCurrentSchedule(schedule);

    // Определяем тип расписания
    const scheduleType = schedule.schedule_type || detectScheduleType(schedule);

    if (scheduleType === "workdays") {
      setNewSchedule({
        workdays:
          schedule.start_time && schedule.end_time
            ? [{ start: schedule.start_time, end: schedule.end_time }]
            : [],
        weekends: [],
        specific_days: [],
        schedule_type: scheduleType,
      });
    } else if (scheduleType === "weekends") {
      setNewSchedule({
        workdays: [],
        weekends:
          schedule.start_time && schedule.end_time
            ? [{ start: schedule.start_time, end: schedule.end_time }]
            : [],
        specific_days: [],
        schedule_type: scheduleType,
      });
    } else if (scheduleType === "specific_day") {
      setNewSchedule({
        workdays: [],
        weekends: [],
        specific_days: [
          {
            day: schedule.day_of_week || schedule.day,
            windows:
              schedule.start_time && schedule.end_time
                ? [{ start: schedule.start_time, end: schedule.end_time }]
                : [],
          },
        ],
        schedule_type: scheduleType,
      });
    } else {
      // Обработка других типов расписания, если необходимо
    }

    setScheduleFormOpen(true);
  };

  // Функция для определения типа расписания, если поле schedule_type отсутствует
  const detectScheduleType = (schedule) => {
    if (schedule.workdays) {
      return "workdays";
    }
    if (schedule.weekends) {
      return "weekends";
    }
    if (schedule.specific_days) {
      return "specific_day";
    }
    // Добавьте другие проверки, если необходимо
    return null;
  };

  // Закрыть форму расписания
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
    console.log('Детали ошибки:', errorDetail);

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

    if (isEditingSchedule) {
      // Логика для обновления расписания
      const scheduleData = {};

      let scheduleType = newSchedule.schedule_type || null;

      if (newSchedule.workdays && newSchedule.workdays.length > 0) {
        scheduleType = "workdays";
        scheduleData.schedule_type = scheduleType;
        scheduleData.start_time = newSchedule.workdays[0].start;
        scheduleData.end_time = newSchedule.workdays[0].end;
      } else if (newSchedule.weekends && newSchedule.weekends.length > 0) {
        scheduleType = "weekends";
        scheduleData.schedule_type = scheduleType;
        scheduleData.start_time = newSchedule.weekends[0].start;
        scheduleData.end_time = newSchedule.weekends[0].end;
      } else if (newSchedule.specific_days && newSchedule.specific_days.length > 0) {
        scheduleType = "specific_day";
        scheduleData.schedule_type = scheduleType;
        scheduleData.start_time = newSchedule.specific_days[0].windows[0].start;
        scheduleData.end_time = newSchedule.specific_days[0].windows[0].end;
        scheduleData.day_of_week = newSchedule.specific_days[0].day;
      }

      console.log('Отправка scheduleData при обновлении:', scheduleData);

      // Отправляем данные на сервер
      const requestConfig = {
        params: {
          job_id: job.job_id,
          schedule_id: currentSchedule.schedule_id,
        },
        headers: { "Content-Type": "application/json" },
      };

      axiosInstance
        .put("/jobs/update-schedules", scheduleData, requestConfig)
        .then(() => {
          showAlert("Расписание успешно обновлено.");
          fetchSchedules();
          setScheduleFormOpen(false);
        })
        .catch((error) => {
          handleApiError(error, "Ошибка при обновлении расписания.");
        });
    } else {
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

  // Обработка изменений конфигурации
  const handleConfigChange = (e) => {
    setConfig(e.target.value);
  };

  // Закрыть оповещение
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Функция для отображения деталей расписания
  const renderScheduleDetails = (schedule) => {
    const { schedule_type, start_time, end_time, day_of_week } = schedule;

    return (
      <Box>
        <Typography variant="subtitle1">
          Тип расписания: {schedule_type}
        </Typography>
        <Typography variant="body1">
          Время начала: {start_time}
        </Typography>
        <Typography variant="body1">
          Время окончания: {end_time}
        </Typography>
        {day_of_week && (
          <Typography variant="body1">
            День недели: {day_of_week}
          </Typography>
        )}
      </Box>
    );
  };

  // Проверка наличия задания
  if (!job) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>{`Детали задачи: ${job.job_name}`}</DialogTitle>
        <DialogContent dividers>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Выполнения" />
            <Tab label="Расписание" />
            <Tab label="Конфигурация" />
          </Tabs>
          {/* Вкладка "Выполнения" */}
          {tabValue === 0 && (
            <Box sx={{ mt: 2 }}>
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
              ) : executions.length > 0 ? (
                <List>
                  {executions.map((execution) => (
                    <ListItem key={execution.job_execution_id}>
                      <ListItemText
                        primary={`ID: ${execution.job_execution_id}`}
                        secondary={`Статус: ${execution.status} | Начало: ${
                          execution.start_time || "N/A"
                        } | Конец: ${execution.end_time || "N/A"}`}
                      />
                      {/* Кнопки действий */}
                      <Tooltip title="Скопировать ID выполнения">
                        <IconButton
                          onClick={() => handleCopy(execution.job_execution_id)}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Остановить выполнение">
                        <IconButton
                          onClick={() =>
                            handleStopExecution(execution.job_execution_id)
                          }
                        >
                          <StopIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>Нет выполнений для этой задачи.</Typography>
              )}
            </Box>
          )}
          {/* Вкладка "Расписание" */}
          {tabValue === 1 && (
            <Box sx={{ mt: 2 }}>
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
              ) : schedules.length > 0 ? (
                <List>
                  {schedules.map((schedule) => (
                    <ListItem key={schedule.schedule_id}>
                      <ListItemText
                        primary={`ID: ${schedule.schedule_id}`}
                        secondary={renderScheduleDetails(schedule)}
                      />
                      {/* Кнопки действий */}
                      <Tooltip title="Редактировать расписание">
                        <IconButton onClick={() => handleEditSchedule(schedule)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить расписание">
                        <IconButton
                          onClick={() =>
                            handleDeleteSchedule(schedule.schedule_id)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>Нет расписаний для этой задачи.</Typography>
              )}
              <Button
                variant="contained"
                onClick={handleAddSchedule}
                sx={{ mt: 2 }}
              >
                Добавить расписание
              </Button>
            </Box>
          )}
          {/* Вкладка "Конфигурация" */}
          {tabValue === 2 && (
            <Box sx={{ mt: 2 }}>
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
                  <Typography variant="body1">Конфигурация:</Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={20}
                    variant="outlined"
                    value={config}
                    onChange={handleConfigChange}
                    InputProps={{
                      readOnly: !configEditing,
                    }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    {configEditing ? (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveConfig}
                      >
                        Сохранить конфигурацию
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={handleEditConfig}
                      >
                        Редактировать конфигурацию
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговая форма расписания */}
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
                    window.start
                      ? new Date(`1970-01-01T${window.start}`)
                      : null
                  }
                  onChange={(time) => {
                    const formattedTime = time ? format(time, "HH:mm:ss") : "";
                    const updatedWorkdays = [...newSchedule.workdays];
                    updatedWorkdays[index].start = formattedTime;
                    setNewSchedule((prev) => ({
                      ...prev,
                      workdays: updatedWorkdays,
                    }));
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
                    const formattedTime = time ? format(time, "HH:mm:ss") : "";
                    const updatedWorkdays = [...newSchedule.workdays];
                    updatedWorkdays[index].end = formattedTime;
                    setNewSchedule((prev) => ({
                      ...prev,
                      workdays: updatedWorkdays,
                    }));
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
                    window.start
                      ? new Date(`1970-01-01T${window.start}`)
                      : null
                  }
                  onChange={(time) => {
                    const formattedTime = time ? format(time, "HH:mm:ss") : "";
                    const updatedWeekends = [...newSchedule.weekends];
                    updatedWeekends[index].start = formattedTime;
                    setNewSchedule((prev) => ({
                      ...prev,
                      weekends: updatedWeekends,
                    }));
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
                    const formattedTime = time ? format(time, "HH:mm:ss") : "";
                    const updatedWeekends = [...newSchedule.weekends];
                    updatedWeekends[index].end = formattedTime;
                    setNewSchedule((prev) => ({
                      ...prev,
                      weekends: updatedWeekends,
                    }));
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
                  <LocalizationProvider dateAdapter={AdapterDateFns} locale={ru}>
                    <TimePicker
                      label="Начало"
                      value={
                        window.start
                          ? new Date(`1970-01-01T${window.start}`)
                          : null
                      }
                      onChange={(time) => {
                        const formattedTime = time
                          ? format(time, "HH:mm:ss")
                          : "";
                        const updatedWindows = [...day.windows];
                        updatedWindows[wIndex].start = formattedTime;
                        handleSpecificDayWindowsChange(index, updatedWindows);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} sx={{ mr: 1 }} fullWidth />
                      )}
                    />
                    <TimePicker
                      label="Конец"
                      value={
                        window.end
                          ? new Date(`1970-01-01T${window.end}`)
                          : null
                      }
                      onChange={(time) => {
                        const formattedTime = time
                          ? format(time, "HH:mm:ss")
                          : "";
                        const updatedWindows = [...day.windows];
                        updatedWindows[wIndex].end = formattedTime;
                        handleSpecificDayWindowsChange(index, updatedWindows);
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
          <Button onClick={handleScheduleFormSubmit}>
            {isEditingSchedule ? "Сохранить изменения" : "Добавить"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Оповещения */}
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

export default JobDetailsDialog;