import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axiosInstance from "../../../api";
import { ru } from "date-fns/locale";
import yaml from "js-yaml";
import { format, parseISO } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  AlertSeverity,
  AnySchedule,
  ApiErrorDetail,
  ApiErrorResponse,
  Execution,
  Job,
  Schedule,
} from "../../../types";
import axios, { AxiosError, isAxiosError } from "axios";

interface useJobDetailsDialogMobileProps {
  open: boolean;
  job: Job;
}

export const useJobDetailsDialogMobile = ({
  open,
  job,
}: useJobDetailsDialogMobileProps) => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [executionsLoading, setExecutionsLoading] = useState<boolean>(true);
  const [executionsError, setExecutionsError] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<AnySchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState<boolean>(true);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);

  const [config, setConfig] = useState("");
  const [configLoading, setConfigLoading] = useState<boolean>(true);

  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [logsModalOpen, setLogsModalOpen] = useState<boolean>(false);
  const [currentLogs, setCurrentLogs] = useState<string>("");
  const [currentJobName, setCurrentJobName] = useState<string>("");

  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>("success");
  const [alertMessage, setAlertMessage] = useState<string>("");

  const initialExecutionsLoadRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Добавляем состояние для событий
  const [events, setEvents] = useState({});
  const [eventsLoading, setEventsLoading] = useState<boolean>(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Состояния для формы расписания
  const [scheduleFormOpen, setScheduleFormOpen] = useState<boolean>(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState<boolean>(false);
  const [currentSchedule, setCurrentSchedule] = useState<AnySchedule | null>(
    null
  );
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    workdays: [],
    weekends: [],
    specific_days: [],
  });
  const [editedSchedule, setEditedSchedule] = useState<AnySchedule | null>(
    null
  );

  const formatJobExecutionId = useCallback((id: string) => {
    if (!id) return "N/A";
    return id.length > 12 ? `${id.slice(0, 3)}**${id.slice(-3)}` : id;
  }, []);

  const showAlert = (message: string, severity: AlertSeverity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // Функции-обработчики
  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      showAlert("Скопировано в буфер обмена.");
    },
    [showAlert]
  );

  const formatDateTime = useCallback((dateTimeString: string) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = parseISO(dateTimeString);
      return format(date, "dd.MM.yyyy HH:mm:ss", { locale: ru });
    } catch (error) {
      console.error("Ошибка при форматировании даты:", error);
      return dateTimeString;
    }
  }, []);

  const handleLogsClick = useCallback(
    (execution: Execution | null = null) => {
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
            error.response?.data?.detail ||
            "Ошибка при получении логов задачи.";
          setCurrentLogs(errorMessage);
        })
        .finally(() => {
          setLogsLoading(false);
        });
    },
    [job]
  );

  const handleDownloadArtifacts = useCallback(
    (job: Job, execution: Execution | null = null) => {
      showAlert("Скачивание артефактов началось...", "info");

      if (job.job_type !== "run") {
        alert("Артефакты доступны только для задач типа 'run'.");
        return;
      }

      const params: Record<string, string> = {};

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
          link.parentNode?.removeChild(link);
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
    },
    []
  );

  const fetchExecutions = useCallback(async () => {
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
  }, [job.job_id]);

  const fetchSchedules = useCallback(async () => {
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
  }, [job.job_id]);

  const fetchConfig = useCallback(async () => {
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
  }, [job.job_id]);

  // Заглушка для получения событий. Пока просто устанавливаем пустой объект.
  const fetchEvents = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (job && open) {
      initialExecutionsLoadRef.current = true;
      fetchExecutions();
      fetchSchedules();
      fetchConfig();
      fetchEvents();

      if (intervalRef.current) {
        intervalRef.current = setInterval(() => {
          fetchExecutions();
        }, 5000);
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [job, open]);

  const handleStartClick = useCallback(() => {
    alert("запуск");
  }, []);
  const handleStopClick = useCallback(() => {
    alert("stop");
  }, []);

  // Функция для отображения деталей расписания
  const renderScheduleDetails = useCallback((schedule: AnySchedule) => {
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
  }, []);

  // Функция для добавления расписания
  const handleAddSchedule = useCallback(() => {
    setIsEditingSchedule(false);
    setEditedSchedule(null);
    setNewSchedule({
      workdays: [],
      weekends: [],
      specific_days: [],
    });
    setScheduleFormOpen(true);
  }, []);

  // Функция для закрытия формы расписания
  const handleScheduleFormClose = useCallback(() => {
    setScheduleFormOpen(false);
    setIsEditingSchedule(false);
    setCurrentSchedule(null);
    setEditedSchedule(null);
  }, []);

  // Валидация расписания перед отправкой
  const validateSchedule = useCallback(() => {
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
  }, [newSchedule, showAlert]);

  // Обработка ошибок API
  const handleApiError = useCallback(
    (error: AxiosError<ApiErrorResponse>, defaultMessage: string) => {
      console.error(defaultMessage, error);
      const errorDetail = error.response?.data;
      console.log("Детали ошибки:", errorDetail);

      let errorMessage = defaultMessage;

      if (!errorDetail) return;

      if (Array.isArray(errorDetail?.detail)) {
        errorMessage = errorDetail.detail.map((err) => err.msg).join(", ");
      } else if (typeof errorDetail?.detail === "string") {
        errorMessage = errorDetail.detail;
      } else if (
        typeof errorDetail?.detail === "object" &&
        errorDetail.detail !== null &&
        "msg" in errorDetail.detail
      ) {
        errorMessage = errorDetail.detail.msg!;
      } else if (typeof errorDetail === "object" && errorDetail !== null) {
        errorMessage = JSON.stringify(errorDetail);
      }

      showAlert(errorMessage, "error");
    },
    [showAlert]
  );

  // Отправка формы расписания на сервер
  const handleScheduleFormSubmit = useCallback(() => {
    if (isEditingSchedule) {
      // Обработка редактирования расписания
      // ...
    } else {
      // Добавление нового расписания
      if (!validateSchedule()) {
        return;
      }

      const scheduleData: Partial<Schedule> = {};

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
          date: day.date,
          time_windows: day.time_windows.map((window) => ({
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
  }, [
    isEditingSchedule,
    newSchedule,
    currentSchedule,
    editedSchedule,
    job.job_id,
    fetchSchedules,
    showAlert,
    handleApiError,
    validateSchedule,
  ]);

  // Обработка удаления расписания
  const handleDeleteSchedule = useCallback(
    async (scheduleId: string) => {
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
        if (isAxiosError(error) && error.response) {
          handleApiError(
            error,
            `Ошибка при удалении расписания ${scheduleId}.`
          );
        }
      }
    },
    [showAlert, fetchSchedules, handleApiError]
  );

  // Обработка редактирования расписания
  const handleEditSchedule = useCallback((schedule: AnySchedule) => {
    setIsEditingSchedule(true);
    setCurrentSchedule(schedule);
    setEditedSchedule({ ...schedule });
    setScheduleFormOpen(true);
  }, []);
  return {
    formatDateTime,
    handleStopClick,
    handleStartClick,
    executionsLoading,
    executionsError,
    executions,
    formatJobExecutionId,
    handleLogsClick,
    handleDownloadArtifacts,
    schedulesLoading,
    schedulesError,
    schedules,
    renderScheduleDetails,
    handleEditSchedule,
    handleDeleteSchedule,
    handleAddSchedule,
    configLoading,
    config,
    eventsLoading,
    eventsError,
    events,
    scheduleFormOpen,
    handleScheduleFormClose,
    isEditingSchedule,
    handleScheduleFormSubmit,
    logsModalOpen,
    setLogsModalOpen,
    currentJobName,
    logsLoading,
    currentLogs,
    alertOpen,
    setAlertOpen,
    alertSeverity,
    alertMessage,
    handleCopy,
  };
};
