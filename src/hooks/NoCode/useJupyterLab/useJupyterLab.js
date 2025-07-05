import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../../api";
import { AVAILABLE_GPUS } from "../../../constants/AVAILABLE_GPUS";

export const useJupyterLab = ({ currentOrganization, authToken }) => {
  const [sessions, setSessions] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedGpu, setSelectedGpu] = useState("");
  const [diskSpace, setDiskSpace] = useState(20);
  const [jobName, setJobName] = useState(""); // Для имени задачи
  const [isCreating, setIsCreating] = useState(false);
  const [gpuQuantity, setGpuQuantity] = useState(1);
  const [loadingId, setLoadingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "info" | "warning"
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const availableGpus = Object.keys(AVAILABLE_GPUS).map((gpuKey) => ({
    id: gpuKey,
    name: AVAILABLE_GPUS[gpuKey].name, // Добавляем поле name
    ...AVAILABLE_GPUS[gpuKey],
  }));

  const refreshSessions = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        "/jupyter/get-jupyter-projects",
        {
          params: {
            organization_id: currentOrganization.id,
          },
        }
      );
      setSessions(response.data); // Обновляем список сессий
    } catch (error) {
      console.error("Ошибка при получении проектов:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization.id]);

  useEffect(() => {
    refreshSessions();
    const intervalId = setInterval(refreshSessions, 3000);
    return () => clearInterval(intervalId);
  }, [currentOrganization]);

  const handleCreateSession = async () => {
    if (!selectedGpu || !jobName) {
      alert("Please select GPU type and provide job name");
      return;
    }

    setIsCreating(true);

    const formData = new FormData();
    formData.append(
      "config_str",
      JSON.stringify({
        job_type: "run", // <-- ОБЯЗАТЕЛЬНО
        job_name: jobName,
        gpu_types: [
          {
            type: selectedGpu,
            count: parseInt(gpuQuantity),
          },
        ],
        disk_space: parseInt(diskSpace),
        min_gpu_count: 0,
        max_gpu_count: 1,
      })
    );
    formData.append("organization_id", String(currentOrganization.id));

    try {
      const response = await axiosInstance.post("/jupyter/run", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      refreshSessions();
      setOpenCreateModal(false);
      setSnackbar({
        open: true,
        message: "Сессия создана",
        severity: "success",
      });
    } catch (error) {
      console.error(
        "Error creating session:",
        error.response?.data || error.message
      );
      setSnackbar({
        open: true,
        message: "Ошибка при создании проекта",
        severity: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartSession = async (jobId) => {
    if (!jobId)
      return setSnackbar({
        open: true,
        message: "ID задачи отсутствует",
        severity: "error",
      });

    setLoadingId(jobId);
    try {
      await axiosInstance.post("/jobs/job-start", null, {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setSnackbar({
        open: true,
        message: "Задача запущена",
        severity: "success",
      });
      refreshSessions();
    } catch (e) {
      console.error(e);
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
    if (!jobId)
      return setSnackbar({
        open: true,
        message: "ID задачи отсутствует",
        severity: "error",
      });

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
    } catch (e) {
      console.error("Ошибка при остановке:", e);
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
    handleCreateSession,
    snackbar,
    handleSnackbarClose,
    isLoading,
  };
};
