// src/components/Tasks/Tasks.js

import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Snackbar,
  Alert,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  FiberManualRecord as FiberManualRecordIcon,
} from "@mui/icons-material";
import axiosInstance from "../../api";
import { OrganizationContext } from "../Organization/OrganizationContext";
import { format, parseISO } from "date-fns";
import TasksDetailsDialog from "./TasksDetailsDialog";
import TasksActions from "./TasksActions";
import { AuthContext } from "../../AuthContext";
import { useTheme } from "@mui/material/styles";
import { wrap } from "framer-motion";
import { TasksFiltersContext } from "./TasksFiltersContext";



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
  failed: "#dc3545",
  creating: "#fd7e14", // оранжевый
  provisioning: "#ffc107", // желтый
  pending: "#17a2b8", // голубой
};

const buildStatusColors = {
  success: "#28a745", // зеленый
  failed: "#dc3545", // красный
  building: "#007bff", // синий
};

function Tasks() {
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);
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

  const {
    selectedStatus,
    setSelectedStatus,
    selectedJobType,
    setSelectedJobType,
    isScheduledFilter,
    setIsScheduledFilter,
  } = useContext(TasksFiltersContext);

  const intervalRef = useRef(null);
  const initialLoadRef = useRef(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMinDesktop = useMediaQuery(theme.breakpoints.down("lg"));
  


  const fetchJobs = () => {
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
            setSelectedJobType("run");
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
  };

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
  
    // Добавляем сортировку по дате создания в порядке убывания
    filteredJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
    setJobs(filteredJobs);
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

  // Обновленная функция handleLogsClick
  const handleLogsClick = (job, jobExecutionId = null) => {
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
  };

  // Обновленная функция handleBuildLogsClick
  const handleBuildLogsClick = (job) => {
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
  };

  // Обновленная функция handleExecutionsClick
  const handleExecutionsClick = (job) => {
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
  };

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

  const handleExecutionLogsToggle = (execution) => {
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
  };
  

  const handleStopClick = (job) => {
    setJobToStop(job);
    setConfirmDialogOpen(true);
  };

  const confirmStopJob = () => {
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
  };

  const handleDownloadArtifacts = (job) => {
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
  };

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
      setSelectedJobType(jobType);
    }
  };

  return (
    <Box>
      {/* Заголовок страницы */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 5,
          p: 2,
        }}
      >
        <Typography variant="h4">Задачи</Typography>
        <Box>
          <Button
            variant={"outlined"}
            onClick={() => handleJobTypeChange("deploy")}
            sx={{
              mr: 1,
              borderRadius: "12px",
              color: "secondary.main",
              fontWeight: "bold",
              textTransform: "uppercase",
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
              color: "#10a37f",
              backgroundColor:
                selectedJobType === "run" ? "#c0d4d3" : "#e0f7fa",
              textTransform: "uppercase",
            }}
            onClick={() => handleJobTypeChange("run")}
          >
            Run
          </Button>
        </Box>
      </Box>
      {/* Кнопки фильтров статусов */}
      <Box sx={{ ml: 2, mb: 1, display: "flex", flexWrap:'wrap', gap:'5px' }}>
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
              color: selectedStatus === status ? "white" : statusColors[status],
            }}
          >
            {status}
          </Button>
        ))}
      </Box>

      {/* Основное содержимое */}
      <Box sx={{ p: 2, wordWrap: "break-word" }}>
        {jobTypeLoading ? (
          // Если идет загрузка при переключении типов задач, показываем спиннер на всю таблицу
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={isMobile ? 1 : 2}>
            {/* Заголовки столбцов */}
            {!(isMobile || isTablet) && (
              <Grid item xs={12}>
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  sx={{
                    p: 1,
                    borderBottom: "1px solid #ccc",
                    textAlign: "center",
                    display: isMobile ? "none" : "flex",
                  }}
                >
                  {/* Ваши заголовки */}
                  <Grid item xs={selectedJobType === "run" ? 1.7 : 1.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Имя
                    </Typography>
                  </Grid>
                  <Grid item xs={selectedJobType === "run" ? 1.7 : 1.3}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      ID
                    </Typography>
                  </Grid>
                  <Grid item xs={1.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Создана
                    </Typography>
                  </Grid>
                  <Grid item xs={selectedJobType === "run" ? 1.7 : 1.1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Статус образа
                    </Typography>
                  </Grid>
                  <Grid item xs={selectedJobType === "run" ? 1.7 : 1.4}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Начало
                    </Typography>
                  </Grid>
                  <Grid item xs={selectedJobType === "run" ? 1.7 : 1.1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Статус
                    </Typography>
                  </Grid>
                  {/* Дополнительные колонки для "deploy" */}
                  {selectedJobType === "deploy" && (
                    <>
                      <Grid item xs={2.2}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          URL
                        </Typography>
                      </Grid>
                      <Grid item xs={1.2}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Health
                        </Typography>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={selectedJobType === "run" ? 1.5 : 0.7}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Действия
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Если идет загрузка данных, показываем спиннер под заголовками */}
            {loading ? (
              <Grid item xs={12}>
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
              </Grid>
            ) : (
              <>
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <Grid
                      item
                      xs={12}
                      key={job.job_id || job.id}
                      style={{ paddingTop: "8px" }}
                    >
                      {isMobile || isTablet ? (
                        // Отображение в виде карточек на мобильных устройствах
                        <Card
                          onClick={() => handleTaskClick(job)}
                          sx={{
                            position: "relative",
                            cursor: "pointer",
                            backgroundColor: "background.paper",
                            borderRadius: "12px",
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <CardContent sx={{ position: "relative" }}>
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                              }}
                            >
                              {getStatusIndicator(job)}
                            </Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              {job.job_name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>ID:</strong> {formatJobId(job.job_id)}
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
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>Создана:</strong>{" "}
                              {formatDateTime(job.created_at)}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>Статус образа:</strong>{" "}
                              <span
                                style={{
                                  color:
                                    buildStatusColors[job.build_status] ||
                                    "black",
                                }}
                              >
                                {job.build_status}
                              </span>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>Начало:</strong>{" "}
                              {job.last_execution_start_time
                                ? formatDateTime(job.last_execution_start_time)
                                : "N/A"}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Статус:</strong>{" "}
                              <span
                                style={{
                                  color:
                                    statusColors[
                                      job.last_execution_status
                                    ] || "black",
                                }}
                              >
                                {job.last_execution_status || "N/A"}
                              </span>
                            </Typography>
                            {/* Дополнительные поля для "deploy" */}
                            {selectedJobType === "deploy" && (
                              <>
                                <Typography variant="body2" sx={{ mt: 0.5, }}>
                                  <strong>URL:</strong> {job.job_url || "N/A"}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  <strong>Health:</strong>{" "}
                                  {job.health_status || "N/A"}
                                </Typography>
                              </>
                            )}
                          </CardContent>
                          <CardActions>
                            <TasksActions
                              job={job}
                              onLogsClick={handleLogsClick}
                              onExecutionsClick={handleExecutionsClick}
                              onScheduleClick={handleScheduleClick}
                              onBuildLogsClick={handleBuildLogsClick}
                              onDownloadArtifacts={handleDownloadArtifacts}
                              onStopClick={handleStopClick}
                            />
                          </CardActions>
                        </Card>
                      ) : (
                        // Отображение в виде таблицы на больших экранах
                        <Box
                          onClick={() => handleTaskClick(job)}
                          sx={{
                            position: "relative",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: "50%",
                              right: 5,
                              transform: "translateY(-50%)",
                            }}
                          >
                            {getStatusIndicator(job)}
                          </Box>

                          <Paper variant="outlined" sx={{ border: "none" }}>
                            <Grid
                              container
                              spacing={1}
                              alignItems="center"
                              sx={{
                                textAlign: "center",
                                borderBottom: "1px solid #ccc",
                                p: 1,
                                cursor: "pointer",
                                position: "relative",
                                background: "rgba(0,0,0,0)",
                                transition: "background 0.2s",
                                "&:hover": {
                                  background: "rgba(0,0,0,0.08)",
                                },
                                "& > .MuiGrid-item": {
                                  paddingTop: 0,
                                },
                              }}
                            >
                              {/* Имя */}
                              <Grid
                                item
                                xs={selectedJobType === "run" ? 1.7 : 1.5}
                              >
                                <Typography variant="body2" sx={{fontSize:'13px'}}>
                                  {job.job_name}
                                </Typography>
                              </Grid>
                              {/* ID */}
                              <Grid
                                item
                                xs={selectedJobType === "run" ? 1.7 : 1.3}
                              >
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
                              <Grid item xs={1.5}>
                                <Typography variant="body2">
                                  {formatDateTime(job.created_at)}
                                </Typography>
                              </Grid>
                              {/* Статус образа */}
                              <Grid item xs={selectedJobType === "run" ? 1.7 : 1.1}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color:
                                      buildStatusColors[job.build_status] ||
                                      "black",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {job.build_status}
                                </Typography>
                              </Grid>
                              {/* Начало */}
                              <Grid
                                item
                                xs={selectedJobType === "run" ? 1.7 : 1.4}
                              >
                                <Typography variant="body2">
                                  {job.last_execution_start_time
                                    ? formatDateTime(
                                        job.last_execution_start_time
                                      )
                                    : "N/A"}
                                </Typography>
                              </Grid>
                              {/* Статус */}
                              <Grid
                                item
                                xs={selectedJobType === "run" ? 1.7 : 1.1}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color:
                                      statusColors[
                                        job.last_execution_status
                                      ] || "black",
                                  }}
                                >
                                  {job.last_execution_status || "N/A"}
                                </Typography>
                              </Grid>
                              {/* Дополнительные колонки для "deploy" */}
                              {selectedJobType === "deploy" && (
                                <>
                                  <Grid item xs={2.2}>
                                    <Typography variant="body2" sx={{fontSize: job.job_url ? "11px" : '14px', whiteSpace: isMinDesktop ? 'normal' : 'nowrap', textAlign: 'center' }}>
                                      {job.job_url || "N/A"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={1.2}>
                                    <Typography variant="body2">
                                      {job.health_status || "N/A"}
                                    </Typography>
                                  </Grid>
                                </>
                              )}
                              {/* Действия */}
                              <Grid item xs={selectedJobType === "run" ? 1.5 : 0.7}
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
                              </Grid>
                            </Grid>
                          </Paper>
                        </Box>
                      )}
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography align="center" sx={{ mt: 2 }}>
                      Нет доступных задач.
                    </Typography>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        )}
      </Box>
      {/* Компоненты модальных окон */}
      <TasksDetailsDialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        job={currentJob}
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
                height: "100px",
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
                height: "100px",
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
    </Box>
  );
}

export default Tasks;
