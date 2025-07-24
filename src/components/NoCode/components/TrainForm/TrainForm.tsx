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

import useTrainForm from "../../../../hooks/NoCode/useTrainForm";

import { AVAILABLE_GPUS } from "../../../../constants/AVAILABLE_GPUS";
import { selectCurrentOrganization } from "../../../../store/selectors/organizationsSelectors";
import { useAppSelector } from "../../../../store/hooks";

export interface TrainFormProps {
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
  isLoading: boolean;

  setBaseModel: (model: string) => void;
  setDatasetName: (name: string) => void;
  setMaxSeqLen: (value: number | string) => void;
  setBatchSize: (value: number | string) => void;
  setGradAccum: (value: number | string) => void;
  setEpochs: (value: number | string) => void;
  setLearningRate: (value: number | string) => void;
  setWeightDecay: (value: number | string) => void;
  setSeed: (value: number | string) => void;
  setLoraR: (value: number | string) => void;
  setLoraAlpha: (value: number | string) => void;
  setLoraDropout: (value: number | string) => void;
  setHfToken: (token: string) => void;
}

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
}: TrainFormProps) {
  const currentOrganization = useAppSelector(selectCurrentOrganization);

  const {
    selectedGpu,
    handleGpuChange,
    datasetOption,
    handleDatasetChange,
    datasets,
    hfMode,
    hfDatasetId,
    setHfDatasetId,
    handleSubmit,
  } = useTrainForm({
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
  });

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
              {AVAILABLE_GPUS[gpuKey as keyof typeof AVAILABLE_GPUS].name} -{" "}
              {AVAILABLE_GPUS[gpuKey as keyof typeof AVAILABLE_GPUS].memoryInGb}{" "}
              GB
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
