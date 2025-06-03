import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { getDatasets } from "../../api/datasetsApi"; // Подключаем функцию для получения датасетов
import { OrganizationContext } from "../../../Organization/OrganizationContext";
import axiosInstance from "../../../../api";

const AVAILABLE_GPUS = {
  "A100 PCIe": { name: "A100 PCIe", memoryInGb: 80, costPerHour: 260 },
  "A100 SXM": { name: "A100 SXM", memoryInGb: 80, costPerHour: 299 },
  A40: { name: "A40", memoryInGb: 48, costPerHour: 90 },
  "RTX 4090": { name: "RTX 4090", memoryInGb: 24, costPerHour: 130 },
  "H100 SXM": { name: "H100 SXM", memoryInGb: 80, costPerHour: 399 },
  "H100 NVL": { name: "H100 NVL", memoryInGb: 94, costPerHour: 355 },
  "H100 PCIe": { name: "H100 PCIe", memoryInGb: 80, costPerHour: 335 },
  "H200 SXM": { name: "H200 SXM", memoryInGb: 143, costPerHour: 460 },
  L4: { name: "L4", memoryInGb: 24, costPerHour: 90 },
  L40: { name: "L40", memoryInGb: 48, costPerHour: 170 },
  L40S: { name: "L40S", memoryInGb: 48, costPerHour: 175 },
  "RTX 2000 Ada": { name: "RTX 2000 Ada", memoryInGb: 16, costPerHour: 55 },
  "RTX 6000 Ada": { name: "RTX 6000 Ada", memoryInGb: 48, costPerHour: 140 },
  "RTX A6000": { name: "RTX A6000", memoryInGb: 48, costPerHour: 130 },
};

export default function TrainForm({
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
  isLoading,
  setBaseModel,
  setDatasetName,
  setMaxSeqLen,
  setBatchSize,
  setGradAccum,
  setEpochs,
  setLearningRate,
  setWeightDecay,
  setSeed,
  setLoraR,
  setLoraAlpha,
  setLoraDropout,
  setHfToken,
}) {
  const [datasets, setDatasets] = useState([]); // Хранение списка датасетов
  const [selectedGpu, setSelectedGpu] = useState("A100 PCIe"); // Состояние для выбранного GPU
  const { currentOrganization } = useContext(OrganizationContext);

  const [datasetOption, setDatasetOption] = useState("hf"); // значение в <Select>
  const [hfDatasetId, setHfDatasetId] = useState(""); // ввод из HF
  const [hfMode, setHfMode] = useState(true);

  // 1. грузим датасеты
  useEffect(() => {
    getDatasets(currentOrganization.id)
      .then(setDatasets)
      .catch((err) => console.error("Ошибка загрузки датасетов:", err));
  }, [currentOrganization.id]);

  const handleDatasetChange = (event) => {
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
  };
  const handleGpuChange = (event) => {
    setSelectedGpu(event.target.value); // Обновляем выбранный GPU
  };

  const handleSubmit = async () => {
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
    console.log(config);

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
      console.error(
        "Ошибка при запуске дообучения:",
        error.response?.data || error.message
      );
      alert(
        "Ошибка при запуске задачи дообучения: " +
          (error.response?.data?.detail || error.message)
      );
    }
  };

  return (
    <Box sx={{ maxHeight: "80vh", overflowY: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Настройка дообучения
      </Typography>

      {/* Выбор GPU */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Выберите GPU</InputLabel>
        <Select
          value={selectedGpu}
          onChange={handleGpuChange}
          label="Выберите GPU"
        >
          {Object.keys(AVAILABLE_GPUS).map((gpuKey) => (
            <MenuItem key={gpuKey} value={gpuKey}>
              {AVAILABLE_GPUS[gpuKey].name} -{" "}
              {AVAILABLE_GPUS[gpuKey].memoryInGb} GB
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Выбор датасета */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Набор Данных</InputLabel>
        <Select
          value={datasetOption}
          onChange={handleDatasetChange}
          label="(Набор Данных)"
        >
          {/* сначала ваши датасеты */}
          {datasets.map((ds) => (
            <MenuItem key={ds.id} value={ds.dataset_id}>
              {ds.name}
            </MenuItem>
          ))}

          {/* последний пункт – из HuggingFace */}
          <MenuItem value="hf">Из HuggingFace</MenuItem>
        </Select>
      </FormControl>

      {hfMode && (
        <TextField
          label="Название набора данных из HuggingFace"
          fullWidth
          sx={{ mb: 2 }}
          value={hfDatasetId}
          onChange={(e) => setHfDatasetId(e.target.value)}
        />
      )}

      {/* Остальные параметры формы */}
      <TextField
        label="Базовая модель"
        fullWidth
        sx={{ mb: 2 }}
        value={baseModel}
        onChange={(e) => setBaseModel(e.target.value)}
      />

      <TextField
        label="MAX_SEQ_LEN"
        fullWidth
        sx={{ mb: 2 }}
        value={maxSeqLen}
        onChange={(e) => setMaxSeqLen(e.target.value)}
      />

      <TextField
        label="BATCH_SIZE"
        fullWidth
        sx={{ mb: 2 }}
        value={batchSize}
        onChange={(e) => setBatchSize(e.target.value)}
      />

      <TextField
        label="GRADIENT_ACCUMULATION"
        fullWidth
        sx={{ mb: 2 }}
        value={gradAccum}
        onChange={(e) => setGradAccum(e.target.value)}
      />

      <TextField
        label="NUM_EPOCHS"
        fullWidth
        sx={{ mb: 2 }}
        value={epochs}
        onChange={(e) => setEpochs(e.target.value)}
      />

      <TextField
        label="LEARNING_RATE"
        fullWidth
        sx={{ mb: 2 }}
        value={learningRate}
        onChange={(e) => setLearningRate(e.target.value)}
      />

      <TextField
        label="WEIGHT_DECAY"
        fullWidth
        sx={{ mb: 2 }}
        value={weightDecay}
        onChange={(e) => setWeightDecay(e.target.value)}
      />

      <TextField
        label="SEED"
        fullWidth
        sx={{ mb: 2 }}
        value={seed}
        onChange={(e) => setSeed(e.target.value)}
      />

      <TextField
        label="LORA_R"
        fullWidth
        sx={{ mb: 2 }}
        value={loraR}
        onChange={(e) => {
          setLoraR(e.target.value);
          setLoraAlpha(e.target.value); // Auto set LORA_ALPHA when LORA_R changes
        }}
      />

      <TextField
        label="LORA_ALPHA"
        fullWidth
        sx={{ mb: 2 }}
        value={loraAlpha}
        onChange={(e) => setLoraAlpha(e.target.value)}
      />

      <TextField
        label="LORA_DROPOUT"
        fullWidth
        sx={{ mb: 2 }}
        value={loraDropout}
        onChange={(e) => setLoraDropout(e.target.value)}
      />

      <TextField
        label="HF_TOKEN"
        fullWidth
        sx={{ mb: 2 }}
        value={hfToken}
        onChange={(e) => setHfToken(e.target.value)}
      />

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Button
          variant="contained"
          sx={{
            color: "white",
            mb: 1,
            bgcolor: "#597ad3",
            "&:hover": {
              bgcolor: "#7c97de",
            },
          }}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            "Запустить дообучение новой модели"
          )}
        </Button>
      </Box>
    </Box>
  );
}
