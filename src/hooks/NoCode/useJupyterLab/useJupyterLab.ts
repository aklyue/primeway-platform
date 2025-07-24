import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../../api";
import { AVAILABLE_GPUS } from "../../../constants/AVAILABLE_GPUS";
import { Organization } from "../../../store/slices/authSlice";
import { JupyterSession } from "../../../types";
import { SnackbarCloseReason } from "@mui/material";
import axios from "axios";

interface useJupyterLabProps {
  currentOrganization: Organization | null;
  authToken: string | null;
}

export const useJupyterLab = ({
  currentOrganization,
  authToken,
}: useJupyterLabProps) => {
  const [sessions, setSessions] = useState<JupyterSession[]>([]);
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [selectedGpu, setSelectedGpu] = useState<string>("");
  const [diskSpace, setDiskSpace] = useState<number | string>(20);
  const [jobName, setJobName] = useState<string>(""); // Для имени задачи
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [gpuQuantity, setGpuQuantity] = useState<number | string>(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "info" | "warning"
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleSnackbarClose = (
    event: React.SyntheticEvent<Element, Event> | Event,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const handleAlertClose = (_event: React.SyntheticEvent<Element, Event>) => {
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const availableGpus = (
    Object.keys(AVAILABLE_GPUS) as (keyof typeof AVAILABLE_GPUS)[]
  ).map((gpuKey) => {
    const { name, ...rest } = AVAILABLE_GPUS[gpuKey];
    return {
      id: gpuKey,
      name,
      ...rest,
    };
  });

  const refreshSessions = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        "/jupyter/get-jupyter-projects",
        {
          params: {
            organization_id: currentOrganization?.id,
          },
        }
      );
      setSessions(response.data); // Обновляем список сессий
    } catch (error) {
      console.error("Ошибка при получении проектов:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization?.id]);

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
            count: parseInt(gpuQuantity.toString(), 10),
          },
        ],
        disk_space: parseInt(diskSpace.toString(), 10),
        min_gpu_count: 0,
        max_gpu_count: 1,
      })
    );
    formData.append("organization_id", String(currentOrganization?.id));

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
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "Error creating session:",
          error.response?.data || error.message
        );
      }
      setSnackbar({
        open: true,
        message: "Ошибка при создании проекта",
        severity: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartSession = async (jobId: string) => {
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

  const handleStopSession = async (jobId: string) => {
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
    handleAlertClose,
  };
};
