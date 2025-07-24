import { ReactNode, useCallback, useEffect, useState } from "react";
import axiosInstance from "../../../api";
import { getDatasets } from "../../../components/NoCode/api/datasetsApi";
import { Dataset } from "../../../types";
import { Organization } from "../../../store/slices/authSlice";
import axios from "axios";
import { SelectChangeEvent } from "@mui/material";

interface useTrainFormProps {
  currentOrganization: Organization | null;
  baseModel: string;
  datasetName: string;
  maxSeqLen: number | string;
  batchSize: number | string;
  gradAccum: number | string;
  epochs: number | string;
  learningRate: number | string;
  weightDecay: number | string;
  seed: number | string;
  loraR: number | string;
  loraAlpha: number | string;
  loraDropout: number | string;
  hfToken: string;
  setDatasetName: (name: string) => void;
}

export const useTrainForm = ({
  currentOrganization,
  baseModel,
  datasetName,
  maxSeqLen,
  batchSize,
  gradAccum,
  epochs,
  learningRate,
  weightDecay,
  seed,
  loraR,
  loraAlpha,
  loraDropout,
  hfToken,
  setDatasetName,
}: useTrainFormProps) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]); // Хранение списка датасетов
  const [selectedGpu, setSelectedGpu] = useState<string>("A100 PCIe"); // Состояние для выбранного GPU

  const [datasetOption, setDatasetOption] = useState<string>("hf"); // значение в <Select>
  const [hfDatasetId, setHfDatasetId] = useState<string>(""); // ввод из HF
  const [hfMode, setHfMode] = useState<boolean>(true);

  // 1. грузим датасеты
  useEffect(() => {
    if (currentOrganization) {
      getDatasets(currentOrganization.id)
        .then(setDatasets)
        .catch((err) => console.error("Ошибка загрузки датасетов:", err));
    }
  }, [currentOrganization?.id]);

  const handleDatasetChange = useCallback(
    (event: SelectChangeEvent<string>, child: ReactNode) => {
      const value = event.target.value;
      setDatasetOption(value);

      if (value === "hf") {
        setHfMode(true);
        setDatasetName("");
      } else {
        setHfMode(false);
        setHfDatasetId("");
        setDatasetName(value);
      }
    },
    []
  );

  const handleGpuChange = useCallback(
    (event: SelectChangeEvent<string>, child: ReactNode) => {
      setSelectedGpu(event.target.value); // Обновляем выбранный GPU
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    const isHf = hfMode;
    const config = {
      job_name: baseModel,
      gpu_types: [
        {
          type: selectedGpu, // Используем выбранный GPU
          count: 1, // Можно сделать поле выбора позже
        },
      ],
      base_model: baseModel,
      custom_dataset: !hfMode, // Если выбран кастомный датасет
      dataset_name: isHf ? hfDatasetId : datasetName, // Здесь передаем ID датасета
      disk_space: 30,
      creation_timeout: 600,
      env: [
        { name: "EPOCHS", value: String(epochs) },
        { name: "LR", value: String(learningRate) },
        { name: "MAX_SEQ_LEN", value: String(maxSeqLen) },
        { name: "BATCH_SIZE", value: String(batchSize) },
        { name: "GRADIENT_ACCUMULATION", value: String(gradAccum) },
        { name: "WEIGHT_DECAY", value: String(weightDecay) },
        { name: "SEED", value: String(seed) },
        { name: "LORA_R", value: String(loraR) },
        { name: "LORA_ALPHA", value: String(loraAlpha) },
        { name: "LORA_DROPOUT", value: String(loraDropout) },
        { name: "HF_TOKEN", value: hfToken },
      ],
    };

    const finetuningConfigStr = JSON.stringify(config);

    if (currentOrganization) {
      const formData = new FormData();
      formData.append("finetuning_config_str", finetuningConfigStr);
      formData.append("organization_id", currentOrganization.id);
      try {
        const response = await axiosInstance.post("/finetuning/run", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Задача дообучения успешно запущена:", response.data);
        alert("Задача дообучения успешно запущена");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error(
            "Ошибка при запуске дообучения:",
            error.response?.data || error.message
          );
          alert(
            "Ошибка при запуске задачи дообучения: " +
              (error.response?.data?.detail || error.message)
          );
        }
      }
    }
  }, [
    baseModel,
    selectedGpu,
    hfMode,
    hfDatasetId,
    datasetName,
    epochs,
    learningRate,
    maxSeqLen,
    batchSize,
    gradAccum,
    weightDecay,
    seed,
    loraAlpha,
    loraR,
    loraDropout,
    hfToken,
    currentOrganization?.id,
  ]);

  return {
    selectedGpu,
    handleGpuChange,
    datasetOption,
    handleDatasetChange,
    datasets,
    hfMode,
    hfDatasetId,
    setHfDatasetId,
    handleSubmit,
  };
};
