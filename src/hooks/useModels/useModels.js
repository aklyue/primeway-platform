import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api";

export default function useModels({
  currentOrganization,
  authToken,
  decodedModelId,
  modelsData = [],
  fineTunedData = [],
  onLaunchedModelChange,
}) {
  const [launchedModels, setLaunchedModels] = useState([]);
  const [fineTunedModels, setFineTunedModels] = useState([]);
  const [model, setModel] = useState(null);
  const [launchedModel, setLaunchedModel] = useState(null);
  const [fineTunedModel, setFineTunedModel] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);

  const fetchLaunchedModels = useCallback(async () => {
    if (!currentOrganization || !authToken) return;
    try {
      const { data = [] } = await axiosInstance.get(
        "/jobs/get-vllm-deploy-jobs",
        {
          params: { organization_id: currentOrganization.id },
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setLaunchedModels(data);
    } catch (err) {
      console.error("Ошибка при получении запущенных моделей:", err);
    }
  }, [currentOrganization, authToken]);

  const fetchFineTunedModels = useCallback(async () => {
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
  }, [currentOrganization, authToken]);

  useEffect(() => {
    fetchLaunchedModels();
    fetchFineTunedModels();
  }, [currentOrganization, authToken]);

  useEffect(() => {
    const found = modelsData.find((m) => m.id === decodedModelId);
    if (found) {
      setModel(found);
      setModelStatus(found.last_execution_status);
    }
  }, [decodedModelId, modelsData]);

  useEffect(() => {
    const found = launchedModels.find((m) => m.job_id === decodedModelId);
    if (found) {
      setLaunchedModel(found);
      setModelStatus(found.last_execution_status);
      onLaunchedModelChange?.(true);
    } else {
      onLaunchedModelChange?.(false);
    }
  }, [launchedModels, decodedModelId, onLaunchedModelChange]);

  useEffect(() => {
    const found = fineTunedModels.find((m) => m.job_id === decodedModelId);
    if (found) {
      const base = fineTunedData.find((m) => m.name === found.base_model) || {};
      const cfg = base.defaultConfig || {};
      const merged = {
        ...found,
        defaultConfig: {
          ...cfg,
          modelName: cfg.modelName ?? found.base_model,
          finetuned_job_id: found.job_id,
          modelConfig: {
            ...(cfg.modelConfig || {}),
            job_name: `${found.artifact_name}-deploy`,
          },
        },
      };
      setFineTunedModel(merged);
      setModelStatus(found.last_execution_status);
    }
  }, [fineTunedModels, decodedModelId, fineTunedData]);

  useEffect(() => {
    if (!authToken || !currentOrganization?.id) return;

    const interval = setInterval(() => {
      fetchLaunchedModels();
      fetchFineTunedModels();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchLaunchedModels, fetchFineTunedModels]);

  const isLaunchedModel = !!launchedModel;
  const isFineTuned = !!fineTunedModel;

  const renderData = model || launchedModel || fineTunedModel;

  return {
    launchedModels,
    fineTunedModels,
    model,
    launchedModel,
    fineTunedModel,
    modelStatus,
    setModelStatus,
    isLaunchedModel,
    isFineTuned,
    renderData,
  };
}
