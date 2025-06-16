import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ConfigureModelForm from "../../components/ConfigureModelForm/ConfigureModelForm";

const CreateTabbyModal = ({
  openCreateModal,
  setOpenCreateModal,
  jobName,
  setJobName,
  selectedGpu,
  setSelectedGpu,
  isCreating,
  availableGpus,
  diskSpace,
  setDiskSpace,
  gpuQuantity,
  setGpuQuantity,
  inferenceModel,
  setInferenceModel,
  embeddingModel,
  setEmbeddingModel,
  handleCreateSession,
  // Аргументы и флаги
  inferenceArgs,
  setInferenceArgs,
  inferenceFlags,
  setInferenceFlags,
  embeddingArgs,
  setEmbeddingArgs,
  embeddingFlags,
  setEmbeddingFlags,
}) => {
  const [openInferenceDialog, setOpenInferenceDialog] = useState(false);
  const [openEmbeddingDialog, setOpenEmbeddingDialog] = useState(false);

  const [tempInference, setTempInference] = useState(inferenceModel || null);
  const [tempEmbedding, setTempEmbedding] = useState(embeddingModel || null);

  return (
    <>
      <Modal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        aria-labelledby="create-tabby-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Создание нового TabbyML Проекта
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Название задачи"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setOpenInferenceDialog(true)}
              >
                Настроить инференс модель
              </Button>
            </Grid>

            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setOpenEmbeddingDialog(true)}
              >
                Настроить эмбеддинг модель
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Свободное место на диске (GB)"
                type="number"
                value={diskSpace}
                onChange={(e) => setDiskSpace(e.target.value)}
                inputProps={{ min: 20 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Количество GPU"
                type="number"
                value={gpuQuantity}
                onChange={(e) => setGpuQuantity(e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  onClick={() => setOpenCreateModal(false)}
                  sx={{ mr: 2 }}
                  disabled={isCreating}
                >
                  Отмена
                </Button>
                <Button
                  variant="contained"
                  disabled={
                    !jobName || !inferenceModel || !embeddingModel || isCreating
                  }
                  onClick={handleCreateSession}
                  sx={{
                    bgcolor: "#597ad3",
                    color: "white",
                    "&:hover": { bgcolor: "#7c97de" },
                  }}
                >
                  Создать
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Диалог настройки инференс модели */}
      <Dialog
        open={openInferenceDialog}
        onClose={() => setOpenInferenceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Настройка инференс модели</DialogTitle>
        <DialogContent>
          <ConfigureModelForm
            initialConfig={inferenceModel}
            isFineTuned={false}
            isCreate={true}
            onClose={() => setOpenInferenceDialog(false)}
            onModelConfigChange={(config) => setTempInference(config)}
            onArgsChange={(args) => setInferenceArgs(args)}
            onFlagsChange={(flags) => setInferenceFlags(flags)}
            isInference={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInferenceDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#597ad3",
              color: "white",
              "&:hover": { bgcolor: "#7c97de" },
            }}
            onClick={() => {
              setInferenceModel(tempInference);
              setOpenInferenceDialog(false);
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог настройки эмбеддинг модели */}
      <Dialog
        open={openEmbeddingDialog}
        onClose={() => setOpenEmbeddingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Настройка эмбеддинг модели</DialogTitle>
        <DialogContent>
          <ConfigureModelForm
            initialConfig={embeddingModel}
            isFineTuned={false}
            isCreate={true}
            onClose={() => setOpenEmbeddingDialog(false)}
            onModelConfigChange={(config) => setTempEmbedding(config)}
            onArgsChange={(args) => setEmbeddingArgs(args)}
            onFlagsChange={(flags) => setEmbeddingFlags(flags)}
            isEmbedding={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmbeddingDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#597ad3",
              color: "white",
              "&:hover": { bgcolor: "#7c97de" },
            }}
            onClick={() => {
              setEmbeddingModel(tempEmbedding);
              setOpenEmbeddingDialog(false);
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateTabbyModal;
