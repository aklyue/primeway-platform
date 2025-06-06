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
import axiosInstance from "../../api";
import dayjs from "dayjs";
import { VLLM_ARGS, VLLM_FLAGS } from "../../data/VllmArgs";
import useConfigureModelForm from "../../hooks/useConfigureModelForm";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";

import { AVAILABLE_GPUS } from "../../AVAILABLE_GPUS"

function ConfigureModelForm({
  initialConfig,
  onClose,
  readOnlyModelName = false,
}) {
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);

  const {
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
  } = useConfigureModelForm({
    initialConfig,
    onClose,
    readOnlyModelName,
    authToken,
    currentOrganization,
  });

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
          disabled={loading || readOnlyModelName}
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
            sx={{
              mt: 2,
              color: "white",
              padding: "7px 18px",
              bgcolor: "#597ad3",
              "&:hover": {
                bgcolor: "#7c97de",
              },
            }}
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
