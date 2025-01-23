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
  Paper,
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
const statusColors = {
  running: "#28a745", // зеленый
  stopped: "#dc3545", // красный
  terminated: "#6c757d", // серый
  completed: "#007bff", // синий
  failed: "#6f42c1", // пурпурный
  creating: "#fd7e14", // оранжевый
  provisioning: "#ffc107", // желтый
  pending: "#17a2b8", // голубой
};

const jobTypeOptions = ["deploy", "run"];

function Tasks() {
  const { currentOrganization } = useContext(OrganizationContext);
  const [allJobs, setAllJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния фильтров
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("deploy");
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
        job_type: selectedJobType || undefined,
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

    setJobs(filteredJobs);
  };

  // Обработчики для фильтров
  const handleStatusChange = (event) => {
    const value = event.target.value;
    setSelectedStatus(value);
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
    const color = statusColors[status] || "grey";

    if (["creating", "pending", "provisioning"].includes(status)) {
      return (
        <CircularProgress
          size={15}
          thickness={5}
          sx={{ color: color }}
        />
      );
    } else if (status) {
      return (
        <FiberManualRecordIcon
          sx={{ color: color, fontSize: 15 }}
        />
      );
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
          alignItems: "flex-start",
          justifyContent:'space-between',
          p: 2,
        }}
      >
        <Typography variant="h4">Задачи</Typography>

        {/* Кнопки фильтров статусов */}
        <Box sx={{ ml: 2, mb: 2 }}>
          <Button
            key="all"
            variant={selectedStatus === "" ? "contained" : "outlined"}
            onClick={() => setSelectedStatus("")}
            size="small"
            sx={{
              borderRadius: "12px",
              fontSize: "12px",
              mr: 1,
              backgroundColor: selectedStatus === "" ? "#6c757d" : "inherit",
              color: selectedStatus === "" ? "white" : "#6c757d",
            }}
          >
            Все
          </Button>
          {statusOptions.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "contained" : "outlined"}
              onClick={() => setSelectedStatus(status)}
              size="small"
              sx={{
                borderRadius: "12px",
                fontSize: "12px",
                mr: 1,
                backgroundColor:
                  selectedStatus === status ? statusColors[status] : "inherit",
                color:
                  selectedStatus === status ? "white" : statusColors[status],
              }}
            >
              {status}
            </Button>
          ))}
        </Box>
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
      <Box sx={{ ml: 2 }}>
        <Button
          variant={"outlined"}
          onClick={() => setSelectedJobType("deploy")}
          sx={{
            mr: 1,
            borderRadius: "12px",
            color:'secondary.main',
            fontWeight: "bold",
            textTransform:'uppercase',
            backgroundColor:
              selectedJobType === "deploy" ? "#c0d4d3" : "#e0f7fa",
          }}
        >
          Deploy
        </Button>
        <Button
          variant={"outlined"}
          sx={{
            borderRadius: "12px",
            fontWeight: "bold",
            color:'#10a37f',
            backgroundColor: selectedJobType === "run" ? "#c0d4d3" : "#e0f7fa",
            textTransform:'uppercase'
          }}
          onClick={() => setSelectedJobType("run")}
        >
          Run
        </Button>
      </Box>

      {/* Основное содержимое */}
      <Box sx={{ p: 2, wordWrap:'break-word' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {/* Заголовки столбцов */}
            <Grid
              container
              spacing={1}
              alignItems="center"
              sx={{
                p: 1,
                borderBottom: "1px solid #ccc",
                textAlign: "center",
              }}
            >
              <Grid item xs={selectedJobType === "run" ? 1.6 : 1.3}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Имя
                </Typography>
              </Grid>
              <Grid item xs={selectedJobType === "run" ? 1.6 : 1.3}>
                <Typography variant="subtitle2" fontWeight="bold">
                  ID
                </Typography>
              </Grid>
              <Grid item xs={1.6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Создана
                </Typography>
              </Grid>
              <Grid item xs={1.6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Статус образа
                </Typography>
              </Grid>
              <Grid item xs={selectedJobType === "run" ? 1.6 : 1.4}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Начало
                </Typography>
              </Grid>
              <Grid item xs={selectedJobType === "run" ? 1.6 : 1.4}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Статус
                </Typography>
              </Grid>
              {/* Добавляем дополнительные колонки для "deploy" */}
              {selectedJobType === "deploy" && (
                <>
                  <Grid item xs={1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      URL
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Health
                    </Typography>
                  </Grid>
                </>
              )}
              <Grid item xs={1}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Действия
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Grid item xs={12} key={job.job_id || job.id}>
                <Box
                  onClick={() => handleTaskClick(job)}
                  sx={{
                    cursor: "pointer",
                    position: "relative",
                    mb: 1,
                    borderRadius: "15px",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                    backgroundColor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                    }}
                  >
                    {getStatusIndicator(job.last_execution_status)}
                  </Box>

                  <Paper variant="outlined" sx={{ p: 1, border:"none" }}>
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      sx={{ textAlign: "center", borderBottom: "1px solid #ccc", pb: 1 }}
                    >
                      {/* Имя */}
                      <Grid item xs={selectedJobType === "run" ? 1.6 : 1.3}>
                        <Typography variant="body2">{job.job_name}</Typography>
                      </Grid>
                      {/* ID */}
                      <Grid item xs={selectedJobType === "run" ? 1.6 : 1.3}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="body2">
                            {formatJobId(job.job_id)}
                          </Typography>
                          <Tooltip title="Скопировать ID задачи">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(job.job_id);
                              }}
                            >
                              <ContentCopyIcon
                                fontSize="small"
                                sx={{ fontSize: "1.1rem" }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Grid>
                      {/* Создана */}
                      <Grid item xs={1.6}>
                        <Typography variant="body2">
                          {formatDateTime(job.created_at)}
                        </Typography>
                      </Grid>
                      {/* Статус образа */}
                      <Grid item xs={1.6}>
                        <Typography variant="body2">
                          {job.build_status}
                          {job.build_status === "building" && (
                            <CircularProgress size={16} sx={{ ml: 1 }} />
                          )}
                        </Typography>
                      </Grid>
                      {/* Начало */}
                      <Grid item xs={selectedJobType === "run" ? 1.6 : 1.4}>
                        <Typography variant="body2">
                          {job.last_execution_start_time
                            ? formatDateTime(job.last_execution_start_time)
                            : "N/A"}
                        </Typography>
                      </Grid>
                      {/* Статус */}
                      <Grid item xs={selectedJobType === "run" ? 1.6 : 1.4}>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              statusColors[job.last_execution_status] ||
                              "black",
                          }}
                        >
                          {job.last_execution_status || "N/A"}
                        </Typography>
                      </Grid>
                      {/* Дополнительные колонки для "deploy" */}
                      {selectedJobType === "deploy" && (
                        <>
                          <Grid item xs={1}>
                            <Typography variant="body2">
                              {job.job_url || "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body2">
                              {job.health_status || "N/A"}
                            </Typography>
                          </Grid>
                        </>
                      )}
                      {/* Действия */}
                      <Grid item xs={1}>
                        <TasksActions
                          job={job}
                          onLogsClick={handleLogsClick}
                          onExecutionsClick={handleExecutionsClick}
                          onScheduleClick={handleScheduleClick}
                          onBuildLogsClick={handleBuildLogsClick}
                          onDownloadArtifacts={handleDownloadArtifacts}
                          onStopClick={handleStopClick}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </Grid>
            ))
          ) : (
            <Typography variant="body1">Нет доступных задач.</Typography>
          )}
        </Grid>
      </Box>

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
          <Button onClick={() => setBuildLogsModalOpen(false)}>Закрыть</Button>
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
                          <strong>Состояние:</strong> {execution.health_status}
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
          <Button onClick={() => setExecutionsModalOpen(false)}>Закрыть</Button>
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
        </Box>
      </Box>
    );
  }
}

export default Tasks;
