// src/components/ConfigureModelForm.jsx

import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  Autocomplete,
} from "@mui/material";
import {
  AddCircle,
  RemoveCircle,
  ArrowDropDown,
  ArrowDropUp,
} from "@mui/icons-material";
import { AuthContext } from "../AuthContext";
import { OrganizationContext } from "./Organization/OrganizationContext";
import axiosInstance from "../api";
import dayjs from "dayjs";
import { VLLM_ARGS, VLLM_FLAGS } from "../data/VllmArgs";

const AVAILABLE_GPUS = {
  "A100 PCIe": { memoryInGb: 80, costPerHour: 260 },
  "A100 SXM": { memoryInGb: 80, costPerHour: 299 },
  A40: { memoryInGb: 48, costPerHour: 90 },
  "RTX 4090": { memoryInGb: 24, costPerHour: 130 },
  "H100 SXM": { memoryInGb: 80, costPerHour: 399 },
  "H100 NVL": { memoryInGb: 94, costPerHour: 355 },
  "H100 PCIe": { memoryInGb: 80, costPerHour: 335 },
  "H200 SXM": { memoryInGb: 143, costPerHour: 460 },
  L4: { memoryInGb: 24, costPerHour: 90 },
  L40: { memoryInGb: 48, costPerHour: 170 },
  L40S: { memoryInGb: 48, costPerHour: 175 },
  "RTX 2000 Ada": { memoryInGb: 16, costPerHour: 55 },
  "RTX 6000 Ada": { memoryInGb: 48, costPerHour: 140 },
  "RTX A6000": { memoryInGb: 48, costPerHour: 130 },
};

