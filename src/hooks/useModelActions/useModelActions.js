import { useState } from "react";
import axiosInstance from "../../api";
import { modelsData } from "../../data/modelsData";
import { useNavigate } from "react-router-dom";

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
  modelConfig
}) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);

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
      console.log("launched")
      setModelStatus("running");
      alert("Модель успешно запущена.");
    } catch (error) {
      console.error("Ошибка при запуске модели:", error);
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
      console.log("launched")
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
      const { defaultConfig } = model;


      const vllmConfig = {
        model: defaultConfig.modelName,
        args: (args && args.length > 0)
          ? args.reduce(
            (acc, arg) => ({ ...acc, [arg.key]: arg.value }),
            {}
          )
          : (defaultConfig.args && defaultConfig.args.length > 0)
            ? defaultConfig.args.reduce(
              (acc, arg) => ({ ...acc, [arg.key]: arg.value }),
              {}
            )
            : {},

        flags: (flags && flags.length > 0)
          ? flags.reduce(
            (acc, flag) => ({ ...acc, [flag.key]: flag.value }),
            {}
          )
          : (defaultConfig.flags && defaultConfig.flags.length > 0)
            ? defaultConfig.flags.reduce(
              (acc, flag) => ({ ...acc, [flag.key]: flag.value }),
              {}
            )
            : {},

        finetuned_job_id: defaultConfig.finetuned_job_id,
      };

      const formData = new FormData();
      console.log(currentOrganization)
      formData.append("organization_id", currentOrganization?.id || "");
      formData.append("vllm_config_str", JSON.stringify(vllmConfig));
      formData.append("config_str", JSON.stringify(modelConfig));

      console.log(formData);

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
      console.log("not launched")
      navigate("/models")
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
