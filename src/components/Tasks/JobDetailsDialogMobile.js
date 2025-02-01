import React, { useState, useEffect, useRef } from "react";
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
  Stack,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  DialogTitle,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  BugReport as BugReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { format, parseISO, isValid } from "date-fns";
import axiosInstance from "../../api";
import TasksActions from "../Tasks/TasksActions";
import { ru } from "date-fns/locale";
import yaml from "js-yaml";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const statusColors = {
  success: "#28a745",
  failed: "#dc3545",
  building: "#007bff",
};

function JobDetailsDialogMobile({ open, onClose, job, getStatusIndicator }) {
  // Состояния компонента
  const [activeTab, setActiveTab] = useState("executions");
  const [executions, setExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(true);
  const [executionsError, setExecutionsError] = useState(null);

  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [schedulesError, setSchedulesError] = useState(null);

  const [config, setConfig] = useState("");
  const [configLoading, setConfigLoading] = useState(true);

  const [logsLoading, setLogsLoading] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [currentJobName, setCurrentJobName] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const initialExecutionsLoadRef = useRef(true);
  const intervalRef = useRef(null);

  // Добавляем состояние для событий
  const [events, setEvents] = useState({});
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // Состояния для формы расписания
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    workdays: [],
    weekends: [],
    specific_days: [],
  });
  const [editedSchedule, setEditedSchedule] = useState(null);

  const formatJobExecutionId = (id) => {
    if (!id) return "N/A";
    return id.length > 12 ? `${id.slice(0, 3)}**${id.slice(-3)}` : id;
  };

  // Функции-обработчики
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showAlert("Скопировано в буфер обмена.");
  };

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

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleLogsClick = (execution = null) => {
    setLogsModalOpen(true);
    setLogsLoading(true);
    setCurrentLogs("");
    setCurrentJobName(job.job_name || "N/A");

    const params = execution
      ? { job_execution_id: execution.job_execution_id }
      : { job_id: job.job_id };

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
      });
  };

  const handleDownloadArtifacts = (job, execution = null) => {
    showAlert("Скачивание артефактов началось...", "info");

    if (job.job_type !== "run") {
      alert("Артефакты доступны только для задач типа 'run'.");
      return;
    }

    const params = {};

    if (execution && execution.job_execution_id) {
      params.job_execution_id = execution.job_execution_id;
    } else if (job.last_execution_id) {
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
        responseType: "blob",
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "application/zip" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const contentDisposition = response.headers["content-disposition"];
        let fileName = "artifacts.zip";
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (fileNameMatch && fileNameMatch.length === 2) {
            fileName = fileNameMatch[1];
          }
        }
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error(
          `Ошибка при скачивании артефактов для задачи ${job.job_id}:`,
          error
        );
        const errorMessage =
          error.response?.data?.detail || "Ошибка при скачивании артефактов.";
        showAlert(errorMessage, "error");
      });
  };

  const fetchExecutions = async () => {
    if (initialExecutionsLoadRef.current) {
      setExecutionsLoading(true);
    }
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
      if (initialExecutionsLoadRef.current) {
        setExecutionsLoading(false);
        initialExecutionsLoadRef.current = false;
      }
    }
  };

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

  const fetchConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await axiosInstance.get("/jobs/get-config", {
        params: { job_id: job.job_id },
      });
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

  // Заглушка для получения событий. Пока просто устанавливаем пустой объект.
  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      // Здесь будет запрос на сервер за событиями
      // const response = await axiosInstance.get("/jobs/get-events", { params: { job_id: job.job_id } });
      // setEvents(response.data);
      // Пока просто устанавливаем пустой объект
      setEvents({});
    } catch (error) {
      console.error("Ошибка при получении событий:", error);
      setEventsError("Ошибка при загрузке событий");
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (job && open) {
      initialExecutionsLoadRef.current = true;
      fetchExecutions();
      fetchSchedules();
      fetchConfig();
      fetchEvents();

      intervalRef.current = setInterval(() => {
        fetchExecutions();
      }, 5000);

      return () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [job, open]);

  const handleStartClick = () => {
    alert("запуск");
  };
  const handleStopClick = () => {
    alert("stop");
  };

  // Функция для отображения деталей расписания
  const renderScheduleDetails = (schedule) => {
    const { schedule_type, start_time, end_time, day_of_week } = schedule;
    return (
      <Box>
        <Typography variant="subtitle1">
          <strong>Тип расписания:</strong> {schedule_type}
        </Typography>
        <Typography variant="body1">
          <strong>Время начала:</strong> {start_time}
        </Typography>
        <Typography variant="body1">
          <strong>Время окончания:</strong> {end_time || "run"}
        </Typography>
        {day_of_week && (
          <Typography variant="body1">
            <strong>День недели:</strong> {day_of_week}
          </Typography>
        )}
      </Box>
    );
  };

  // Функция для добавления расписания
  const handleAddSchedule = () => {
    setIsEditingSchedule(false);
    setEditedSchedule(null);
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
    setIsEditingSchedule(false);
    setCurrentSchedule(null);
    setEditedSchedule(null);
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
    if (isEditingSchedule) {
      // Обработка редактирования расписания
      // ...
    } else {
      // Добавление нового расписания
      if (!validateSchedule()) {
        return;
      }

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

  // Обработка удаления расписания
  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await axiosInstance.delete("/jobs/delete-schedules", {
        params: {
          job_id: job.job_id,
          schedule_id: scheduleId,
        },
      });

      showAlert(`Расписание ${scheduleId} успешно удалено.`);
      fetchSchedules();
    } catch (error) {
      handleApiError(error, `Ошибка при удалении расписания ${scheduleId}.`);
    }
  };

  // Обработка редактирования расписания
  const handleEditSchedule = (schedule) => {
    setIsEditingSchedule(true);
    setCurrentSchedule(schedule);
    setEditedSchedule({ ...schedule });
    setScheduleFormOpen(true);
  };

  if (!job) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        scroll="paper"
        PaperProps={{
          style: {
            borderRadius: 0,
          },
        }}
      >
        {/* Заголовок и информация о задаче */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            position: "relative",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
            }}
          >
            {getStatusIndicator(job)}
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            {job.job_name}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              textTransform: "uppercase",
              textAlign: "center",
              color: "gray",
            }}
          >
            {job.job_type}
          </Typography>
          <Typography
            variant="caption"
            sx={{ textAlign: "center", color: "gray" }}
          >
            Создано: {formatDateTime(job.created_at)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: statusColors[job.build_status] || "black",
              textAlign: "center",
              mt: 1,
            }}
          >
            Статус сборки: {job.build_status}
          </Typography>

          {/* Кнопки управления */}
          <Box sx={{ mt: 2 }}>
            <TasksActions
              job={job}
              onStopClick={(job) => handleStopClick(job)}
              onStartClick={(job) => handleStartClick(job)}
              displayMode="buttons"
            />
          </Box>
        </Box>

        {/* Вкладки */}
        <Tabs
          value={activeTab}
          onChange={(e, value) => setActiveTab(value)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ backgroundColor: "#fafafa" }}
        >
          <Tab label="Выполнения" value="executions" />
          <Tab label="Расписание" value="schedule" />
          <Tab label="Конфиг" value="config" />
          <Tab label="События" value="events" />
        </Tabs>

        <Divider />

        {/* Содержимое */}
        <DialogContent dividers>
          {activeTab === "executions" && (
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
              ) : executionsError ? (
                <Typography color="error">{executionsError}</Typography>
              ) : executions.length > 0 ? (
                <Grid container spacing={2}>
                  {executions.map((execution) => (
                    <Grid item xs={12} key={execution.job_execution_id}>
                      <Paper variant="outlined" sx={{ p: 2, pt:1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", display:'flex', alignItems:'center', justifyContent:'space-between' }}
                        >
                          <Box>
                            ID:{" "}
                            {formatJobExecutionId(execution.job_execution_id)}
                          </Box>
                          {/* Кнопки действий */}
                          <Box sx={{ mt: 1 }}>
                            <TasksActions
                              job={job}
                              onLogsClick={() => handleLogsClick(execution)}
                              onDownloadArtifacts={() =>
                                handleDownloadArtifacts(job, execution)
                              }
                              onStopClick={() =>
                                handleStopClick(execution.job_execution_id)
                              }
                              showStartButton={false}
                            />
                          </Box>
                        </Typography>
                        <Typography variant="body2">
                          <strong>Статус:</strong> {execution.status}
                        </Typography>
                        <Typography variant="body2">
                        <strong>Создано:</strong> {formatDateTime(execution.created_at)}
                        </Typography>
                        <Typography variant="body2">
                        <strong>Начало:</strong> {formatDateTime(execution.start_time)}
                        </Typography>
                        <Typography variant="body2">
                        <strong>Конец:</strong> {formatDateTime(execution.end_time)}
                        </Typography>
                        <Typography variant="body2">
                        <strong>GPU:</strong> {execution.gpu_info?.type || "N/A"}
                        </Typography>
                        {job.job_type !== "run" && (
                          <Typography variant="body2">
                            <strong>Health:</strong> {execution.health_status || "N/A"}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography>Нет выполнений для этой задачи.</Typography>
              )}
            </Box>
          )}

          {activeTab === "schedule" && (
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
              ) : schedulesError ? (
                <Typography color="error">{schedulesError}</Typography>
              ) : (
                <>
                  {schedules.length > 0 ? (
                    <List>
                      {schedules.map((schedule) => (
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, mb: 2 }}
                          key={schedule.schedule_id}
                        >
                          {renderScheduleDetails(schedule)}
                          {/* Кнопки действий */}
                          <Box sx={{ mt: 1, display: "flex" }}>
                            <Tooltip title="Редактировать расписание">
                              <IconButton
                                onClick={() => handleEditSchedule(schedule)}
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
                          </Box>
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Typography>Нет расписаний для этой задачи.</Typography>
                  )}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleAddSchedule}
                    sx={{ mt: 2 }}
                  >
                    Добавить расписание
                  </Button>
                </>
              )}
            </Box>
          )}

          {activeTab === "config" && (
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
                <SyntaxHighlighter
                  language="yaml"
                  style={coy}
                  showLineNumbers
                  customStyle={{
                    borderRadius: "10px",
                    maxHeight: "400px",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  {config}
                </SyntaxHighlighter>
              )}
            </Box>
          )}

          {activeTab === "events" && (
            <Box sx={{ mt: 2 }}>
              {eventsLoading ? (
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
              ) : eventsError ? (
                <Typography color="error">{eventsError}</Typography>
              ) : (
                <>
                  {Object.keys(events).length > 0 ? (
                    <List>
                      {Object.entries(events).map(([dateTime, log], index) => (
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, mb: 2 }}
                          key={index}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {formatDateTime(dateTime)}
                          </Typography>
                          <Typography variant="body2">{log}</Typography>
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Typography>Событий нет.</Typography>
                  )}
                </>
              )}
            </Box>
          )}
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
          {/* Здесь размещается форма для добавления или редактирования расписания */}
          {/* Форма аналогична той, что в десктопной версии, но адаптирована для мобильного интерфейса */}
          {/* Добавьте здесь компоненты формы для ввода расписания */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleFormClose}>Отмена</Button>
          <Button onClick={handleScheduleFormSubmit}>
            {isEditingSchedule ? "Сохранить" : "Добавить"}
          </Button>
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

      {/* Оповещения */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={10000}
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

export default JobDetailsDialogMobile;
