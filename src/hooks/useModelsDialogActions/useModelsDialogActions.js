import { ru } from "date-fns/locale";
import axiosInstance from "../../api";
import { format, parseISO } from "date-fns";
import yaml from "js-yaml";
import { useEffect, useRef, useState } from "react";

export const useModelsDialogActions = ({ authToken, open, onClose, model }) => {
  // Состояния
  const [jobDetails, setJobDetails] = useState({ ...model });
  const [configLoading, setConfigLoading] = useState(true);
  const [config, setConfig] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [activeTab, setActiveTab] = useState("events");
  const [jobStatus, setJobStatus] = useState(
    model.last_execution_status || model.created
  );
  const [modelStatus, setModelStatus] = useState(model?.last_execution_status);

  // Состояния для выполнений
  const [executions, setExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(true);
  const [executionsError, setExecutionsError] = useState(null);
  const initialExecutionsLoadRef = useRef(true);

  // Состояния для логов
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  // Состояния для логов сборки
  const [buildLogsModalOpen, setBuildLogsModalOpen] = useState(false);
  const [buildLogsLoading, setBuildLogsLoading] = useState(false);

  const job_id = model.job_id;

  // Функция форматирования даты и времени
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

  // Функция для отображения оповещений
  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showAlert("Скопировано в буфер обмена.");
  };

  // Функция для получения списка выполнений задачи
  const fetchExecutions = async () => {
    if (initialExecutionsLoadRef.current) {
      setExecutionsLoading(true);
    }
    setExecutionsError(null);
    try {
      const response = await axiosInstance.get("/jobs/executions", {
        params: { job_id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data || [];

      // Сортируем выполнения по дате создания в порядке убывания
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setExecutions(sortedData);

      // Обновляем статус задачи на основе последнего выполнения
      if (sortedData.length > 0) {
        const latestExecution = sortedData[0];
        setJobStatus(latestExecution.status);
      } else {
        setJobStatus("No executions found");
      }
    } catch (error) {
      console.error("Ошибка при получении выполнений:", error);
      setExecutionsError("Ошибка при загрузке выполнений");
      showAlert("Ошибка при получении выполнений задачи.", "error");
    } finally {
      if (initialExecutionsLoadRef.current) {
        setExecutionsLoading(false);
        initialExecutionsLoadRef.current = false;
      }
    }
  };

  const handleStartModel = async () => {
    try {
      await axiosInstance.post("/jobs/job-start", null, {
        params: { job_id: model.job_id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showAlert("Модель успешно запущена.", "success");
      setModelStatus("running");
    } catch (error) {
      console.error("Ошибка при запуске модели:", error);
      showAlert("Ошибка при запуске модели.", "error");
    }
  };

  const handleStopModel = async () => {
    try {
      await axiosInstance.post("/jobs/job-stop", null, {
        params: { job_id: model.job_id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showAlert("Модель успешно остановлена.", "success");
      setModelStatus("stopped");
    } catch (error) {
      console.error("Ошибка при остановке модели:", error);
      showAlert("Ошибка при остановке модели.", "error");
    }
  };

  // Функция для загрузки конфигурации
  const fetchConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await axiosInstance.get("/jobs/get-config", {
        params: { job_id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // Конвертируем конфигурацию в YAML
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

  // Получение данных при открытии диалога
  useEffect(() => {
    if (open && job_id) {
      fetchExecutions();
      fetchConfig();
    } else {
      setConfig("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, job_id]);

  // Обработка закрытия оповещения
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handleStartJob = async () => {
    try {
      await axiosInstance.post("/jobs/job-start", null, {
        params: { job_id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showAlert("Задача успешно запущена.", "success");
      setJobStatus("running");
      fetchExecutions(); // Обновляем выполнения
    } catch (error) {
      console.error("Ошибка при запуске задачи:", error);
      showAlert("Ошибка при запуске задачи.", "error");
    }
  };

  const handleStopJob = async (job) => {
    try {
      const executionId = job.job_execution_id || job.last_execution_id;
      const params = executionId
        ? { job_execution_id: executionId }
        : { job_id: job_id };

      await axiosInstance.post("/jobs/job-stop", null, {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showAlert("Задача успешно остановлена.", "success");
      setJobStatus("stopped");
      fetchExecutions(); // Обновляем выполнения
    } catch (error) {
      console.error("Ошибка при остановке задачи:", error);
      showAlert("Ошибка при остановке задачи.", "error");
    }
  };

  // Функция для получения логов выполнения задачи
  const handleLogsClick = async (execution = null) => {
    setLogsModalOpen(true);
    setLogsLoading(true);
    setCurrentLogs(""); // Сбрасываем предыдущие логи

    try {
      let params = {};

      if (execution && execution.job_execution_id) {
        params.job_execution_id = execution.job_execution_id;
      } else if (job_id) {
        params.job_id = job_id;
      } else {
        setCurrentLogs("Идентификатор задачи отсутствует.");
        setLogsLoading(false);
        return;
      }

      const response = await axiosInstance.get("/jobs/job-logs", {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const logs = response.data.logs || "Логи отсутствуют.";
      setCurrentLogs(logs);
    } catch (error) {
      console.error("Ошибка при получении логов задачи:", error);
      const errorMessage =
        error.response?.data?.detail || "Ошибка при получении логов задачи.";
      setCurrentLogs(errorMessage);
    } finally {
      setLogsLoading(false);
    }
  };

  // Функция для скачивания артефактов
  const handleDownloadArtifacts = async (job, execution = null) => {
    // Показываем Snackbar
    showAlert("Скачивание артефактов началось...", "info");

    // Проверяем, что задача имеет тип "run"
    if (job.job_type !== "run") {
      showAlert("Артефакты доступны только для задач типа 'run'.", "error");
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
      showAlert("Не указан идентификатор задачи или выполнения.", "error");
      return;
    }

    try {
      const response = await axiosInstance.get("/jobs/get-job-artifacts", {
        params: params,
        responseType: "blob",
        headers: { Authorization: `Bearer ${authToken}` },
      });

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
    } catch (error) {
      console.error(
        `Ошибка при скачивании артефактов для задачи ${job.job_id}:`,
        error
      );
      const errorMessage =
        error.response?.data?.detail || "Ошибка при скачивании артефактов.";
      showAlert(errorMessage, "error");
    }
  };

  // Функция для форматирования идентификатора выполнения
  const formatJobExecutionId = (id) => {
    if (!id) return "N/A";
    return id.length > 12 ? `${id.slice(0, 3)}**${id.slice(-3)}` : id;
  };
  return {
    jobDetails,
    formatDateTime,
    handleLogsClick,
    handleCopy,
    handleStartModel,
    modelStatus,
    handleStopModel,
    executionsLoading,
    executionsError,
    executions,
    handleDownloadArtifacts,
    handleStopJob,
    setActiveTab,
    activeTab,
    configLoading,
    config,
    job_id,
    logsModalOpen,
    setLogsModalOpen,
    logsLoading,
    currentLogs,
    buildLogsModalOpen,
    buildLogsLoading,
    setBuildLogsModalOpen,
    alertOpen,
    setAlertOpen,
    alertSeverity,
    alertMessage,
    formatJobExecutionId,
  };
};
