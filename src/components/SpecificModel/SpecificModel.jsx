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
  const [model, setModel] = useState(null);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [launchedModel, setLaunchedModel] = useState(null)
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

  useEffect(() => {
    fetchLaunchedModels();
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
      console.log(launchedModel)
    }
  }, [launchedModels]);

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
    jobId: launchedModel?.job_id,
    setModelStatus,
    modelStatus,
    handleRun,
    handleStart,
    handleStop,
    loading,
  });

  const isLaunchedModel = !!launchedModel;

  if (!model && !launchedModel) {
    return <Typography sx={{ p: 4 }}>Модель не найдена</Typography>;
  }
  if (!model && !launchedModel) {
    return <Typography sx={{ p: 4 }}>Модель не найдена</Typography>;
  }

  const renderData = model || launchedModel;

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
            value: renderData.defaultConfig?.modelConfig?.job_name,
          }
        ] : [
          { label: "Job ID", value: renderData.job_id },
          { label: "Job Name", value: renderData.job_name },
          { label: "Created At", value: renderData.created_at },
          { label: "Last Execution Status", value: renderData.last_execution_status },
          { label: "Job URL", value: renderData.job_url },
          { label: "GPU Type", value: renderData.gpu_type?.type },
          { label: "Health Status", value: renderData.health_status },
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
          <ConfigureModelForm
            initialConfig={initialConfig || renderData.defaultConfig}
            onClose={toggleConfigure}
          />
        </Box>
      </Collapse>
    </Box>
  );
}

export default SpecificModel;
