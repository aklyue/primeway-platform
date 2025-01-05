import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  IconButton,
  Modal,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LogsIcon from "@mui/icons-material/Description";
import StopIcon from "@mui/icons-material/Stop";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { OrganizationContext } from "./Organization/OrganizationContext";

function RunningJobs() {
  const [runningJobs, setRunningJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentJobLogs, setCurrentJobLogs] = useState("");
  const [logStream, setLogStream] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [jobToTerminate, setJobToTerminate] = useState(null);

  const { currentOrganization } = useContext(OrganizationContext);

  const token = "visionx-nlOm2e3vwv_rjakw286mzg";

  const useMockData = true;

  // Состояния для меню действий
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuJobId, setMenuJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = () => {
    setLoading(true);

    if (useMockData) {
      fetchMockRunningJobs()
        .then((data) => {
          setRunningJobs(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching mock running jobs:", error);
          setError("Error fetching mock running jobs");
          setLoading(false);
        });
    } else {
      axios
        .get("http://localhost:8888/api/jobs?status=running", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setRunningJobs(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching running jobs:", error);
          setError("Error fetching running jobs");
          setLoading(false);
        });
    }
  };

  const handleOpenDialog = (jobId) => {
    setOpenDialog(true);
    setJobToTerminate(jobId);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setJobToTerminate(null);
  };

  const terminateJob = (jobId) => {
    handleCloseDialog();

    if (useMockData) {
      terminateMockJob(jobId)
        .then(() => {
          setRunningJobs((prevJobs) =>
            prevJobs.filter((job) => job.job_id !== jobId)
          );
        })
        .catch((error) => {
          console.error("Error terminating mock job:", error);
          setError("Error terminating mock job");
        });
    } else {
      axios
        .delete(`http://localhost:8888/api/terminate-job/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setRunningJobs((prevJobs) =>
            prevJobs.filter((job) => job.job_id !== jobId)
          );
        })
        .catch((error) => {
          console.error("Error terminating job:", error);
          setError("Error terminating job");
        });
    }
  };

  const handleOpenModal = (jobId) => {
    setOpenModal(true);
    setCurrentJobId(jobId);
    setCurrentJobLogs("");
    setIsCopied(false);

    if (useMockData) {
      fetchMockJobLogs(jobId)
        .then((logs) => {
          setCurrentJobLogs(logs);
        })
        .catch((error) => {
          console.error("Error fetching mock job logs:", error);
          setCurrentJobLogs("Error fetching logs");
        });
    } else {
      const eventSource = new EventSource(
        `http://localhost:8888/api/resume-logs/${jobId}`
      );
      setLogStream(eventSource);

      eventSource.onmessage = (event) => {
        console.log("event", event);
        setCurrentJobLogs((prevLogs) => prevLogs + "\n" + event.data);
      };

      eventSource.onerror = () => {
        console.error("Error in log streaming");
        eventSource.close();
      };
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    if (logStream) {
      logStream.close();
      setLogStream(null);
    }
    setCurrentJobId(null);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(currentJobLogs);
    setIsCopied(true);
  };

  // Функции для управления меню действий
  const handleMenuClick = (event, jobId) => {
    setAnchorEl(event.currentTarget);
    setMenuJobId(jobId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuJobId(null);
  };

  const handleCopyJobId = (jobId) => {
    navigator.clipboard.writeText(jobId);
    handleMenuClose();
    setIsCopied(true);
    // Здесь вы можете добавить уведомление о том, что jobId скопирован
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Выполняемые задачи
      </Typography>
      

      {/* Таблица с данными */}
      <TableContainer component={Paper}>
        <Table aria-label="running jobs table">
          <TableHead sx={{ "& .MuiTableCell-root": { color: "black" } }}>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Тип GPU</TableCell>
              <TableCell>Количество GPU</TableCell>
              <TableCell>Количество CPU</TableCell>
              <TableCell>Память (GB)</TableCell>
              <TableCell>Объем диска (GB)</TableCell>
              <TableCell>Стоимость за час (₽)</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              "& .MuiTableCell-root": { color: "#6e6e80", textAlign: "center" },
            }}
          >
            {runningJobs.map((job) => (
              <TableRow key={job.job_id}>
                <TableCell component="th" scope="row">
                  <Box component="span" sx={{ color: "secondary.main" }}>
                    {job.name || job.job_id}
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(job.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Box component="span" sx={{ color: "secondary.main" }}>
                    {job.gpu_type}
                  </Box>
                </TableCell>
                <TableCell>{job.gpu_count}</TableCell>
                <TableCell>{job.cpu_count}</TableCell>
                <TableCell>{job.memory}</TableCell>
                <TableCell>{job.disk_space}</TableCell>
                <TableCell>{job.pricePerHour}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(event) => handleMenuClick(event, job.job_id)}
                    aria-controls={
                      menuJobId === job.job_id ? "action-menu" : undefined
                    }
                    aria-haspopup="true"
                  >
                    <MoreVertIcon />
                  </IconButton>
                  {/* Меню действий */}
                  <Menu
                    id="action-menu"
                    anchorEl={anchorEl}
                    open={menuJobId === job.job_id}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        handleOpenModal(job.job_id);
                      }}
                    >
                      <ListItemIcon>
                        <LogsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Просмотр логов</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleCopyJobId(job.job_id);
                      }}
                    >
                      <ListItemIcon>
                        <ContentCopyIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Скопировать</ListItemText>
                    </MenuItem>
                    <MenuItem>
                      <ListItemIcon>
                        <StopIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Остановить</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        handleOpenDialog(job.job_id);
                      }}
                    >
                      <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ sx: { color: "red" } }}
                      >
                        Удалить
                      </ListItemText>
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Модальное окно для логов */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          {/* <Typography id="modal-modal-title" variant="h6" component="h2">
            Логи задания {currentJobId}
          </Typography> */}
          <Box
            sx={{
              maxHeight: "300px",
              overflowY: "auto",
              backgroundColor: "background.default",
              padding: "16px",
              marginTop: "16px",
              borderRadius: "4px",
              whiteSpace: "pre-wrap",
            }}
          >
            {currentJobLogs || "Логи пока недоступны."}
          </Box>

          {/* Кнопка копирования логов и закрытия модалки */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
            }}
          >
            <Button
              onClick={handleCopyLogs}
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              disabled={isCopied}
              sx={
                isCopied
                  ? {
                      color: "green",
                      borderColor: "green",
                      "&.Mui-disabled": {
                        color: "green",
                        borderColor: "green",
                      },
                    }
                  : {}
              }
            >
              {isCopied ? "Скопировано" : "Скопировать логи"}
            </Button>
            <Button
              onClick={handleCloseModal}
              variant="contained"
              color="secondary"
            >
              Закрыть
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Диалог подтверждения завершения задачи */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Подтверждение</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Вы уверены, что хотите завершить эту задачу?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Отмена
          </Button>
          <Button
            onClick={() => terminateJob(jobToTerminate)}
            color="secondary"
            autoFocus
          >
            Завершить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Стили для модального окна
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

