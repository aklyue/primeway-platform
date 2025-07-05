import axiosInstance from "../../../api";
import {
  ContentCopy as ContentCopyIcon,
  FiberManualRecord as FiberManualRecordIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { useTheme } from "@mui/material/styles";
import { wrap } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { CircularProgress, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedStatus,
  setSelectedJobType,
  setIsScheduledFilter,
} from "../../../store/slices/tasksFilterSlice";
import {
  statusOptions,
  statusColors,
  buildStatusColors,
} from "../../../constants/statusProperties";

export const useTasks = ({ authToken, currentOrganization }) => {
  const [allJobs, setAllJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTypeLoading, setJobTypeLoading] = useState(false);
  const [error, setError] = useState(null);

  // Состояния фильтров
  const [triedSwitchJobType, setTriedSwitchJobType] = useState(false);

  // Состояния для модальных окон и текущей задачи
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);

  // Состояния для управления диалогами
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [currentJobName, setCurrentJobName] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [alertMessage, setAlertMessage] = useState("");

  const [executionsModalOpen, setExecutionsModalOpen] = useState(false);
  const [currentExecutions, setCurrentExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);

  const [logsByExecutionId, setLogsByExecutionId] = useState({});

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [currentScheduleData, setCurrentScheduleData] = useState(null);

  const [buildLogsModalOpen, setBuildLogsModalOpen] = useState(false);
  const [buildLogsLoading, setBuildLogsLoading] = useState(false);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [jobToStop, setJobToStop] = useState(null);

  const [loadingFinished, setLoadingFinished] = useState(false);

  const dispatch = useDispatch();

  const selectedStatus = useSelector(
    (state) => state.tasksFilters.selectedStatus
  );
  const selectedJobType = useSelector(
    (state) => state.tasksFilters.selectedJobType
  );
  const isScheduledFilter = useSelector(
    (state) => state.tasksFilters.isScheduledFilter
  );

  const intervalRef = useRef(null);
  const initialLoadRef = useRef(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMinDesktop = useMediaQuery(theme.breakpoints.down("lg"));

  const fetchJobs = useCallback(() => {
    if (initialLoadRef.current) {
      setLoading(true);
    }
    if (currentOrganization && authToken) {
      const endpoint = `/jobs/get-organization-jobs`;
      const params = {
        organization_id: currentOrganization.id,
        is_scheduled: isScheduledFilter || undefined,
        status: selectedStatus || undefined,
        job_type: selectedJobType || undefined,
      };

      axiosInstance
        .get(endpoint, { params })
        .then((response) => {
          const data = response.data || [];
          setAllJobs(data);

          if (
            initialLoadRef.current &&
            data.length === 0 &&
            selectedJobType === "deploy" &&
            !triedSwitchJobType
          ) {
            setTriedSwitchJobType(true);
            dispatch(setSelectedJobType("run"));
          } else {
            if (initialLoadRef.current) {
              setLoading(false);
              initialLoadRef.current = false;
            }
          }
        })
        .catch((error) => {
          console.error("Ошибка при получении списка задач:", error);
          const errorMessage =
            error.response?.data?.detail ||
            "Не удалось загрузить список задач.";
          setError(errorMessage);
          if (initialLoadRef.current) {
            setLoading(false);
            initialLoadRef.current = false;
          }
        })
        .finally(() => {
          setJobTypeLoading(false);
        });
    } else {
      if (initialLoadRef.current) {
        setLoading(false);
        initialLoadRef.current = false;
      }
      setJobTypeLoading(false);
    }
  }, [
    currentOrganization,
    authToken,
    isScheduledFilter,
    selectedStatus,
    selectedJobType,
    triedSwitchJobType,
    dispatch,
  ]);

  useEffect(() => {
    // Фетчим данные сразу при монтировании или изменении зависимостей
    fetchJobs();

    // Очищаем предыдущий интервал, если он существует
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Устанавливаем новый интервал для периодического фетчинга
    intervalRef.current = setInterval(() => {
      fetchJobs();
    }, 5000); // Интервал в 5 секунд

    // Чистим интервал при размонтировании компонента или изменении зависимостей
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [
    currentOrganization,
    isScheduledFilter,
    selectedStatus,
    selectedJobType,
    authToken,
  ]);

  useEffect(() => {
    applyFilters();
  }, [selectedStatus, selectedJobType, isScheduledFilter, allJobs]);

  const handleTaskClick = useCallback((job) => {
    setCurrentJob(job);
    setDetailsModalOpen(true);
  }, []);

  const applyFilters = useCallback(() => {
    let filteredJobs = [...allJobs];

    if (selectedJobType) {
      filteredJobs = filteredJobs.filter(
        (job) => job.job_type === selectedJobType
      );
    }

    if (selectedStatus) {
      filteredJobs = filteredJobs.filter(
        (job) => job.last_execution_status === selectedStatus
      );
    }

    if (isScheduledFilter) {
      filteredJobs = filteredJobs.filter((job) => job.is_scheduled);
    }

    // Добавляем сортировку по дате создания в порядке убывания
    filteredJobs.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    setJobs(filteredJobs);
  }, [allJobs, selectedJobType, selectedStatus, isScheduledFilter]);

  const formatJobId = (jobId) => {
    if (!jobId || typeof jobId !== "string") return "N/A";
    if (jobId.length <= 8) {
      return jobId;
    } else {
      const firstFour = jobId.substring(0, 4);
      const lastFour = jobId.substring(jobId.length - 4);
      return `${firstFour}**${lastFour}`;
    }
  };

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

  const handleCopy = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Скопировано:", text);
        })
        .catch((error) => {
          console.error("Ошибка при копировании:", error);
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        console.log("Скопировано:", text);
      } catch (err) {
        console.error("Ошибка при копировании:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Обновленная функция handleLogsClick
  const handleLogsClick = useCallback(
    (job, jobExecutionId = null) => {
      setLogsModalOpen(true); // Открываем диалог сразу
      setLogsLoading(true);
      setCurrentLogs(""); // Сброс предыдущих логов
      setCurrentJobName(job.job_name || "N/A");

      const params = {};
      if (jobExecutionId) {
        params.job_execution_id = jobExecutionId;
      } else {
        params.job_id = job.job_id;
      }
      console.log(params);
      axiosInstance
        .get("/jobs/job-logs", {
          params: params,
        })
        .then((response) => {
          const logs = response.data.logs || "Логи отсутствуют.";
          setCurrentLogs(logs);
        })
        .catch((error) => {
          console.error(
            `Ошибка при получении логов для задачи ${job.id}:`,
            error
          );
          const errorMessage =
            error.response?.data?.detail ||
            (error.response?.status === 404
              ? "Логи недоступны."
              : "Ошибка при получении логов.");
          setCurrentLogs(errorMessage);
        })
        .finally(() => {
          setLogsLoading(false);
        });
    },
    [axiosInstance]
  );

  // Обновленная функция handleBuildLogsClick
  const handleBuildLogsClick = useCallback(
    (job) => {
      setBuildLogsModalOpen(true); // Открываем диалог сразу
      setBuildLogsLoading(true);
      setCurrentLogs(""); // Сброс предыдущих логов
      setCurrentJobName(job.job_name || "N/A");

      axiosInstance
        .get("/jobs/build-logs", {
          params: { job_id: job.job_id },
        })
        .then((response) => {
          const logs = response.data.build_logs || "Логи сборки отсутствуют.";
          setCurrentLogs(logs);
        })
        .catch((error) => {
          console.error(
            `Ошибка при получении логов сборки для задачи ${job.id}:`,
            error
          );
          const errorMessage =
            error.response?.data?.detail ||
            (error.response?.status === 404
              ? "Логи сборки недоступны."
              : "Ошибка при получении логов сборки.");
          setCurrentLogs(errorMessage);
        })
        .finally(() => {
          setBuildLogsLoading(false);
        });
    },
    [axiosInstance]
  );

  // Обновленная функция handleExecutionsClick
  const handleExecutionsClick = useCallback(
    (job) => {
      setExecutionsModalOpen(true); // Открываем диалог сразу
      setExecutionsLoading(true);
      setCurrentJobName(job.job_name || "N/A");
      setLogsByExecutionId({}); // Сброс данных

      axiosInstance
        .get("/jobs/executions", {
          params: { job_id: job.job_id },
        })
        .then((response) => {
          const executions = response.data || [];
          setCurrentExecutions(executions);
        })
        .catch((error) => {
          console.error(
            `Ошибка при получении выполнений для задачи ${job.id}:`,
            error
          );
          setCurrentExecutions([]);
        })
        .finally(() => {
          setExecutionsLoading(false);
        });
    },
    [axiosInstance]
  );

  // Обновленная функция handleScheduleClick
  const handleScheduleClick = (job) => {
    setScheduleModalOpen(true); // Открываем диалог сразу
    setScheduleLoading(true);
    setCurrentJobName(job.job_name || "N/A");
    setCurrentScheduleData(null); // Сброс данных

    axiosInstance
      .get(`/jobs/${job.id}/schedule`)
      .then((response) => {
        const scheduleData = response.data || null;
        setCurrentScheduleData(scheduleData);
      })
      .catch((error) => {
        console.error(
          `Ошибка при получении расписания для задачи ${job.id}:`,
          error
        );
        const errorMessage =
          error.response?.data?.detail || "Информация о расписании недоступна.";
        setCurrentScheduleData(null);
      })
      .finally(() => {
        setScheduleLoading(false);
      });
  };

  const handleExecutionLogsToggle = useCallback(
    (execution) => {
      const executionId = execution.job_execution_id || execution.execution_id;

      if (logsByExecutionId[executionId]) {
        setLogsByExecutionId((prevLogs) => {
          const newLogs = { ...prevLogs };
          delete newLogs[executionId];
          return newLogs;
        });
      } else {
        const params = { job_execution_id: executionId };

        setLogsByExecutionId((prevLogs) => ({
          ...prevLogs,
          [executionId]: { logs: "", loading: true },
        }));

        axiosInstance
          .get("/jobs/job-logs", { params })
          .then((response) => {
            const logs = response.data.logs || "Логи отсутствуют.";
            setLogsByExecutionId((prevLogs) => ({
              ...prevLogs,
              [executionId]: { logs, loading: false },
            }));
          })
          .catch((error) => {
            console.error(
              `Ошибка при получении логов для выполнения ${executionId}:`,
              error
            );
            const errorMessage =
              error.response?.data?.detail ||
              (error.response?.status === 404
                ? "Логи недоступны."
                : "Ошибка при получении логов.");
            setLogsByExecutionId((prevLogs) => ({
              ...prevLogs,
              [executionId]: { logs: errorMessage, loading: false },
            }));
          });
      }
    },
    [logsByExecutionId, axiosInstance]
  );

  const handleStopClick = (job) => {
    setJobToStop(job);
    setConfirmDialogOpen(true);
  };

  const confirmStopJob = useCallback(() => {
    const params = {};

    if (jobToStop.job_execution_id) {
      params.job_execution_id = jobToStop.job_execution_id;
    } else if (jobToStop.job_id) {
      params.job_id = jobToStop.job_id;
    } else if (jobToStop.id) {
      params.job_id = jobToStop.id;
    }

    if (!params.job_id && !params.job_execution_id) {
      console.log("Не указан идентификатор задачи или выполнения.");
      setConfirmDialogOpen(false);
      return;
    }

    axiosInstance
      .post("/jobs/job-stop", null, { params })
      .then((response) => {
        const message = response.data.message || "Задача успешно остановлена.";
        console.log(message);
        fetchJobs();
      })
      .catch((error) => {
        console.error(`Ошибка при остановке задачи:`, error);
        const errorMessage =
          error.response?.data?.detail || "Ошибка при остановке задачи.";
        console.log(errorMessage);
      })
      .finally(() => {
        setConfirmDialogOpen(false);
        setJobToStop(null);
      });
  }, [jobToStop, fetchJobs]);

  const handleDownloadArtifacts = useCallback(
    (job) => {
      // Показываем Snackbar
      setAlertMessage("Скачивание артефактов началось...");
      setAlertSeverity("info");
      setAlertOpen(true);

      // Проверяем, что задача имеет тип "run"
      if (job.job_type !== "run") {
        alert("Артефакты доступны только для задач типа 'run'.");
        return;
      }

      const params = {};
      if (job.last_execution_id) {
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
          alert(errorMessage);
        });
    },
    [axiosInstance]
  );

  const getStatusIndicator = (job) => {
    const status = job.last_execution_status;
    const buildStatus = job.build_status;

    if (buildStatus === "building") {
      const color = buildStatusColors[buildStatus] || "grey";
      return <CircularProgress size={15} thickness={5} sx={{ color: color }} />;
    }

    const color = statusColors[status] || "grey";

    if (["creating", "pending", "provisioning"].includes(status)) {
      return <CircularProgress size={15} thickness={5} sx={{ color: color }} />;
    } else if (status) {
      return <FiberManualRecordIcon sx={{ color: color, fontSize: 15 }} />;
    } else {
      return null;
    }
  };

  // if (error) {
  //   return <Typography color="error">{error}</Typography>;
  // }

  // Обработчик переключения типа задач
  const handleJobTypeChange = (jobType) => {
    if (jobType !== selectedJobType) {
      setJobTypeLoading(true);
      dispatch(setSelectedJobType(jobType));
    }
  };
  return {
    // Селекторы, значения
    selectedJobType,
    selectedStatus,
    statusOptions,
    statusColors,
    isMobile,
    isTablet,
    isMinDesktop,
    jobTypeLoading,
    loading,
    jobs,
    detailsModalOpen,
    logsModalOpen,
    buildLogsModalOpen,
    executionsModalOpen,
    confirmDialogOpen,
    scheduleModalOpen,
    alertOpen,
    alertSeverity,
    alertMessage,
    currentJob,
    currentJobName,
    currentLogs,
    logsLoading,
    buildLogsLoading,
    executionsLoading,
    currentExecutions,
    logsByExecutionId,
    currentScheduleData,
    jobToStop,
    scheduleLoading,
    // Сеттеры
    setSelectedStatus,
    setDetailsModalOpen,
    setLogsModalOpen,
    setBuildLogsModalOpen,
    setExecutionsModalOpen,
    setConfirmDialogOpen,
    setScheduleModalOpen,
    setAlertOpen,
    // Обработчики и утилиты
    handleJobTypeChange,
    handleTaskClick,
    getStatusIndicator,
    formatJobId,
    handleCopy,
    formatDateTime,
    handleLogsClick,
    handleExecutionsClick,
    handleScheduleClick,
    handleBuildLogsClick,
    handleDownloadArtifacts,
    handleStopClick,
    handleExecutionLogsToggle,
    confirmStopJob,
    buildStatusColors,
  };
};
