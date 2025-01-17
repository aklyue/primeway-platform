import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  OutlinedInput,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  FiberManualRecord as FiberManualRecordIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import axiosInstance from "../api";
import { AuthContext } from "../AuthContext";
import { OrganizationContext } from "./Organization/OrganizationContext";

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
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);
  const [allJobs, setAllJobs] = useState([]); // Храним все загруженные задачи
  const [jobs, setJobs] = useState([]); // Храним отфильтрованные задачи
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния фильтров
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [isScheduledFilter, setIsScheduledFilter] = useState(false);

  // Состояния для управления диалоговым окном логов
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [currentJobName, setCurrentJobName] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  // Состояния для управления диалоговым окном Запусков (Executions)
  const [executionsModalOpen, setExecutionsModalOpen] = useState(false);
  const [currentExecutions, setCurrentExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState("");

  // Состояния для управления диалоговым окном Расписания
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [currentScheduleData, setCurrentScheduleData] = useState(null);

  // Состояние для переключения между моковыми данными и реальными данными
  const [useMockData, setUseMockData] = useState(true);

  // Моковые данные для тестирования
  const mockJobs = [
    {
      id: "job1",
      job_id: "job1",
      job_name: "Test Job Very Long Name 1",
      job_type: "run",
      created_at: "2023-10-07T14:48:00.000Z",
      status: "completed",
      start_time: "2023-10-07T15:00:00.000Z",
      build_status: "success",
      last_execution_status: "success",
      last_execution_start_time: "2023-10-07T15:05:00.000Z",
      last_execution_end_time: "2023-10-07T15:10:00.000Z",
      gpu_type: "NVIDIA A100",
      url: null,
      is_scheduled: true,
      schedule: {
        start_date: "2023-10-10T08:00:00.000Z",
        end_date: "2023-10-20T18:00:00.000Z",
        days_of_week: ["Monday", "Wednesday", "Friday"],
      },
    },
    {
      id: "job2",
      job_id: "job2",
      job_name: "Job 2",
      job_type: "deploy",
      created_at: "2023-10-07T14:50:00.000Z",
      status: "running",
      start_time: "2023-10-07T15:05:00.000Z",
      build_status: "building",
      last_execution_status: "running",
      last_execution_start_time: "2023-10-07T15:15:00.000Z",
      last_execution_end_time: null,
      gpu_type: "NVIDIA RTX 3090",
      url: "https://example.com/deploy/job2",
      is_scheduled: false,
    },
    {
      id: "job3",
      job_id: "job3",
      job_name: "Another Job With Long Name 3",
      job_type: "run",
      created_at: "2023-10-07T14:55:00.000Z",
      status: "creating",
      start_time: null,
      build_status: "failed",
      last_execution_status: null,
      last_execution_start_time: null,
      last_execution_end_time: null,
      gpu_type: "NVIDIA V100",
      url: null,
      is_scheduled: true,
      schedule: {
        start_date: "2023-10-15T09:00:00.000Z",
        end_date: "2023-10-25T17:00:00.000Z",
        days_of_week: ["Tuesday", "Thursday"],
      },
    },
    // Добавьте больше тестовых задач по необходимости
  ];

  // Моковые данные для запусков (executions) задачи
  const mockExecutions = [
    {
      execution_id: "exec1",
      status: "running",
      start_time: "2023-10-07T15:05:00.000Z",
      end_time: null,
    },
    {
      execution_id: "exec2",
      status: "completed",
      start_time: "2023-10-07T14:50:00.000Z",
      end_time: "2023-10-07T15:00:00.000Z",
    },
    // Добавьте больше запусков по необходимости
  ];

  useEffect(() => {
    fetchJobs();
  }, [currentOrganization, authToken, useMockData]);

  // Применяем фильтры при их изменении
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatuses, selectedJobTypes, isScheduledFilter, allJobs]);

  const fetchJobs = () => {
    setLoading(true);
    if (useMockData) {
      // Используем моковые данные
      setTimeout(() => {
        setAllJobs(mockJobs);
        setLoading(false);
      }, 500); // Имитируем задержку
    } else if (currentOrganization && authToken) {
      // Используем реальные данные
      const endpoint = `/jobs/${currentOrganization.id}`;

      // Запрашиваем все задачи без фильтров
      axiosInstance
        .get(endpoint)
        .then((response) => {
          const data = response.data || [];
          setAllJobs(data);
        })
        .catch((error) => {
          console.error("Ошибка при получении списка задач:", error);
          setError("Не удалось загрузить список задач.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Если нет организации или токена, сбрасываем загрузку
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredJobs = [...allJobs];

    // Применяем фильтр по статусу
    if (selectedStatuses.length > 0) {
      filteredJobs = filteredJobs.filter((job) =>
        selectedStatuses.includes(job.status)
      );
    }

    // Применяем фильтр по типу задачи
    if (selectedJobTypes.length > 0) {
      filteredJobs = filteredJobs.filter((job) =>
        selectedJobTypes.includes(job.job_type)
      );
    }

    // Применяем фильтр по запланированным задачам
    if (isScheduledFilter) {
      filteredJobs = filteredJobs.filter((job) => job.is_scheduled);
    }

    setJobs(filteredJobs);
  };

  // Обработчики для фильтров
  const handleStatusChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedStatuses(typeof value === "string" ? value.split(",") : value);
  };

  const handleJobTypeChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedJobTypes(typeof value === "string" ? value.split(",") : value);
  };

  const handleIsScheduledChange = (event) => {
    setIsScheduledFilter(event.target.checked);
  };

  const resetFilters = () => {
    setSelectedStatuses([]);
    setSelectedJobTypes([]);
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

  const formatJobName = (jobName) => {
    if (!jobName || typeof jobName !== "string") return "N/A";
    if (jobName.length <= 8) {
      return jobName;
    } else {
      const firstFour = jobName.substring(0, 4);
      return `${firstFour}***`;
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

  const handleLogsClick = (job) => {
    // Получаем логи для задачи и открываем диалог
    setLogsLoading(true);
    setCurrentJobName(job.job_name || "N/A");

    if (useMockData) {
      // Используем моковые логи
      setTimeout(() => {
        setCurrentLogs(`Логи для задачи ${job.job_name} (ID: ${job.id})`);
        setLogsLoading(false);
        setLogsModalOpen(true);
      }, 1000);
    } else {
      axiosInstance
        .get(`/jobs/${job.id}/logs`)
        .then((response) => {
          const logs = response.data.logs || "Логи отсутствуют.";
          setCurrentLogs(logs);
        })
        .catch((error) => {
          console.error(
            `Ошибка при получении логов для задачи ${job.id}:`,
            error
          );
          setCurrentLogs("Ошибка при получении логов.");
        })
        .finally(() => {
          setLogsLoading(false);
          setLogsModalOpen(true);
        });
    }
  };

  const handleStopClick = (job) => {
    console.log("Остановить задачу:", job);
    // Реализация остановки задачи
  };

  const handleBuildLogsClick = (job) => {
    // Получаем build logs для задачи и открываем диалог
    setLogsLoading(true);
    setCurrentJobName(job.job_name || "N/A");

    if (useMockData) {
      // Используем моковые логи сборки
      setTimeout(() => {
        setCurrentLogs(`Build Logs для задачи ${job.job_name} (ID: ${job.id})`);
        setLogsLoading(false);
        setLogsModalOpen(true);
      }, 1000);
    } else {
      axiosInstance
        .get(`/jobs/${job.id}/build-logs`)
        .then((response) => {
          const logs = response.data.logs || "Логи отсутствуют.";
          setCurrentLogs(logs);
        })
        .catch((error) => {
          console.error(
            `Ошибка при получении build logs для задачи ${job.id}:`,
            error
          );
          setCurrentLogs("Ошибка при получении логов сборки.");
        })
        .finally(() => {
          setLogsLoading(false);
          setLogsModalOpen(true);
        });
    }
  };

  const handleExecutionsClick = (job) => {
    // Получаем запуски для задачи и открываем диалог
    setExecutionsLoading(true);
    setCurrentJobName(job.job_name || "N/A");
    setCurrentJobId(job.id || job.job_id || "");

    if (useMockData) {
      // Используем моковые данные
      setTimeout(() => {
        setCurrentExecutions(mockExecutions);
        setExecutionsLoading(false);
        setExecutionsModalOpen(true);
      }, 1000);
    } else {
      // Используем корректный эндпоинт для получения запусков задачи
      const endpoint = `/jobs/${currentOrganization.id}/${job.id}/executions`;

      axiosInstance
        .get(endpoint)
        .then((response) => {
          const executions = response.data || [];
          setCurrentExecutions(executions);
        })
        .catch((error) => {
          console.error(
            `Ошибка при получении executions для задачи ${job.id}:`,
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
      // Запрос к API для получения расписания задачи
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
    // Реализация скачивания артефактов

    if (useMockData) {
      alert(`Скачивание артефактов для задачи ${job.job_name} (ID: ${job.id})`);
    } else {
      // Реальный запрос для скачивания артефактов
      axiosInstance
        .get(`/jobs/${job.id}/artifacts`, {
          responseType: "blob", // Ожидаем файл в ответе
        })
        .then((response) => {
          // Создаем ссылку для скачивания файла
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          // Предполагаем, что в заголовках ответа есть имя файла
          const contentDisposition = response.headers["content-disposition"];
          let fileName = "artifacts.zip";
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
          }
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.error(
            `Ошибка при скачивании артефактов для задачи ${job.id}:`,
            error
          );
          alert("Ошибка при скачивании артефактов.");
        });
    }
  };

  const getStatusIndicator = (status) => {
    const creatingStatuses = ["creating", "pending", "provisioning"];
    const stoppedStatuses = ["stopped", "failed", "completed", "terminated"];

    if (creatingStatuses.includes(status)) {
      return <CircularProgress size={16} sx={{ ml: 1 }} />;
    } else if (status === "running") {
      return (
        <FiberManualRecordIcon sx={{ color: "green", fontSize: 16, ml: 1 }} />
      );
    } else if (stoppedStatuses.includes(status)) {
      return (
        <FiberManualRecordIcon sx={{ color: "red", fontSize: 16, ml: 1 }} />
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

  // Переименованные заголовки столбцов
  const fixedColumns = [
    { field: "job_id", headerName: "ID" },
    { field: "gpu_type", headerName: "Тип GPU" },
  ];

  const dynamicColumns = [
    { field: "job_name", headerName: "Имя" },
    { field: "job_type", headerName: "Тип" },
    { field: "created_at", headerName: "Создана" },
    { field: "status", headerName: "Статус" },
    { field: "start_time", headerName: "Начало" },
    { field: "build_status", headerName: "Статус сборки" },
    { field: "last_execution_status", headerName: "Статус последнего запуска" },
    {
      field: "last_execution_start_time",
      headerName: "Начало последнего запуска",
    },
    {
      field: "last_execution_end_time",
      headerName: "Окончание последнего запуска",
    },
    // Добавьте другие колонки по необходимости
  ];

  const availableDynamicColumns = dynamicColumns.filter((column) =>
    jobs.some(
      (job) =>
        job[column.field] !== undefined &&
        job[column.field] !== null &&
        job[column.field] !== ""
    )
  );

  const columnsToDisplay =
    availableDynamicColumns.length > 0
      ? [fixedColumns[0], ...availableDynamicColumns, fixedColumns[1]]
      : [fixedColumns[0], ...dynamicColumns, fixedColumns[1]];

  const renderCellContent = (job, field) => {
    const value = job[field];
    switch (field) {
      case "job_id":
        const jobId = value || job.id || "N/A";
        const fullJobId = value || job.id || "";
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {formatJobId(jobId)}
            {fullJobId && (
              <Tooltip title="Скопировать ID">
                <IconButton size="small" onClick={() => handleCopy(fullJobId)}>
                  <ContentCopyIcon sx={{ fontSize: "1rem" }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      case "job_name":
        const jobName = value || "N/A";
        const formattedJobName = formatJobName(jobName);
        return (
          <Tooltip title={jobName}>
            <Typography>{formattedJobName}</Typography>
          </Tooltip>
        );
      case "status":
        return value || "N/A";
      case "job_type":
        return (
          <Typography
            sx={{
              padding: "3px 7px",
              borderRadius: "5px",
              backgroundColor: "#ff77004d",
              fontWeight: "bold",
              color:
                value === "deploy"
                  ? "blue"
                  : value === "run"
                  ? "green"
                  : "inherit",
            }}
          >
            {value || "N/A"}
          </Typography>
        );
      case "created_at":
      case "start_time":
      case "last_execution_start_time":
      case "last_execution_end_time":
        return value ? new Date(value).toLocaleString() : "N/A";
      case "build_status":
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {value || "N/A"}
            {value === "building" && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </Box>
        );
      case "gpu_type":
        return value
          ? typeof value === "string"
            ? value
            : value.type
            ? value.type
            : "N/A"
          : "N/A";
      default:
        return value || "N/A";
    }
  };

  return (
    <Box>
      {/* Заголовок и переключатель моковых данных */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontSize: { xs: "1.2rem", sm: "1.6rem" } }}
        >
          Задачи
        </Typography>
        {/* Переключатель между моковыми данными и реальными данными */}
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

      {/* Элементы управления фильтрами */}
      <Box sx={{ display: "flex", flexWrap: "wrap", mb: 2, gap: 2 }}>
        {/* Фильтр по статусу */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-label">Статус</InputLabel>
          <Select
            labelId="status-label"
            multiple
            value={selectedStatuses}
            onChange={handleStatusChange}
            input={<OutlinedInput label="Статус" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                <Checkbox checked={selectedStatuses.indexOf(status) > -1} />
                <ListItemText primary={status} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Фильтр по типу задачи */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="job-type-label">Тип задачи</InputLabel>
          <Select
            labelId="job-type-label"
            multiple
            value={selectedJobTypes}
            onChange={handleJobTypeChange}
            input={<OutlinedInput label="Тип задачи" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {jobTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                <Checkbox checked={selectedJobTypes.indexOf(type) > -1} />
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
          label="Запланировано"
        />
        {/* Кнопка сброса фильтров */}
        <Button variant="outlined" onClick={resetFilters}>
          Сбросить фильтры
        </Button>
      </Box>

      {/* Отображаем таблицу */}
      <TableContainer
        component={Paper}
        sx={{ boxShadow: "none", overflowX: "auto", width: "100%" }}
      >
        <Table>
          <TableHead
            sx={{
              "& .MuiTableCell-root": {
                padding: "5px",
                color: "black",
                textAlign: "center",
                height: "50px",
                width: "100px",
              },
            }}
          >
            <TableRow>
              {columnsToDisplay.map((column) => (
                <TableCell
                  key={column.field}
                  sx={{
                    width:
                      column.field === "job_id" || column.field === "gpu_type"
                        ? "100px"
                        : "100px",
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              {/* Добавляем пустую ячейку для индикатора статуса */}
              <TableCell sx={{ width: "50px", ml: 0 }}></TableCell>
              {/* Добавляем ячейку для значка расписания */}
              <TableCell sx={{ width: "50px", ml: 0 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              "& .MuiTableCell-root": {
                padding: "5px",
                color: "#6e6e80",
                textAlign: "center",
                height: "auto",
                width: "100px",
                borderBottom: "none",
              },
            }}
          >
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow
                  key={job.job_id || job.id || Math.random()}
                  sx={{
                    "&:not(:last-child)": {
                      borderBottom: "1px solid rgba(224, 224, 224, 1)",
                    },
                  }}
                >
                  <TableCell colSpan={columnsToDisplay.length + 2}>
                    {/* Объединяем все данные и кнопки действий в одну ячейку */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                      }}
                    >
                      {/* Строка данных задачи с индикатором статуса */}
                      <Box>
                        <Table>
                          <TableBody>
                            <TableRow>
                              {columnsToDisplay.map((column) => (
                                <TableCell
                                  key={column.field}
                                  sx={{
                                    padding: "5px",
                                    color: "#6e6e80",
                                    textAlign: "center",
                                    borderBottom: "none",
                                  }}
                                >
                                  {renderCellContent(job, column.field)}
                                </TableCell>
                              ))}
                              {/* Индикатор статуса задачи */}
                              <TableCell>
                                {getStatusIndicator(job.status)}
                              </TableCell>
                              {/* Значок расписания, если задача запланирована */}
                              <TableCell>
                                {job.is_scheduled && (
                                  <Tooltip title="Запланированная задача">
                                    <CalendarIcon sx={{ color: "blue", fontSize:'1.2rem' }} />
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Box>
                      {/* Контейнер для URL и кнопок действий */}
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          mt: 1,
                          mb: 0.5,
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* Левая часть с URL */}
                        {job.job_type === "deploy" && job.url && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 1,
                            }}
                          >
                            <Tooltip title="Скопировать URL">
                              <Typography
                                variant="body2"
                                sx={{
                                  mr: 1,
                                  padding: "5px 10px",
                                  borderRadius: "5px",
                                  backgroundColor: "#1976d2",
                                  color: "white",
                                  cursor: "pointer",
                                  wordBreak: "break-all",
                                  "&:hover": {
                                    backgroundColor: "#1565c0",
                                  },
                                }}
                                onClick={() => handleCopy(job.url)}
                              >
                                {job.url}
                              </Typography>
                            </Tooltip>
                          </Box>
                        )}
                        {/* Правая часть с кнопками */}
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            ml: "auto",
                          }}
                        >
                          {job.is_scheduled && (
                            <Button
                              variant="outlined"
                              sx={{ mr: 1, mb: 1, padding: "5px 7px", }}
                              onClick={() => handleScheduleClick(job)}
                            >
                              Расписание
                            </Button>
                          )}
                          {(job.build_status === "failed" ||
                            job.build_status === "building") && (
                            <Button
                              variant="outlined"
                              sx={{ mr: 1, mb: 1, padding: "5px 7px", }}
                              onClick={() => handleBuildLogsClick(job)}
                            >
                              Build Logs
                            </Button>
                          )}

                          {/* Кнопка "Запуски" */}
                          <Button
                            variant="outlined"
                            sx={{ mr: 1, mb: 1, padding: "5px 7px", }}
                            onClick={() => handleExecutionsClick(job)}
                          >
                            Запуски
                          </Button>

                          {/* Кнопка "Скачать артефакты" */}
                          {job.job_type === "run" && job.status === "completed" && (
                            <Button
                              variant="outlined"
                              sx={{
                                mr: 1,
                                mb: 1,
                                padding: "5px 7px",
                              }}
                              onClick={() => handleDownloadArtifacts(job)}
                            >
                              Скачать артефакты
                            </Button>
                          )}

                          <Button
                            variant="outlined"
                            sx={{
                              mr: 1,
                              mb: 1,
                              padding: "5px 7px",
                              border: "1px solid #5282ff",
                            }}
                            onClick={() => handleLogsClick(job)}
                          >
                            Логи
                          </Button>
                          {(job.status === "creating" ||
                            job.status === "running") && (
                            <Button
                              variant="contained"
                              sx={{
                                ml: 1,
                                mr: 1,
                                mb: 1,
                                backgroundColor: "inherit",
                                boxShadow: "none",
                                border: "1px solid #5282ff",
                                padding:'5px 7px'
                              }}
                              onClick={() => handleStopClick(job)}
                            >
                              <StopCircleIcon
                                sx={{ fontSize: "20px", color: "#5282ff" }}
                              />
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Если нет задач, отображаем одну строку с N/A
              <TableRow>
                <TableCell colSpan={columnsToDisplay.length + 2}>N/A</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
                {new Date(currentScheduleData.start_date).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Конец:</strong>{" "}
                {new Date(currentScheduleData.end_date).toLocaleString()}
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

      {/* Диалоговое окно логов */}
      <Dialog
        open={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Логи задачи: ${currentJobName}`}</DialogTitle>
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

      {/* Диалоговое окно Запусков */}
      <Dialog
        open={executionsModalOpen}
        onClose={() => setExecutionsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Запуски задачи: ${currentJobName}`}</DialogTitle>
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
            // Отображаем таблицу запусков
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID запуска</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Начало</TableCell>
                  <TableCell>Окончание</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentExecutions.map((execution) => (
                  <TableRow key={execution.execution_id}>
                    <TableCell>{execution.execution_id}</TableCell>
                    <TableCell>{execution.status}</TableCell>
                    <TableCell>
                      {execution.start_time
                        ? new Date(execution.start_time).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {execution.end_time
                        ? new Date(execution.end_time).toLocaleString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>Нет доступных запусков для этой задачи.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecutionsModalOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Tasks;