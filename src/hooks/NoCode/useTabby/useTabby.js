import { useEffect, useState } from "react";
import axiosInstance from "../../../api";
import { AVAILABLE_GPUS } from "../../../constants";

export const useTabby = ({ currentOrganization, authToken }) => {
  const [sessions, setSessions] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedGpu, setSelectedGpu] = useState("");
  const [diskSpace, setDiskSpace] = useState(20);
  const [jobName, setJobName] = useState("");
  const [gpuQuantity, setGpuQuantity] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const [inferenceModelName, setInferenceModelName] = useState("");
  const [embeddingModelName, setEmbeddingModelName] = useState("");

  const [inferenceModel, setInferenceModel] = useState({});
  const [embeddingModel, setEmbeddingModel] = useState({});

  const [inferenceArgs, setInferenceArgs] = useState([]);
  const [inferenceFlags, setInferenceFlags] = useState([]);

  const [embeddingArgs, setEmbeddingArgs] = useState([]);
  const [embeddingFlags, setEmbeddingFlags] = useState([]);

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
      const response = await axiosInstance.get("/tabby/get-projects", {
        params: { organization_id: currentOrganization.id },
      });
      setSessions(response.data);
    } catch (error) {
      console.error("Ошибка при получении проектов Tabby:", error);
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
      job_type: "tabby_run",
      job_name: jobName,
      gpu_types: [
        {
          type: selectedGpu,
          count: parseInt(gpuQuantity),
        },
      ],
      disk_space: parseInt(diskSpace),
      inference_model: inferenceModel,
      embedding_model: embeddingModel,
    };

    const formData = new FormData();
    formData.append("config_str", JSON.stringify(payload));
    formData.append("organization_id", String(currentOrganization.id));

    try {
      await axiosInstance.post("/tabby/run", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      refreshSessions();
      setOpenCreateModal(false);
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

  const handleStartSession = async (jobId) => {
    if (!jobId) {
      return setSnackbar({
        open: true,
        message: "ID задачи отсутствует",
        severity: "error",
      });
    }

    setLoadingId(jobId);
    try {
      await axiosInstance.post("/jobs/job-start", null, {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      refreshSessions();
      setSnackbar({
        open: true,
        message: "Задача запущена",
        severity: "success",
      });
    } catch (error) {
      console.error("Ошибка при запуске:", error);
      setSnackbar({
        open: true,
        message: "Ошибка при запуске задачи",
        severity: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleStopSession = async (jobId) => {
    if (!jobId) {
      return setSnackbar({
        open: true,
        message: "ID задачи отсутствует",
        severity: "error",
      });
    }

    setLoadingId(jobId);
    try {
      await axiosInstance.post("/jobs/job-stop", null, {
        params: { job_id: jobId },
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
