import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../../api";
import { AVAILABLE_GPUS } from "../../../constants/AVAILABLE_GPUS";
import { useNavigate } from "react-router-dom";

import { Organization } from "../../../store/slices/authSlice";
import { SnackbarCloseReason } from "@mui/material";
import axios from "axios";
import { AdditionalFields, Model, TabbySession } from "../../../types";

interface useTabbyProps {
  currentOrganization: Organization | null;
  authToken: string | null;
}

type SnackbarSeverity = "success" | "error" | "info" | "warning";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

export const useTabby = ({ currentOrganization, authToken }: useTabbyProps) => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<TabbySession[]>([]);
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [selectedGpu, setSelectedGpu] = useState<string>("");
  const [diskSpace, setDiskSpace] = useState<number | string>(20);
  const [jobName, setJobName] = useState<string>("qwen");
  const [gpuQuantity, setGpuQuantity] = useState<number | string>(1);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const DEFAULT_INFERENCE_MODEL_NAME = "Qwen/Qwen2.5-Coder-7B-Instruct";
  const DEFAULT_EMBEDDING_MODEL_NAME = "Qwen/Qwen3-Embedding-0.6B";

  const DEFAULT_EMBEDDING_ARGS = [
    { key: "task", value: "embed" },
    { key: "dtype", value: "float16" },
  ];
  const DEFAULT_INFERENCE_ARGS: AdditionalFields[] = [{ key: "", value: "" }];
  const DEFAULT_FLAGS = [{ key: "", value: "" }];

  const DEFAULT_INFERENCE_MODEL: Model = {
    modelName: DEFAULT_INFERENCE_MODEL_NAME,
    args: DEFAULT_INFERENCE_ARGS as AdditionalFields[],
    flags: DEFAULT_FLAGS as AdditionalFields[],
    modelConfig: {
      job_name: "Qwen/Qwen2.5-Coder-7B-Instruct-deploy",
      port: 8000,
      disk_space: 78,
      health_check_timeout: 600,
      autoscaler_timeout: 600,
      gpu_types: [{ type: "A40" as const, count: 1 }],
      min_gpu_count: 0,
      max_gpu_count: 1,
      max_requests: 10,
    },
  };

  const DEFAULT_EMBEDDING_MODEL: Model = {
    modelName: DEFAULT_EMBEDDING_MODEL_NAME,
    args: DEFAULT_EMBEDDING_ARGS as AdditionalFields[],
    flags: DEFAULT_FLAGS as AdditionalFields[],
    modelConfig: {
      job_name: "Qwen/Qwen3-Embedding-0.6B-deploy",
      port: 80,
      disk_space: 30,
      health_check_timeout: 600,
      autoscaler_timeout: 600,
      gpu_types: [{ type: "RTX 2000 Ada" as const, count: 1 }],
      min_gpu_count: 0,
      max_gpu_count: 1,
      max_requests: 10,
    },
  };

  const [inferenceModelName, setInferenceModelName] = useState<string>(
    DEFAULT_INFERENCE_MODEL_NAME
  );
  const [embeddingModelName, setEmbeddingModelName] = useState<string>(
    DEFAULT_EMBEDDING_MODEL_NAME
  );

  const [inferenceModel, setInferenceModel] = useState<Model>(
    DEFAULT_INFERENCE_MODEL
  );
  const [embeddingModel, setEmbeddingModel] = useState<Model>(
    DEFAULT_EMBEDDING_MODEL
  );

  const [inferenceArgs, setInferenceArgs] = useState<AdditionalFields[]>(
    DEFAULT_INFERENCE_ARGS
  );
  const [inferenceFlags, setInferenceFlags] =
    useState<AdditionalFields[]>(DEFAULT_FLAGS);

  const [embeddingArgs, setEmbeddingArgs] = useState<AdditionalFields[]>(
    DEFAULT_EMBEDDING_ARGS
  );
  const [embeddingFlags, setEmbeddingFlags] =
    useState<AdditionalFields[]>(DEFAULT_FLAGS);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const handleAlertClose = (_event: React.SyntheticEvent) => {
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
      if (currentOrganization) {
        const response = await axiosInstance.get("/tabby/instances", {
          params: { organization_id: currentOrganization.id },
        });
        setSessions(response.data);
      }
    } catch (error) {
      console.error("Ошибка при получении проектов Tabby:", error);
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

    try {
      await axiosInstance.post("/tabby/start", payload, {
        headers: { "Content-Type": "application/json" },
      });

      refreshSessions();
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

  const handleStartSession = async (id: string) => {
    if (!id) {
      return setSnackbar({
        open: true,
        message: "ID задачи отсутствует",
        severity: "error",
      });
    }

    setLoadingId(id);
    try {
      if (id) {
        await axiosInstance.post("/tabby/job-start", null, {
          params: { tabby_id: id },
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
      if (axios.isAxiosError(error) && error.response)
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

  const handleStopSession = async (id: string) => {
    if (!id) {
      return setSnackbar({
        open: true,
        message: "ID задачи отсутствует",
        severity: "error",
      });
    }

    setLoadingId(id);
    try {
      await axiosInstance.post("/tabby/job-stop", null, {
        params: { tabby_id: id },
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
    handleAlertClose,
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
