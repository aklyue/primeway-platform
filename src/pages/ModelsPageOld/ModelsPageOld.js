// src/components/ModelsPage.jsx

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
import axiosInstance from "../../api"; // Adjust the import path accordingly
import dayjs from "dayjs";
import { VLLM_ARGS, VLLM_FLAGS } from "../../data/VllmArgs";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";

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

function ModelsPage() {
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);

  const [modelName, setModelName] = useState("");
  const [args, setArgs] = useState([{ key: "", value: "" }]);
  const [flags, setFlags] = useState([{ key: "", value: "True" }]);

  // Updated modelConfig state
  const [modelConfig, setModelConfig] = useState({
    job_name: "",
    gpu_types: [{ type: "", count: 1 }],
    health_check_timeout: 3500,
    disk_space: 80,
    port: 8000,
    autoscaler_timeout: 600,
    env: [{ name: "", value: "" }],
    schedule: {
      workdays: [],
      weekends: [],
      specific_days: [],
    },
  });

  const [loading, setLoading] = useState(false);

  // States for alerts
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [alertMessage, setAlertMessage] = useState("");

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

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
    setFlags([...flags, { key: "", value: "true" }]);
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

  const handleGpuTypeChange = (index, field, value) => {
    const newGpuTypes = [...modelConfig.gpu_types];
    newGpuTypes[index][field] = value;
    setModelConfig({ ...modelConfig, gpu_types: newGpuTypes });
  };

  // Schedule handlers
  const [scheduleOpen, setScheduleOpen] = useState({
    workdays: false,
    weekends: false,
    specific_days: false,
  });

  const toggleScheduleSection = (section) => {
    setScheduleOpen({
      ...scheduleOpen,
      [section]: !scheduleOpen[section],
    });
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

    // Prepare form data
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
      // Handle success
      const message = response.data.message || "Задача успешно запущена.";
      setAlertMessage(message);
      setAlertSeverity("success");
      setAlertOpen(true);

      // Optionally, reset the form
      setModelName("");
      setArgs([{ key: "", value: "" }]);
      setFlags([{ key: "", value: "true" }]);
      setModelConfig({
        name: "",
        image: "",
        gpu_types: [{ type: "", count: 1 }],
        health_check_timeout: 3500,
        port: 8000,
        disk_space: 80,
        autoscaler_timeout: 600,
        env: [{ name: "", value: "" }],
        schedule: {
          workdays: [],
          weekends: [],
          specific_days: [],
        },
      });
    } catch (error) {
      // Handle error
      console.error(error);
      let errorMessage = "Произошла ошибка при запуске задачи.";
      if (error.response && error.response.data) {
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Extract the 'msg' from each error detail and join them
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
    <Box
      sx={{
        p: isMobile ? 1 : 3,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Запуск модели
      </Typography>
      <Paper
        sx={{
          p: isMobile ? 1 : 3,
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Vllm Конфигурация */}
          <Typography variant="h6">Vllm Конфигурация</Typography>

          {/* Model Name */}
          <TextField
            label="Название модели (Hugging Face)"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            fullWidth
            required
            margin="normal"
            disabled={loading}
            helperText="Наименование модели из Hugging Face"
          />

          {/* Args */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
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
                onChange={(e) =>
                  handleArgChange(index, "value", e.target.value)
                }
                disabled={loading}
                helperText="Значение аргумента"
                sx={{ flex: 1 }} // Ensure flex is applied here as well
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
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Флаги
          </Typography>
          {flags.map((flag, index) => {
            return (
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
            );
          })}
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

          {/* Конфигурация Инфраструктуры */}
          <Typography variant="h6">Конфигурация Деплоя</Typography>

          {/* Job Name */}
          <TextField
            label="Уникальное название деплоя"
            value={modelConfig.job_name}
            onChange={(e) =>
              setModelConfig({
                ...modelConfig,
                job_name: e.target.value,
              })
            }
            fullWidth
            required
            margin="normal"
            disabled={loading}
            helperText="Так как вы можете задеплоить несколько инстансов одной модели, то для каждого деплоя нужно указать уникальное имя"
          />

          {/* GPU Types */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Типы GPU
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
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id={`gpu-select-label-${index}`}>
                  Название GPU
                </InputLabel>
                <Select
                  labelId={`gpu-select-label-${index}`}
                  label="Название GPU"
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
                  Выберите GPU из списка
                </Typography>
              </FormControl>
              <TextField
                label="Количество"
                type="number"
                value={gpuType.count}
                onChange={(e) =>
                  handleGpuTypeChange(index, "count", e.target.value)
                }
                disabled={loading}
                helperText="Количество GPU данного типа"
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
                    Память GPU: {gpuDetails.memoryInGb} ГБ
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
            label="Таймаут проверки работоспособности (мс)"
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
            helperText="Время ожидания ответа от модели в миллисекундах"
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
            helperText="Порт, на котором работает модель. По дефолту Vllm работает на порту 8000, поэтому если вы меняете значение здесь, то не забудьте добавить соответствующее значение для аргумента `--port` в vllm конфиге"
          />

          {/* Disk Space */}
          <TextField
            label="Disk Space"
            type="number"
            value={modelConfig.disk_space}
            onChange={(e) =>
              setModelConfig({ ...modelConfig, disk_space: e.target.value })
            }
            fullWidth
            margin="normal"
            disabled={loading}
            helperText="Необходимое кол-во места на диске. Указывайте столько, чтобы места хватило на загрузку модели"
          />

          {/* Autoscaler Timeout */}
          <TextField
            label="Таймаут авто-масштабирования (сек)"
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
            helperText="Время бездействия перед уменьшением масштабирования"
          />

          {/* Schedule */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Расписание
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
              <Typography variant="subtitle1">Рабочие дни</Typography>
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
                    label="Конец (опционально)"
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
                Добавить интервал
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
              <Typography variant="subtitle1">Выходные дни</Typography>
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
                    label="Конец (опционально)"
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
                Добавить интервал
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
              <Typography variant="subtitle1">Определенные даты</Typography>
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
                            label="Конец (опционально)"
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
                      Добавить интервал
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
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Переменные окружения
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
                label="Значение переменной"
                value={envVar.value}
                onChange={(e) =>
                  handleEnvVarChange(index, "value", e.target.value)
                }
                disabled={loading}
                helperText="Значение переменной окружения"
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

          <Divider sx={{ my: 3 }} />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Запустить модель"
            )}
          </Button>
        </form>
      </Paper>

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
    </Box>
  );
}

export default ModelsPage;
