// FineTuneFormModal.js
import { useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Edit, Check, Close } from "@mui/icons-material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkCold } from "react-syntax-highlighter/dist/esm/styles/prism";
import { api } from "./mockApi";

/* -------------------- демо YAML -------------------- */
const DEFAULT_YAML = `base_model: t-tech/T-lite-it-1.0
model_type: AutoModelForCausalLM
tokenizer_type: AutoTokenizer

load_in_8bit: false
strict: false

datasets:
  path: ./dataset.jsonl
  type: chat_template
  field_messages: conversations
  message_field_role: from
  message_field_content: value
  val_set_size: 0.0
output_dir: ./outputs/out

adapter: lora
lora_r: 64
lora_alpha: 64
lora_dropout: 0.05
lora_target_linear: true

sequence_len: 8192
sample_packing: true
eval_sample_packing: false
pad_to_sequence_len: true

gradient_accumulation_steps: 4
micro_batch_size: 1
num_epochs: 5
optimizer: adamw_bnb_8bit
lr_scheduler: cosine
learning_rate: 0.0002

train_on_inputs: false
group_by_length: false
bf16: true
fp16: false
tf32: true

gradient_checkpointing: true
early_stopping_patience:
resume_from_checkpoint:
local_rank:
logging_steps: 1
xformers_attention:
flash_attention:

warmup_ratio: 0.1
evals_per_epoch:
eval_table_size:
eval_max_new_tokens: 128
saves_per_epoch: 1
debug:
deepspeed:
weight_decay: 0.0
fsdp:
fsdp_config:
special_tokens:
`;

/* -------------------- компонент -------------------- */
export default function FineTuneFormModal({
  open,
  onClose,
  datasets = [],
  baseModel = "",
  onSuccess,
}) {
  const [params, setParams] = useState(DEFAULT_YAML);
  const [ds, setDs] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [tempParams, setTempParams] = useState(DEFAULT_YAML);

  /* -------- отправка -------- */
  const handleSubmit = async () => {
    if (!ds) return alert("Выберите датасет");
    await api.startFineTune({ baseModel, datasetId: ds, params });
    onSuccess();
    onClose();
  };

  /* -------- edit / save / cancel -------- */
  const handleEditClick = () => {
    setTempParams(params);
    setEditMode(true);
  };
  const handleCancelEdit = () => {
    setEditMode(false);
    setParams(tempParams);
  };
  const handleSaveEdit = () => {
    setEditMode(false);
  };

  /* -------- стили scroll-box-а -------- */
  const scrollBoxSX = {
    maxHeight: "60vh",
    overflow: "auto", // ← единственный скролл
    bgcolor: "background.paper",
    borderRadius: 3,
    position: "relative",
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.default",
          p: 3,
          maxWidth: 600,
          width: "95%",
          maxHeight: "95vh",
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          outline: "none",
        }}
      >
        <Typography sx={{ mb: 2, color: "primary.main", fontSize: 16 }}>
          Модель: <b>{baseModel}</b>
        </Typography>

        <Box sx={{ overflowY: "auto", flex: 1 }}>
          {/* выбор датасета */}
          <TextField
            select
            label="Dataset"
            fullWidth
            value={ds}
            onChange={(e) => setDs(e.target.value)}
            sx={{
              my: 2,
              "& .MuiInputLabel-root": { fontWeight: "bold" },
            }}
          >
            {datasets.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>

          {/* ------ блок YAML (общий скролл-box) ------ */}
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Параметры (YAML)
          </Typography>

          <Box sx={scrollBoxSX}>
            {editMode ? (
              <>
                <TextField
                  fullWidth
                  multiline
                  minRows={12}
                  value={params}
                  onChange={(e) => setParams(e.target.value)}
                  variant="outlined"
                  sx={{
                    position: "relative",
                    width: "100%",
                    fontFamily: "monospace",

                    "& .MuiOutlinedInput-root": {
                      p: 2,

                      "& fieldset": { border: "none" },
                      "&:hover fieldset": { border: "none" },
                      "&.Mui-focused fieldset": { border: "none" },
                    },
                    "& .MuiInputBase-inputMultiline": {
                      overflow: "visible",
                      lineHeight: "1.6",
                    },
                  }}
                />
                {/* кнопки save/cancel */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 1,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    p: 0.5,
                  }}
                >
                  <IconButton
                    size="small"
                    color="error"
                    onClick={handleCancelEdit}
                    title="Отменить"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={handleSaveEdit}
                    title="Сохранить"
                  >
                    <Check fontSize="small" />
                  </IconButton>
                </Box>
              </>
            ) : (
              <>
                <SyntaxHighlighter
                  language="yaml"
                  style={coldarkCold}
                  customStyle={{
                    margin: 0,
                    background: "transparent",
                    fontSize: "0.95rem",
                  }}
                >
                  {params}
                </SyntaxHighlighter>

                <IconButton
                  onClick={handleEditClick}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "background.paper",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  title="Редактировать"
                >
                  <Edit fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* ------------ футер (кнопки ок / cancel) ------------- */}
        <Box sx={{ textAlign: "right", pt: 2 }}>
          <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>
            Отмена
          </Button>
          <Button
            variant="contained"
            color="secondary"
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
