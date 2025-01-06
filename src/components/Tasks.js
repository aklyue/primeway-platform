import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import axiosInstance from "../api";
import { AuthContext } from "../AuthContext";
import { OrganizationContext } from "./Organization/OrganizationContext";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function Tasks() {
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // Состояние для фильтра
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (currentOrganization && authToken) {
      setLoading(true);

      const endpoint =
        filter === "running"
          ? `/jobs/${currentOrganization.id}/running`
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
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontSize: { xs: "1.2rem", sm: "1.6rem" } }}
          >
            Задачи
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Button
            variant="outlined"
            sx={{
              mt: 1,
              borderColor: filter === "running" ? "green" : "grey.400",
              color: filter === "running" ? "green" : "inherit",
              backgroundColor:
                filter === "running" ? "rgba(0, 128, 0, 0.1)" : "transparent",
              textTransform: "none",
              borderRadius: "20px",
              "&:hover": {
                borderColor: "green",
              },
            }}
            onClick={() => setFilter(filter === "running" ? "all" : "running")}
          >
            Running
          </Button>
        </Box>
        <Typography sx={{ textAlign: "center", fontSize: "18px", mt: "40px" }}>
          Задачи не найдены.
        </Typography>
      </Box>
    );
  }

  // Step 1: Define possible columns
  const possibleColumns = [
    { field: "job_id", headerName: "Job ID" },
    { field: "job_name", headerName: "Job Name" },
    { field: "job_type", headerName: "Job Type" },
    { field: "created_at", headerName: "Created At" },
    { field: "status", headerName: "Status" },
    { field: "start_time", headerName: "Start Time" },
    { field: "build_status", headerName: "Build Status" },
    { field: "last_execution_status", headerName: "Last Execution Status" },
    {
      field: "last_execution_start_time",
      headerName: "Last Execution Start Time",
    },
    { field: "last_execution_end_time", headerName: "Last Execution End Time" },
    { field: "gpu_type", headerName: "GPU Type" },
    // Add other columns as needed
  ];

  // Step 2: Determine which columns have data
  const displayColumns = possibleColumns.filter((column) =>
    jobs.some(
      (job) =>
        job[column.field] !== undefined &&
        job[column.field] !== null &&
        job[column.field] !== ""
    )
  );

  const renderCellContent = (job, field) => {
    const value = job[field];
    switch (field) {
      case "job_id":
        const jobId = value || job.id || "N/A";
        const fullJobId = value || job.id || "";
        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            {formatJobId(jobId)}
            {fullJobId && (
              <Tooltip title="Скопировать Job ID">
                <IconButton
                  size="small"
                  onClick={() => handleCopy(fullJobId)}
                  sx={{ ml: 1 }}
                >
                  <ContentCopyIcon fontSize="10px" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      case "created_at":
      case "start_time":
      case "last_execution_start_time":
      case "last_execution_end_time":
        return value ? new Date(value).toLocaleString() : "N/A";
      case "status":
      case "build_status":
      case "last_execution_status":
        return value || "N/A";
      case "job_type":
        return (
          <Typography
            sx={{
              padding: isMobile ? "0px 5px" : "3px 7px",
              borderRadius: "5px",
              backgroundColor: "#ff77004d",
              color:
                value === "deploy"
                  ? "blue"
                  : value === "run"
                  ? "green"
                  : "inherit",
            }}
          >
            {value || "N/A"}
          </Typography>
        );
      case "gpu_type":
        return value
          ? typeof value === "string"
            ? value
            : value.type
            ? value.type
            : "N/A"
          : "N/A";
      default:
        return value || "N/A";
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontSize: { xs: "1.2rem", sm: "1.6rem" } }}
        >
          Задачи
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Button
          variant="outlined"
          sx={{
            mt: 1,
            borderColor: filter === "running" ? "green" : "grey.400",
            color: filter === "running" ? "green" : "inherit",
            backgroundColor:
              filter === "running" ? "rgba(0, 128, 0, 0.1)" : "transparent",
            textTransform: "none",
            borderRadius: "20px",
            "&:hover": {
              borderColor: "green",
            },
          }}
          onClick={() => setFilter(filter === "running" ? "all" : "running")}
        >
          Running
        </Button>
      </Box>
      {isMobile ? (
        // Mobile view (List)
        <List>
          {jobs.map((job) => {
            const jobId = job.job_id || job.id || "N/A";
            const fullJobId = job.job_id || job.id || "";

            return (
              <Paper
                key={jobId}
                sx={{
                  mb: 2,
                  p: 2,
                  boxShadow: "none",
                  borderBottom: "1px solid rgba(0,0,0,0.2)",
                }}
                elevation={1}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6">{job.job_name || "N/A"}</Typography>
                </Box>
                {/* Dynamically render available fields */}
                {displayColumns.map((column) => (
                  <Typography
                    key={column.field}
                    variant="body2"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <strong>{column.headerName}:</strong>{" "}
                    {renderCellContent(job, column.field)}
                  </Typography>
                ))}
              </Paper>
            );
          })}
        </List>
      ) : (
        // Desktop and tablet view (Table)
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "none", overflowX: "auto", boxShadow: "none" }}
        >
          <Table>
            <TableHead
              sx={{
                width: "100%",
                height: "80px",
                "& .MuiTableCell-root": {
                  color: "black",
                  textAlign: "center",
                },
              }}
            >
              <TableRow>
                {displayColumns.map((column) => (
                  <TableCell key={column.field}>{column.headerName}</TableCell>
                ))}
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
              {jobs.map((job) => (
                <TableRow key={job.job_id || job.id || Math.random()}>
                  {displayColumns.map((column) => (
                    <TableCell key={column.field}>
                      {renderCellContent(job, column.field)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default Tasks;
