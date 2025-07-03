import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { modelsData } from "../../data/modelsData";
import { fineTunedData } from "../../data/fineTunedData";
import {
  Box,
  Typography,
  Button,
  Grid,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import ConfigureModelForm from "../ConfigureModelForm";
import useModelActions from "../../hooks/useModelActions";
import useModelButtonLogic from "../../hooks/useModelButtonLogic";
import ModelActions from "../../UI/ModelActions";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import useModels from "../../hooks/useModels";

function SpecificModel({
  initialConfig,
  isBasic: passedIsBasic,
  isMobile,
  jobId,
  onLaunchedModelChange,
}) {
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);
  const { modelId } = useParams();

  const decodedModelId = modelId.replaceAll("__", "/");
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [confirmLaunchOpen, setConfirmLaunchOpen] = useState(false);
  const [flags, setFlags] = useState([]);
  const [args, setArgs] = useState([]);
  const [modelConfig, setModelConfig] = useState({});

  const handleFlagsChange = (newFlags) => {
    setFlags(newFlags);
  };

  const handleArgsChange = (newArgs) => {
    setArgs(newArgs);
  };

  const handleModelConfigChange = (newConfig) => {
    setModelConfig(newConfig);
  };

  const handleConfirmLaunchOpen = () => {
    setConfirmLaunchOpen(true);
  };

  const handleConfirmLaunchClose = () => {
    setConfirmLaunchOpen(false);
  };

  const handleLaunchButtonClick = () => {
    handleConfirmLaunchOpen();
  };

  const {
    model,
    launchedModel,
    fineTunedModel,
    modelStatus,
    setModelStatus,
    isLaunchedModel,
    isFineTuned,
    renderData,
  } = useModels({
    currentOrganization,
    authToken,
    decodedModelId,
    modelsData,
    fineTunedData,
    onLaunchedModelChange,
  });

  const toggleConfigure = () => setIsConfigureOpen((prev) => !prev);

  const isBasic = passedIsBasic ?? model?.isBasic;

  const { handleRun, handleStart, handleStop, loading } = useModelActions({
    model,
    currentOrganization,
    authToken,
    setModelStatus,
    args,
    flags,
    modelConfig,
  });

  const { actionButtonText, actionButtonHandler, isActionButtonDisabled } =
    useModelButtonLogic({
      model: model || fineTunedModel,
      isBasic,
      isFineTuned,
      jobId:
        model?.job_id ||
        launchedModel?.job_id ||
        fineTunedModel?.defaultConfig.finetuned_job_id,
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
      modelConfig,
    });

    console.log(modelConfig)

  if (!renderData) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: "1px solid rgba(0, 0, 0, 0.12)",
        borderRadius: "16px",
        overflow: "hidden",
        my: 4,
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
        {(model
          ? [
              { label: "ID", value: renderData.id },
              { label: "Тип", value: renderData.type },
              { label: "Описание", value: renderData.description },
              {
                label: "Модель (config)",
                value: renderData.defaultConfig?.modelName,
              },
              {
                label: "Job name",
                value:
                  renderData.defaultConfig?.modelConfig?.job_name ||
                  renderData.artifact_name,
              },
            ]
          : [
              ...(fineTunedModel
                ? [
                    { label: "Job ID", value: renderData.job_id },
                    { label: "Artifact Name", value: renderData.artifact_name },
                    { label: "Base Model", value: renderData.base_model },
                    { label: "Status", value: renderData.status },
                    { label: "Dataset ID", value: renderData.dataset_id },
                    { label: "Created At", value: renderData.created_at },
                  ]
                : [
                    { label: "Job ID", value: renderData.job_id },
                    {
                      label: "Job Name",
                      value: renderData.job_name || renderData.artifact_name,
                    },
                    { label: "Created At", value: renderData.created_at },
                    {
                      label: "Last Execution Status",
                      value: modelStatus,
                    },
                    { label: "Job URL", value: renderData.job_url },
                    { label: "GPU Type", value: renderData.gpu_type?.type },
                    {
                      label: "Health Status",
                      value: renderData.health_status || renderData.status,
                    },
                  ]),
            ]
        ).map((row, index) => (
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
        {!isLaunchedModel && (
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
        )}
        <ModelActions
          actionButtonHandler={
            actionButtonText === "Остановить" || isLaunchedModel
              ? actionButtonHandler
              : handleLaunchButtonClick
          }
          actionButtonText={actionButtonText}
          isActionButtonDisabled={isActionButtonDisabled}
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
            isSmall={true}
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
            Вы уверены, что хотите запустить модель{" "}
            <b>{renderData?.defaultConfig?.modelName || "—"}</b>?
          </Typography>
          <Typography>
            Это действие инициирует выполнение модели с текущими настройками:
          </Typography>

          {/* Параметры модели */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Параметры модели:</Typography>
            <Typography>
              <b>GPU Type:</b>{" "}
              {modelConfig?.gpu_types?.map((gpu) => gpu.type).join(", ") || "—"}
            </Typography>
            <Typography>
              <b>Health Check Timeout:</b>{" "}
              {modelConfig?.health_check_timeout || "—"} ms
            </Typography>
            <Typography>
              <b>Disk Space:</b> {modelConfig?.disk_space || "—"} GB
            </Typography>
            <Typography>
              <b>Port:</b> {modelConfig?.port || "—"}
            </Typography>
            <Typography>
              <b>Autoscaler Timeout:</b>{" "}
              {modelConfig?.autoscaler_timeout || "—"} sec
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
    </Box>
  );
}

export default SpecificModel;
