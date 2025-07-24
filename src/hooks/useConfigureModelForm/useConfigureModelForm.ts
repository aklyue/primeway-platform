import { useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../../api";
import { useNavigate } from "react-router-dom";
import {
  Model,
  Schedule,
  SpecificDay,
  TimeWindow,
  VllmConfig,
} from "../../types";
import { Organization } from "../../store/slices/authSlice";
import { AdditionalFields, ModelConfig, GpuTypes, Env } from "../../types";
import axios from "axios";

interface useConfigureModelFormProps {
  initialConfig: Model;
  onClose: () => void;
  readOnlyModelName: boolean;
  authToken: string | null;
  currentOrganization: Organization | null;
  onFlagsChange?: (flags: AdditionalFields[]) => void;
  onArgsChange?: (args: AdditionalFields[]) => void;
  onModelConfigChange?: (modelConfig: ModelConfig) => void;
  onModelNameChange?: (name: string) => void;
  isFineTuned?: boolean;
  isEmbedding?: boolean;
}

export const useConfigureModelForm = ({
  initialConfig,
  onClose,
  readOnlyModelName,
  authToken,
  currentOrganization,
  onFlagsChange,
  onArgsChange,
  onModelConfigChange,
  onModelNameChange,
  isFineTuned,
  isEmbedding = false,
}: useConfigureModelFormProps) => {
  const [modelName, setModelName] = useState(initialConfig?.modelName || "");
  const navigate = useNavigate();

  const [args, setArgs] = useState(
    isFineTuned
      ? [{ key: "", value: "" }]
      : initialConfig?.args || [{ key: "", value: "" }]
  );

  const [flags, setFlags] = useState(
    isFineTuned
      ? [{ key: "", value: "" }]
      : initialConfig?.flags || [{ key: "", value: "True" }]
  );

  useEffect(() => {
    if (isEmbedding) {
      setArgs((prevArgs) => {
        const alreadyHasTask = prevArgs.some(
          (arg) => arg.key === "task" && arg.value === "embed"
        );
        return alreadyHasTask
          ? prevArgs
          : [{ key: "task", value: "embed" }, ...prevArgs];
      });
    }
  }, [isEmbedding]);

  const [modelConfig, setModelConfig] = useState(
    initialConfig?.modelConfig || {
      job_name: "",
      gpu_types: [{ type: "A40", count: 1 }],
      health_check_timeout: 3500,
      disk_space: 80,
      port: 8000,
      autoscaler_timeout: 600,
      env: [
        {
          name: "HUGGING_FACE_HUB_TOKEN",
          value: "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",
        },
      ],
      schedule: {
        workdays: [],
        weekends: [],
        specific_days: [],
      },
    }
  );

  const [loading, setLoading] = useState(false);

  // States for alerts
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<
    "info" | "error" | "success"
  >("info");
  const [alertMessage, setAlertMessage] = useState<string>("");

  const [modelNameError, setModelNameError] = useState<boolean>(false);
  const [deploymentNameError, setDeploymentNameError] =
    useState<boolean>(false);
  const [gpuTypesError, setGpuTypesError] = useState<boolean>(false);
  const [diskSpaceError, setDiskSpaceError] = useState<boolean>(false);

  const [modelNameErrorText, setModelNameErrorText] = useState<string>("");
  const [deploymentNameErrorText, setDeploymentNameErrorText] =
    useState<string>("");
  const [gpuTypesErrorText, setGpuTypesErrorText] = useState<string>("");
  const [diskSpaceErrorText, setDiskSpaceErrorText] = useState<string>("");

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModelName(e.target.value);
    if (e.target.value) {
      setModelNameError(false);
      setModelNameErrorText("");
    }
  };

  const handleDeploymentNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setModelConfig({
      ...modelConfig,
      job_name: e.target.value,
    });
    if (e.target.value) {
      setDeploymentNameError(false);
      setDeploymentNameErrorText("");
    }
  };

  const handleGpuTypeChange = <K extends keyof GpuTypes>(
    index: number,
    field: K,
    value: GpuTypes[K]
  ) => {
    const newGpuTypes = [...modelConfig.gpu_types];
    newGpuTypes[index] = {
      ...newGpuTypes[index],
      [field]: value,
    };
    setModelConfig({ ...modelConfig, gpu_types: newGpuTypes });

    if (value && field === "type") {
      setGpuTypesError(false);
      setGpuTypesErrorText("");
    }
  };

  const handleDiskSpaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModelConfig({ ...modelConfig, disk_space: e.target.value });
    if (e.target.value) {
      setDiskSpaceError(false);
      setDiskSpaceErrorText("");
    }
  };

  // Handlers for args
  const handleAddArg = () => {
    setArgs([...args, { key: "", value: "" }]);
  };

  const handleRemoveArg = (index: number) => {
    const newArgs = [...args];
    newArgs.splice(index, 1);
    setArgs(newArgs);
  };

  const handleArgChange = <K extends keyof AdditionalFields>(
    index: number,
    field: K,
    value: AdditionalFields[K]
  ) => {
    const newArgs = [...args];
    newArgs[index][field] = value;
    setArgs(newArgs);
  };

  // Handlers for flags
  const handleAddFlag = () => {
    setFlags([...flags, { key: "", value: "True" }]);
  };

  const handleRemoveFlag = (index: number) => {
    const newFlags = [...flags];
    newFlags.splice(index, 1);
    setFlags(newFlags);
  };

  const handleFlagChange = <K extends keyof AdditionalFields>(
    index: number,
    field: K,
    value: AdditionalFields[K]
  ) => {
    const newFlags = [...flags];
    newFlags[index][field] = value;
    setFlags(newFlags);
  };

  useEffect(() => {
    if (onFlagsChange) {
      onFlagsChange(flags);
    }
  }, [flags, onFlagsChange]);

  useEffect(() => {
    if (onArgsChange) {
      onArgsChange(args);
    }
  }, [args, onArgsChange]);

  // Handlers for environment variables
  const handleAddEnvVar = () => {
    setModelConfig({
      ...modelConfig,
      env: [...(modelConfig.env || []), { name: "", value: "" }],
    });
  };

  const handleRemoveEnvVar = (index: number) => {
    const newEnv = [...(modelConfig.env ?? [])];
    newEnv.splice(index, 1);
    setModelConfig({ ...modelConfig, env: newEnv });
  };

  const handleEnvVarChange = <K extends keyof Env>(
    index: number,
    field: K,
    value: Env[K]
  ) => {
    const newEnv = [...(modelConfig.env ?? [])];
    newEnv[index][field] = value;
    setModelConfig({ ...modelConfig, env: newEnv });
  };

  // Handlers for GPU types
  const handleAddGpuType = () => {
    setModelConfig({
      ...modelConfig,
      gpu_types: [...(modelConfig.gpu_types || []), { type: "A40", count: 1 }],
    });
  };

  const handleRemoveGpuType = (index: number) => {
    const newGpuTypes = [...modelConfig.gpu_types];
    newGpuTypes.splice(index, 1);
    setModelConfig({ ...modelConfig, gpu_types: newGpuTypes });
  };

  // Schedule handlers
  const [scheduleOpen, setScheduleOpen] = useState({
    workdays: false,
    weekends: false,
    specific_days: false,
  });

  const toggleScheduleSection = (section: keyof typeof scheduleOpen) => {
    setScheduleOpen({ ...scheduleOpen, [section]: !scheduleOpen[section] });
  };

  const handleAddTimeWindow = (section: "workdays" | "weekends") => {
    const currentSchedule = modelConfig.schedule ?? {
      specific_days: [],
      workdays: [],
      weekends: [],
    };
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...currentSchedule,
        [section]: [
          ...(currentSchedule[section] ?? []),
          { start: "", end: "" },
        ],
      },
    });
  };

  const handleRemoveTimeWindow = (
    section: "workdays" | "weekends",
    index: number
  ) => {
    const newTimeWindows = [...(modelConfig.schedule?.[section] ?? [])];
    newTimeWindows.splice(index, 1);
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...(modelConfig.schedule ?? {
          specific_days: [],
          workdays: [],
          weekends: [],
        }),
        [section]: newTimeWindows,
      },
    });
  };

  const handleTimeWindowChange = <K extends keyof TimeWindow>(
    section: "workdays" | "weekends",
    index: number,
    field: K,
    value: TimeWindow[K]
  ) => {
    const newTimeWindows = [...(modelConfig.schedule?.[section] ?? [])];
    newTimeWindows[index][field] = value;
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...(modelConfig.schedule ?? {
          specific_days: [],
          workdays: [],
          weekends: [],
        }),
        [section]: newTimeWindows,
      },
    });
  };

  // Handlers for specific days
  const handleAddSpecificDay = () => {
    const currentSchedule = modelConfig.schedule ?? {
      specific_days: [],
      workdays: [],
      weekends: [],
    };

    setModelConfig({
      ...modelConfig,
      schedule: {
        ...currentSchedule,
        specific_days: [
          ...(currentSchedule.specific_days ?? []),
          { date: "", time_windows: [{ start: "", end: "" }] },
        ],
      },
    });
  };

  const handleRemoveSpecificDay = (index: number) => {
    const currentSchedule = modelConfig.schedule ?? {
      specific_days: [],
      workdays: [],
      weekends: [],
    };

    const newSpecificDays = [...currentSchedule.specific_days];
    newSpecificDays.splice(index, 1);
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...currentSchedule,
        specific_days: newSpecificDays,
      },
    });
  };

  const handleSpecificDayChange = <K extends keyof SpecificDay>(
    index: number,
    field: K,
    value: SpecificDay[K]
  ) => {
    const currentSchedule = modelConfig.schedule ?? {
      specific_days: [],
      workdays: [],
      weekends: [],
    };

    const newSpecificDays = [...currentSchedule.specific_days];
    newSpecificDays[index][field] = value;
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...currentSchedule,
        specific_days: newSpecificDays,
      },
    });
  };

  const handleAddSpecificDayTimeWindow = (dayIndex: number) => {
    const currentSchedule = modelConfig.schedule ?? {
      specific_days: [],
      workdays: [],
      weekends: [],
    };

    const newSpecificDays = [...currentSchedule.specific_days];
    newSpecificDays[dayIndex].time_windows.push({ start: "", end: "" });
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...currentSchedule,
        specific_days: newSpecificDays,
      },
    });
  };

  const handleRemoveSpecificDayTimeWindow = (
    dayIndex: number,
    windowIndex: number
  ) => {
    const currentSchedule = modelConfig.schedule ?? {
      specific_days: [],
      workdays: [],
      weekends: [],
    };

    const newSpecificDays = [...currentSchedule.specific_days];
    newSpecificDays[dayIndex].time_windows.splice(windowIndex, 1);
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...currentSchedule,
        specific_days: newSpecificDays,
      },
    });
  };

  const handleSpecificDayTimeWindowChange = <K extends keyof TimeWindow>(
    dayIndex: number,
    windowIndex: number,
    field: K,
    value: TimeWindow[K]
  ) => {
    const currentSchedule = modelConfig.schedule ?? {
      specific_days: [],
      workdays: [],
      weekends: [],
    };

    const newSpecificDays = [...currentSchedule.specific_days];
    newSpecificDays[dayIndex].time_windows[windowIndex][field] = value;
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...currentSchedule,
        specific_days: newSpecificDays,
      },
    });
  };

  useEffect(() => {
    if (onModelConfigChange) {
      onModelConfigChange(modelConfig);
    }
  }, [modelConfig, onModelConfigChange]);

  useEffect(() => {
    if (onModelNameChange) {
      onModelNameChange(modelName);
    }
  }, [modelName, onModelNameChange]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Сброс ошибок перед проверкой
    setModelNameError(false);
    setDeploymentNameError(false);
    setGpuTypesError(false);
    setDiskSpaceError(false);

    // Флаг для определения, есть ли ошибки
    let hasErrors = false;

    // Проверяем modelName
    if (!modelName) {
      setModelNameError(true);
      setModelNameErrorText("Поле 'Model Name' обязательно для заполнения.");
      hasErrors = true;
    }

    // Проверяем deployment_name (job_name)
    if (!modelConfig.job_name) {
      setDeploymentNameError(true);
      setDeploymentNameErrorText(
        "Поле 'Unique Deployment Name' обязательно для заполнения."
      );
      hasErrors = true;
    }

    // Проверяем gpu_types
    if (
      !modelConfig.gpu_types ||
      modelConfig.gpu_types.length === 0 ||
      modelConfig.gpu_types.some((gpu) => !gpu.type)
    ) {
      setGpuTypesError(true);
      setGpuTypesErrorText("Необходимо выбрать хотя бы один GPU тип.");
      hasErrors = true;
    }

    // Проверяем disk_space
    const diskSpace = Number(modelConfig.disk_space);
    if (!diskSpace || diskSpace <= 0) {
      setDiskSpaceError(true);
      setDiskSpaceErrorText("Поле 'Disk Space' обязательно для заполнения.");
      hasErrors = true;
    }

    // Если есть ошибки, прекращаем выполнение
    if (hasErrors) {
      setAlertMessage("Пожалуйста, заполните все обязательные поля.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    setLoading(true);

    const vllmConfig: VllmConfig = {
      model: modelName,
      args: {},
      flags: {},
    };

    if (initialConfig?.finetuned_job_id) {
      vllmConfig.finetuned_job_id = initialConfig.finetuned_job_id;
    }

    args.forEach((arg) => {
      if (arg.key && arg.value) {
        vllmConfig.args[arg.key] = arg.value;
      }
    });

    flags.forEach((flag) => {
      if (flag.key) {
        vllmConfig.flags[flag.key] = flag.value;
      }
    });

    // Подготовка данных формы
    const formData = new FormData();
    formData.append("organization_id", currentOrganization?.id || "");
    formData.append("vllm_config_str", JSON.stringify(vllmConfig));
    formData.append("config_str", JSON.stringify(modelConfig));

    try {
      const response = await axiosInstance.post("/models/run", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Обработка успешного ответа
      const message =
        response.data.message ||
        "Модель успешно запущена! Вы можете просмотреть ее в разделе 'Задачи'.";
      setAlertMessage(message);
      setAlertSeverity("success");
      setAlertOpen(true);
      navigate("/models");
    } catch (error) {
      // Обработка ошибки
      console.error(error);
      let errorMessage = "Произошла ошибка при запуске модели.";
      if (axios.isAxiosError(error) && error.response) {
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Извлекаем 'msg' из каждой детали ошибки и объединяем их
          errorMessage = error.response.data.detail
            .map((d: { msg: string }) => d.msg)
            .join(", ");
        }
      }
      setAlertMessage(errorMessage);
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return {
    isMobile,
    handleSubmit,
    modelName,
    handleModelNameChange,
    loading,
    modelNameErrorText,
    modelNameError,
    args,
    handleArgChange,
    handleRemoveArg,
    handleAddArg,
    flags,
    handleFlagChange,
    handleRemoveFlag,
    handleAddFlag,
    handleDeploymentNameChange,
    deploymentNameErrorText,
    deploymentNameError,
    modelConfig,
    gpuTypesError,
    gpuTypesErrorText,
    handleGpuTypeChange,
    handleRemoveGpuType,
    handleAddGpuType,
    setModelConfig,
    handleDiskSpaceChange,
    diskSpaceErrorText,
    diskSpaceError,
    toggleScheduleSection,
    scheduleOpen,
    handleTimeWindowChange,
    handleRemoveTimeWindow,
    handleAddTimeWindow,
    handleSpecificDayChange,
    handleRemoveSpecificDay,
    handleAddSpecificDay,
    handleSpecificDayTimeWindowChange,
    handleRemoveSpecificDayTimeWindow,
    handleAddSpecificDayTimeWindow,
    handleEnvVarChange,
    handleRemoveEnvVar,
    handleAddEnvVar,
    handleAlertClose,
    alertOpen,
    alertSeverity,
    alertMessage,
  };
};
