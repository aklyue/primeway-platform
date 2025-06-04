import axiosInstance from "../../../api";
import { ru } from "date-fns/locale";
import yaml from "js-yaml";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { format, parseISO } from "date-fns";

export const useTasksDetailsDialog = ({
  open,
  onClose,
  job,
  getStatusIndicator,
  useMockData,
}) => {
  const statusColors = {
    success: "#28a745", // зеленый
    failed: "#dc3545", // красный
    building: "#007bff", // синий
  };

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
  return {
    isMobile,
    isTablet,
    jobWithConfig,
    formatDateTime,
    handleBuildLogsClick,
    handleCopy,
    handleCardStopClick,
    executionsLoading,
    executionsError,
    executions,
    formatJobExecutionId,
    handleLogsClick,
    handleDownloadArtifacts,
    handleStopClick,
    setActiveTab,
    activeTab,
    schedulesLoading,
    schedulesError,
    schedules,
    renderScheduleDetails,
    handleEditSchedule,
    handleDeleteSchedule,
    handleAddSchedule,
    configLoading,
    config,
    scheduleFormOpen,
    handleScheduleFormClose,
    isEditingSchedule,
    handleScheduleFormSubmit,
    editedSchedule,
    setEditedSchedule,
    addWorkdayWindow,
    newSchedule,
    setNewSchedule,
    removeWorkdayWindow,
    addWeekendWindow,
    removeWeekendWindow,
    handleAddSpecificDay,
    handleSpecificDayChange,
    handleRemoveSpecificDay,
    handleSpecificDayWindowsChange,
    logsModalOpen,
    setLogsModalOpen,
    currentJobName,
    logsLoading,
    currentLogs,
    buildLogsModalOpen,
    setBuildLogsModalOpen,
    buildLogsLoading,
    alertOpen,
    setAlertOpen,
    alertSeverity,
    alertMessage,
  };
};
