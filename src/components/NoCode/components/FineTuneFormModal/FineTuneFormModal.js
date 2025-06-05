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
import useFineTuneFormModal from "../../../../hooks/NoCode/useFineTuneFormModal";

/* ───────────────────────── CONSTANTS ───────────────────────── */
import { AVAILABLE_GPUS } from "../../../../AVAILABLE_GPUS";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../../../store/selectors/organizationsSelectors";

/* ───────────────────────── COMPONENT ───────────────────────── */
export default function FineTuningJobFormModal({ open, onClose }) {
  const currentOrganization = useSelector(selectCurrentOrganization)

  const {
    selectedGpu,
    handleGpuChange,
    datasetOption,
    handleDatasetChange,
    loadingDS,
    fileInputRef,
    handleUpload,
    datasets,
    hfMode,
    hfDatasetId,
    setHfDatasetId,
    baseModel,
    setBaseModel,
    artifactName,
    setArtifactName,
    maxSeqLen,
    setMaxSeqLen,
    batchSize,
    setBatchSize,
    gradAccum,
    setGradAccum,
    epochs,
    setEpochs,
    learningRate,
    setLearningRate,
    weightDecay,
    setWeightDecay,
    seed,
    setSeed,
    loraR,
    setLoraR,
    loraAlpha,
    setLoraAlpha,
    loraDropout,
    setLoraDropout,
    hfToken,
    setHfToken,
    handleSubmit,
    isLoading,
  } = useFineTuneFormModal({ open, onClose, currentOrganization });

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
