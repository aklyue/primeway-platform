import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  IconButton,
  Modal,
  CircularProgress,
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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import LogsIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function CompletedJobs() {
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false); // Состояние для модального окна
  const [currentJobId, setCurrentJobId] = useState(null); // Текущий job_id
  const [currentJobLogs, setCurrentJobLogs] = useState(''); // Логи текущей задачи
  const [logsLoading, setLogsLoading] = useState(false); // Состояние загрузки логов
  const [isCopied, setIsCopied] = useState(false); // Состояние копирования

  const token = 'visionx-nlOm2e3vwv_rjakw286mzg'; // Ваш хардкодированный токен

  // Состояния для меню действий
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuJobId, setMenuJobId] = useState(null);

  // Переменная для переключения между бэкендом и моковыми данными
  const useMockData = true; // Установите в false, чтобы использовать реальные данные с бэкенда

  useEffect(() => {
    setLoading(true);

    if (useMockData) {
      // Используем моковые данные
      fetchMockCompletedJobs()
        .then((data) => {
          setCompletedJobs(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching mock completed jobs:', error);
          setError('Error fetching mock completed jobs');
          setLoading(false);
        });
    } else {
      // Запрашиваем данные с бэкенда
      axios
        .get('http://localhost:8888/api/jobs?status=completed', {
          headers: {
            Authorization: `Bearer ${token}`, // Добавляем Bearer токен в запрос
          },
        })
        .then((response) => {
          setCompletedJobs(response.data); // Устанавливаем данные в состояние
          setLoading(false); // Устанавливаем загрузку в false после получения данных
        })
        .catch((error) => {
          console.error('Error fetching completed jobs:', error);
          setError('Error fetching completed jobs');
          setLoading(false);
        });
    }
  }, [token, useMockData]);

  const downloadData = (jobId) => {
    // Здесь вы можете эмулировать скачивание данных или добавить реальную логику
    alert(`Данные для задания ${jobId} были загружены.`);
  };

  const handleOpenModal = (jobId) => {
    setOpenModal(true);
    setCurrentJobId(jobId);
    setLogsLoading(true);
    setIsCopied(false); // Сброс состояния копирования при открытии нового модального окна

    if (useMockData) {
      // Используем моковые данные для логов
      fetchMockJobLogs(jobId)
        .then((logs) => {
          setCurrentJobLogs(logs);
          setLogsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching mock job logs:', error);
          setCurrentJobLogs('Ошибка при получении логов');
          setLogsLoading(false);
        });
    } else {
      // Запрашиваем логи с бэкенда
      axios
        .get(`http://localhost:8888/api/resume-logs/${jobId}?stream=false`, {
          headers: {
            Authorization: `Bearer ${token}`, // Добавляем Bearer токен в запрос
          },
        })
        .then((response) => {
          console.log('Fetched job logs:', response.data);
          setCurrentJobLogs(response.data); // Устанавливаем полученные логи
          setLogsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching job logs:', error);
          setCurrentJobLogs('Ошибка при получении логов');
          setLogsLoading(false);
        });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentJobLogs(''); // Сбрасываем логи при закрытии модального окна
    setIsCopied(false); // Сбрасываем состояние копирования
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(currentJobLogs);
    setIsCopied(true); // Отмечаем как скопировано
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
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Завершенные задачи
      </Typography>

      {/* Таблица с данными */}
      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table aria-label="completed jobs table">
          <TableHead sx={{ '& .MuiTableCell-root': { color: 'black' } }}>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Создан</TableCell>
              <TableCell>Завершен</TableCell>
              <TableCell>Тип GPU</TableCell>
              <TableCell>Количество GPU</TableCell>
              <TableCell>Количество CPU</TableCell>
              <TableCell>Память (GB)</TableCell>
              <TableCell>Объем диска (GB)</TableCell>
              <TableCell>Общая стоимость (₽)</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ '& .MuiTableCell-root': { color: '#6e6e80', textAlign: 'center' } }}>
            {completedJobs.map((job) => (
              <TableRow key={job.job_id}>
                <TableCell component="th" scope="row">
                  <Box component="span" sx={{ color: 'secondary.main' }}>
                    {job.job_id}
                  </Box>
                </TableCell>
                <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                <TableCell>{new Date(job.completed_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Box component="span" sx={{ color: 'secondary.main' }}>
                    {job.gpu_type}
                  </Box>
                </TableCell>
                <TableCell>{job.gpu_count}</TableCell>
                <TableCell>{job.cpu_count}</TableCell>
                <TableCell>{job.memory}</TableCell>
                <TableCell>{job.disk_space}</TableCell>
                <TableCell>{job.total_cost}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(event) => handleMenuClick(event, job.job_id)}
                    aria-controls={menuJobId === job.job_id ? 'action-menu' : undefined}
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
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
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
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        downloadData(job.job_id);
                      }}
                    >
                      <ListItemIcon>
                        <DownloadIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Скачать данные</ListItemText>
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Модальное окно для просмотра логов */}
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
          {logsLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Box
                sx={{
                  maxHeight: '300px', // Ограничиваем высоту
                  overflowY: 'auto', // Добавляем вертикальную прокрутку, если логи превышают высоту
                  backgroundColor: 'background.default', // Цвет фона для области логов
                  padding: '16px', // Отступы вокруг логов
                  marginTop: '16px',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  {currentJobLogs || 'Логи недоступны.'}
                </Typography>
              </Box>

              {/* Кнопки копирования и закрытия модального окна */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                {isCopied ? (
                  <Button
                    variant="outlined"
                    disabled
                    sx={{
                      color: 'green',
                      borderColor: 'green',
                      '&.Mui-disabled': { color: 'green', borderColor: 'green' },
                    }}
                  >
                    Скопировано
                  </Button>
                ) : (
                  <Button onClick={handleCopyLogs} variant="outlined" startIcon={<ContentCopyIcon />}>
                    Скопировать логи
                  </Button>
                )}
                <Button onClick={handleCloseModal} variant="contained" color="secondary">
                  Закрыть
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

// Стили для модального окна
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

export default CompletedJobs;

// Функция для получения моковых данных завершённых задач
function fetchMockCompletedJobs() {
  return new Promise((resolve, reject) => {
    // Эмулируем задержку запроса
    setTimeout(() => {
      // Моковые данные завершённых задач
      const mockData = [
        {
          job_id: 'job-1',
          created_at: '2023-08-01T10:00:00Z',
          gpu_type: 'NVIDIA Tesla V100',
          gpu_count: 2,
          cpu_count: 16,
          memory: 64,
          disk_space: 500,
          total_cost: 120.5,
          completed_at: '2023-08-01T12:30:00Z',
        },
        {
          job_id: 'job-2',
          created_at: '2023-08-02T09:15:00Z',
          gpu_type: 'NVIDIA Tesla P100',
          gpu_count: 1,
          cpu_count: 8,
          memory: 32,
          disk_space: 250,
          total_cost: 80.75,
          completed_at: '2023-08-02T11:45:00Z',
        },
        // Добавьте больше тестовых данных при необходимости
      ];
      // Возвращаем данные с вероятностью ошибки для тестирования обработки ошибок
      const shouldFail = false; // Установите в true, чтобы эмулировать ошибку
      if (shouldFail) {
        reject(new Error('Failed to fetch mock completed jobs'));
      } else {
        resolve(mockData);
      }
    }, 1000); // Задержка в 1 секунду
  });
}

// Функция для получения моковых логов задачи
function fetchMockJobLogs(jobId) {
  return new Promise((resolve, reject) => {
    // Эмулируем задержку запроса
    setTimeout(() => {
      // Моковые логи задачи
      const mockLogs = `Логи для ${jobId}:\n\n[INFO] Задача запущена...\n[INFO] Обработка данных...\n[INFO] Задача завершена успешно.`;
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