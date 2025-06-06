import { useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../../api";

export const useConfigureModelForm = ({
  initialConfig,
  onClose,
  readOnlyModelNames,
  authToken,
  currentOrganization,
  onFlagsChange,
  onArgsChange,
  isFineTuned
}) => {

  const [modelName, setModelName] = useState(initialConfig?.modelName || "");


  const [args, setArgs] = useState(
    isFineTuned ? [{ key: "", value: "" }] : (initialConfig?.args || [{ key: "", value: "" }])
  );

  const [flags, setFlags] = useState(
    isFineTuned ? [{ key: "", value: "" }] : (initialConfig?.flags || [{ key: "", value: "True" }])
  );
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
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [alertMessage, setAlertMessage] = useState("");

  const [modelNameError, setModelNameError] = useState(false);
  const [deploymentNameError, setDeploymentNameError] = useState(false);
  const [gpuTypesError, setGpuTypesError] = useState(false);
  const [diskSpaceError, setDiskSpaceError] = useState(false);

  const [modelNameErrorText, setModelNameErrorText] = useState("");
  const [deploymentNameErrorText, setDeploymentNameErrorText] = useState("");
  const [gpuTypesErrorText, setGpuTypesErrorText] = useState("");
  const [diskSpaceErrorText, setDiskSpaceErrorText] = useState("");

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleModelNameChange = (e) => {
    setModelName(e.target.value);
    if (e.target.value) {
      setModelNameError(false);
      setModelNameErrorText("");
    }
  };

  const handleDeploymentNameChange = (e) => {
    setModelConfig({
      ...modelConfig,
      job_name: e.target.value,
    });
    if (e.target.value) {
      setDeploymentNameError(false);
      setDeploymentNameErrorText("");
    }
  };

  const handleGpuTypeChange = (index, field, value) => {
    const newGpuTypes = [...modelConfig.gpu_types];
    newGpuTypes[index][field] = value;
    setModelConfig({ ...modelConfig, gpu_types: newGpuTypes });

    if (value && field === "type") {
      setGpuTypesError(false);
      setGpuTypesErrorText("");
    }
  };

  const handleDiskSpaceChange = (e) => {
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

  const handleRemoveArg = (index) => {
    const newArgs = [...args];
    newArgs.splice(index, 1);
    setArgs(newArgs);
  };

  const handleArgChange = (index, field, value) => {
    const newArgs = [...args];
    newArgs[index][field] = value;
    setArgs(newArgs);
  };

  // Handlers for flags
  const handleAddFlag = () => {
    setFlags([...flags, { key: "", value: "True" }]);
  };

  const handleRemoveFlag = (index) => {
    const newFlags = [...flags];
    newFlags.splice(index, 1);
    setFlags(newFlags);
  };

  const handleFlagChange = (index, field, value) => {
    const newFlags = [...flags];
    newFlags[index][field] = value;
    setFlags(newFlags);
  };

  useEffect(() => {
    onFlagsChange(flags);
  }, [flags, onFlagsChange]);

  useEffect(() => {
    onArgsChange(args);
  }, [args, onArgsChange]);

  // Handlers for environment variables
  const handleAddEnvVar = () => {
    setModelConfig({
      ...modelConfig,
      env: [...modelConfig.env, { name: "", value: "" }],
    });
  };

  const handleRemoveEnvVar = (index) => {
    const newEnv = [...modelConfig.env];
    newEnv.splice(index, 1);
    setModelConfig({ ...modelConfig, env: newEnv });
  };

  const handleEnvVarChange = (index, field, value) => {
    const newEnv = [...modelConfig.env];
    newEnv[index][field] = value;
    setModelConfig({ ...modelConfig, env: newEnv });
  };

  // Handlers for GPU types
  const handleAddGpuType = () => {
    setModelConfig({
      ...modelConfig,
      gpu_types: [...modelConfig.gpu_types, { type: "", count: 1 }],
    });
  };

  const handleRemoveGpuType = (index) => {
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

  const toggleScheduleSection = (section) => {
    setScheduleOpen({ ...scheduleOpen, [section]: !scheduleOpen[section] });
  };

  const handleAddTimeWindow = (section) => {
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...modelConfig.schedule,
        [section]: [
          ...(modelConfig.schedule[section] || []),
          { start: "", end: "" },
        ],
      },
    });
  };

  const handleRemoveTimeWindow = (section, index) => {
    const newTimeWindows = [...(modelConfig.schedule[section] || [])];
    newTimeWindows.splice(index, 1);
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...modelConfig.schedule,
        [section]: newTimeWindows,
      },
    });
  };

  const handleTimeWindowChange = (section, index, field, value) => {
    const newTimeWindows = [...(modelConfig.schedule[section] || [])];
    newTimeWindows[index][field] = value;
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...modelConfig.schedule,
        [section]: newTimeWindows,
      },
    });
  };

  // Handlers for specific days
  const handleAddSpecificDay = () => {
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...modelConfig.schedule,
        specific_days: [
          ...(modelConfig.schedule.specific_days || []),
          { date: "", time_windows: [{ start: "", end: "" }] },
        ],
      },
    });
  };

  const handleRemoveSpecificDay = (index) => {
    const newSpecificDays = [...(modelConfig.schedule.specific_days || [])];
    newSpecificDays.splice(index, 1);
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...modelConfig.schedule,
        specific_days: newSpecificDays,
      },
    });
  };

  const handleSpecificDayChange = (index, field, value) => {
    const newSpecificDays = [...(modelConfig.schedule.specific_days || [])];
    newSpecificDays[index][field] = value;
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...modelConfig.schedule,
        specific_days: newSpecificDays,
      },
    });
  };

  const handleAddSpecificDayTimeWindow = (dayIndex) => {
    const newSpecificDays = [...(modelConfig.schedule.specific_days || [])];
    newSpecificDays[dayIndex].time_windows.push({ start: "", end: "" });
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...modelConfig.schedule,
        specific_days: newSpecificDays,
      },
    });
  };

  const handleRemoveSpecificDayTimeWindow = (dayIndex, windowIndex) => {
    const newSpecificDays = [...(modelConfig.schedule.specific_days || [])];
    newSpecificDays[dayIndex].time_windows.splice(windowIndex, 1);
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...modelConfig.schedule,
        specific_days: newSpecificDays,
      },
    });
  };

  const handleSpecificDayTimeWindowChange = (
    dayIndex,
    windowIndex,
    field,
    value
  ) => {
    const newSpecificDays = [...(modelConfig.schedule.specific_days || [])];
    newSpecificDays[dayIndex].time_windows[windowIndex][field] = value;
    setModelConfig({
      ...modelConfig,
      schedule: {
        ...modelConfig.schedule,
        specific_days: newSpecificDays,
      },
    });
  };

  const handleSubmit = async (event) => {
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
    if (!modelConfig.disk_space || modelConfig.disk_space <= 0) {
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

    const vllmConfig = {
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

      // Закрываем модальное окно
      onClose();
    } catch (error) {
      // Обработка ошибки
      console.error(error);
      let errorMessage = "Произошла ошибка при запуске модели.";
      if (error.response && error.response.data) {
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Извлекаем 'msg' из каждой детали ошибки и объединяем их
          errorMessage = error.response.data.detail
            .map((d) => d.msg)
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
