import { useState } from "react";
import axiosInstance from "../../api";

export const useModelActions = ({
  isBasic,
  jobId,
  authToken,
  model,
  currentOrganization,
  setModelStatus,
}) => {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (isBasic) return;
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

      setModelStatus("running");
      alert("Модель успешно запущена.");
    } catch (error) {
      console.error("Ошибка при запуске модели:", error);
      alert("Произошла ошибка при запуске модели.");
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
      alert("Модель успешно остановлена.");
    } catch (error) {
      console.error("Ошибка при остановке модели:", error);
      alert("Произошла ошибка при остановке модели.");
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!isBasic) return;
    setLoading(true);

    try {
      const { defaultConfig } = model;
      console.log("defaultConfig", defaultConfig);

      const vllmConfig = {
        model: defaultConfig.modelName,
        args: defaultConfig.args.reduce(
          (acc, arg) => ({ ...acc, [arg.key]: arg.value }),
          {}
        ),
        flags: defaultConfig.flags.reduce(
          (acc, flag) => ({ ...acc, [flag.key]: flag.value }),
          {}
        ),
        finetuned_job_id: defaultConfig.finetuned_job_id,
      };

      const formData = new FormData();
      formData.append("organization_id", currentOrganization?.id || "");
      formData.append("vllm_config_str", JSON.stringify(vllmConfig));
      formData.append("config_str", JSON.stringify(defaultConfig.modelConfig));

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
    } catch (error) {
      console.error("Ошибка при запуске модели:", error);
      alert("Произошла ошибка при запуске модели.");
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
