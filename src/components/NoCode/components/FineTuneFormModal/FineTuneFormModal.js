import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import axiosInstance from "../../../../api";
import { getDatasets, uploadDataset } from "../../api/datasetsApi";
import { OrganizationContext } from "../../../Organization/OrganizationContext";

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

/* ───────────────────────── COMPONENT ───────────────────────── */
export default function FineTuningJobFormModal({ open, onClose }) {
  const { currentOrganization } = useContext(OrganizationContext);
  const organizationId = currentOrganization.id;

  /* dataset state */
  const [datasets, setDatasets] = useState([]);
  const [loadingDS, setLoadingDS] = useState(false);
  const [datasetOption, setDatasetOption] = useState(""); // 'hf' | dataset_id
  const [hfDatasetId, setHfDatasetId] = useState("");
  const hfMode = datasetOption === "hf";

  /* form state */
  const [selectedGpu, setSelectedGpu] = useState("A100 PCIe");
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
  const [isLoading, setIsLoading] = useState(false);

  /* file input ref (for reliable click) */
  const fileInputRef = useRef(null);

  /* load datasets each open */
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingDS(true);
        const list = await getDatasets(organizationId);
        setDatasets(list);
        if (!hfMode && !datasetOption && list.length) {
          setDatasetOption(list[0].dataset_id); // 🡐 use dataset_id
        }
      } finally {
        setLoadingDS(false);
      }
    })();
  }, [open, organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* upload dataset */
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadDataset(file, organizationId);
      const list = await getDatasets(organizationId);
      setDatasets(list);
      setDatasetOption(list[0].dataset_id); // 🡐 use dataset_id
      alert("Dataset uploaded");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  /* handlers */
  const handleDatasetChange = (e) => setDatasetOption(e.target.value);
  const handleGpuChange = (e) => setSelectedGpu(e.target.value);

  const handleSubmit = async () => {
    if (!baseModel.trim()) return alert("Базовая модель не указана");
    if (!artifactName.trim())
      return alert("Укажите название артефакта / адаптера");
    if (hfMode && !hfDatasetId.trim())
      return alert("Укажите HF dataset ID или выберите локальный датасет");

    const config = {
      job_name: baseModel,
      gpu_types: [{ type: selectedGpu, count: 1 }],
      base_model: baseModel,
      artifact_name: artifactName.trim(),
      custom_dataset: !hfMode,
      dataset_id: hfMode ? hfDatasetId.trim() : datasetOption.trim(), // ✔
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

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("finetuning_config_str", JSON.stringify(config));
      formData.append("organization_id", organizationId);

      await axiosInstance.post("/finetuning/run", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Задача дообучения успешно запущена");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Ошибка запуска: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  /* ──────────────────────── RENDER ──────────────────────── */
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 520,
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 3,
          maxHeight: "85vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" textAlign="center">
          Настройка дообучения
        </Typography>

        {/* GPU */}
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

        {/* DATASET SELECT */}
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
                    {/* hidden file input to trigger normal file picker */}
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
            <MenuItem
              key={ds.dataset_id}
              value={ds.dataset_id}
              sx={{ alignItems: "flex-start", whiteSpace: "normal" }}
            >
              {ds.dataset_id} — {ds.name}
            </MenuItem>
          ))}

          <MenuItem value="hf">Из HuggingFace</MenuItem>
        </TextField>

        {hfMode && (
          <TextField
            label="HF dataset ID"
            fullWidth
            value={hfDatasetId}
            onChange={(e) => setHfDatasetId(e.target.value)}
          />
        )}

        {/* MAIN PARAMS */}
        <TextField
          label="Базовая модель"
          fullWidth
          value={baseModel}
          onChange={(e) => setBaseModel(e.target.value)}
        />
        <TextField
          label="Adapter / artifact name"
          fullWidth
          value={artifactName}
          onChange={(e) => setArtifactName(e.target.value)}
        />
        <TextField
          label="MAX_SEQ_LEN"
          fullWidth
          value={maxSeqLen}
          onChange={(e) => setMaxSeqLen(e.target.value)}
        />
        <TextField
          label="BATCH_SIZE"
          fullWidth
          value={batchSize}
          onChange={(e) => setBatchSize(e.target.value)}
        />
        <TextField
          label="GRADIENT_ACCUMULATION"
          fullWidth
          value={gradAccum}
          onChange={(e) => setGradAccum(e.target.value)}
        />
        <TextField
          label="NUM_EPOCHS"
          fullWidth
          value={epochs}
          onChange={(e) => setEpochs(e.target.value)}
        />
        <TextField
          label="LEARNING_RATE"
          fullWidth
          value={learningRate}
          onChange={(e) => setLearningRate(e.target.value)}
        />
        <TextField
          label="WEIGHT_DECAY"
          fullWidth
          value={weightDecay}
          onChange={(e) => setWeightDecay(e.target.value)}
        />
        <TextField
          label="SEED"
          fullWidth
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
        />
        <TextField
          label="LORA_R"
          fullWidth
          value={loraR}
          onChange={(e) => {
            setLoraR(e.target.value);
            setLoraAlpha(e.target.value);
          }}
        />
        <TextField
          label="LORA_ALPHA"
          fullWidth
          value={loraAlpha}
          onChange={(e) => setLoraAlpha(e.target.value)}
        />
        <TextField
          label="LORA_DROPOUT"
          fullWidth
          value={loraDropout}
          onChange={(e) => setLoraDropout(e.target.value)}
        />
        <TextField
          label="HF_TOKEN"
          fullWidth
          value={hfToken}
          onChange={(e) => setHfToken(e.target.value)}
        />

        {/* ACTIONS */}
        <Box sx={{ textAlign: "center", pt: 1 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Отмена
          </Button>
          <Button
            variant="contained"
            sx={{
              color: "#fff",
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
              "Запустить дообучение"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
