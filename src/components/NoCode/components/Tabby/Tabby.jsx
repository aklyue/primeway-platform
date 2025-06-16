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
} from "@mui/material";
import React, { useState } from "react";
import { Code } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../../../store/selectors/organizationsSelectors";
import useJupyterLab from "../../../../hooks/NoCode/useJupyterLab";
import useTabby from "../../../../hooks/NoCode/useTabby";
import CreateTabbyModal from "../../../../UI/CreateTabbyModal";
import { Link } from "react-router-dom";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import StopIcon from "@mui/icons-material/Stop";

function Tabby({ isMobile, isTablet }) {
  const currentOrganization = useSelector(selectCurrentOrganization);
  const authToken = useSelector((state) => state.auth.authToken);

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
    embeddingArgs,
    setEmbeddingArgs,
    embeddingFlags,
    setEmbeddingFlags,
    inferenceArgs,
    setInferenceArgs,
    inferenceFlags,
    setInferenceFlags,
  } = useTabby({ currentOrganization, authToken });


  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Code />
          <Typography ml={1} fontSize={"1.25rem"} fontWeight={500}>
            Проекты TabbyML
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setOpenCreateModal(true)}
          sx={{
            bgcolor: "#597ad3",
            color: "white",
            "&:hover": { bgcolor: "#7c97de" },
          }}
        >
          Новый проект
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: isMobile || isTablet ? 0 : 2 }}>
        {isMobile || isTablet ? (
          <Box>
            {sessions.map((session) => {
              const startDisabled =
                loadingId === session.job_id ||
                ["running", "starting", "queued", "creating"].includes(
                  session.last_execution_status
                );

              const stopDisabled =
                session.last_execution_status !== "running" ||
                loadingId === session.job_id;

              return (
                <Box
                  key={session.job_id}
                  sx={{
                    border: "1px solid lightgray",
                    borderRadius: "8px",
                    padding: 2,
                    marginBottom: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: "14px" }}>
                    {session.job_name}
                  </Typography>
                  <Typography sx={{ fontSize: "12px" }}>
                    <b>Тип GPU:</b> {session.gpu_type?.type || "N/A"}
                  </Typography>
                  <Typography sx={{ fontSize: "12px" }}>
                    <b>Статус:</b> {session.last_execution_status}
                    {loadingId === session.job_id ||
                    session.last_execution_status === "creating" ? (
                      <CircularProgress size={14} sx={{ ml: 1 }} />
                    ) : null}
                  </Typography>
                  <Typography sx={{ fontSize: "12px" }}>
                    <b>URL:</b>{" "}
                    <Link
                      to={session.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      <span style={{ textDecoration: "underline" }}>
                        {session.job_url || "N/A"}
                      </span>
                    </Link>
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                    <IconButton
                      size="small"
                      disabled={startDisabled}
                      onClick={() => handleStartSession(session.job_id)}
                      color="success"
                      title="Запустить"
                    >
                      <PlayCircleFilledIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      disabled={stopDisabled}
                      onClick={() => handleStopSession(session.job_id)}
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
                  <TableCell sx={{ fontSize: "12px" }}>Тип GPU</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>Статус</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>URL</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => {
                  const startDisabled =
                    loadingId === session.job_id ||
                    ["running", "starting", "queued", "creating"].includes(
                      session.last_execution_status
                    );

                  const stopDisabled =
                    session.last_execution_status !== "running" ||
                    loadingId === session.job_id;

                  return (
                    <TableRow key={session.job_id} hover>
                      <TableCell sx={{ fontSize: "11px" }}>
                        {session.job_name}
                      </TableCell>
                      <TableCell sx={{ fontSize: "11px" }}>
                        {session.gpu_type?.type || "N/A"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "11px" }}>
                        <Box
                          sx={{ display: "inline-flex", alignItems: "center" }}
                        >
                          {(loadingId === session.job_id ||
                            session.last_execution_status === "creating") && (
                            <CircularProgress size={14} sx={{ mr: 1 }} />
                          )}
                          {session.last_execution_status}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: "11px" }}>
                        <Link
                          to={session.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                        >
                          <span style={{ textDecoration: "underline" }}>
                            {session.job_url || "N/A"}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell sx={{ fontSize: "11px" }}>
                        <IconButton
                          size="small"
                          disabled={startDisabled}
                          onClick={() => handleStartSession(session.job_id)}
                          color="success"
                          title="Запустить"
                        >
                          <PlayCircleFilledIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          disabled={stopDisabled}
                          onClick={() => handleStopSession(session.job_id)}
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

      <CreateTabbyModal
        openCreateModal={openCreateModal}
        setOpenCreateModal={setOpenCreateModal}
        jobName={jobName}
        setJobName={setJobName}
        selectedGpu={selectedGpu}
        setSelectedGpu={setSelectedGpu}
        isCreating={isCreating}
        availableGpus={availableGpus}
        diskSpace={diskSpace}
        setDiskSpace={setDiskSpace}
        gpuQuantity={gpuQuantity}
        setGpuQuantity={setGpuQuantity}
        inferenceModel={{
          args: inferenceArgs,
          flags: inferenceFlags,
          modelConfig: inferenceModel || {},
        }}
        setInferenceModel={setInferenceModel}
        embeddingModel={{
          args: embeddingArgs,
          flags: embeddingFlags,
          modelConfig: embeddingModel || {},
        }}
        setEmbeddingModel={setEmbeddingModel}
        handleCreateSession={handleCreateSession}
        inferenceArgs={inferenceArgs}
        setInferenceArgs={setInferenceArgs}
        inferenceFlags={inferenceFlags}
        setInferenceFlags={setInferenceFlags}
        embeddingArgs={embeddingArgs}
        setEmbeddingArgs={setEmbeddingArgs}
        embeddingFlags={embeddingFlags}
        setEmbeddingFlags={setEmbeddingFlags}
      />

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
