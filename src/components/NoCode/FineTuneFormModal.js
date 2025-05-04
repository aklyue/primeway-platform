import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { api } from "./mockApi";
import { addFineTuned } from "./fineTuneStorage";

/* ------------------ значения по-умолчанию --------------- */
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

export default function FineTuneFormModal({
  open,
  onClose,
  datasets = [],
  baseModel = "",
}) {
  /* -------- состояния формы -------- */
  const [name, setName] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [epochs, setEpochs] = useState(5);
  const [batch, setBatch] = useState(1);
  const [lr, setLr] = useState(0.0002);
  const [loraR, setLoraR] = useState(64);

  /* очищаем при каждом открытии */
  useEffect(() => {
    if (open) {
      setName("");
      setDatasetId("");
      setEpochs(5);
      setBatch(1);
      setLr(0.0002);
      setLoraR(64);
    }
  }, [open]);

  /* -------- отправка -------- */
  const handleSubmit = async () => {
    if (!name.trim()) return alert("Введите название модели");
    if (!datasetId) return alert("Выберите датасет");

    /* 1. кладём в localStorage (бросит ошибку, если имя занято) */
    try {
      addFineTuned({
        id: Date.now(),
        name: name.trim(),
        baseModel,
        type: `fine-tuned (${baseModel})`,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      return alert(e.message);
    }

    /* 2. собираем final-params: статич. + пользовательские */
    const params = {
      base_model: baseModel,
      ...DEFAULTS,
      num_epochs: Number(epochs),
      micro_batch_size: Number(batch),
      learning_rate: Number(lr),
      lora_r: Number(loraR),
      datasets: [
        {
          path: datasetId, // позже подставите реальный путь
          type: "chat_template",
          field_messages: "conversations",
          message_field_role: "from",
          message_field_content: "value",
        },
      ],
    };

    /* 3. вызываем mock API */
    await api.startFineTune({
      baseModel,
      datasetId,
      params,
      name: name.trim(),
    });

    alert("Дообучение запущено.");
    onClose();
  };

  /* -------- UI -------- */
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
          width: 420,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" textAlign="center">
          Дообучить «{baseModel}»
        </Typography>

        <TextField
          label="Название новой модели"
          required
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          select
          label="Датасет"
          required
          fullWidth
          value={datasetId}
          onChange={(e) => setDatasetId(e.target.value)}
        >
          {datasets.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>

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
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ color: "#fff" }}
          >
            Дообучить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
