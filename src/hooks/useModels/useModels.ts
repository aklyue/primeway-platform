import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api";
import { Organization } from "../../store/slices/authSlice";
import {
  BasicModel,
  FinetunedModel,
  Job,
  JupyterSession,
  Model,
} from "../../types";

interface useModelsProps {
  currentOrganization: Organization | null;
  authToken: string | null;
  decodedModelId?: string;
  modelsData: BasicModel[];
  fineTunedData: BasicModel[];
  onLaunchedModelChange: (value: boolean) => void;
}

export default function useModels({
  currentOrganization,
  authToken,
  decodedModelId,
  modelsData = [],
  fineTunedData = [],
  onLaunchedModelChange,
}: useModelsProps) {
  const [launchedModels, setLaunchedModels] = useState<Job[]>([]);
  const [fineTunedModels, setFineTunedModels] = useState<FinetunedModel[]>([]);
  const [model, setModel] = useState<BasicModel | null>(null);
  const [launchedModel, setLaunchedModel] = useState<Job | null>(null);
  const [fineTunedModel, setFineTunedModel] = useState<FinetunedModel | null>(
    null
  );
  const [modelStatus, setModelStatus] = useState<string | null>(null);

  const fetchLaunchedModels = useCallback(async () => {
    if (!currentOrganization || !authToken) return;
    try {
      const { data = [] } = await axiosInstance.get<Job[]>(
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
      const { data = [] } = await axiosInstance.get<FinetunedModel[]>(
        "/models/finetuned",
        {
          params: { organization_id: currentOrganization.id },
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
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
      setModelStatus(found.last_execution_status ?? null);
    }
  }, [decodedModelId, modelsData]);

  useEffect(() => {
    const found = launchedModels.find((m) => m.job_id === decodedModelId);
    if (found) {
      setLaunchedModel(found);
      setModelStatus(found.last_execution_status ?? null);
      onLaunchedModelChange?.(true);
    } else {
      onLaunchedModelChange?.(false);
    }
  }, [launchedModels, decodedModelId, onLaunchedModelChange]);

  useEffect(() => {
    const found = fineTunedModels.find((m) => m.job_id === decodedModelId);
    if (found) {
      const base: BasicModel | undefined = fineTunedData.find(
        (m) => m.name === found.base_model
      );
      const cfg: Model | undefined = base?.defaultConfig;
      const merged = {
        ...found,
        defaultConfig: {
          ...cfg,
          modelName: cfg?.modelName ?? found.base_model,
          finetuned_job_id: found.job_id,
          modelConfig: {
            ...(cfg?.modelConfig || {}),
            job_name: `${found.artifact_name}-deploy`,
          },
        },
      };
      setFineTunedModel(merged as FinetunedModel);
      setModelStatus(found.last_execution_status ?? null);
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
