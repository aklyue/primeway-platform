import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { modelsData } from "../../data/modelsData";
import { fineTunedData } from "../../data/fineTunedData";
import { Box, Typography, Button, Modal, Grid, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ConfigureModelForm from "../ConfigureModelForm";
import useModelActions from "../../hooks/useModelActions";
import useModelButtonLogic from "../../hooks/useModelButtonLogic";
import ModelActions from "../../UI/ModelActions";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import axiosInstance from "../../api";

function SpecificModel({ initialConfig, isBasic: passedIsBasic, isMobile, jobId }) {
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);
  const { modelId } = useParams();

  const decodedModelId = modelId.replaceAll("__", "/");
  const [launchedModels, setLaunchedModels] = useState([]);
  const [fineTunedModels, setFineTunedModels] = useState([]);
  const [model, setModel] = useState(null);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [launchedModel, setLaunchedModel] = useState(null)
  const [fineTunedModel, setFineTunedModel] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [confirmLaunchOpen, setConfirmLaunchOpen] = useState(false);
  const [flags, setFlags] = useState([]);
  const [args, setArgs] = useState([]);
  const [modelConfig, setModelConfig] = useState({})
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  const handleFlagsChange = (newFlags) => {
    setFlags(newFlags);
  };

  const handleArgsChange = (newArgs) => {
    setArgs(newArgs);
  };

  const handleModelConfigChange = (newConfig) => {
    setModelConfig(newConfig);
  }


  const handleConfirmLaunchOpen = () => {
    setConfirmLaunchOpen(true);
  };

  const handleConfirmLaunchClose = () => {
    setConfirmLaunchOpen(false);
  };

  const handleLaunchButtonClick = () => {
    handleConfirmLaunchOpen();
  };



  const toggleLogsModal = async () => {
    setLogsModalOpen(true)
    setLogsLoading(true);
    setCurrentLogs(""); // Сбрасываем предыдущие логи

    try {
      if (!jobId) {
        setCurrentLogs("Идентификатор задачи отсутствует.");
        setLogsLoading(false);
        return;
      }

      const response = await axiosInstance.get("/jobs/job-logs", {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const logs = response.data.logs || "Логи отсутствуют.";
      setCurrentLogs(logs);
    } catch (error) {
      console.error(`Ошибка при получении логов для задачи ${jobId}:`, error);
      const errorMessage =
        error.response?.data?.detail ||
        (error.response?.status === 404
          ? "Логи недоступны."
          : "Ошибка при получении логов.");
      setCurrentLogs(errorMessage);
    } finally {
      setLogsLoading(false);
    }
  }



  const fetchLaunchedModels = async () => {
    if (!currentOrganization || !authToken) return;
    try {
      const { data = [] } = await axiosInstance.get("/jobs/get-vllm-deploy-jobs", {
        params: { organization_id: currentOrganization.id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setLaunchedModels(data);
    } catch (err) {
      console.error("Ошибка при получении запущенных моделей:", err);
    }
  };

  const fetchFineTunedModels = async () => {
    if (!currentOrganization || !authToken) return;
    try {
      const { data = [] } = await axiosInstance.get("/models/finetuned", {
        params: { organization_id: currentOrganization.id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setFineTunedModels(data);
    } catch (err) {
      console.error("Ошибка при получении fine-tune моделей:", err);
    }
  };

  useEffect(() => {
    fetchLaunchedModels();
    fetchFineTunedModels();
  }, [currentOrganization, authToken]);

  useEffect(() => {
    const foundModel = modelsData.find((m) => m.id === decodedModelId);
    if (foundModel) {
      setModel(foundModel);
      setModelStatus(foundModel.last_execution_status);
    }
  }, [decodedModelId]);

  useEffect(() => {
    const foundModel = launchedModels.find(
      (launched) => launched.job_id === decodedModelId
    );
    if (foundModel) {
      setLaunchedModel(foundModel);
      setModelStatus(foundModel.last_execution_status);
    }
  }, [launchedModels]);

  useEffect(() => {
    const foundModel = fineTunedModels.find(
      (model) => model.job_id === decodedModelId
    );
    if (foundModel) {
      const buildDefaultConfig = (ft) => {
        const base = fineTunedData.find((m) => m.name === ft.base_model) || {};
        const cfg = base.defaultConfig || {};
        return {
          ...cfg,
          modelName: cfg.modelName ?? ft.base_model,
          finetuned_job_id: ft.job_id,
          modelConfig: {
            ...(cfg.modelConfig || {}),
            job_name: `${ft.artifact_name}-deploy`,
          },
        };
      };

      const mergedModel = {
        ...foundModel,
        defaultConfig: buildDefaultConfig(foundModel),
      };
      setFineTunedModel(mergedModel);
      setModelStatus(foundModel.last_execution_status);
    }
  }, [fineTunedModels]);

  const isFineTuned = !!fineTunedModel;


  const toggleConfigure = () => setIsConfigureOpen((prev) => !prev);

  const isBasic = passedIsBasic ?? model?.isBasic;


  const { handleRun, handleStart, handleStop, loading } = useModelActions({
    model,
    currentOrganization,
    authToken,
    setModelStatus,
    args,
    flags,
    modelConfig
  });

  const { actionButtonText, actionButtonHandler, isActionButtonDisabled } = useModelButtonLogic({
    model: model || fineTunedModel,
    isBasic,
    isFineTuned,
    jobId: model?.job_id || launchedModel?.job_id || fineTunedModel?.defaultConfig.
      finetuned_job_id,
    setModelStatus,
    modelStatus,
    handleRun,
    handleStart,
    handleStop,
    loading,
    authToken,
    currentOrganization,
    handleConfirmLaunchClose,
    args,
    flags,
    modelConfig
  });

  const isLaunchedModel = !!launchedModel;

  const renderData = model || launchedModel || fineTunedModel;


  if (!renderData) {
    return <Typography sx={{ p: 4 }}>Модель не найдена</Typography>;
  }


  return (
    <Box
      sx={{
        border: "1px solid rgba(0, 0, 0, 0.12)",
        borderRadius: "16px",
        overflow: "hidden",
        m: 4,
        mx: isMobile ? 0 : 4,
        bgcolor: "#ffffff",
      }}
    >
      <Grid
        container
        sx={{
          backgroundColor: "rgba(102, 179, 238, 0.1)",
          padding: 2,
          borderBottom: "1px solid lightgray",
        }}
      >
        <Grid item xs={4}>
          <Typography variant="subtitle2" fontWeight="light">
            ПАРАМЕТР
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="subtitle2" fontWeight="light">
            ЗНАЧЕНИЕ
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ px: 2 }}>
        {(model ? [
          { label: "ID", value: renderData.id },
          { label: "Тип", value: renderData.type },
          { label: "Описание", value: renderData.description },
          { label: "Модель (config)", value: renderData.defaultConfig?.modelName },
          {
            label: "Job name",
            value: renderData.defaultConfig?.modelConfig?.job_name || renderData.artifact_name,
          }
        ] : [
          ...(fineTunedModel ? [
            { label: "Job ID", value: renderData.job_id },
            { label: "Artifact Name", value: renderData.artifact_name },
            { label: "Base Model", value: renderData.base_model },
            { label: "Status", value: renderData.status },
            { label: "Dataset ID", value: renderData.dataset_id },
            { label: "Created At", value: renderData.created_at },
          ] : [
            { label: "Job ID", value: renderData.job_id },
            {
              label: "Job Name", value: renderData.job_name || renderData.artifact_name
            },
            { label: "Created At", value: renderData.created_at },
            { label: "Last Execution Status", value: renderData.last_execution_status },
            { label: "Job URL", value: renderData.job_url },
            { label: "GPU Type", value: renderData.gpu_type?.type },
            { label: "Health Status", value: renderData.health_status || renderData.status },
          ]),
        ]).map((row, index) => (
          <Grid
            container
            key={index}
            sx={{ borderBottom: "1px solid #e0e0e0", py: 2, my: 0.5 }}
          >
            <Grid item xs={4}>
              <Typography variant="subtitle2">{row.label}</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{row.value}</Typography>
            </Grid>
          </Grid>
        ))}
      </Box>

      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>

        {!isLaunchedModel ? (
          <Button
            onClick={toggleConfigure}
            sx={{
              color: "white",
              padding: "8px 16px",
              bgcolor: "#597ad3",
              "&:hover": {
                bgcolor: "#7c97de",
              },
            }}
          >
            {isConfigureOpen ? "Скрыть настройку" : "Настроить"}
          </Button>
        ) : (
          <Button
            onClick={toggleLogsModal}
            sx={{
              color: "white",
              padding: "8px 16px",
              bgcolor: "#597ad3",
              "&:hover": {
                bgcolor: "#7c97de",
              },
            }}
          >
            Логи
          </Button>
        )}
        <ModelActions
          actionButtonHandler={actionButtonText === "Остановить" ? actionButtonHandler : handleLaunchButtonClick}
          actionButtonText={actionButtonText}
          isActionButtonDisabled={false}
        />
      </Box>

      <Collapse in={isConfigureOpen}>
        <Box
          sx={{
            borderTop: "1px solid #e0e0e0",
            bgcolor: "#fff",
            p: 1,
          }}
        >
          <ConfigureModelForm
            initialConfig={initialConfig || renderData.defaultConfig}
            onClose={toggleConfigure}
            isFineTuned={isFineTuned}
            onFlagsChange={handleFlagsChange}
            onArgsChange={handleArgsChange}
            onModelConfigChange={handleModelConfigChange}
          />
        </Box>
      </Collapse>

      <Dialog
        open={confirmLaunchOpen}
        onClose={handleConfirmLaunchClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Подтвердите запуск модели</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Вы уверены, что хотите запустить модель <b>{renderData?.defaultConfig?.modelName || "—"}</b>?
          </Typography>
          <Typography>
            Это действие инициирует выполнение модели с текущими настройками:
          </Typography>

          {/* Параметры модели */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Параметры модели:</Typography>
            <Typography>
              <b>GPU Type:</b> {modelConfig?.gpu_types?.map(gpu => gpu.type).join(", ") || "—"}
            </Typography>
            <Typography>
              <b>Health Check Timeout:</b> {modelConfig?.health_check_timeout || "—"} ms
            </Typography>
            <Typography>
              <b>Disk Space:</b> {modelConfig?.disk_space || "—"} GB
            </Typography>
            <Typography>
              <b>Port:</b> {modelConfig?.port || "—"}
            </Typography>
            <Typography>
              <b>Autoscaler Timeout:</b> {modelConfig?.autoscaler_timeout || "—"} sec
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Аргументы:</Typography>
            {args?.length > 0 ? (
              args.map((arg, index) => (
                <Typography key={index}>
                  <b>{arg.key}:</b> {arg.value || "—"}
                </Typography>
              ))
            ) : (
              <Typography>—</Typography>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Флаги:</Typography>
            {flags?.length > 0 ? (
              flags.map((flag, index) => (
                <Typography key={index}>
                  <b>{flag.key}:</b> {flag.value || "—"}
                </Typography>
              ))
            ) : (
              <Typography>—</Typography>
            )}
          </Box>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmLaunchClose}>Отмена</Button>
          <Button
            sx={{
              bgcolor: "#597ad3",
              "&:hover": {
                bgcolor: "#7c97de",
              },
              color: "white",
            }}
            onClick={actionButtonHandler}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Логи модели: ${launchedModel?.job_name}`}</DialogTitle>
        <DialogContent dividers>
          {logsLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Typography
              variant="body2"
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            >
              {currentLogs}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsModalOpen(false)}>Закрыть</Button>
          <Button
            onClick={() => {
              // Копирование логов в буфер обмена
              if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(currentLogs).catch((error) => {
                  console.error("Ошибка при копировании:", error);
                });
              } else {
                const textarea = document.createElement("textarea");
                textarea.value = currentLogs;
                textarea.style.position = "fixed"; // Предотвращаем прокрутку страницы
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                try {
                  document.execCommand("copy");
                } catch (error) {
                  console.error("Ошибка при копировании:", error);
                }
                document.body.removeChild(textarea);
              }
            }}
          >
            Скопировать Логи
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SpecificModel;
