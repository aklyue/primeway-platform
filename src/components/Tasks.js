import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import axiosInstance from "../api";
import { AuthContext } from "../AuthContext";
import { OrganizationContext } from "./Organization/OrganizationContext";

function Tasks() {
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('all'); // Состояние для фильтра

  useEffect(() => {
    if (currentOrganization && authToken) {
      setLoading(true);

      const endpoint =
        filter === 'running'
          ? `/jobs/${currentOrganization.id}/running` // Обновленный ендпоинт
          : `/jobs/${currentOrganization.id}`;

      axiosInstance
        .get(endpoint)
        .then((response) => {
          const data = response.data || [];
          setJobs(data);
        })
        .catch((error) => {
          console.error("Ошибка при получении списка задач:", error);
          setError("Не удалось загрузить список задач.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentOrganization, authToken, filter]);

  // Функция для форматирования job_id
  const formatJobId = (jobId) => {
    if (!jobId || typeof jobId !== "string") return "N/A";
    if (jobId.length <= 12) {
      return jobId;
    } else {
      const firstFive = jobId.substring(0, 5);
      const lastFive = jobId.substring(jobId.length - 5);
      return `${firstFive}**${lastFive}`;
    }
  };

  const handleCopy = (jobId) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(jobId)
        .then(() => {
          console.log("Job ID скопирован:", jobId);
        })
        .catch((error) => {
          console.error("Ошибка при копировании Job ID:", error);
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = jobId;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        console.log("Job ID скопирован:", jobId);
      } catch (err) {
        console.error("Ошибка при копировании Job ID:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Задачи
          </Typography>
          <Box
            sx={{
              ml: 2,
              padding: '6px 12px',
              border: '1px solid',
              borderColor: filter === 'running' ? 'green' : 'grey.400',
              borderRadius: '20px',
              cursor: 'pointer',
              backgroundColor: filter === 'running' ? 'green' : 'transparent',
              color: filter === 'running' ? 'white' : 'inherit',
              '&:hover': {
                borderColor: 'green',
              },
            }}
            onClick={() => setFilter(filter === 'running' ? 'all' : 'running')}
          >
            Running
          </Box>
        </Box>
        <Typography sx={{ textAlign: "center", fontSize: "18px", mt: "40px" }}>
          Задачи не найдены.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Задачи
        </Typography>
        <Box
          sx={{
            ml: 2,
            padding: '6px 12px',
            border: '1px solid',
            borderColor: filter === 'running' ? 'green' : 'grey.400',
            borderRadius: '20px',
            cursor: 'pointer',
            backgroundColor: filter === 'running' ? 'green' : 'transparent',
            color: filter === 'running' ? 'white' : 'inherit',
            '&:hover': {
              borderColor: 'green',
            },
          }}
          onClick={() => setFilter(filter === 'running' ? 'all' : 'running')}
        >
          Running
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table>
          {filter === 'running' ? (
            <>
              {/* Таблица для "running" задач */}
              <TableHead
                sx={{
                  "& .MuiTableCell-root": {
                    color: "black",
                    textAlign: "center",
                  },
                }}
              >
                <TableRow>
                  <TableCell>Job ID</TableCell>
                  <TableCell>Job Name</TableCell>
                  <TableCell>Job Type</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>GPU Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  "& .MuiTableCell-root": {
                    color: "#6e6e80",
                    textAlign: "center",
                  },
                }}
              >
                {jobs.map((job) => {
                  const jobId = job.job_id || job.id || "N/A";
                  const fullJobId = job.job_id || job.id || "";

                  return (
                    <TableRow key={jobId}>
                      <TableCell>
                        <Box display="flex" alignItems="center" justifyContent="center">
                          {formatJobId(jobId)}
                          {fullJobId && (
                            <Tooltip title="Скопировать Job ID">
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(fullJobId)}
                                sx={{ ml: 1 }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {typeof job.job_name === "string" ? job.job_name : "N/A"}
                      </TableCell>
                      <TableCell>
                        {typeof job.job_type === "string" ? job.job_type : "N/A"}
                      </TableCell>
                      <TableCell>
                        {job.created_at
                          ? new Date(job.created_at).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {typeof job.status === "string" ? job.status : "N/A"}
                      </TableCell>
                      <TableCell>
                        {job.start_time
                          ? new Date(job.start_time).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {job.gpu_type
                          ? typeof job.gpu_type === "string"
                            ? job.gpu_type
                            : job.gpu_type.type
                            ? job.gpu_type.type
                            : "N/A"
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </>
          ) : (
            <>
              {/* Таблица для всех задач */}
              <TableHead
                sx={{
                  "& .MuiTableCell-root": {
                    color: "black",
                    textAlign: "center",
                  },
                }}
              >
                <TableRow>
                  <TableCell>Job ID</TableCell>
                  <TableCell>Job Name</TableCell>
                  <TableCell>Job Type</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Build Status</TableCell>
                  <TableCell>Last Execution Status</TableCell>
                  <TableCell>Last Execution Start Time</TableCell>
                  <TableCell>Last Execution End Time</TableCell>
                  <TableCell>GPU Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  "& .MuiTableCell-root": {
                    color: "#6e6e80",
                    textAlign: "center",
                  },
                }}
              >
                {jobs.map((job) => {
                  const jobId = job.job_id || job.id || "N/A";
                  const fullJobId = job.job_id || job.id || "";

                  return (
                    <TableRow key={jobId}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Box display="flex" alignItems="center">
                          {formatJobId(jobId)}
                          {fullJobId && (
                            <Tooltip title="Скопировать Job ID">
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(fullJobId)}
                                sx={{ ml: 1 }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {typeof job.job_name === "string"
                          ? job.job_name
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            padding: "3px 7px",
                            borderRadius: "5px",
                            backgroundColor: "#ff77004d",
                            color:
                              job.job_type === "deploy"
                                ? "blue"
                                : job.job_type === "run"
                                ? "green"
                                : "inherit",
                          }}
                        >
                          {typeof job.job_type === "string"
                            ? job.job_type
                            : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {job.created_at
                          ? new Date(job.created_at).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {typeof job.build_status === "string"
                          ? job.build_status
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {typeof job.last_execution_status === "string"
                          ? job.last_execution_status
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {job.last_execution_start_time
                          ? new Date(job.last_execution_start_time).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {job.last_execution_end_time
                          ? new Date(job.last_execution_end_time).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {job.gpu_type
                          ? typeof job.gpu_type === "string"
                            ? job.gpu_type
                            : job.gpu_type.type
                            ? job.gpu_type.type
                            : "N/A"
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Tasks;