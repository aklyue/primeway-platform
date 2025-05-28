import { useEffect, useState, useContext } from "react";
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

import axiosInstance from "../../api";
import { OrganizationContext } from "../Organization/OrganizationContext";
import { AuthContext } from "../../AuthContext";

// Данные о доступных GPU с полем name для передачи на сервер
const AVAILABLE_GPUS = {
  "A100 PCIe": { name: "A100 PCIe", memoryInGb: 80, costPerHour: 260 },
  "A100 SXM": { name: "A100 SXM", memoryInGb: 80, costPerHour: 299 },
  A40: { name: "A40", memoryInGb: 48, costPerHour: 90 },
  "RTX 4090": { name: "RTX 4090", memoryInGb: 24, costPerHour: 130 },
  "H100 SXM": { name: "H100 SXM", memoryInGb: 80, costPerHour: 399 },
  "H100 NVL": { name: "H100 NVL", memoryInGb: 94, costPerHour: 355 },
  "H100 PCIe": { name: "H100 PCIe", memoryInGb: 80, costPerHour: 335 },
  "H200 SXM": { name: "H200 SXM", memoryInGb: 143, costPerHour: 460 },
  L4: { name: "L4", memoryInGb: 24, costPerHour: 90 },
  L40: { name: "L40", memoryInGb: 48, costPerHour: 170 },
  L40S: { name: "L40S", memoryInGb: 48, costPerHour: 175 },
  "RTX 2000 Ada": { name: "RTX 2000 Ada", memoryInGb: 16, costPerHour: 55 },
  "RTX 6000 Ada": { name: "RTX 6000 Ada", memoryInGb: 48, costPerHour: 140 },
  "RTX A6000": { name: "RTX A6000", memoryInGb: 48, costPerHour: 130 },
};

export default function JupyterLabSessions() {
  const [sessions, setSessions] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedGpu, setSelectedGpu] = useState("");
  const [diskSpace, setDiskSpace] = useState(20);
  const [jobName, setJobName] = useState(""); // Для имени задачи
  const [isCreating, setIsCreating] = useState(false);
  const [gpuQuantity, setGpuQuantity] = useState(1);
  const [loadingId, setLoadingId] = useState(null);

  const { currentOrganization } = useContext(OrganizationContext); // Получаем текущую организацию из контекста
  const { authToken } = useContext(AuthContext);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "info" | "warning"
  });

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const availableGpus = Object.keys(AVAILABLE_GPUS).map((gpuKey) => ({
    id: gpuKey,
    name: AVAILABLE_GPUS[gpuKey].name, // Добавляем поле name
    ...AVAILABLE_GPUS[gpuKey],
  }));

  const refreshSessions = async () => {
    try {
      const response = await axiosInstance.get(
        "/jupyter/get-jupyter-projects",
        {
          params: {
            organization_id: currentOrganization.id,
          },
        }
      );
      setSessions(response.data); // Обновляем список сессий
    } catch (error) {
      console.error("Ошибка при получении проектов:", error);
    }
  };

  useEffect(() => {
    refreshSessions();
    const intervalId = setInterval(refreshSessions, 3000);
    return () => clearInterval(intervalId);
  }, [currentOrganization]);

  const handleCreateSession = async () => {
    if (!selectedGpu || !jobName) {
      alert("Please select GPU type and provide job name");
      return;
    }

    setIsCreating(true);

    const formData = new FormData();
    formData.append(
      "config_str",
      JSON.stringify({
        job_type: "run", // <-- ОБЯЗАТЕЛЬНО
        job_name: jobName,
        gpu_types: [
          {
            type: selectedGpu,
            count: parseInt(gpuQuantity),
          },
        ],
        disk_space: parseInt(diskSpace),
      })
    );
    formData.append("organization_id", String(currentOrganization.id));

    try {
      const response = await axiosInstance.post("/jupyter/run", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      refreshSessions();
      setOpenCreateModal(false);
      setSnackbar({
        open: true,
        message: "Сессия создана",
        severity: "success",
      });
    } catch (error) {
      console.error(
        "Error creating session:",
        error.response?.data || error.message
      );
      setSnackbar({
        open: true,
        message: "Ошибка при создании проекта",
        severity: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartSession = async (jobId) => {
    if (!jobId)
      return setSnackbar({
        open: true,
        message: "ID задачи отсутствует",
        severity: "error",
      });

    setLoadingId(jobId);
    try {
      await axiosInstance.post("/jobs/job-start", null, {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setSnackbar({
        open: true,
        message: "Задача запущена",
        severity: "success",
      });
      refreshSessions();
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: "Ошибка при запуске задачи",
        severity: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleStopSession = async (jobId) => {
    if (!jobId)
      return setSnackbar({
        open: true,
        message: "ID задачи отсутствует",
        severity: "error",
      });

    setLoadingId(jobId);
    try {
      await axiosInstance.post("/jobs/job-stop", null, {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      refreshSessions();
      setSnackbar({
        open: true,
        message: "Задача остановлена",
        severity: "success",
      });
    } catch (e) {
      console.error("Ошибка при остановке:", e);
      setSnackbar({
        open: true,
        message: "Ошибка при остановке задачи",
        severity: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">Проекты JupyterLab</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ color: "#F5F5F5" }}
          onClick={() => setOpenCreateModal(true)}
        >
          Новый проект
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Имя проекта</TableCell>
              <TableCell>Тип GPU</TableCell>

              <TableCell>Статус</TableCell>
              <TableCell>URl</TableCell>
              <TableCell>Действие</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => {
              const startDisabled =
                loadingId === session.job_id || // идёт POST
                ["running", "starting", "queued", "creating"].includes(
                  session.last_execution_status
                ); // статус ещё не «idle»

              const stopDisabled =
                session.last_execution_status !== "running" ||
                loadingId === session.job_id;
              // ────────────────────────────────────────────────────────

              return (
                <TableRow key={session.job_id} hover>
                  <TableCell>{session.job_name}</TableCell>
                  <TableCell>{session.gpu_type?.type || "N/A"}</TableCell>

                  <TableCell>
                    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                      {loadingId === session.job_id ||
                        (session.last_execution_status === "creating" && (
                          <CircularProgress size={14} sx={{ mr: 1 }} />
                        ))}
                      {session.last_execution_status}
                    </Box>
                  </TableCell>

                  <TableCell>{session.job_url || "N/A"}</TableCell>

                  <TableCell>
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
      </Paper>

      {/* Create new session modal */}
      <Modal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        aria-labelledby="create-session-modal"
        sx={{zIndex: 9999}}
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
                  sx={{ color: "white" }}
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
