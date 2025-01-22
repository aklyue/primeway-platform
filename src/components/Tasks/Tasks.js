// src/components/Tasks.js

import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  OutlinedInput,
  InputLabel,
  FormControl,
  Radio,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemText,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  FiberManualRecord as FiberManualRecordIcon,
  CalendarToday as CalendarIcon,
  EventNote as EventNoteIcon,
  BugReport as BugReportIcon,
  Download as DownloadIcon,
  ContentPasteSearch as ContentPasteSearchIcon,
  Stop as StopIcon,
} from "@mui/icons-material";
import axiosInstance from "../../api";
import { AuthContext } from "../../AuthContext";
import { OrganizationContext } from "../Organization/OrganizationContext";
import { format, parseISO } from "date-fns";
import TasksDetailsDialog from "./TasksDetailsDialog";
import TasksActions from "./TasksActions";

const statusOptions = [
  "running",
  "stopped",
  "terminated",
  "completed",
  "failed",
  "creating",
  "provisioning",
  "pending",
];

const jobTypeOptions = ["deploy", "run"];

function Tasks() {
  const { currentOrganization } = useContext(OrganizationContext);
  const [allJobs, setAllJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния фильтров
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [isScheduledFilter, setIsScheduledFilter] = useState(false);

  // Добавить в список состояний
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);

  // Состояния для управления диалогами
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [currentJobName, setCurrentJobName] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  const [executionsModalOpen, setExecutionsModalOpen] = useState(false);
  const [currentExecutions, setCurrentExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState("");

  // Добавлены состояния для отображения логов под выполнением
  const [logsByExecutionId, setLogsByExecutionId] = useState({});

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [currentScheduleData, setCurrentScheduleData] = useState(null);

  // Состояния для логов сборки
  const [buildLogsModalOpen, setBuildLogsModalOpen] = useState(false);
  const [buildLogsLoading, setBuildLogsLoading] = useState(false);

  // Состояние для подтверждения остановки
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [jobToStop, setJobToStop] = useState(null);

  // Состояние для переключения между моковыми данными и реальными данными
  const [useMockData, setUseMockData] = useState(false);

  const formatJobName = (name) => {
    if (!name) return "N/A";
    return name.length > 12 ? `${name.slice(0, 12)}**` : name;
  };

  // Моковые данные для тестирования
  const mockJobs = [
    {
      id: "job1",
      job_id: "job1",
      job_name: "Test Job 1",
      job_type: "run",
      created_at: "2023-10-07T14:48:00Z",
      start_time: "2023-10-07T15:00:00Z",
      build_status: "success",
      last_execution_status: "completed",
      last_execution_start_time: "2023-10-07T15:05:00Z",
      last_execution_end_time: "2023-10-07T15:10:00Z",
      gpu_type: "NVIDIA A100",
      job_url: null,
      is_scheduled: true,
      schedule: {
        start_date: "2023-10-10T08:00:00Z",
        end_date: "2023-10-20T18:00:00Z",
        days_of_week: ["Monday", "Wednesday", "Friday"],
      },
    },
    {
      id: "job2",
      job_id: "job2",
      job_name: "Job 2",
      job_type: "deploy",
      created_at: "2023-10-07T14:50:00Z",
      start_time: "2023-10-07T15:05:00Z",
      build_status: "building",
      last_execution_status: "running",
      last_execution_start_time: "2023-10-07T15:15:00Z",
      last_execution_end_time: null,
      gpu_type: "NVIDIA RTX 3090",
      job_url: "https://example.com/deploy/job2",
      is_scheduled: false,
    },
    {
      id: "job3",
      job_id: "job3",
      job_name: "Another Job 3",
      job_type: "run",
      created_at: "2023-10-07T14:55:00Z",
      start_time: null,
      build_status: "failed",
      last_execution_status: "creating",
      last_execution_start_time: null,
      last_execution_end_time: null,
      gpu_type: "NVIDIA V100",
      job_url: null,
      is_scheduled: true,
      schedule: {
        start_date: "2023-10-15T09:00:00Z",
        end_date: "2023-10-25T17:00:00Z",
        days_of_week: ["Tuesday", "Thursday"],
      },
    },
    // Добавьте больше тестовых задач по необходимости
  ];

  // Моковые данные для выполнений задачи
  const mockExecutions = [
    {
      job_execution_id: "exec1",
      status: "running",
      start_time: "2023-10-07T15:05:00Z",
      end_time: null,
      created_at: "2023-10-07T15:00:00Z",
      gpu_info: { type: "NVIDIA A100", memory: "40GB" },
      health_status: "healthy",
    },
    {
      job_execution_id: "exec2",
      status: "completed",
      start_time: "2023-10-07T14:50:00Z",
      end_time: "2023-10-07T15:00:00Z",
      created_at: "2023-10-07T14:45:00Z",
      gpu_info: { type: "NVIDIA V100", memory: "32GB" },
      health_status: "healthy",
    },
    // Добавьте больше выполнений по необходимости
  ];

  useEffect(() => {
    fetchJobs();
  }, [
    currentOrganization,
    useMockData,
    isScheduledFilter,
    selectedStatus,
    selectedJobType,
  ]);

  // Применяем фильтры при их изменении
  useEffect(() => {
    applyFilters();
  }, [selectedStatus, selectedJobType, isScheduledFilter, allJobs]);

  const fetchJobs = () => {
    setLoading(true);
    if (useMockData) {
      // Используем моковые данные
      setTimeout(() => {
        setAllJobs(mockJobs);
        setLoading(false);
      }, 500); // Имитируем задержку
    } else if (currentOrganization) {
      // Используем реальные данные
      const endpoint = `/jobs/get-organization-jobs`;
      const params = {
        organization_id: currentOrganization.id,
        is_scheduled: isScheduledFilter || undefined,
        status: selectedStatus || undefined,
        // Добавьте другие параметры фильтрации, если необходимо
      };

      axiosInstance
        .get(endpoint, { params })
        .then((response) => {
          const data = response.data || [];
          setAllJobs(data);
        })
        .catch((error) => {
          console.error("Ошибка при получении списка задач:", error);
          const errorMessage =
            error.response?.data?.detail ||
            "Не удалось загрузить список задач.";
          setError(errorMessage);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const handleTaskClick = (job) => {
    setCurrentJob(job);
    setDetailsModalOpen(true);
  };

  const applyFilters = () => {
    let filteredJobs = [...allJobs];

    if (selectedStatus) {
      filteredJobs = filteredJobs.filter(
        (job) => job.last_execution_status === selectedStatus
      );
    }

    if (selectedJobType) {
      filteredJobs = filteredJobs.filter(
        (job) => job.job_type === selectedJobType
      );
    }

    if (isScheduledFilter) {
      filteredJobs = filteredJobs.filter((job) => job.is_scheduled);
    }

    setJobs(filteredJobs);
  };

  // Обработчики для фильтров
  const handleStatusChange = (event) => {
    const value = event.target.value;
    setSelectedStatus(value);
  };

  const handleJobTypeChange = (event) => {
    const value = event.target.value;
    setSelectedJobType(value);
  };

  const handleIsScheduledChange = (event) => {
    setIsScheduledFilter(event.target.checked);
  };

  const resetFilters = () => {
    setSelectedStatus("");
    setSelectedJobType("");
    setIsScheduledFilter(false);
  };

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

  const handleLogsClick = (job, jobExecutionId = null) => {
    // Получаем логи для задачи или выполнения и открываем диалог
    setLogsLoading(true);
    setCurrentJobName(job.job_name || "N/A");

    const params = {};
    if (jobExecutionId) {
      params.job_execution_id = jobExecutionId;
    } else {
      params.job_id = job.job_id;
    }

    if (useMockData) {
      // Используем моковые логи
      setTimeout(() => {
        if (jobExecutionId) {
          setCurrentLogs(
            `Логи для выполнения ${jobExecutionId} задачи ${job.job_name} (ID: ${job.id})`
          );
        } else {
          setCurrentLogs(`Логи для задачи ${job.job_name} (ID: ${job.id})`);
        }
        setLogsLoading(false);
        setLogsModalOpen(true);
      }, 1000);
    } else {
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
          setLogsModalOpen(true);
        });
    }
  };

  const handleExecutionLogsToggle = (execution) => {
    const executionId = execution.job_execution_id || execution.execution_id;

    // Проверяем, есть ли уже логи для этого выполнения
    if (logsByExecutionId[executionId]) {
      // Если есть, удаляем их (скрываем)
      setLogsByExecutionId((prevLogs) => {
        const newLogs = { ...prevLogs };
        delete newLogs[executionId];
        return newLogs;
      });
    } else {
      // Иначе, загружаем логи и отображаем под выполнением
      const params = { job_execution_id: executionId };

      if (useMockData) {
        // Используем моковые данные
        setTimeout(() => {
          const logs = `Логи выполнения ${executionId}`;
          setLogsByExecutionId((prevLogs) => ({
            ...prevLogs,
            [executionId]: { logs, loading: false },
          }));
        }, 1000);

        // Пока логи загружаются, устанавливаем состояние загрузки
        setLogsByExecutionId((prevLogs) => ({
          ...prevLogs,
          [executionId]: { logs: "", loading: true },
        }));
      } else {
        // Пока логи загружаются, устанавливаем состояние загрузки
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
    }
  };

  const handleStopClick = (job) => {
    // Подтверждение остановки
    setJobToStop(job);
    setConfirmDialogOpen(true);
  };

  const confirmStopJob = () => {
    // Реализация остановки задачи
    if (useMockData) {
      // Моковое уведомление об успешной остановке
      setTimeout(() => {
        fetchJobs();
      }, 1000);
    } else {
      const params = {};

      if (jobToStop.job_execution_id) {
        params.job_execution_id = jobToStop.job_execution_id;
      } else if (jobToStop.job_id) {
        params.job_id = jobToStop.job_id;
      } else if (jobToStop.id) {
        params.job_id = jobToStop.id;
      }

      // Проверяем, что хотя бы один из параметров указан
      if (!params.job_id && !params.job_execution_id) {
        console.log("Не указан идентификатор задачи или выполнения.");
        setConfirmDialogOpen(false);
        return;
      }

      axiosInstance
        .post("/jobs/job-stop", null, { params })
        .then((response) => {
          const message =
            response.data.message || "Задача успешно остановлена.";
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
    }
  };

  const handleBuildLogsClick = (job) => {
    // Получаем build logs для задачи и открываем диалог
    setBuildLogsLoading(true);
    setCurrentJobName(job.job_name || "N/A");

    if (useMockData) {
      // Используем моковые логи сборки
      setTimeout(() => {
        setCurrentLogs(`Build Logs для задачи ${job.job_name} (ID: ${job.id})`);
        setBuildLogsLoading(false);
        setBuildLogsModalOpen(true);
      }, 1000);
    } else {
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
          setBuildLogsModalOpen(true);
        });
    }
  };

  const handleExecutionsClick = (job) => {
    // Получаем список выполнений для задачи и открываем диалог
    setExecutionsLoading(true);
    setCurrentJobName(job.job_name || "N/A");
    setCurrentJobId(job.id || job.job_id || "");
    setLogsByExecutionId({}); // Сбрасываем состояние логов

    if (useMockData) {
      // Используем моковые данные
      setTimeout(() => {
        setCurrentExecutions(mockExecutions);
        setExecutionsLoading(false);
        setExecutionsModalOpen(true);
      }, 1000);
    } else {
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
          setExecutionsModalOpen(true);
        });
    }
  };

  const handleScheduleClick = (job) => {
    // Получаем расписание для задачи и открываем диалог
    setScheduleLoading(true);
    setCurrentJobName(job.job_name || "N/A");
    setCurrentJobId(job.id || job.job_id || "");

    if (useMockData) {
      // Используем моковые данные
      setTimeout(() => {
        const scheduleData = job.schedule || null;
        setCurrentScheduleData(scheduleData);
        setScheduleLoading(false);
        setScheduleModalOpen(true);
      }, 1000);
    } else {
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
            error.response?.data?.detail ||
            "Информация о расписании недоступна.";
          setCurrentScheduleData(null);
        })
        .finally(() => {
          setScheduleLoading(false);
          setScheduleModalOpen(true);
        });
    }
  };

  const handleDownloadArtifacts = (job) => {
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

      // Передаем job_id или job_execution_id
      if (job.last_execution_id) {
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
          const blob = new Blob([response.data], { type: "application/zip" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;

          // Получение имени файла из заголовка Content-Disposition
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
    }
  };

  const getStatusIndicator = (status) => {
    const creatingStatuses = ["creating", "pending", "provisioning"];
    const stoppedStatuses = ["stopped", "failed", "completed", "terminated"];

    if (creatingStatuses.includes(status)) {
      return <CircularProgress size={20} color="inherit" />;
    } else if (status === "running") {
      return <FiberManualRecordIcon sx={{ color: "green", fontSize: 20 }} />;
    } else if (stoppedStatuses.includes(status)) {
      return <FiberManualRecordIcon sx={{ color: "red", fontSize: 20 }} />;
    } else {
      return null;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      {/* Заголовок страницы */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Задачи
        </Typography>
        {/* Переключатель моковых данных */}
        <FormControlLabel
          control={
            <Switch
              checked={useMockData}
              onChange={(e) => setUseMockData(e.target.checked)}
              color="primary"
            />
          }
          label="Моковые данные"
        />
      </Box>

      {/* Рендерим фильтры сверху */}
      <Box sx={{ p: 2 }}>{renderFilters()}</Box>

      {/* Основное содержимое */}
      <Box>
        <Grid container spacing={2}>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Grid item xs={12} key={job.job_id || job.id}>
                <Card
                  onClick={() => handleTaskClick(job)}
                  sx={{
                    cursor: "pointer",
                    position: "relative",
                    mb: 3,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    borderRadius: "15px",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 6px 25px rgba(0, 0, 0, 0.15)",
                    },
                    backgroundColor: "#fff",
                  }}
                >
                  {/* Верхний блок с типом задачи и URL */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: "bold",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          job.job_type === "run" ? "#10a37f" : "secondary.main",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        mr: 1,
                        backgroundColor:
                          job.job_type === "run" ? "#e0f7fa" : "#e0f2f1",
                        padding: "8px 12px",
                        borderTopLeftRadius: "15px",
                        borderBottomRightRadius: "15px",
                        display: "flex",
                        gap: "7px",
                        alignItems: "flex-start",
                      }}
                    >
                      {job.job_type}
                      {job.is_scheduled && (
                        <Tooltip title="Запланированная задача">
                          <CalendarIcon
                            sx={{ color: "#00695c", fontSize: "1.1rem" }}
                          />
                        </Tooltip>
                      )}
                    </Typography>
                    {job.job_type === "deploy" && job.job_url && (
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
                            wordBreak: "break-all",
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
                          {job.job_url}
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>

                  {/* Статус задачи */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                    }}
                  >
                    {getStatusIndicator(job.last_execution_status)}
                  </Box>

                  {/* Контент карточки */}
                  <CardContent>
                    <Grid container spacing={2}>
                      {/* Левая часть с информацией */}
                      <Grid item xs={12} md={9}>
                        <Box sx={{ mt: 4 }}>
                          {/* Название задачи */}
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: "bold", color: "#333" }}
                          >
                            {job.job_name}
                          </Typography>
                          {/* ID задачи */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#888",
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            ID: {formatJobId(job.job_id)}
                            <Tooltip title="Скопировать ID">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(job.job_id);
                                }}
                              >
                                <ContentCopyIcon sx={{ fontSize: "1rem" }} />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                          {/* Основная информация */}
                          <Grid container spacing={2}>
                            {/* Создана */}
                            <Grid item xs={12} sm={6} md={2.5}>
                              <Typography
                                variant="body2"
                                sx={{ color: "#555", fontWeight: "bold" }}
                              >
                                Создана
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#555" }}
                              >
                                {formatDateTime(job.created_at)}
                              </Typography>
                            </Grid>
                            {/* Статус образа */}
                            <Grid item xs={12} sm={6} md={2.5}>
                              <Typography
                                variant="body2"
                                sx={{ color: "#555", fontWeight: "bold" }}
                              >
                                Статус образа
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#555" }}
                              >
                                {job.build_status}
                                {job.build_status === "building" && (
                                  <CircularProgress size={16} sx={{ ml: 1 }} />
                                )}
                              </Typography>
                            </Grid>
                            {/* Начало с заголовком "Последний запуск" */}
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ position: "relative" }}>
                                <Typography
                                  variant="h5"
                                  sx={{
                                    fontWeight: "bold", color: "#333",
                                    position: "absolute",
                                    top: -45,
                                  }}
                                >
                                  Последний запуск
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#555", fontWeight: "bold" }}
                                >
                                  Начало
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#555" }}
                                >
                                  {job.last_execution_start_time
                                    ? formatDateTime(
                                        job.last_execution_start_time
                                      )
                                    : "N/A"}
                                </Typography>
                              </Box>
                            </Grid>
                            {/* Конец */}
                            <Grid item xs={12} sm={6} md={2.5}>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#555", fontWeight: "bold" }}
                                >
                                  Конец
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#555" }}
                                >
                                  {job.last_execution_end_time
                                    ? formatDateTime(
                                        job.last_execution_end_time
                                      )
                                    : "N/A"}
                                </Typography>
                              </Box>
                            </Grid>
                            {/* Статус */}
                            <Grid item xs={12} sm={6} md={1}>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#555", fontWeight: "bold" }}
                                >
                                  Статус
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#555",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {job.last_execution_status || "N/A"}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                      {/* Правая часть с кнопками */}
                      <Grid item xs={12} md={3}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "flex-end",
                            height: "100%",
                            pr: 2,
                          }}
                        >
                          <TasksActions
                            job={job}
                            onLogsClick={handleLogsClick}
                            onExecutionsClick={handleExecutionsClick}
                            onScheduleClick={handleScheduleClick}
                            onBuildLogsClick={handleBuildLogsClick}
                            onDownloadArtifacts={handleDownloadArtifacts}
                            onStopClick={handleStopClick}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1">Нет доступных задач.</Typography>
          )}
        </Grid>

        {/* Компоненты модальных окон */}
        <TasksDetailsDialog
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          job={currentJob}
          useMockData={useMockData}
          getStatusIndicator={getStatusIndicator}
        />

        {/* Диалоговое окно логов */}
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
                // Копирование логов в буфер обмена
                handleCopy(currentLogs);
              }}
            >
              Скопировать Логи
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалоговое окно логов сборки */}
        <Dialog
          open={buildLogsModalOpen}
          onClose={() => setBuildLogsModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{`Логи сборки: ${currentJobName}`}</DialogTitle>
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
            <Button onClick={() => setBuildLogsModalOpen(false)}>
              Закрыть
            </Button>
            <Button
              onClick={() => {
                // Копирование логов сборки в буфер обмена
                handleCopy(currentLogs);
              }}
            >
              Скопировать Логи
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалоговое окно Выполнений */}
        <Dialog
          open={executionsModalOpen}
          onClose={() => setExecutionsModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{`Выполнения задачи: ${currentJobName}`}</DialogTitle>
          <DialogContent dividers>
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
            ) : currentExecutions.length > 0 ? (
              // Отображаем список выполнений
              <Box>
                {currentExecutions.map((execution) => {
                  const executionId =
                    execution.job_execution_id || execution.execution_id;
                  const logsData = logsByExecutionId[executionId];
                  return (
                    <Box key={executionId} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          "&:hover": {
                            backgroundColor: "#f0f0f0",
                            cursor: "pointer",
                          },
                          p: 1,
                          borderRadius: "5px",
                        }}
                        onClick={() => handleExecutionLogsToggle(execution)}
                      >
                        <Typography variant="body2">
                          <strong>ID выполнения:</strong> {executionId}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Статус:</strong> {execution.status}
                        </Typography>
                        {execution.created_at && (
                          <Typography variant="body2">
                            <strong>Создано:</strong>{" "}
                            {formatDateTime(execution.created_at)}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          <strong>Начало:</strong>{" "}
                          {execution.start_time
                            ? formatDateTime(execution.start_time)
                            : "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Окончание:</strong>{" "}
                          {execution.end_time
                            ? formatDateTime(execution.end_time)
                            : "N/A"}
                        </Typography>
                        {execution.gpu_info && (
                          <Typography variant="body2">
                            <strong>GPU:</strong> {execution.gpu_info.type} (
                            {execution.gpu_info.memory})
                          </Typography>
                        )}
                        {execution.health_status && (
                          <Typography variant="body2">
                            <strong>Состояние:</strong>{" "}
                            {execution.health_status}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          sx={{ color: "gray", mt: 1 }}
                        >
                          Нажмите, чтобы увидеть логи выполнения
                        </Typography>
                      </Box>
                      {/* Отображение логов под выполнением */}
                      {logsData && (
                        <Box sx={{ pl: 2, mt: 1 }}>
                          {logsData.loading ? (
                            <CircularProgress size={24} />
                          ) : (
                            <Typography
                              variant="body2"
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              {logsData.logs}
                            </Typography>
                          )}
                        </Box>
                      )}
                      <Box
                        sx={{
                          borderBottom: "1px solid #ccc",
                          mt: 1,
                          mb: 1,
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography>Нет доступных выполнений для этой задачи.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExecutionsModalOpen(false)}>
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог подтверждения остановки */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
        >
          <DialogTitle>Подтверждение остановки</DialogTitle>
          <DialogContent>
            <Typography>
              Вы уверены, что хотите остановить задачу "{jobToStop?.job_name}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Отмена</Button>
            <Button onClick={confirmStopJob} color="secondary">
              Остановить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалоговое окно Расписания */}
        <Dialog
          open={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{`Расписание задачи: ${currentJobName}`}</DialogTitle>
          <DialogContent dividers>
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
            ) : currentScheduleData ? (
              <Box>
                <Typography variant="body1">
                  <strong>Начало:</strong>{" "}
                  {formatDateTime(currentScheduleData.start_date)}
                </Typography>
                <Typography variant="body1">
                  <strong>Конец:</strong>{" "}
                  {formatDateTime(currentScheduleData.end_date)}
                </Typography>
                <Typography variant="body1">
                  <strong>Дни недели:</strong>{" "}
                  {currentScheduleData.days_of_week.join(", ")}
                </Typography>
                {/* Добавьте отображение других данных расписания по необходимости */}
              </Box>
            ) : (
              <Typography>Информация о расписании недоступна.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleModalOpen(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );

  // Функция для рендеринга фильтров
  function renderFilters() {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Фильтр по статусу */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="status-label">Статус</InputLabel>
            <Select
              labelId="status-label"
              value={selectedStatus}
              onChange={handleStatusChange}
              input={<OutlinedInput label="Статус" />}
              renderValue={(selected) => (selected ? selected : "Все")}
            >
              <MenuItem value="">
                <Radio checked={selectedStatus === ""} />
                <ListItemText primary="Все" />
              </MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  <Radio checked={selectedStatus === status} />
                  <ListItemText primary={status} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Фильтр по типу задачи */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="job-type-label">Тип задачи</InputLabel>
            <Select
              labelId="job-type-label"
              value={selectedJobType}
              onChange={handleJobTypeChange}
              input={<OutlinedInput label="Тип задачи" />}
              renderValue={(selected) => (selected ? selected : "Все")}
            >
              <MenuItem value="">
                <Radio checked={selectedJobType === ""} />
                <ListItemText primary="Все" />
              </MenuItem>
              {jobTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  <Radio checked={selectedJobType === type} />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Фильтр по расписанию */}
          <FormControlLabel
            control={
              <Switch
                checked={isScheduledFilter}
                onChange={handleIsScheduledChange}
                color="primary"
              />
            }
            label="Только запланированные"
          />

          {/* Кнопка сброса фильтров */}
          <Button variant="outlined" onClick={resetFilters}>
            Сбросить фильтры
          </Button>
        </Box>
      </Box>
    );
  }
}

export default Tasks;
