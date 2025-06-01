import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { OrganizationContext } from "../Organization/OrganizationContext";
import axiosInstance from "../../api";
import { getDatasets, uploadDataset } from "./datasetsApi";

/* ───────────────────────── CONSTANTS ───────────────────────── */
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

/* ───────────────────────── HELPERS ───────────────────────── */
const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

/* ───────────────────────── COMPONENT ───────────────────────── */
export default function FineTuningJobCreatePage() {
  const { currentOrganization } = useContext(OrganizationContext);
  const organizationId = currentOrganization?.id;

  /* ───── dataset state ───── */
  const [datasets, setDatasets] = useState([]);       // список с бэка
  const [loadingDS, setLoadingDS] = useState(false);
  const [datasetOption, setDatasetOption] = useState(""); // 'hf' | dataset_id
  const [hfDatasetId, setHfDatasetId] = useState("");
  const hfMode = datasetOption === "hf";

  /* ───── form state ───── */
  const [selectedGpu, setSelectedGpu] = useState("A100 PCIe");
  const [gpuCount,  setGpuCount]  = useState(1);
  const [baseModel, setBaseModel] = useState("");
  const [artifactName, setArtifactName] = useState("");
  const [maxSeqLen, setMaxSeqLen] = useState(8192);
  const [batchSize, setBatchSize] = useState(1);
  const [gradAccum, setGradAccum] = useState(1);
  const [epochs, setEpochs] = useState(5);
  const [learningRate, setLearningRate] = useState(2e-4);
  const [weightDecay, setWeightDecay] = useState(0);
  const [seed, setSeed] = useState(42);
  const [loraR, setLoraR] = useState(64);
  const [loraAlpha, setLoraAlpha] = useState(64);
  const [loraDropout, setLoraDropout] = useState(0.05);
  const [hfToken, setHfToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* confirm dialog */
  const [confirmOpen, setConfirmOpen] = useState(false);

  /* file input ref (для триггера upload) */
  const fileInputRef = useRef(null);

  /* ───── LOAD DATASETS ───── */
  useEffect(() => {
    const fetchDS = async () => {
      try {
        setLoadingDS(true);
        const list = await getDatasets(organizationId);
        setDatasets(list);
        if (!datasetOption && list.length) setDatasetOption(list[0].dataset_id); // первый по умолчанию
      } finally {
        setLoadingDS(false);
      }
    };
    if (organizationId) fetchDS();
  }, [organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGpuCountChange = (e) => {
    const v = Math.max(1, Number(e.target.value)); // never below 1
    setGpuCount(v);
  };

  /* ───── UPLOAD DATASET ───── */
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadDataset(file, organizationId);
      const list = await getDatasets(organizationId);
      setDatasets(list);
      setDatasetOption(list[0].dataset_id);
      alert("Dataset uploaded");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  /* ───── HANDLERS ───── */
  const handleDatasetChange = (e) => setDatasetOption(e.target.value);
  const handleGpuChange = (e) => setSelectedGpu(e.target.value);

  const assembledConfig = useMemo(
    () => ({
      job_name: baseModel,
      gpu_types: [{ type: selectedGpu, count: gpuCount }],
      base_model: baseModel,
      artifact_name: artifactName.trim(),
      custom_dataset: !hfMode,
      dataset_id: hfMode ? hfDatasetId.trim() : datasetOption.trim(),
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
    }),
    [
      baseModel,
      selectedGpu,
      gpuCount,
      artifactName,
      hfMode,
      hfDatasetId,
      datasetOption,
      epochs,
      learningRate,
      maxSeqLen,
      batchSize,
      gradAccum,
      weightDecay,
      seed,
      loraR,
      loraAlpha,
      loraDropout,
      hfToken,
    ],
  );

  const handleCreate = () => {
    if (!baseModel.trim()) return alert("Укажите базовую модель");
    if (hfMode && !hfDatasetId.trim()) return alert("Укажите HF dataset ID");
    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    setConfirmOpen(false);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("finetuning_config_str", JSON.stringify(assembledConfig));
      formData.append("organization_id", organizationId);
      await axiosInstance.post("/finetuning/run", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Задача дообучения успешно запущена");
      // здесь можно сделать редирект, если нужно
    } catch (err) {
      console.error(err);
      alert("Ошибка запуска: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ───── UI ───── */
  return (
    <Box sx={{ p: 3 }}>
      <Toolbar disableGutters sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Создать задачу дообучения
        </Typography>
        <Tooltip title="Вернуться к списку">
          {/* Замените на <Link> если используете react-router */}
          <Button href="/fine-tuning" startIcon={<AddCircleOutlineIcon />}>
            К списку задач
          </Button>
        </Tooltip>
      </Toolbar>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid rgba(0,0,0,0.12)" }}>
        {/* SECTION: BASE MODEL & DATASET */}
        <Typography variant="subtitle1" gutterBottom>
          Базовая модель и датасет
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Базовая модель"
              fullWidth
              value={baseModel}
              onChange={(e) => setBaseModel(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Суффикс адаптера"
              fullWidth
              value={artifactName}
              onChange={(e) => setArtifactName(e.target.value)}
            />
          </Grid>

          {/* DATASET SELECT */}
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Набор данных"
              value={datasetOption}
              onChange={handleDatasetChange}
              disabled={loadingDS}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {loadingDS ? (
                      <CircularProgress size={20} />
                    ) : (
                      <>
                        <input
                          ref={fileInputRef}
                          hidden
                          type="file"
                          accept=".jsonl,.jsonl.gz"
                          onChange={handleUpload}
                        />
                        <IconButton
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <UploadFileIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </InputAdornment>
                ),
              }}
            >
              {datasets.map((ds) => (
                <MenuItem key={ds.dataset_id} value={ds.dataset_id} sx={{ alignItems: "flex-start" }}>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ds.dataset_id}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {ds.name} • {formatBytes(ds.size)} •{" "}
                      {new Date(ds.created_at).toLocaleString()}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
              <MenuItem value="hf">Из HuggingFace</MenuItem>
            </TextField>
          </Grid>

          {hfMode && (
            <Grid item xs={12}>
              <TextField
                label="HF Dataset ID"
                fullWidth
                value={hfDatasetId}
                onChange={(e) => setHfDatasetId(e.target.value)}
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* SECTION: TRAINING CONFIG */}
        <Typography variant="subtitle1" gutterBottom>
          Параметры обучения
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>GPU</InputLabel>
              <Select value={selectedGpu} onChange={handleGpuChange} label="GPU">
                {Object.keys(AVAILABLE_GPUS).map((k) => (
                  <MenuItem key={k} value={k}>
                    {AVAILABLE_GPUS[k].name} – {AVAILABLE_GPUS[k].memoryInGb} GB
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* GPU count  ← NEW */}
          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="GPU count"
              inputProps={{ min: 1 }}
              fullWidth
              value={gpuCount}
              onChange={handleGpuCountChange}
            />
          </Grid>

          {/* базовые гиперпараметры */}
          <Grid item xs={6} sm={3}>
            <TextField
              label="MAX_SEQ_LEN"
              fullWidth
              value={maxSeqLen}
              onChange={(e) => setMaxSeqLen(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="BATCH_SIZE"
              fullWidth
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="GRAD_ACCUM"
              fullWidth
              value={gradAccum}
              onChange={(e) => setGradAccum(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="EPOCHS"
              fullWidth
              value={epochs}
              onChange={(e) => setEpochs(e.target.value)}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              label="LR"
              fullWidth
              value={learningRate}
              onChange={(e) => setLearningRate(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="WEIGHT_DECAY"
              fullWidth
              value={weightDecay}
              onChange={(e) => setWeightDecay(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="SEED"
              fullWidth
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              label="LORA_R"
              fullWidth
              value={loraR}
              onChange={(e) => {
                setLoraR(e.target.value);
                setLoraAlpha(e.target.value); // keep α = r by default
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="LORA_ALPHA"
              fullWidth
              value={loraAlpha}
              onChange={(e) => setLoraAlpha(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="LORA_DROPOUT"
              fullWidth
              value={loraDropout}
              onChange={(e) => setLoraDropout(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="HF_TOKEN"
              fullWidth
              value={hfToken}
              onChange={(e) => setHfToken(e.target.value)}
            />
          </Grid>
        </Grid>

        {/* ACTION BUTTONS */}
        <Box sx={{ textAlign: "right", mt: 4 }}>
          <Button onClick={() => window.history.back()} sx={{ mr: 1 }}>
            Отмена
          </Button>
          <Button 
            variant="contained" 
            disabled={isSubmitting} 
            onClick={handleCreate}
            color="primary"
            sx={{
              color: "white",
              padding: "8px 16px",
              bgcolor: "#597ad3",
              "&:hover": {
                bgcolor: "#7c97de",
              },
            }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Запустить"}
          </Button>
        </Box>
      </Paper>

      {/* ───── CONFIRMATION DIALOG ───── */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Подтвердите создание задачи</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Typography>
              <b>Base model:</b> {assembledConfig.base_model || "—"}
            </Typography>
            <Typography>
              <b>Суффикс Адаптера:</b> {assembledConfig.artifact_name || "—"}
            </Typography>
            <Typography>
              <b>GPU:</b> {selectedGpu} ({gpuCount}×)
            </Typography>
            <Typography>
              <b>Dataset:</b> {hfMode ? hfDatasetId : datasetOption}
            </Typography>
            <Typography>
              <b>Epochs:</b> {epochs}
            </Typography>
            <Typography>
              <b>Learning rate:</b> {learningRate}
            </Typography>
            <Typography>
              <b>Batch size:</b> {batchSize}
            </Typography>
            <Typography>
              <b>Grad. accum:</b> {gradAccum}
            </Typography>
            <Typography>
              <b>LORA r/α:</b> {loraR}/{loraAlpha}
            </Typography>
            {/* при желании добавьте другие поля */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            disabled={isSubmitting} 
            onClick={handleSubmit}
            color="primary"
            sx={{
              color: "white",
              padding: "8px 16px",
              bgcolor: "#597ad3",
              "&:hover": {
                bgcolor: "#7c97de",
              },
            }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Подтвердить запуск"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
