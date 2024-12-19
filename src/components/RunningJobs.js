import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Box,
  CardActions,
  Modal,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogsIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { OrganizationContext } from './Organization/OrganizationContext';

function RunningJobs() {
  const [runningJobs, setRunningJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentJobLogs, setCurrentJobLogs] = useState('');
  const [logStream, setLogStream] = useState(null); // For managing SSE stream
  const [isCopied, setIsCopied] = useState(false); // To manage copy state

  const [openDialog, setOpenDialog] = useState(false); // State to control dialog visibility
  const [jobToTerminate, setJobToTerminate] = useState(null); // State to track job to terminate

  const { currentOrganization } = useContext(OrganizationContext);

  const token = 'visionx-nlOm2e3vwv_rjakw286mzg'; // Replace this with how you store your token

  // Переменная для переключения между бэкендом и моковыми данными
  const useMockData = true; // Установите в false, чтобы использовать реальные данные с бэкенда

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = () => {
    setLoading(true);

    if (useMockData) {
      // Используем моковые данные
      fetchMockRunningJobs()
        .then((data) => {
          setRunningJobs(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching mock running jobs:', error);
          setError('Error fetching mock running jobs');
          setLoading(false);
        });
    } else {
      // Запрашиваем данные с бэкенда
      axios
        .get('http://localhost:8888/api/jobs?status=running', {
          headers: {
            Authorization: `Bearer ${token}`, // Add the Bearer token to the request
          },
        })
        .then((response) => {
          setRunningJobs(response.data); // Set the data to the state
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching running jobs:', error);
          setError('Error fetching running jobs');
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
      // Эмулируем удаление задачи из моковых данных
      terminateMockJob(jobId)
        .then(() => {
          setRunningJobs((prevJobs) => prevJobs.filter((job) => job.job_id !== jobId));
        })
        .catch((error) => {
          console.error('Error terminating mock job:', error);
          setError('Error terminating mock job');
        });
    } else {
      // Отправляем реальный запрос к бэкенду
      axios
        .delete(`http://localhost:8888/api/terminate-job/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add the Bearer token to the request
          },
        })
        .then(() => {
          setRunningJobs((prevJobs) => prevJobs.filter((job) => job.job_id !== jobId));
        })
        .catch((error) => {
          console.error('Error terminating job:', error);
          setError('Error terminating job');
        });
    }
  };

  const handleOpenModal = (jobId) => {
    setOpenModal(true);
    setCurrentJobId(jobId);
    setCurrentJobLogs(''); // Reset logs
    setIsCopied(false); // Reset copy state

    if (useMockData) {
      // Используем моковые логи
      fetchMockJobLogs(jobId)
        .then((logs) => {
          setCurrentJobLogs(logs);
        })
        .catch((error) => {
          console.error('Error fetching mock job logs:', error);
          setCurrentJobLogs('Error fetching logs');
        });
    } else {
      // Start the SSE connection for real-time logs
      const eventSource = new EventSource(`http://localhost:8888/api/resume-logs/${jobId}`);
      setLogStream(eventSource);

      eventSource.onmessage = (event) => {
        console.log('event', event);
        setCurrentJobLogs((prevLogs) => prevLogs + '\n' + event.data); // Append new logs
      };

      eventSource.onerror = () => {
        console.error('Error in log streaming');
        eventSource.close();
      };
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    if (logStream) {
      logStream.close(); // Close the SSE connection when modal is closed
      setLogStream(null);
    }
    setCurrentJobId(null);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(currentJobLogs);
    setIsCopied(true); // Mark logs as copied
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Running Jobs
      </Typography>
      {currentOrganization && (
        <Typography variant="h5" gutterBottom>
          Running Jobs for {currentOrganization.name}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column', // Set to column layout for cards
          gap: 2, // Space between cards
        }}
      >
        {runningJobs.map((job) => (
          <Card key={job.job_id} sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}>
            {/* Each card takes full width */}
            <CardContent>
              <Typography variant="h6" component="div">
                {job.job_id}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  mt: 2,
                }}
              >
                {/* Column 1 */}
                <Box sx={{ flex: '1' }}>
                  <Typography color="textSecondary">
                    Created at: {new Date(job.createdAt).toLocaleString()}
                  </Typography>
                  <Typography>GPU Type: {job.gpu_type}</Typography>
                </Box>

                {/* Column 2 */}
                <Box sx={{ flex: '1' }}>
                  <Typography>GPU Count: {job.gpu_count}</Typography>
                  <Typography>CPU Count: {job.cpu_count}</Typography>
                </Box>

                {/* Column 3 */}
                <Box sx={{ flex: '1' }}>
                  <Typography>Memory: {job.memory} GB</Typography>
                  <Typography>Disk Space: {job.disk_space} GB</Typography>
                </Box>

                {/* Column 4 */}
                <Box sx={{ flex: '1' }}>
                  <Typography>Price per hour: ${job.pricePerHour}</Typography>
                </Box>
              </Box>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenModal(job.job_id)}
                startIcon={<LogsIcon />}
              >
                View Logs
              </Button>
              <IconButton
                color="secondary"
                onClick={() => handleOpenDialog(job.job_id)}
                aria-label="terminate"
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Modal for logs */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Job Logs for {currentJobId}
          </Typography>
          <Box
            sx={{
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: '#f5f5f5',
              padding: '16px',
              marginTop: '16px',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {currentJobLogs || 'No logs available yet.'}
          </Box>

          {/* Copy button and message */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <Button
              onClick={handleCopyLogs}
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              disabled={isCopied}
              sx={
                isCopied
                  ? {
                      color: 'green',
                      borderColor: 'green',
                      '&.Mui-disabled': { color: 'green', borderColor: 'green' },
                    }
                  : {}
              }
            >
              {isCopied ? 'Copied' : 'Copy Logs'}
            </Button>
            <Button onClick={handleCloseModal} variant="contained" color="secondary">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirm Termination'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to terminate this job?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={() => terminateJob(jobToTerminate)} color="secondary" autoFocus>
            Terminate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Modal styles
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

export default RunningJobs;

// Моковая функция для получения списка запущенных задач
function fetchMockRunningJobs() {
  return new Promise((resolve, reject) => {
    // Эмулируем задержку запроса
    setTimeout(() => {
      // Моковые данные запущенных задач
      const mockData = [
        {
          job_id: 'job-1',
          createdAt: '2023-08-05T10:00:00Z',
          gpu_type: 'NVIDIA Tesla V100',
          gpu_count: 2,
          cpu_count: 16,
          memory: 64,
          disk_space: 500,
          pricePerHour: 5.0,
        },
        {
          job_id: 'job-2',
          createdAt: '2023-08-06T09:15:00Z',
          gpu_type: 'NVIDIA Tesla P100',
          gpu_count: 1,
          cpu_count: 8,
          memory: 32,
          disk_space: 250,
          pricePerHour: 3.5,
        },
        // Добавьте больше тестовых данных при необходимости
      ];
      // Возвращаем данные с вероятностью ошибки для тестирования обработки ошибок
      const shouldFail = false; // Установите в true, чтобы эмулировать ошибку
      if (shouldFail) {
        reject(new Error('Failed to fetch mock running jobs'));
      } else {
        resolve(mockData);
      }
    }, 1000); // Задержка в 1 секунду
  });
}

// Моковая функция для завершения задачи
function terminateMockJob(jobId) {
  return new Promise((resolve, reject) => {
    // Эмулируем задержку запроса
    setTimeout(() => {
      // Эмулируем успешное завершение задачи
      const shouldFail = false; // Установите в true, чтобы эмулировать ошибку
      if (shouldFail) {
        reject(new Error('Failed to terminate mock job'));
      } else {
        resolve();
      }
    }, 500); // Задержка в 0.5 секунды
  });
}

// Моковая функция для получения логов задачи
function fetchMockJobLogs(jobId) {
  return new Promise((resolve, reject) => {
    // Эмулируем задержку запроса
    setTimeout(() => {
      // Моковые логи задачи
      const mockLogs = `Logs for ${jobId}:\n\n[INFO] Job started...\n[INFO] Processing data...\n[INFO] Job is running...`;
      // Возвращаем данные с вероятностью ошибки для тестирования обработки ошибок
      const shouldFail = false; // Установите в true, чтобы эмулировать ошибку
      if (shouldFail) {
        reject(new Error('Failed to fetch mock job logs'));
      } else {
        resolve(mockLogs);
      }
    }, 500); // Задержка в 0.5 секунды
  });
}