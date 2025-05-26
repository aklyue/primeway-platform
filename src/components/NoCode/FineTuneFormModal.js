import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  TextField,
  MenuItem,
  Box,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import axiosInstance from "../../api";
import { getDatasets, uploadDataset } from "./datasetsApi";
import { OrganizationContext } from "../Organization/OrganizationContext";

/* ------------------ defaults sent to the backend ---------------- */
const DEFAULTS = {
  adapter: "lora",
  lora_alpha: 64,
  lora_dropout: 0.05,
  lora_target_linear: true,
  sequence_len: 8192,
  optimizer: "adamw_bnb_8bit",
  lr_scheduler: "cosine",
  load_in_8bit: false,
  strict: false,
  bf16: true,
  fp16: false,
  tf32: true,
  gradient_checkpointing: true,
  logging_steps: 1,
  warmup_ratio: 0.1,
  output_dir: "./outputs/out",
};

/* ----------------------------------------------------------------- */
export default function FineTuneFormModal({ open, onClose, baseModel = "" }) {
  const { currentOrganization } = useContext(OrganizationContext);

  /* ---------------- form state ---------------- */
  const [name, setName] = useState(""); // internal model title shown to the user later
  const [adapterName, setAdapterName] = useState(""); // goes straight to backend as artifact name
  const [datasetId, setDatasetId] = useState("");
  const [epochs, setEpochs] = useState(5);
  const [batch, setBatch] = useState(1);
  const [lr, setLr] = useState(0.0002);
  const [loraR, setLoraR] = useState(64);

  /* --------------- dataset state -------------- */
  const [datasets, setDatasets] = useState([]);
  const [loadingDS, setLoadingDS] = useState(false);

  const fetchDatasets = async () => {
    try {
      setLoadingDS(true);
      const list = await getDatasets(currentOrganization.id);
      setDatasets(list);
    } finally {
      setLoadingDS(false);
    }
  };

  /* Load list each time the modal opens */
  useEffect(() => {
    if (open) fetchDatasets();
  }, [open]);

  /* Clear the form each time the modal opens */
  useEffect(() => {
    if (open) {
      setName("");
      setAdapterName("");
      setDatasetId("");
      setEpochs(5);
      setBatch(1);
      setLr(0.0002);
      setLoraR(64);
    }
  }, [open]);

  /* -------------- upload handler -------------- */
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadDataset(file, currentOrganization.id);
      await fetchDatasets();
      alert("Dataset uploaded");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  /* ---------------- submit -------------------- */
  const handleSubmit = async () => {
    if (!name.trim()) return alert("Введите название модели");
    if (!adapterName.trim()) return alert("Введите название адаптера / артефакта");
    if (!datasetId) return alert("Выберите датасет");

    /* Optional: validate dataset on backend */
    try {
      const { data: validation } = await axiosInstance.post(
        "/datasets/validate",
        { dataset_id: datasetId },
        { params: { organization_id: currentOrganization.id } }
      );
      if (!validation.valid) {
        return alert(`Dataset check failed: ${validation.reason}`);
      }
    } catch (_) {
      // swallow — if your backend doesn't have this route just ignore
    }

    /* Build the config expected by POST /finetuning/run */
    const finetuningConfig = {
      base_model: baseModel,
      adapter_name: adapterName.trim(), // IMPORTANT
      dataset_name: datasetId,
      custom_dataset: true,

      ...DEFAULTS,
      num_epochs: Number(epochs),
      micro_batch_size: Number(batch),
      learning_rate: Number(lr),
      lora_r: Number(loraR),
    };

    /* Wrap everything in multipart/form-data */
    const formData = new FormData();
    formData.append("finetuning_config_str", JSON.stringify(finetuningConfig));
    formData.append("organization_id", currentOrganization.id);

    await axiosInstance.post("/finetuning/run", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Дообучение запущено.");
    onClose();
  };

  /* ---------------- UI ----------------------- */
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          p: 3,
          width: 440,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" textAlign="center">
          Дообучить «{baseModel || "-"}»
        </Typography>

        {/* TITLE (for display in your UI later, not sent to backend) */}
        <TextField
          label="Название новой модели"
          required
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* ADAPTER / ARTIFACT NAME */}
        <TextField
          label="Adapter / artifact name"
          required
          fullWidth
          value={adapterName}
          onChange={(e) => setAdapterName(e.target.value)}
        />

        {/* DATASET SELECT WITH UPLOAD BUTTON */}
        <TextField
          select
          label="Датасет"
          required
          fullWidth
          disabled={loadingDS}
          value={datasetId}
          onChange={(e) => setDatasetId(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {loadingDS ? (
                  <CircularProgress size={20} />
                ) : (
                  <IconButton component="label">
                    <UploadFileIcon />
                    <input
                      hidden
                      type="file"
                      accept=".json,.csv,.parquet"
                      onChange={handleUpload}
                    />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        >
          {datasets.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>

        {/* NUMERIC FIELDS */}
        <TextField
          label="Эпохи"
          type="number"
          fullWidth
          inputProps={{ min: 1 }}
          value={epochs}
          onChange={(e) => setEpochs(e.target.value)}
        />
        <TextField
          label="Micro batch size"
          type="number"
          fullWidth
          inputProps={{ min: 1 }}
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        />
        <TextField
          label="Learning rate"
          type="number"
          fullWidth
          inputProps={{ step: "0.00001", min: 0 }}
          value={lr}
          onChange={(e) => setLr(e.target.value)}
        />
        <TextField
          label="LoRA r"
          type="number"
          fullWidth
          inputProps={{ min: 1 }}
          value={loraR}
          onChange={(e) => setLoraR(e.target.value)}
        />

        <Box sx={{ textAlign: "right", pt: 1 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ color: "#fff" }}>
            Дообучить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