function ConfigureModelForm({ initialConfig, onClose }) {
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);

  const [modelName, setModelName] = useState(initialConfig?.modelName || "");
  const [args, setArgs] = useState(
    initialConfig?.args?.length > 0
      ? initialConfig.args
      : [{ key: "", value: "" }]
  );
  const [flags, setFlags] = useState(
    initialConfig?.flags?.length > 0
      ? initialConfig.flags
      : [{ key: "", value: "True" }]
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

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 1 : 4,
        maxHeight: "95vh",
        overflowY: "auto",
        margin: "auto",
        maxWidth: 800,
      }}
    >
      <form onSubmit={handleSubmit} style={{ paddingBottom: "16px" }}>
        {/* VLLM Configuration */}
        <Typography variant="h6">VLLM конфигурация</Typography>

        {/* Model Name */}
        <TextField
          label="Имя модели (Hugging Face)"
          value={modelName}
          onChange={handleModelNameChange}
          fullWidth
          required
          margin="normal"
          disabled={loading}
          helperText={modelNameErrorText || "Имя модели из Hugging Face"}
          error={modelNameError}
        />

        {/* Args */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Аргументы
        </Typography>
        {args.map((arg, index) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mt: 1,
            }}
            key={index}
          >
            <Autocomplete
              freeSolo
              options={VLLM_ARGS}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.key
              }
              onInputChange={(event, newInputValue) => {
                handleArgChange(index, "key", newInputValue);
              }}
              value={arg.key}
              sx={{ flex: 1 }}
              renderOption={(props, option) => (
                <li {...props}>
                  <div>
                    <strong>{option.key}</strong>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      display="block"
                    >
                      {option.description}
                    </Typography>
                  </div>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ключ"
                  disabled={loading}
                  helperText="Ключ аргумента"
                />
              )}
            />
            <TextField
              label="Значение"
              value={arg.value}
              onChange={(e) => handleArgChange(index, "value", e.target.value)}
              disabled={loading}
              helperText="Значение аргумента"
              sx={{ flex: 1 }}
            />
            <IconButton
              onClick={() => handleRemoveArg(index)}
              disabled={args.length === 1 || loading}
            >
              <RemoveCircle />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="text"
          startIcon={<AddCircle />}
          onClick={handleAddArg}
          sx={{ mt: 1 }}
          disabled={loading}
        >
          Добавить аргумент
        </Button>

        {/* Flags */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Флаги
        </Typography>
        {flags.map((flag, index) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mt: 1,
            }}
            key={index}
          >
            <Autocomplete
              freeSolo
              options={VLLM_FLAGS}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.key
              }
              onInputChange={(event, newInputValue) => {
                handleFlagChange(index, "key", newInputValue);
              }}
              value={flag.key}
              sx={{ flex: 1 }}
              renderOption={(props, option) => (
                <li {...props}>
                  <div>
                    <strong>{option.key}</strong>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      display="block"
                    >
                      {option.description}
                    </Typography>
                  </div>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ключ"
                  disabled={loading}
                  helperText="Ключ флага"
                />
              )}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id={`flag-value-label-${index}`}>
                Значение (True/False)
              </InputLabel>
              <Select
                labelId={`flag-value-label-${index}`}
                value={flag.value}
                onChange={(e) =>
                  handleFlagChange(index, "value", e.target.value)
                }
                disabled={loading}
                label="Значение (True/False)"
              >
                <MenuItem value="True">True</MenuItem>
                <MenuItem value="False">False</MenuItem>
              </Select>
              <Typography variant="caption" color="textSecondary">
                Значение флага (True/False)
              </Typography>
            </FormControl>
            <IconButton
              onClick={() => handleRemoveFlag(index)}
              disabled={flags.length === 1 || loading}
            >
              <RemoveCircle />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="text"
          startIcon={<AddCircle />}
          onClick={handleAddFlag}
          sx={{ mt: 1 }}
          disabled={loading}
        >
          Добавить флаг
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* Deployment Configuration */}
        <Typography variant="h6">Конфигурация развертывания</Typography>

        {/* Job Name */}
        <TextField
          label="Уникальное имя развертывания"
          value={modelConfig.job_name}
          onChange={handleDeploymentNameChange}
          fullWidth
          required
          margin="normal"
          disabled={loading}
          helperText={
            deploymentNameErrorText ||
            "Укажите уникальное имя для этого развертывания"
          }
          error={deploymentNameError}
        />

        {/* GPU Types */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Тип GPU
        </Typography>
        {modelConfig.gpu_types.map((gpuType, index) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mt: 1,
            }}
            key={index}
          >
            <FormControl
              sx={{ flex: 1 }}
              error={gpuTypesError && !gpuType.type}
              required
            >
              <InputLabel id={`gpu-select-label-${index}`}>Имя GPU</InputLabel>
              <Select
                labelId={`gpu-select-label-${index}`}
                label="Имя GPU"
                value={gpuType.type}
                onChange={(e) =>
                  handleGpuTypeChange(index, "type", e.target.value)
                }
                disabled={loading}
              >
                {Object.keys(AVAILABLE_GPUS).map((gpuName) => (
                  <MenuItem key={gpuName} value={gpuName}>
                    {gpuName}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="textSecondary">
                {gpuTypesErrorText || "Выберите GPU из списка"}
              </Typography>
            </FormControl>
            <TextField
              label="Count"
              type="number"
              value={gpuType.count}
              onChange={(e) =>
                handleGpuTypeChange(index, "count", e.target.value)
              }
              disabled={loading}
              helperText="Количество GPU этого типа"
              sx={{ flex: 1 }}
            />

            <IconButton
              onClick={() => handleRemoveGpuType(index)}
              disabled={modelConfig.gpu_types.length === 1 || loading}
            >
              <RemoveCircle />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="text"
          startIcon={<AddCircle />}
          onClick={handleAddGpuType}
          sx={{ mt: 1 }}
          disabled={loading}
        >
          Добавить тип GPU
        </Button>

        {/* Display GPU RAM and Cost */}
        {modelConfig.gpu_types.map((gpuType, index) => {
          const gpuDetails = AVAILABLE_GPUS[gpuType.type];
          if (gpuDetails) {
            return (
              <Box
                key={`gpu-details-${index}`}
                sx={{ mt: 1, mb: 2, pl: 2, borderLeft: "4px solid #ccc" }}
              >
                <Typography variant="body2">
                  Память GPU: {gpuDetails.memoryInGb} GB
                </Typography>
                <Typography variant="body2">
                  Стоимость: {gpuDetails.costPerHour} рублей в час
                </Typography>
              </Box>
            );
          }
          return null;
        })}

        {/* Health Check Timeout */}
        <TextField
          label="Health Check Timeout"
          type="number"
          value={modelConfig.health_check_timeout}
          onChange={(e) =>
            setModelConfig({
              ...modelConfig,
              health_check_timeout: e.target.value,
            })
          }
          fullWidth
          margin="normal"
          disabled={loading}
          helperText="Время ожидания ответа модели в миллисекундах"
        />

        {/* Port */}
        <TextField
          label="Порт"
          type="number"
          value={modelConfig.port}
          onChange={(e) =>
            setModelConfig({ ...modelConfig, port: e.target.value })
          }
          fullWidth
          margin="normal"
          disabled={loading}
          helperText="Порт, на котором работает модель"
        />

        {/* Disk Space */}
        <TextField
          label="Свободное место на диске (GB)"
          type="number"
          value={modelConfig.disk_space}
          onChange={handleDiskSpaceChange}
          fullWidth
          required
          margin="normal"
          disabled={loading}
          helperText={
            diskSpaceErrorText || "Требуемое дисковое пространство в GB"
          }
          error={diskSpaceError}
        />

        {/* Autoscaler Timeout */}
        <TextField
          label="Время ожидания автоматического масштабирования (сек)"
          type="number"
          value={modelConfig.autoscaler_timeout}
          onChange={(e) =>
            setModelConfig({
              ...modelConfig,
              autoscaler_timeout: e.target.value,
            })
          }
          fullWidth
          margin="normal"
          disabled={loading}
          helperText="Время простоя перед уменьшением масштаба"
        />

        {/* Schedule */}
        <Typography variant="h6" sx={{ mt: 3 }}>
          График
        </Typography>

        {/* Workdays */}
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => toggleScheduleSection("workdays")}
          >
            {scheduleOpen.workdays ? <ArrowDropUp /> : <ArrowDropDown />}
            <Typography variant="subtitle1">Будни</Typography>
          </Box>
          {scheduleOpen.workdays &&
            (modelConfig.schedule.workdays || []).map((timeWindow, index) => (
              <Box
                key={`workdays-${index}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mt: 1,
                }}
              >
                <TextField
                  label="Начало"
                  type="time"
                  value={timeWindow.start}
                  onChange={(e) =>
                    handleTimeWindowChange(
                      "workdays",
                      index,
                      "start",
                      e.target.value
                    )
                  }
                  disabled={loading}
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  label="Конец (необязательно)"
                  type="time"
                  value={timeWindow.end}
                  onChange={(e) =>
                    handleTimeWindowChange(
                      "workdays",
                      index,
                      "end",
                      e.target.value
                    )
                  }
                  disabled={loading}
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <IconButton
                  onClick={() => handleRemoveTimeWindow("workdays", index)}
                  disabled={loading}
                >
                  <RemoveCircle />
                </IconButton>
              </Box>
            ))}
          {scheduleOpen.workdays && (
            <Button
              variant="text"
              startIcon={<AddCircle />}
              onClick={() => handleAddTimeWindow("workdays")}
              sx={{ mt: 1 }}
              disabled={loading}
            >
              Добавить временное окно
            </Button>
          )}
        </Box>

        {/* Weekends */}
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => toggleScheduleSection("weekends")}
          >
            {scheduleOpen.weekends ? <ArrowDropUp /> : <ArrowDropDown />}
            <Typography variant="subtitle1">Выходные</Typography>
          </Box>
          {scheduleOpen.weekends &&
            (modelConfig.schedule.weekends || []).map((timeWindow, index) => (
              <Box
                key={`weekends-${index}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mt: 1,
                }}
              >
                <TextField
                  label="Начало"
                  type="time"
                  value={timeWindow.start}
                  onChange={(e) =>
                    handleTimeWindowChange(
                      "weekends",
                      index,
                      "start",
                      e.target.value
                    )
                  }
                  disabled={loading}
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  label="Конец (необязательно)"
                  type="time"
                  value={timeWindow.end}
                  onChange={(e) =>
                    handleTimeWindowChange(
                      "weekends",
                      index,
                      "end",
                      e.target.value
                    )
                  }
                  disabled={loading}
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <IconButton
                  onClick={() => handleRemoveTimeWindow("weekends", index)}
                  disabled={loading}
                >
                  <RemoveCircle />
                </IconButton>
              </Box>
            ))}
          {scheduleOpen.weekends && (
            <Button
              variant="text"
              startIcon={<AddCircle />}
              onClick={() => handleAddTimeWindow("weekends")}
              sx={{ mt: 1 }}
              disabled={loading}
            >
              Добавить временное окно
            </Button>
          )}
        </Box>

        {/* Specific Days */}
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => toggleScheduleSection("specific_days")}
          >
            {scheduleOpen.specific_days ? <ArrowDropUp /> : <ArrowDropDown />}
            <Typography variant="subtitle1">Конкретные даты</Typography>
          </Box>
          {scheduleOpen.specific_days &&
            (modelConfig.schedule.specific_days || []).map(
              (specificDay, dayIndex) => (
                <Box
                  key={`specific-day-${dayIndex}`}
                  sx={{
                    mt: 1,
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TextField
                      label="Дата"
                      type="date"
                      value={specificDay.date}
                      onChange={(e) =>
                        handleSpecificDayChange(
                          dayIndex,
                          "date",
                          e.target.value
                        )
                      }
                      disabled={loading}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveSpecificDay(dayIndex)}
                      disabled={loading}
                    >
                      <RemoveCircle />
                    </IconButton>
                  </Box>
                  {/* Time Windows for Specific Day */}
                  {(specificDay.time_windows || []).map(
                    (timeWindow, windowIndex) => (
                      <Box
                        key={`specific-day-${dayIndex}-window-${windowIndex}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 1,
                        }}
                      >
                        <TextField
                          label="Начало"
                          type="time"
                          value={timeWindow.start}
                          onChange={(e) =>
                            handleSpecificDayTimeWindowChange(
                              dayIndex,
                              windowIndex,
                              "start",
                              e.target.value
                            )
                          }
                          disabled={loading}
                          sx={{ flex: 1 }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                        <TextField
                          label="Коннец (необязательно)"
                          type="time"
                          value={timeWindow.end}
                          onChange={(e) =>
                            handleSpecificDayTimeWindowChange(
                              dayIndex,
                              windowIndex,
                              "end",
                              e.target.value
                            )
                          }
                          disabled={loading}
                          sx={{ flex: 1 }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                        <IconButton
                          onClick={() =>
                            handleRemoveSpecificDayTimeWindow(
                              dayIndex,
                              windowIndex
                            )
                          }
                          disabled={loading}
                        >
                          <RemoveCircle />
                        </IconButton>
                      </Box>
                    )
                  )}
                  <Button
                    variant="text"
                    startIcon={<AddCircle />}
                    onClick={() => handleAddSpecificDayTimeWindow(dayIndex)}
                    sx={{ mt: 1 }}
                    disabled={loading}
                  >
                    Добавить временное окно
                  </Button>
                </Box>
              )
            )}
          {scheduleOpen.specific_days && (
            <Button
              variant="text"
              startIcon={<AddCircle />}
              onClick={handleAddSpecificDay}
              sx={{ mt: 1 }}
              disabled={loading}
            >
              Добавить дату
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Environment Variables */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Переменные среды
        </Typography>
        {modelConfig.env.map((envVar, index) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mt: 1,
            }}
            key={index}
          >
            <TextField
              label="Имя переменной"
              value={envVar.name}
              onChange={(e) =>
                handleEnvVarChange(index, "name", e.target.value)
              }
              disabled={loading}
              helperText="Например, 'ENV_VAR_NAME'"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Переменное значение"
              value={envVar.value}
              onChange={(e) =>
                handleEnvVarChange(index, "value", e.target.value)
              }
              disabled={loading}
              helperText="Значение переменной среды"
              sx={{ flex: 1 }}
            />
            <IconButton
              onClick={() => handleRemoveEnvVar(index)}
              disabled={modelConfig.env.length === 1 || loading}
            >
              <RemoveCircle />
            </IconButton>
          </Box>
        ))}

        <Button
          variant="text"
          startIcon={<AddCircle />}
          onClick={handleAddEnvVar}
          sx={{ mt: 1 }}
          disabled={loading}
        >
          Добавить переменную окружения
        </Button>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ textAlign: "end" }}>
          <Button variant="text" onClick={onClose} sx={{ mt: 2, ml: 2 }}>
            Отмена
          </Button>
          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={loading}
            sx={{ mt: 2, color: "white", padding: "7px 18px" }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Деплой"
            )}
          </Button>
        </Box>
      </form>

      {/* Snackbar for alerts */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default ConfigureModelForm;
