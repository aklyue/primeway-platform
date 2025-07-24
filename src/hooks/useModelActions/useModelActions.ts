import { useState } from "react";
import axiosInstance from "../../api";
import { useNavigate } from "react-router-dom";
import {
  AdditionalFields,
  BasicModel,
  FinetunedModel,
  ModelConfig,
} from "../../types";
import { Organization } from "../../store/slices/authSlice";
import axios from "axios";

interface useModelActionsProps {
  isBasic?: boolean;
  isFineTuned?: boolean;
  jobId?: string | null;
  authToken: string | null;
  model: BasicModel | FinetunedModel | null;
  currentOrganization: Organization | null;
  setModelStatus: (status: string) => void;
  args?: AdditionalFields[];
  flags?: AdditionalFields[];
  modelConfig: ModelConfig;
}

export const useModelActions = ({
  isBasic,
  isFineTuned,
  jobId,
  authToken,
  model,
  currentOrganization,
  setModelStatus,
  args,
  flags,
  modelConfig,
}: useModelActionsProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const handleStart = async () => {
    if (isBasic || isFineTuned) return;
    setLoading(true);

    try {
      if (!jobId) {
        alert("Идентификатор задачи отсутствует.");
        return;
      }

      await axiosInstance.post("/jobs/job-start", null, {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("launched");
      setModelStatus("running");
      alert("Модель успешно запущена.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Ошибка при запуске модели:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (isBasic) return;
    setLoading(true);

    try {
      if (!jobId) {
        alert("Идентификатор задачи отсутствует.");
        return;
      }

      await axiosInstance.post("/jobs/job-stop", null, {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setModelStatus("stopped");
      console.log("launched");
      alert("Модель успешно остановлена.");
    } catch (error) {
      console.error("Ошибка при остановке модели:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setLoading(true);
    try {
      if (model) {
        const { defaultConfig } = model;

        const vllmConfig = {
          model: defaultConfig.modelName,
          args:
            args && args.length > 0
              ? args.reduce(
                  (acc, arg) => ({ ...acc, [arg.key]: arg.value }),
                  {}
                )
              : defaultConfig.args && defaultConfig.args.length > 0
              ? defaultConfig.args.reduce(
                  (acc, arg) => ({ ...acc, [arg.key]: arg.value }),
                  {}
                )
              : {},

          flags:
            flags && flags.length > 0
              ? flags.reduce(
                  (acc, flag) => ({ ...acc, [flag.key]: flag.value }),
                  {}
                )
              : defaultConfig.flags && defaultConfig.flags.length > 0
              ? defaultConfig.flags.reduce(
                  (acc, flag) => ({ ...acc, [flag.key]: flag.value }),
                  {}
                )
              : {},

          finetuned_job_id: defaultConfig.finetuned_job_id,
        };

        const formData = new FormData();
        formData.append("organization_id", currentOrganization?.id || "");
        formData.append("vllm_config_str", JSON.stringify(vllmConfig));
        formData.append(
          "config_str",
          JSON.stringify(modelConfig || model?.defaultConfig.modelConfig)
        );

        const response = await axiosInstance.post("/models/run", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const { job_id } = response.data;

        alert(
          'Модель успешно запущена! Вы можете просмотреть ее в разделе "Задачи".'
        );
        console.log("not launched");
        navigate("/models");
      }
    } catch (error) {
      console.error("Ошибка при запуске модели:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleStart,
    handleStop,
    handleRun,
  };
};
