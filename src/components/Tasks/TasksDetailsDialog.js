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
  TextField,
  Divider,
  Stack,
  DialogTitle,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
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
import yaml from "js-yaml";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import JobDetailsDialogMobile from "./JobDetailsDialogMobile";
import { useTheme } from "@mui/material/styles";
import JobEvents from "./JobEvents";

const statusColors = {
  success: "#28a745", // зеленый
  failed: "#dc3545", // красный
  building: "#007bff", // синий
};

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

  const [activeTab, setActiveTab] = useState("schedule");

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

  const [jobWithConfig, setJobWithConfig] = useState({ ...job });

  // Состояния для расписания
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    workdays: [],
    weekends: [],
    specific_days: [],
  });
  const [editedSchedule, setEditedSchedule] = useState(null); // Новое состояние для редактирования

  // Состояния для оповещений
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const initialExecutionsLoadRef = useRef(true);
  const initialSchedulesLoadRef = useRef(true);
  const initialConfigLoadRef = useRef(true);
  const intervalRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:750px)");

  // Планшеты: от 600px до 960px
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  // Ноутбуки/Компьютеры: от 960px и выше
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const formatJobExecutionId = (id) => {
    if (!id) return "N/A";
    return id.length > 12 ? `${id.slice(0, 3)}**${id.slice(-3)}` : id;
  };

  useEffect(() => {
    setJobWithConfig({ ...job });
  }, [job]);

  // Функции-обработчики
  const handleLogsClick = (execution = null) => {
    setLogsModalOpen(true); // Открываем диалог сразу
    setLogsLoading(true);
    setCurrentLogs(""); // Сбрасываем предыдущие логи
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
      });
  };

  const handleBuildLogsClick = () => {
    setBuildLogsModalOpen(true); // Открываем диалог сразу
    setBuildLogsLoading(true);
    setCurrentLogs(""); // Сбрасываем предыдущие логи
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
      });
  };

  const handleDownloadArtifacts = (job, execution = null) => {
    // Показываем Snackbar
    showAlert("Скачивание артефактов началось...", "info");

    // Проверяем, что задача имеет тип "run"
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

  const handleCardStopClick = (job) => {
    let executionId = job.job_execution_id || job.last_execution_id;

    if (!executionId && !job.job_id) {
      showAlert("Нет выполнения для остановки.", "error");
      return;
    }

    const params = {};
    if (executionId) {
      params.job_execution_id = executionId;
    } else {
      params.job_id = job.job_id;
    }

    console.log("Параметры запроса для остановки задачи:", params);

    axiosInstance
      .post("/jobs/job-stop", null, { params })
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

  const handleStopClick = (job) => {
    let executionId = job.job_execution_id || job.last_execution_id;
  
    if (!executionId && !job.job_id) {
      showAlert("Нет выполнения для остановки.", "error");
      return;
    }
  
    const params = {};
    if (executionId) {
      params.job_execution_id = executionId;
    } else {
      params.job_id = job.job_id;
    }
  
    console.log("Параметры запроса для остановки задачи:", params);
  
    axiosInstance
      .post("/jobs/job-stop", null, { params })
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
    if (initialExecutionsLoadRef.current) {
      setExecutionsLoading(true);
    }
    setExecutionsError(null);
    try {
      const response = await axiosInstance.get("/jobs/executions", {
        params: { job_id: job.job_id },
      });
      const data = response.data || [];

      // Сортируем данные по дате создания в порядке убывания
      const sortedData = data
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setExecutions(sortedData);
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

  // Функция для получения расписаний задачи
  const fetchSchedules = async () => {
    if (initialSchedulesLoadRef.current) {
      setSchedulesLoading(true);
    }
    setSchedulesError(null);
    try {
      const response = await axiosInstance.get("/jobs/get-schedules", {
        params: { job_id: job.job_id },
      });
      console.log("Fetched schedules:", response.data);
      const data = response.data || [];
      setSchedules(data);

      // Устанавливаем activeTab в зависимости от наличия расписаний
      if (data.length > 0) {
        setActiveTab("schedule");
      } else {
        setActiveTab("config");
      }
    } catch (error) {
      console.error("Ошибка при получении расписаний:", error);
      setSchedulesError("Ошибка при загрузке расписаний");
      // Если произошла ошибка, по умолчанию показываем конфигурацию
      setActiveTab("config");
    } finally {
      if (initialSchedulesLoadRef.current) {
        setSchedulesLoading(false);
        initialSchedulesLoadRef.current = false;
      }
    }
  };

  // Функция для получения конфигурации задачи
  const fetchConfig = async () => {
    if (initialConfigLoadRef.current) {
      setConfigLoading(true);
    }
    try {
      const response = await axiosInstance.get("/jobs/get-config", {
        params: { job_id: job.job_id },
      });
      // Конвертируем конфигурацию в YAML
      const yamlConfig = yaml.dump(response.data || {});
      setConfig(yamlConfig);
  
      // Обновляем jobWithConfig, добавляя config
      setJobWithConfig((prevJob) => ({ ...prevJob, config: response.data }));
    } catch (error) {
      console.error("Ошибка при получении конфигурации:", error);
      showAlert("Ошибка при получении конфигурации задания.", "error");
      setConfig("");
    } finally {
      if (initialConfigLoadRef.current) {
        setConfigLoading(false);
        initialConfigLoadRef.current = false;
      }
    }
  };

  useEffect(() => {
    if (job && open) {
      // Сбрасываем флаги первого рендера
      initialExecutionsLoadRef.current = true;
      initialSchedulesLoadRef.current = true;
      initialConfigLoadRef.current = true;

      // Фетчим данные сразу при открытии диалога
      fetchExecutions();
      fetchSchedules();
      fetchConfig();

      // Устанавливаем интервал для периодического фетчинга
      intervalRef.current = setInterval(() => {
        fetchExecutions();
      }, 5000); // Интервал в 5 секунд

      // Очищаем интервал при размонтировании компонента или закрытии диалога
      return () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      };
    } else {
      // Очищаем интервал, если диалог закрыт
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
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
  useEffect(() => {
    if (executions.length > 0) {
      const latestExecution = executions[0]; // Предполагается, что список отсортирован
      setJobWithConfig((prevJob) => ({
        ...prevJob,
        last_execution_status: latestExecution.status,
        last_execution_id: latestExecution.job_execution_id,
      }));
    } else {
      // Если выполнений нет
      setJobWithConfig((prevJob) => ({
        ...prevJob,
        last_execution_status: undefined,
        last_execution_id: undefined,
      }));
    }
  }, [executions]);

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
    if (isEditingSchedule) {
      // Обновление расписания
      const updateData = {
        schedule_type: editedSchedule.schedule_type,
        start_time: editedSchedule.start_time,
        end_time: editedSchedule.end_time,
        day_of_week: editedSchedule.day_of_week,
      };
      console.log(
        "Данные, отправляемые на сервер для обновления расписания:",
        updateData
      );
      const requestConfig = {
        params: {
          job_id: job.job_id,
          schedule_id: currentSchedule.schedule_id,
        },
        headers: { "Content-Type": "application/json" },
      };

      axiosInstance
        .put("/jobs/update-schedules", updateData, requestConfig)
        .then(() => {
          showAlert("Расписание успешно обновлено.");
          fetchSchedules();
          setScheduleFormOpen(false);
          setIsEditingSchedule(false);
          setCurrentSchedule(null);
          setEditedSchedule(null);
        })
        .catch((error) => {
          handleApiError(error, "Ошибка при обновлении расписания.");
        });
    } else {
      // Добавление нового расписания
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
    }
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

  // Обработка редактирования расписания
  const handleEditSchedule = (schedule) => {
    setIsEditingSchedule(true);
    setCurrentSchedule(schedule);
    setEditedSchedule({ ...schedule });
    setScheduleFormOpen(true);
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

  if (isMobile) {
    // Если устройство мобильное, отображаем JobDetailsDialogMobile
    return (
      <JobDetailsDialogMobile
        open={open}
        onClose={onClose}
        job={job}
        getStatusIndicator={getStatusIndicator}
        useMockData={useMockData}
      />
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
            height: "90vh",
            borderRadius: "15px",
          },
        }}
        BackdropProps={{
          sx: {
            zIndex: 0,
            cursor: "pointer",
            "&:hover": {
              background: "rgba(0, 0, 0, 0.48)", // Сделать фон светлее при наведении
            },
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
            flexWrap: isTablet ? "wrap" : "nowrap",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 7,
              left: 8,
            }}
          >
            {getStatusIndicator(jobWithConfig)}
          </Box>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ width: "100%" }}
          >
            {/* Название задачи */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                {job.job_name}
              </Typography>
            </Box>
            <Box
              sx={{
                height: "2px",
                flexGrow: 1,
                minWidth: "3px", // Минимальная ширина, чтобы полоска не исчезала на маленьких экранах
                borderRadius: "5px",
                bgcolor: "black",
              }}
            />
            {/* Тип задачи */}
            <Box>
              <Typography
                variant="body1"
                sx={{
                  textTransform: "uppercase",
                  color: job.job_type === "run" ? "#10a37f" : "secondary.main",
                }}
              >
                <strong>{job.job_type}</strong>
              </Typography>
            </Box>
            <Box
              sx={{
                height: "2px",
                flexGrow: 1,
                minWidth: "3px", // Минимальная ширина, чтобы полоска не исчезала на маленьких экранах
                borderRadius: "5px",
                bgcolor: "black",
              }}
            />
            {/* Дата создания */}
            <Box>
              <Typography variant="body1">
                <strong>{formatDateTime(job.created_at)}</strong>
              </Typography>
            </Box>
            <Box
              sx={{
                height: "2px",
                flexGrow: 1,
                minWidth: "3px", // Минимальная ширина, чтобы полоска не исчезала на маленьких экранах
                borderRadius: "5px",
                bgcolor: "black",
              }}
            />
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color: statusColors[job.build_status] || "black",
                }}
              >
                <strong>{job.build_status}</strong>
              </Typography>
            </Box>
            <Box
              sx={{
                height: "2px",
                flexGrow: 1,
                minWidth: "3px", // Минимальная ширина, чтобы полоска не исчезала на маленьких экранах
                borderRadius: "5px",
                bgcolor: "black",
              }}
            />
            <Button
              sx={{
                border: "1px solid rgba(0,0,0,0.3)",
                borderRadius: "12px",
                padding: "4px 7px",
              }}
              startIcon={isTablet ? "" : <BugReportIcon />}
              onClick={handleBuildLogsClick}
            >
              {isTablet ? <BugReportIcon /> : "Build Логи"}
            </Button>
            {job.job_type === "deploy" && job.job_url && (
              <>
                <Box
                  sx={{
                    height: "2px",
                    flexGrow: 1,
                    minWidth: "3px", // Минимальная ширина, чтобы полоска не исчезала на маленьких экранах
                    borderRadius: "5px",
                    bgcolor: "black",
                  }}
                />
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
                      handleCopy(job.job_url);
                    }}
                  >
                    {isTablet ? "URL" : job.job_url}
                  </Typography>
                </Tooltip>
              </>
            )}
          </Stack>

          {/* Кнопки */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TasksActions
                job={jobWithConfig}
                onStopClick={handleCardStopClick}
                displayMode="buttons" // Указываем режим "buttons"
              />
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Содержимое */}
        <DialogContent dividers>
          <Box sx={{ display: "flex", height: "100%", mt: 1 }}>
            {/* Левая часть - Выполнения */}
            <Box sx={{ flex: 1.4, mr: 2, overflow: "auto" }}>
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
                isTablet ? (
                  // Рендеринг карточек для планшетов
                  <Grid container spacing={2}>
                    {executions.map((execution) => (
                      <Grid
                        item
                        xs={12}
                        key={execution.job_execution_id}
                        style={{ paddingTop: "8px" }}
                      >
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="subtitle1">
                              Job Exec ID:{" "}
                              {formatJobExecutionId(execution.job_execution_id)}
                            </Typography>
                            <Tooltip title="Скопировать ID выполнения">
                              <IconButton
                                onClick={() =>
                                  handleCopy(execution.job_execution_id)
                                }
                                size="small"
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Typography variant="body2">
                            <strong>Создано:</strong>{" "}
                            {formatDateTime(execution.created_at)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Статус:</strong> {execution.status}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Начало:</strong>{" "}
                            {formatDateTime(execution.start_time)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Конец:</strong>{" "}
                            {formatDateTime(execution.end_time)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>GPU:</strong>{" "}
                            {execution.gpu_info?.type || "N/A"}
                          </Typography>
                          {job.job_type !== "run" && (
                            <Typography variant="body2">
                              <strong>Health:</strong>{" "}
                              {execution.health_status || "N/A"}
                            </Typography>
                          )}
                          {/* Кнопки действий */}
                          <Box sx={{ mt: 2 }}>
                            <TasksActions
                              job={execution}
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
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  // Рендеринг таблицы для десктопа
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      {/* Заголовки столбцов */}
                      <Grid
                        container
                        spacing={1}
                        sx={{
                          p: 1,
                          borderBottom: "1px solid #ccc",
                          textAlign: "center",
                        }}
                      >
                        <Grid item xs>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Job Exec ID
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
                        {job.job_type !== "run" && (
                          <Grid item xs>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Health
                            </Typography>
                          </Grid>
                        )}
                        <Grid item xs>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Действия
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    {executions.map((execution) => (
                      <Grid
                        item
                        xs={12}
                        key={execution.job_execution_id}
                        style={{ paddingTop: "8px" }}
                      >
                        <Paper variant="outlined" sx={{ border: "none" }}>
                          <Grid
                            container
                            spacing={1}
                            alignItems="center"
                            sx={{
                              p: 0.5,
                              textAlign: "center",
                              borderBottom: "1px solid #ccc",
                              "& > .MuiGrid-item": {
                                paddingTop: 0,
                              },
                            }}
                          >
                            <Grid item xs>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
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
                            {job.job_type !== "run" && (
                              <Grid item xs>
                                <Typography variant="body2">
                                  {execution.health_status || "N/A"}
                                </Typography>
                              </Grid>
                            )}
                            <Grid item xs>
                              {/* Кнопки действий */}
                              <TasksActions
                                job={execution}
                                onLogsClick={() => handleLogsClick(execution)}
                                onDownloadArtifacts={() =>
                                  handleDownloadArtifacts(job, execution)
                                }
                                onStopClick={() =>
                                  handleStopClick(execution)
                                }
                                showStartButton={false}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )
              ) : (
                <Typography align="center" sx={{ mt: 2 }}>
                  Нет выполнений для этой задачи.
                </Typography>
              )}
            </Box>

            {/* Разделитель */}
            <Divider orientation="vertical" flexItem />

            {/* Правая часть - Переключение между расписанием и конфигурацией */}
            <Box sx={{ flex: isTablet ? 0.4 : 0.7, ml: 2 }}>
              {/* Переключатель вкладок */}
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

              {/* Отображаем расписание или конфигурацию */}
              {activeTab === "schedule" && (
                <Box sx={{ height: "100%", overflow: "auto" }}>
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
                            secondary={renderScheduleDetails(schedule)}
                            secondaryTypographyProps={{ component: "div" }}
                          />
                          {/* Кнопки действий */}
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
              )}

              {activeTab === "config" && (
                <Box
                  sx={{
                    maxWidth: "500px",
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
              {activeTab === "events" && <JobEvents jobId={job.job_id} />}
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
          {isEditingSchedule ? (
            // Форма редактирования расписания
            <>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="schedule-type-label">Тип расписания</InputLabel>
                <Select
                  labelId="schedule-type-label"
                  label="Тип расписания"
                  value={editedSchedule.schedule_type || ""}
                  onChange={(e) =>
                    setEditedSchedule((prev) => ({
                      ...prev,
                      schedule_type: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="DAILY">Ежедневно</MenuItem>
                  <MenuItem value="WEEKLY">Еженедельно</MenuItem>
                  <MenuItem value="ONCE">Однократно</MenuItem>
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns} locale={ru}>
                <TimePicker
                  label="Время начала"
                  value={
                    editedSchedule.start_time
                      ? new Date(`1970-01-01T${editedSchedule.start_time}`)
                      : null
                  }
                  onChange={(time) => {
                    if (time && isValid(time)) {
                      const hours = time.getHours().toString().padStart(2, "0");
                      const minutes = time
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                      const formattedTime = `${hours}:${minutes}:00`;
                      setEditedSchedule((prev) => ({
                        ...prev,
                        start_time: formattedTime,
                      }));
                    } else {
                      setEditedSchedule((prev) => ({
                        ...prev,
                        start_time: "",
                      }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth sx={{ mt: 2 }} />
                  )}
                />
                <TimePicker
                  label="Время окончания"
                  value={
                    editedSchedule.end_time
                      ? new Date(`1970-01-01T${editedSchedule.end_time}`)
                      : null
                  }
                  onChange={(time) => {
                    if (time && isValid(time)) {
                      const hours = time.getHours().toString().padStart(2, "0");
                      const minutes = time
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                      const formattedTime = `${hours}:${minutes}:00`;
                      setEditedSchedule((prev) => ({
                        ...prev,
                        end_time: formattedTime,
                      }));
                    } else {
                      setEditedSchedule((prev) => ({
                        ...prev,
                        end_time: "",
                      }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth sx={{ mt: 2 }} />
                  )}
                />
              </LocalizationProvider>

              {editedSchedule.schedule_type === "WEEKLY" && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="day-of-week-label">День недели</InputLabel>
                  <Select
                    labelId="day-of-week-label"
                    label="День недели"
                    value={editedSchedule.day_of_week || ""}
                    onChange={(e) =>
                      setEditedSchedule((prev) => ({
                        ...prev,
                        day_of_week: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="MONDAY">Понедельник</MenuItem>
                    <MenuItem value="TUESDAY">Вторник</MenuItem>
                    <MenuItem value="WEDNESDAY">Среда</MenuItem>
                    <MenuItem value="THURSDAY">Четверг</MenuItem>
                    <MenuItem value="FRIDAY">Пятница</MenuItem>
                    <MenuItem value="SATURDAY">Суббота</MenuItem>
                    <MenuItem value="SUNDAY">Воскресенье</MenuItem>
                  </Select>
                </FormControl>
              )}
            </>
          ) : (
            // Форма добавления нового расписания
            <>
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
                          const hours = time
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          const formattedTime = `${hours}:${minutes}:00`;
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
                          const hours = time
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          const formattedTime = `${hours}:${minutes}:00`;
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
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
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
                          const hours = time
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          const formattedTime = `${hours}:${minutes}:00`;
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
                          const hours = time
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          const formattedTime = `${hours}:${minutes}:00`;
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
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
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
                              const hours = time
                                .getHours()
                                .toString()
                                .padStart(2, "0");
                              const minutes = time
                                .getMinutes()
                                .toString()
                                .padStart(2, "0");
                              const formattedTime = `${hours}:${minutes}:00`;
                              const updatedWindows = [...day.windows];
                              updatedWindows[wIndex].start = formattedTime;
                              handleSpecificDayWindowsChange(
                                index,
                                updatedWindows
                              );
                            } else {
                              const updatedWindows = [...day.windows];
                              updatedWindows[wIndex].start = "";
                              handleSpecificDayWindowsChange(
                                index,
                                updatedWindows
                              );
                            }
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
                            if (time && isValid(time)) {
                              const hours = time
                                .getHours()
                                .toString()
                                .padStart(2, "0");
                              const minutes = time
                                .getMinutes()
                                .toString()
                                .padStart(2, "0");
                              const formattedTime = `${hours}:${minutes}:00`;
                              const updatedWindows = [...day.windows];
                              updatedWindows[wIndex].end = formattedTime;
                              handleSpecificDayWindowsChange(
                                index,
                                updatedWindows
                              );
                            } else {
                              const updatedWindows = [...day.windows];
                              updatedWindows[wIndex].end = "";
                              handleSpecificDayWindowsChange(
                                index,
                                updatedWindows
                              );
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
            </>
          )}
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

export default JobDetailsDialog;
