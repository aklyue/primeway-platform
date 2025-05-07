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
} from "@mui/material";

import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import axiosInstance from "../../api";
import { OrganizationContext } from "../Organization/OrganizationContext";

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

  const { currentOrganization } = useContext(OrganizationContext); // Получаем текущую организацию из контекста

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
      console.log(sessions);
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

      console.log("Session created:", response.data);
      refreshSessions();
      setOpenCreateModal(false);
    } catch (error) {
      console.error(
        "Error creating session:",
        error.response?.data || error.message
      );
      alert(
        "Ошибка при создании сессии: " +
          (error.response?.data?.detail || error.message)
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartSession = (sessionId) => {
    axiosInstance.post(`/jupyter/start/${sessionId}`).then(refreshSessions);
  };

  const handleStopSession = (sessionId) => {
    axiosInstance.post(`/jupyter/stop/${sessionId}`).then(refreshSessions);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">JupyterLab Project</Typography>
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
            {sessions.map((session) => (
              <TableRow key={session.job_id} hover>
                <TableCell>{session.job_name}</TableCell>
                <TableCell>{session.gpu_type || "N/A"}</TableCell>

                <TableCell>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      color:
                        session.status === "running"
                          ? "success.main"
                          : session.status === "stopped"
                          ? "error.main"
                          : "warning.main",
                    }}
                  >
                    {session.last_execution_status === "starting" && (
                      <CircularProgress size={14} sx={{ mr: 1 }} />
                    )}
                    {session.last_execution_status}
                  </Box>
                </TableCell>
                <TableCell>{session.job_url || "N/A"}</TableCell>
                <TableCell>
                  <>
                    <IconButton
                      disabled={session.last_execution_status === "running"}
                      size="small"
                      onClick={() => handleStartSession(session.id)}
                      color="primary"
                      title="Start session"
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={session.last_execution_status !== "running"}
                      onClick={() => handleStopSession(session.id)}
                      color="error"
                      title="Stop session"
                    >
                      <StopIcon fontSize="small" />
                    </IconButton>
                  </>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                <InputLabel id="gpu-select-label">GPU Type</InputLabel>
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
                label="Disk Space (GB)"
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
    </Box>
  );
}
