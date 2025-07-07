import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Code, ContentCopy } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../../../store/selectors/organizationsSelectors";
import useJupyterLab from "../../../../hooks/NoCode/useJupyterLab";
import useTabby from "../../../../hooks/NoCode/useTabby";
import CreateTabbyModal from "../../../../UI/CreateTabbyModal";
import { Link, useNavigate } from "react-router-dom";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import StopIcon from "@mui/icons-material/Stop";
import BackArrow from "../../../../UI/BackArrow";
import Check from "@mui/icons-material/Check";

function Tabby({ isMobile, isTablet }) {
  const currentOrganization = useSelector(selectCurrentOrganization);
  const authToken = useSelector((state) => state.auth.authToken);
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);

  const {
    setOpenCreateModal,
    openCreateModal,
    sessions,
    loadingId,
    handleStartSession,
    handleStopSession,
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
    snackbar,
    handleSnackbarClose,
    isLoading,
    embeddingArgs,
    setEmbeddingArgs,
    embeddingFlags,
    setEmbeddingFlags,
    inferenceArgs,
    setInferenceArgs,
    inferenceFlags,
    setInferenceFlags,
    inferenceModelName,
    setInferenceModelName,
    embeddingModelName,
    setEmbeddingModelName,
  } = useTabby({ currentOrganization, authToken });

  useEffect(() => {
    if (!sessions.length && !isLoading) {
      navigate("/tabby-create");
    }
  }, [sessions, isLoading, navigate]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80dvh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box>
            <BackArrow
              path={"/marketplace"}
              name={"AI Маркетплейс"}
              postText={"Copilot Альтернатива"}
            />
          </Box>
        </Box>
        <Button
          data-tour-id="tabby-create-btn"
          variant="contained"
          onClick={() => navigate("/tabby-create")}
          sx={{
            bgcolor: "#597ad3",
            color: "white",
            "&:hover": { bgcolor: "#7c97de" },
          }}
        >
          Новый проект
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{ p: isMobile || isTablet ? 0 : 2 }}
        data-tour-id="sessions"
      >
        {isMobile || isTablet ? (
          <Box>
            {sessions.map((session, idx) => {
              const startDisabled =
                loadingId === session.id ||
                ["running", "starting", "queued", "creating"].includes(
                  session.status
                );

              const stopDisabled =
                session.status !== "running" || loadingId === session.id;

              return (
                <Box
                  data-tour-id={idx === 0 ? "session" : undefined}
                  key={session.id}
                  sx={{
                    border: "1px solid lightgray",
                    borderRadius: "8px",
                    padding: 2,
                    marginBottom: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: "14px" }}>
                    {session.tabby_name}
                  </Typography>
                  <Typography sx={{ fontSize: "12px" }}>
                    <b>Code Gen job ID:</b> {session.inference_job_id}
                  </Typography>
                  <Typography sx={{ fontSize: "12px" }}>
                    <b>Embedding job ID:</b> {session.embedding_job_id}
                  </Typography>
                  <Typography sx={{ fontSize: "12px" }}>
                    <b>Статус:</b> {session.status}
                    {loadingId === session.id ||
                    session.status === "creating" ? (
                      <CircularProgress size={14} sx={{ ml: 1 }} />
                    ) : null}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "12px" }}
                    data-tour-id={idx === 0 ? "url" : undefined}
                  >
                    <b>URL:</b>{" "}
                    <Link
                      to={session.endpoint_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      <span style={{ textDecoration: "underline" }}>
                        {session.endpoint_url || "N/A"}
                      </span>
                    </Link>
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                    <IconButton
                      size="small"
                      disabled={startDisabled}
                      onClick={() => handleStartSession(session.id)}
                      color="success"
                      title="Запустить"
                    >
                      <PlayCircleFilledIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      disabled={stopDisabled}
                      onClick={() => handleStopSession(session.id)}
                      color="error"
                      title="Остановить"
                    >
                      <StopIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "12px" }}>Имя проекта</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    Code Gen job ID
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    Embedding job ID
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>Статус</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>URL</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session, idx) => {
                  const startDisabled =
                    loadingId === session.id ||
                    ["running", "starting", "queued", "creating"].includes(
                      session.status
                    );

                  const stopDisabled =
                    session.status !== "running" || loadingId === session.id;

                  return (
                    <TableRow
                      key={session.id}
                      hover
                      data-tour-id={idx === 0 ? "session" : undefined}
                    >
                      <TableCell sx={{ fontSize: "11px" }}>
                        {session.tabby_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "11px",
                          maxWidth: 120,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {session.inference_job_id ? (
                          <Tooltip title={session.inference_job_id} arrow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                maxWidth: "100%",
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flexGrow: 1,
                                }}
                              >
                                {session.inference_job_id}
                              </Box>
                              <IconButton
                                size="small"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      session.inference_job_id
                                    );
                                    setCopiedId(session.inference_job_id);
                                    setTimeout(() => setCopiedId(null), 1500);
                                  } catch (error) {
                                    console.error(
                                      "Ошибка при копировании:",
                                      error
                                    );
                                  }
                                }}
                                sx={{
                                  p: 0.5,
                                }}
                              >
                                {copiedId === session.inference_job_id ? (
                                  <Check sx={{ fontSize: "14px" }} />
                                ) : (
                                  <ContentCopy sx={{ fontSize: "14px" }} />
                                )}
                              </IconButton>
                            </Box>
                          </Tooltip>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontSize: "11px",
                          maxWidth: 120,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {session.embedding_job_id ? (
                          <Tooltip title={session.embedding_job_id} arrow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                maxWidth: "100%",
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flexGrow: 1,
                                }}
                              >
                                {session.embedding_job_id}
                              </Box>
                              <IconButton
                                size="small"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      session.embedding_job_id
                                    );
                                    setCopiedId(session.embedding_job_id);
                                    setTimeout(() => setCopiedId(null), 1500);
                                  } catch (error) {
                                    console.error(
                                      "Ошибка при копировании:",
                                      error
                                    );
                                  }
                                }}
                                sx={{
                                  p: 0.5,
                                }}
                              >
                                {copiedId === session.embedding_job_id ? (
                                  <Check sx={{ fontSize: "14px" }} />
                                ) : (
                                  <ContentCopy sx={{ fontSize: "14px" }} />
                                )}
                              </IconButton>
                            </Box>
                          </Tooltip>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>

                      <TableCell sx={{ fontSize: "11px" }}>
                        <Box
                          sx={{ display: "inline-flex", alignItems: "center" }}
                        >
                          {(loadingId === session.id ||
                            session.status === "creating") && (
                            <CircularProgress size={14} sx={{ mr: 1 }} />
                          )}
                          {session.status}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "11px" }}
                        data-tour-id={idx === 0 ? "url" : undefined}
                      >
                        <Link
                          to={session.endpoint_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                        >
                          <span style={{ textDecoration: "underline" }}>
                            {session.endpoint_url || "N/A"}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell sx={{ fontSize: "11px" }}>
                        <IconButton
                          size="small"
                          disabled={startDisabled}
                          onClick={() => handleStartSession(session.id)}
                          color="success"
                          title="Запустить"
                        >
                          <PlayCircleFilledIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          disabled={stopDisabled}
                          onClick={() => handleStopSession(session.id)}
                          color="error"
                          title="Остановить"
                        >
                          <StopIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

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

export default Tabby;
