import { useEffect, useState } from "react";
import axiosInstance from "../../../api";
import { AVAILABLE_GPUS } from "../../../constants/AVAILABLE_GPUS";
import { useNavigate } from "react-router-dom";

export const useTabby = ({ currentOrganization, authToken }) => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedGpu, setSelectedGpu] = useState("");
  const [diskSpace, setDiskSpace] = useState(20);
  const [jobName, setJobName] = useState("");
  const [gpuQuantity, setGpuQuantity] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const DEFAULT_INFERENCE_MODEL_NAME = "Qwen/Qwen2.5-Coder-7B-Instruct";
  const DEFAULT_EMBEDDING_MODEL_NAME = "Qwen/Qwen3-Embedding-0.6B";

  const DEFAULT_INFERENCE_MODEL = {
    job_name: "Qwen/Qwen2.5-Coder-7B-Instruct-deploy",
    port: 8000,
    disk_space: 78,
    health_check_timeout: 600,
    autoscaler_timeout: 600,
    gpu_types: [{ type: "A40", count: 1 }],
  };

  const DEFAULT_EMBEDDING_MODEL = {
    job_name: "Qwen/Qwen3-Embedding-0.6B-deploy",
    port: 80,
    disk_space: 30,
    health_check_timeout: 600,
    autoscaler_timeout: 600,
    gpu_types: [{ type: "RTX 2000 Ada", count: 1 }],
  };

  const DEFAULT_EMBEDDING_ARGS = [
    { key: "task", value: "embed" },
    { key: "dtype", value: "float16" },
  ];
  const DEFAULT_INFERENCE_ARGS = [];
  const DEFAULT_FLAGS = [];

  const [inferenceModelName, setInferenceModelName] = useState(
    DEFAULT_INFERENCE_MODEL_NAME
  );
  const [embeddingModelName, setEmbeddingModelName] = useState(
    DEFAULT_EMBEDDING_MODEL_NAME
  );

  const [inferenceModel, setInferenceModel] = useState(DEFAULT_INFERENCE_MODEL);
  const [embeddingModel, setEmbeddingModel] = useState(DEFAULT_EMBEDDING_MODEL);

  const [inferenceArgs, setInferenceArgs] = useState(DEFAULT_INFERENCE_ARGS);
  const [inferenceFlags, setInferenceFlags] = useState(DEFAULT_FLAGS);

  const [embeddingArgs, setEmbeddingArgs] = useState(DEFAULT_EMBEDDING_ARGS);
  const [embeddingFlags, setEmbeddingFlags] = useState(DEFAULT_FLAGS);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const availableGpus = Object.keys(AVAILABLE_GPUS).map((gpuKey) => ({
    id: gpuKey,
    name: AVAILABLE_GPUS[gpuKey].name,
    ...AVAILABLE_GPUS[gpuKey],
  }));

  const refreshSessions = async () => {
    try {
      const response = await axiosInstance.get("/tabby/instances", {
        params: { organization_id: currentOrganization.id },
      });
      setSessions(response.data);
    } catch (error) {
      console.error("Ошибка при получении проектов Tabby:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSessions();
    const intervalId = setInterval(refreshSessions, 3000);
    return () => clearInterval(intervalId);
  }, [currentOrganization]);

  const handleCreateSession = async () => {
    if (!jobName || !inferenceModel || !embeddingModel) {
      alert("Заполните все поля и настройте обе модели");
      return;
    }

    setIsCreating(true);

    const payload = {
      tabby_job_name: jobName,
      job_id: "",
      inferenceModel,
      embeddingModel,
      organization_id: currentOrganization?.id,
    };

    console.log(payload);

    try {
      await axiosInstance.post("/tabby/start", payload, {
        headers: { "Content-Type": "application/json" },
      });

      // refreshSessions();
      navigate("/tabby");
      setSnackbar({
        open: true,
        message: "Tabby-проект создан",
        severity: "success",
      });
    } catch (error) {
      console.error("Ошибка при создании Tabby-проекта:", error);
      setSnackbar({
        open: true,
        message: "Ошибка при создании Tabby-проекта",
        severity: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartSession = async (inferenceJobId, embeddingJobId) => {
    if (!inferenceJobId && !embeddingJobId) {
      return setSnackbar({
        open: true,
        message: "ID задачи отсутствует",
        severity: "error",
      });
    }

    setLoadingId(embeddingJobId ?? inferenceJobId);
    try {
      if (inferenceJobId) {
        await axiosInstance.post("/jobs/job-start", null, {
          params: { job_id: inferenceJobId },
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
      if (embeddingJobId) {
        await axiosInstance.post("/jobs/job-start", null, {
          params: { job_id: embeddingJobId },
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
      refreshSessions();
      setSnackbar({
        open: true,
        message: "Задача запущена",
        severity: "success",
      });
    } catch (error) {
      console.error("Ошибка при запуске:", error.response?.data || error);
      setSnackbar({
        open: true,
        message: "Ошибка при запуске задачи",
        severity: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleStopSession = async (inferenceJobId, embeddingJobId) => {
    if (!inferenceJobId && !embeddingJobId) {
      return setSnackbar({
        open: true,
        message: "ID задачи отсутствует",
        severity: "error",
      });
    }

    setLoadingId(embeddingJobId ?? inferenceJobId);
    try {
      await axiosInstance.post("/jobs/job-stop", null, {
        params: { job_id: inferenceJobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      await axiosInstance.post("/jobs/job-stop", null, {
        params: { job_id: embeddingJobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      refreshSessions();
      setSnackbar({
        open: true,
        message: "Задача остановлена",
        severity: "success",
      });
    } catch (error) {
      console.error("Ошибка при остановке:", error);
      setSnackbar({
        open: true,
        message: "Ошибка при остановке задачи",
        severity: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return {
    setOpenCreateModal,
    openCreateModal,
    sessions,
    loadingId,
    handleStartSession,
    handleStopSession,
    jobName,
    setJobName,
    selectedGpu,
    setSelectedGpu,
    isCreating,
    availableGpus,
    diskSpace,
    setDiskSpace,
    gpuQuantity,
    setGpuQuantity,
    inferenceModel,
    setInferenceModel,
    embeddingModel,
    setEmbeddingModel,
    handleCreateSession,
    snackbar,
    handleSnackbarClose,
    isLoading,
    // flags and args
    embeddingArgs,
    setEmbeddingArgs,
    embeddingFlags,
    setEmbeddingFlags,
    inferenceArgs,
    setInferenceArgs,
    inferenceFlags,
    setInferenceFlags,
    //modelName
    inferenceModelName,
    setInferenceModelName,
    embeddingModelName,
    setEmbeddingModelName,
  };
};
