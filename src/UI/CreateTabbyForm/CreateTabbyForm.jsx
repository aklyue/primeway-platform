import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect, useState } from "react";
import ConfigureModelForm from "../../components/ConfigureModelForm/ConfigureModelForm";

function CreateTabbyForm({
  jobName,
  setJobName,
  isCreating,
  inferenceModel,
  setInferenceModel,
  embeddingModel,
  setEmbeddingModel,
  handleCreateSession,
  snackbar,
  handleSnackbarClose,
  // Аргументы и флаги
  inferenceArgs,
  setInferenceArgs,
  inferenceFlags,
  setInferenceFlags,
  embeddingArgs,
  setEmbeddingArgs,
  embeddingFlags,
  setEmbeddingFlags,
  //modelName
  inferenceModelName,
  setInferenceModelName,
  embeddingModelName,
  setEmbeddingModelName,
}) {
  const [tempInference, setTempInference] = useState(inferenceModel);
  const [tempEmbedding, setTempEmbedding] = useState(embeddingModel);

  useEffect(() => {
    setInferenceModel({
      modelName: inferenceModelName,
      args: inferenceArgs,
      flags: inferenceFlags,
      modelConfig: tempInference,
    });
  }, [tempInference, inferenceArgs, inferenceFlags, inferenceModelName]);

  useEffect(() => {
    setEmbeddingModel({
      modelName: embeddingModelName,
      args: embeddingArgs,
      flags: embeddingFlags,
      modelConfig: tempEmbedding,
    });
  }, [tempEmbedding, embeddingArgs, embeddingFlags, embeddingModelName]);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const hasRequiredFields = (config) => {
    const requiredFields = [
      "autoscaler_timeout",
      "disk_space",
      "health_check_timeout",
      "job_name",
      "port",
      "gpu_types",
    ];
    return requiredFields.every(
      (field) => config[field] !== undefined && config[field] !== ""
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" mt={1} gutterBottom>
        Создание нового TabbyML Проекта
      </Typography>

      {/* Прокручиваемая часть */}
      <Box sx={{ flex: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Название задачи"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Accordion
              sx={{
                boxShadow: "none",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "rgba(185, 218, 243, 0.2)",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Настройка инференс модели</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ConfigureModelForm
                  initialConfig={{
                    modelName: inferenceModelName,
                    args: inferenceArgs,
                    flags: inferenceFlags,
                    modelConfig: inferenceModel || {},
                  }}
                  isFineTuned={false}
                  isCreate={false}
                  onClose={() => {}}
                  onModelConfigChange={(config) => setTempInference(config)}
                  onArgsChange={(args) => setInferenceArgs(args)}
                  onFlagsChange={(flags) => setInferenceFlags(flags)}
                  onModelNameChange={(name) => setInferenceModelName(name)}
                  isInference={true}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12}>
            <Accordion
              sx={{
                boxShadow: "none",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "rgba(185, 218, 243, 0.2)",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Настройка эмбеддинг модели</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ConfigureModelForm
                  initialConfig={{
                    modelName: embeddingModelName,
                    args: embeddingArgs,
                    flags: embeddingFlags,
                    modelConfig: embeddingModel || {},
                  }}
                  isFineTuned={false}
                  isCreate={false}
                  onClose={() => {}}
                  onModelConfigChange={(config) => setTempEmbedding(config)}
                  onArgsChange={(args) => setEmbeddingArgs(args)}
                  onFlagsChange={(flags) => setEmbeddingFlags(flags)}
                  onModelNameChange={(name) => setEmbeddingModelName(name)}
                  isEmbedding={true}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>

      {/* Кнопки снизу */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          disabled={
            !jobName ||
            !inferenceModel ||
            !inferenceModel.modelConfig ||
            !embeddingModel ||
            !embeddingModel.modelConfig ||
            !hasRequiredFields(inferenceModel.modelConfig) ||
            !hasRequiredFields(embeddingModel.modelConfig) ||
            !inferenceModel.modelName ||
            !embeddingModel.modelName ||
            isCreating
          }
          onClick={() => setConfirmDialogOpen(true)}
          sx={{
            bgcolor: "#597ad3",
            color: "white",
            "&:hover": { bgcolor: "#7c97de" },
          }}
        >
          Создать
        </Button>
      </Box>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Подтвердите создание сессии</DialogTitle>
        <DialogContent dividers>
          {/* Inference модель */}
          <Typography variant="h5" gutterBottom>
            Inference модель
          </Typography>

          <Box mb={1}>
            <Typography>
              <strong>Название модели:</strong>{" "}
              {inferenceModel?.modelName || "—"}
            </Typography>
          </Box>

          <Box mb={1}>
            <Typography fontWeight="bold">Аргументы:</Typography>
            {inferenceModel.args?.length > 0 ? (
              inferenceModel.args.map((arg, i) => (
                <Typography key={i} sx={{ ml: 2 }}>
                  {arg.key}: {arg.value}
                </Typography>
              ))
            ) : (
              <Typography sx={{ ml: 2 }}>—</Typography>
            )}
          </Box>

          <Box mb={1}>
            <Typography fontWeight="bold">Флаги:</Typography>
            {inferenceModel.flags?.length > 0 ? (
              inferenceModel.flags.map((flag, i) => (
                <Typography key={i} sx={{ ml: 2 }}>
                  {flag.key}: {flag.value}
                </Typography>
              ))
            ) : (
              <Typography sx={{ ml: 2 }}>—</Typography>
            )}
          </Box>

          <Box mb={3}>
            <Typography fontWeight="bold" gutterBottom>
              Параметры конфигурации:
            </Typography>
            <Typography sx={{ ml: 2 }}>
              Имя задачи: {inferenceModel?.modelConfig?.job_name || "—"}
            </Typography>
            <Typography sx={{ ml: 2 }}>
              Порт: {inferenceModel?.modelConfig?.port || "—"}
            </Typography>
            <Typography sx={{ ml: 2 }}>
              Диск: {inferenceModel?.modelConfig?.disk_space || "—"} ГБ
            </Typography>
            <Typography sx={{ ml: 2 }}>
              Таймауты — health:{" "}
              {inferenceModel?.modelConfig?.health_check_timeout || "—"} сек,
              autoscaler:{" "}
              {inferenceModel?.modelConfig?.autoscaler_timeout || "—"} сек
            </Typography>
            <Typography fontWeight="bold" sx={{ mt: 1 }}>
              Типы GPU:
            </Typography>
            {inferenceModel?.modelConfig?.gpu_types?.length > 0 ? (
              inferenceModel.modelConfig.gpu_types.map((gpu, i) => (
                <Typography key={i} sx={{ ml: 2 }}>
                  {gpu.type} — {gpu.count} шт.
                </Typography>
              ))
            ) : (
              <Typography sx={{ ml: 2 }}>—</Typography>
            )}
          </Box>

          {/* Embedding модель */}
          <Typography variant="h5" gutterBottom>
            Embedding модель
          </Typography>

          <Box mb={1}>
            <Typography>
              <strong>Название модели:</strong>{" "}
              {embeddingModel?.modelName || "—"}
            </Typography>
          </Box>

          <Box mb={1}>
            <Typography fontWeight="bold">Аргументы:</Typography>
            {embeddingModel.args?.length > 0 ? (
              embeddingModel.args.map((arg, i) => (
                <Typography key={i} sx={{ ml: 2 }}>
                  {arg.key}: {arg.value}
                </Typography>
              ))
            ) : (
              <Typography sx={{ ml: 2 }}>—</Typography>
            )}
          </Box>

          <Box mb={1}>
            <Typography fontWeight="bold">Флаги:</Typography>
            {embeddingModel.flags?.length > 0 ? (
              embeddingModel.flags.map((flag, i) => (
                <Typography key={i} sx={{ ml: 2 }}>
                  {flag.key}: {flag.value}
                </Typography>
              ))
            ) : (
              <Typography sx={{ ml: 2 }}>—</Typography>
            )}
          </Box>

          <Box mb={2}>
            <Typography fontWeight="bold" gutterBottom>
              Параметры конфигурации:
            </Typography>
            <Typography sx={{ ml: 2 }}>
              Имя задачи: {embeddingModel?.modelConfig?.job_name || "—"}
            </Typography>
            <Typography sx={{ ml: 2 }}>
              Порт: {embeddingModel?.modelConfig?.port || "—"}
            </Typography>
            <Typography sx={{ ml: 2 }}>
              Диск: {embeddingModel?.modelConfig?.disk_space || "—"} ГБ
            </Typography>
            <Typography sx={{ ml: 2 }}>
              Таймауты — health:{" "}
              {embeddingModel?.modelConfig?.health_check_timeout || "—"} сек,
              autoscaler:{" "}
              {embeddingModel?.modelConfig?.autoscaler_timeout || "—"} сек
            </Typography>
            <Typography fontWeight="bold" sx={{ mt: 1 }}>
              Типы GPU:
            </Typography>
            {embeddingModel?.modelConfig?.gpu_types?.length > 0 ? (
              embeddingModel.modelConfig.gpu_types.map((gpu, i) => (
                <Typography key={i} sx={{ ml: 2 }}>
                  {gpu.type} — {gpu.count} шт.
                </Typography>
              ))
            ) : (
              <Typography sx={{ ml: 2 }}>—</Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#597ad3",
              color: "white",
              "&:hover": { bgcolor: "#7c97de" },
            }}
            onClick={() => {
              setConfirmDialogOpen(false);
              handleCreateSession();
            }}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CreateTabbyForm;