export default RunningJobs;

// Моковые функции

function fetchMockRunningJobs() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockData = [
        {
          job_id: "job-1",
          name: "job-1",
          createdAt: "2023-08-05T10:00:00Z",
          gpu_type: "NVIDIA Tesla V100",
          gpu_count: 2,
          cpu_count: 16,
          memory: 64,
          disk_space: 500,
          pricePerHour: 5.0,
        },
        {
          job_id: "job-2",
          name: "job-2",
          createdAt: "2023-08-06T09:15:00Z",
          gpu_type: "NVIDIA Tesla P100",
          gpu_count: 1,
          cpu_count: 8,
          memory: 32,
          disk_space: 250,
          pricePerHour: 3.5,
        },
      ];
      const shouldFail = false;
      if (shouldFail) {
        reject(new Error("Failed to fetch mock running jobs"));
      } else {
        resolve(mockData);
      }
    }, 1000);
  });
}

function terminateMockJob(jobId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const shouldFail = false;
      if (shouldFail) {
        reject(new Error("Failed to terminate mock job"));
      } else {
        resolve();
      }
    }, 500);
  });
}

function fetchMockJobLogs(jobId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockLogs = `Логи для ${jobId}:\n\n[INFO] Задача запущена...\n[INFO] Обработка данных...\n[INFO] Задача выполняется...`;
      const shouldFail = false;
      if (shouldFail) {
        reject(new Error("Failed to fetch mock job logs"));
      } else {
        resolve(mockLogs);
      }
    }, 500);
  });
}