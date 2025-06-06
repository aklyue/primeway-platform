import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { modelsData } from "../../data/modelsData";
import { Box, Typography, Button, Modal, Grid, Collapse } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ConfigureModelForm from "../ConfigureModelForm";
import useModelActions from "../../hooks/useModelActions";
import useModelButtonLogic from "../../hooks/useModelButtonLogic";
import ModelActions from "../../UI/ModelActions";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import axiosInstance from "../../api";
function SpecificModel({ initialConfig, isBasic: passedIsBasic, isMobile }) {
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

  // Функция для получения дообученных моделей
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
      // Встраиваем функцию buildDefaultConfig сюда
      const buildDefaultConfig = (ft) => {
        const base = modelsData.find((m) => m.name === ft.base_model) || {};
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

      // Получаем объединенную конфигурацию
      const mergedModel = {
        ...foundModel,
        defaultConfig: buildDefaultConfig(foundModel), // Объединяем конфигурацию
      };

      // Устанавливаем модель с объединенными данными
      setFineTunedModel(mergedModel);
      setModelStatus(foundModel.last_execution_status);
    }
  }, [fineTunedModels]);

  const toggleConfigure = () => setIsConfigureOpen((prev) => !prev);

  const isBasic = passedIsBasic ?? model?.isBasic;


  const { handleRun, handleStart, handleStop, loading } = useModelActions({
    model,
    currentOrganization,
    authToken,
    setModelStatus,
  });

  const { actionButtonText, actionButtonHandler, isActionButtonDisabled } = useModelButtonLogic({
    model,
    isBasic,
    jobId: launchedModel?.job_id || fineTunedModel?.defaultConfig.
      finetuned_job_id,
    setModelStatus,
    modelStatus,
    handleRun,
    handleStart,
    handleStop,
    loading,
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
          { label: "Job ID", value: renderData.job_id },
          {
            label: "Job Name", value: renderData.job_name || renderData.artifact_name
          },
          { label: "Created At", value: renderData.created_at },
          ...(fineTunedModel ? [] : [
            { label: "Last Execution Status", value: renderData.last_execution_status },
            { label: "Job URL", value: renderData.job_url },
            { label: "GPU Type", value: renderData.gpu_type?.type },
          ]),
          { label: "Health Status", value: renderData.health_status || renderData.status },
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
        {!fineTunedModel && (
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
          actionButtonHandler={actionButtonHandler}
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
          {!fineTunedModel && (
            <ConfigureModelForm
              initialConfig={initialConfig || renderData.defaultConfig}
              onClose={toggleConfigure}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export default SpecificModel;
