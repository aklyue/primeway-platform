import {
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  Typography,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";

import StopIcon from "@mui/icons-material/Stop";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";

import useJupyterLab from "../../../../hooks/NoCode/useJupyterLab";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../../../store/selectors/organizationsSelectors";

export default function JupyterLabSessions({ isMobile }) {
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
    handleCreateSession,
    snackbar,
    handleSnackbarClose,
  } = useJupyterLab({ currentOrganization, authToken });

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">Проекты JupyterLab</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{
            color: "#ffffff",
            bgcolor: "#597ad3",
            "&:hover": {
              bgcolor: "#7c97de",
            },
          }}
          onClick={() => setOpenCreateModal(true)}
        >
          Новый проект
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: isMobile ? 0 : 2 }}>
        {isMobile ? (
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
                (
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
                      <b>URL:</b> {session.job_url || "N/A"}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                      {/* START */}
                      <IconButton
                        size="small"
                        disabled={startDisabled}
                        onClick={() => handleStartSession(session.job_id)}
                        color="success.main"
                        title="Запустить"
                      >
                        <PlayCircleFilledIcon fontSize="small" />
                      </IconButton>

                      {/* STOP */}
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
                )
              )
            })}
          </Box>
        ) : (
          <Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "12px" }}>
                    Имя проекта
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    Тип GPU
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    Статус
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    URL
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    Действие
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ width: "100%" }}>
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
                        <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                          {loadingId === session.job_id ||
                            (session.last_execution_status === "creating" && (
                              <CircularProgress size={14} sx={{ mr: 1 }} />
                            ))}
                          {session.last_execution_status}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: "11px" }}>
                        {session.job_url || "N/A"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "11px" }}>
                        {/* START */}
                        <IconButton
                          size="small"
                          disabled={startDisabled}
                          onClick={() => handleStartSession(session.job_id)}
                          color="success.main"
                          title="Запустить"
                        >
                          <PlayCircleFilledIcon fontSize="small" />
                        </IconButton>

                        {/* STOP */}
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


      {/* Create new session modal */}
      <Modal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        aria-labelledby="create-session-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Создание нового JupyterLab Проекта
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Название задачи"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="gpu-select-label">Тип GPU</InputLabel>
                <Select
                  labelId="gpu-select-label"
                  label="Имя GPU"
                  value={selectedGpu}
                  onChange={(e) => setSelectedGpu(e.target.value)} // Update selected GPU
                  disabled={isCreating}
                >
                  {availableGpus.map((gpu) => (
                    <MenuItem key={gpu.id} value={gpu.id}>
                      {gpu.name} {/* Отображаем имя GPU */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Свободное место на диске (GB)"
                type="number"
                value={diskSpace}
                onChange={(e) => setDiskSpace(e.target.value)}
                inputProps={{ min: 20, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Кол-во GPU"
                type="number"
                value={gpuQuantity}
                onChange={(e) => setGpuQuantity(e.target.value)}
                inputProps={{ min: 1, max: 50 }}
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
                  sx={{
                    color: "white",
                    bgcolor: "#597ad3",
                    "&:hover": {
                      bgcolor: "#7c97de",
                    },
                  }}
                  onClick={handleCreateSession}
                  disabled={isCreating || !selectedGpu || !jobName}
                >
                  {isCreating ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Creating...
                    </>
                  ) : (
                    "Создать"
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
