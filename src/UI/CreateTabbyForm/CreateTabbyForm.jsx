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
  useMediaQuery,
  useTheme,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect, useState } from "react";
import ConfigureModelForm from "../../components/ConfigureModelForm/ConfigureModelForm";
import ModelCheckInfo from "../ModelCheckInfo";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [openCodeGen, setOpenCodeGen] = useState(false);
  const [openEmbedding, setOpenEmbedding] = useState(false);

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

  const getMissingFields = (config) => {
    const requiredFields = [
      "autoscaler_timeout",
      "disk_space",
      "health_check_timeout",
      "job_name",
      "port",
      "gpu_types",
    ];
    if (!config) return requiredFields;
    return requiredFields.filter(
      (field) => config[field] === undefined || config[field] === ""
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        border: "1px solid lightgray",
        borderRadius: 3,
        height: isMobile || isTablet ? "auto" : "97%",
        overflow: "hidden"
      }}
    >
      <Box
        sx={{
          p: isMobile ? 1 : 2,
          borderBottom: "1px solid lightgray",
          backgroundColor: "rgba(102, 179, 238, 0.1)",
        }}
      >
        <Typography variant="h7" gutterBottom>
          СОЗДАНИЕ TABBYML ПРОЕКТА
        </Typography>
      </Box>

      {/* Прокручиваемая часть */}
      <Box sx={{ flex: 1 }} padding={isMobile ? 1 : 2}>
        <Grid container spacing={isMobile ? 1 : 2} sx={{height: "100%"}}>
          {!isMobile && !isTablet ? (
            <Grid
              item
              container
              spacing={isMobile ? 1 : 2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid item xs={10.4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Название задачи"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                />
              </Grid>
              <Grid item xs={1.6} sx={{ pl: 0 }}>
                {" "}
                {/* убираем левый отступ */}
                <Button
                  fullWidth
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
                    padding: 1,
                    fontSize: "12px",
                    color: "white",
                    "&:hover": { bgcolor: "#7c97de" },
                  }}
                >
                  Создать
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Название задачи"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
            </Grid>
          )}

          {!isMobile && !isTablet ? (
            <>
              <Grid item xs={5}>
                <Typography variant="h6" mb={1}>
                  Code Generation Модель
                </Typography>
                <Box
                  sx={{
                    boxShadow: "none",
                    border: "1px solid rgb(235, 235, 235)",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      overflowY: "hidden",
                      borderRadius: 2,
                    }}
                  >
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
                      isSmall={true}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={5}>
                <Typography variant="h6" mb={1}>
                  Embedding Модель
                </Typography>
                <Box
                  sx={{
                    border: "1px solid rgb(235, 235, 235)",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      overflow: "hidden",
                      borderRadius: 2,
                    }}
                  >
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
                      isSmall={true}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={2}>
                <Typography variant="h6" mb={1} height={"24px"}>
                  Требуемые поля
                </Typography>
                <Box>
                  {!inferenceModel?.modelName || !embeddingModel?.modelName ? (
                    <ModelCheckInfo
                      label="VLLM"
                      missingFields={["Имя моделей"]}
                    />
                  ) : (
                    <ModelCheckInfo
                      label="Название задачи"
                      missingFields={[]}
                    />
                  )}
                  <ModelCheckInfo
                    label="Code Gen модель"
                    missingFields={getMissingFields(
                      inferenceModel?.modelConfig
                    )}
                  />
                  <ModelCheckInfo
                    label="Embedding модель"
                    missingFields={getMissingFields(
                      embeddingModel?.modelConfig
                    )}
                  />
                </Box>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <Box
                  display="flex"
                  alignItems="center"
                  onClick={() => setOpenCodeGen((prev) => !prev)}
                >
                  <Typography fontSize="9px" mr={1}>
                    {openCodeGen ? "▼" : "▶"}
                  </Typography>
                  <Typography variant="h6">Code Generation Модель</Typography>
                </Box>
                <Collapse in={openCodeGen}>
                  <Box
                    sx={{
                      boxShadow: "none",
                      borderRadius: 2,
                      border: "1px solid lightgray",
                    }}
                  >
                    <Box
                      sx={{
                        maxHeight: "55dvh",
                        overflowY: "hidden",
                        borderRadius: 2,
                      }}
                    >
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
                        onModelConfigChange={(config) =>
                          setTempInference(config)
                        }
                        onArgsChange={(args) => setInferenceArgs(args)}
                        onFlagsChange={(flags) => setInferenceFlags(flags)}
                        onModelNameChange={(name) =>
                          setInferenceModelName(name)
                        }
                        isInference={true}
                        isSmall={true}
                      />
                    </Box>
                  </Box>
                </Collapse>
              </Grid>

              <Grid item xs={12} mb={2}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent={"flex-start"}
                  onClick={() => setOpenEmbedding((prev) => !prev)}
                >
                  <Typography fontSize="9px" mr={1}>
                    {openEmbedding ? "▼" : "▶"}
                  </Typography>
                  <Typography variant="h6">Embedding Модель</Typography>
                </Box>
                <Collapse in={openEmbedding}>
                  <Box
                    sx={{
                      boxShadow: "none",
                      borderRadius: 2,
                      border: "1px solid lightgray",
                    }}
                  >
                    <Box
                      sx={{
                        maxHeight: "55dvh",
                        overflowY: "hidden",
                        borderRadius: 2,
                      }}
                    >
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
                        onModelConfigChange={(config) =>
                          setTempInference(config)
                        }
                        onArgsChange={(args) => setInferenceArgs(args)}
                        onFlagsChange={(flags) => setInferenceFlags(flags)}
                        onModelNameChange={(name) =>
                          setInferenceModelName(name)
                        }
                        isInference={true}
                        isSmall={true}
                      />
                    </Box>
                  </Box>
                </Collapse>
              </Grid>

              {isTablet ? (
                <Grid item container xs={12} spacing={2}>
                  <Grid item xs={3} sx={{ pl: 0 }}>
                    {" "}
                    {/* убираем левый отступ */}
                    <Button
                      fullWidth
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
                        padding: 1,
                        fontSize: isMobile ? "10px !important" : "12px",
                        color: "white",
                        "&:hover": { bgcolor: "#7c97de" },
                      }}
                    >
                      Создать
                    </Button>
                  </Grid>

                  <Grid item xs={9}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      {!inferenceModel?.modelName ||
                      !embeddingModel?.modelName ? (
                        <ModelCheckInfo
                          label="VLLM"
                          missingFields={["Имя моделей"]}
                        />
                      ) : (
                        <ModelCheckInfo
                          label="Название задачи"
                          missingFields={[]}
                        />
                      )}
                      <ModelCheckInfo
                        label="Code Gen модель"
                        missingFields={getMissingFields(
                          inferenceModel?.modelConfig
                        )}
                      />
                      <ModelCheckInfo
                        label="Embedding модель"
                        missingFields={getMissingFields(
                          embeddingModel?.modelConfig
                        )}
                      />
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Grid item container spacing={2}>
                  <Grid item xs={3} sx={{ pl: 0 }}>
                    {" "}
                    {/* убираем левый отступ */}
                    <Button
                      fullWidth
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
                        padding: 1,
                        fontSize: isMobile ? "10px !important" : "12px",
                        color: "white",
                        "&:hover": { bgcolor: "#7c97de" },
                      }}
                    >
                      Создать
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      {!inferenceModel?.modelName ||
                      !embeddingModel?.modelName ? (
                        <ModelCheckInfo
                          label="VLLM"
                          missingFields={["Имя моделей"]}
                        />
                      ) : (
                        <ModelCheckInfo
                          label="Название задачи"
                          missingFields={[]}
                        />
                      )}
                      <ModelCheckInfo
                        label="Code Gen модель"
                        missingFields={getMissingFields(
                          inferenceModel?.modelConfig
                        )}
                      />
                      <ModelCheckInfo
                        label="Embedding модель"
                        missingFields={getMissingFields(
                          embeddingModel?.modelConfig
                        )}
                      />
                    </Box>
                  </Grid>
                </Grid>
              )}
            </>
          )}
        </Grid>
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
