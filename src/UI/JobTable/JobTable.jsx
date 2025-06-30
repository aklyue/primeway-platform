import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api";
import yaml from "js-yaml";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { format, parseISO } from "date-fns";

function JobTable({ job, isMobile, isTablet }) {
  const [executions, setExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(true);
  const [executionsError, setExecutionsError] = useState(null);
  const [jobWithConfig, setJobWithConfig] = useState({ ...job });
  const [config, setConfig] = useState("");
  const [configLoading, setConfigLoading] = useState(true);

  const initialExecutionsLoadRef = useRef(true);
  const initialConfigLoadRef = useRef(true);

  useEffect(() => {
    setJobWithConfig({ ...job });
  }, [job]);

  const fetchExecutions = async () => {
    if (initialExecutionsLoadRef.current) {
      setExecutionsLoading(true);
    }
    setExecutionsError(null);
    try {
      const response = await axiosInstance.get("/jobs/executions", {
        params: { job_id: job.job_id },
      });
      const data = response.data || [];

      const sortedData = data
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setExecutions(sortedData);
    } catch (error) {
      console.error("Ошибка при получении выполнений:", error);
      setExecutionsError("Ошибка при загрузке выполнений");
    } finally {
      if (initialExecutionsLoadRef.current) {
        setExecutionsLoading(false);
        initialExecutionsLoadRef.current = false;
      }
    }
  };

  const fetchConfig = async () => {
    if (initialConfigLoadRef.current) {
      setConfigLoading(true);
    }
    try {
      const response = await axiosInstance.get("/jobs/get-config", {
        params: { job_id: job.job_id },
      });
      const yamlConfig = yaml.dump(response.data || {});
      setConfig(yamlConfig);

      setJobWithConfig((prevJob) => ({ ...prevJob, config: response.data }));
    } catch (error) {
      console.error("Ошибка при получении конфигурации:", error);
      setConfig("");
    } finally {
      if (initialConfigLoadRef.current) {
        setConfigLoading(false);
        initialConfigLoadRef.current = false;
      }
    }
  };

  useEffect(() => {
    fetchExecutions();
    fetchConfig();
  }, [job]);

  useEffect(() => {
    if (executions.length > 0) {
      const latestExecution = executions[0];
      setJobWithConfig((prevJob) => ({
        ...prevJob,
        last_execution_status: latestExecution.status,
        last_execution_id: latestExecution.job_execution_id,
      }));
    } else {
      setJobWithConfig((prevJob) => ({
        ...prevJob,
        last_execution_status: undefined,
        last_execution_id: undefined,
      }));
    }
  }, [executions]);

  const formatJobExecutionId = (id) => {
    if (!id) return "N/A";
    return id.length > 12 ? `${id.slice(0, 3)}**${id.slice(-3)}` : id;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = parseISO(dateTimeString);
      return format(date, "dd.MM.yyyy HH:mm:ss");
    } catch (error) {
      console.error("Ошибка при форматировании даты:", error);
      return dateTimeString;
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Скопировано в буфер обмена.");
  };

  if (!job) {
    return <div></div>;
  }

  return (
    <div>
      {!isMobile && !isTablet ? (
        <Box
          sx={{
            border: "1px solid rgba(0,0,0,.12)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* ---------- header row ---------- */}
          <Box
            sx={{
              display: "flex",
              p: { xs: 1, sm: 2 },
              backgroundColor: "rgba(102, 179, 238, 0.1)",
              borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              justifyContent: "space-between",
              gap: isMobile ? "5px" : undefined,
            }}
          >
            <Typography
              sx={{ flexBasis: "14%" }}
              fontSize={{ xs: 10, sm: 14 }}
              textAlign={"center"}
            >
              JOB EXEC ID
            </Typography>
            {!isMobile && (
              <Typography
                sx={{ flexBasis: "14%", textAlign: "center" }}
                fontSize={{ xs: 10, sm: 14 }}
              >
                СОЗДАНО
              </Typography>
            )}
            <Typography
              sx={{ flexBasis: "14%", textAlign: "center" }}
              fontSize={{ xs: 10, sm: 14 }}
            >
              СТАТУС
            </Typography>
            <Typography
              sx={{ flexBasis: "14%", textAlign: "center" }}
              fontSize={{ xs: 10, sm: 14 }}
            >
              НАЧАЛО
            </Typography>
            <Typography
              sx={{ flexBasis: "14%", textAlign: "center" }}
              fontSize={{ xs: 10, sm: 14 }}
            >
              КОНЕЦ
            </Typography>
            <Typography
              sx={{ flexBasis: "14%", textAlign: "center" }}
              fontSize={{ xs: 10, sm: 14 }}
            >
              GPU
            </Typography>
            <Typography
              sx={{ flexBasis: "14%", textAlign: "center" }}
              fontSize={{ xs: 10, sm: 14 }}
            >
              HEALTH
            </Typography>
          </Box>

          {/* ---------- rows ---------- */}
          {executions.map((execution) => (
            <Box
              key={execution.job_execution_id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: "16px",
                py: "12px",
                cursor: "pointer",
                "&:hover": { background: "rgba(102, 179, 238, 0.2)" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexBasis: "14%",
                }}
              >
                <Typography variant="body2">
                  {formatJobExecutionId(execution.job_execution_id)}
                </Typography>
                <Tooltip title="Скопировать ID выполнения">
                  <IconButton
                    onClick={() => handleCopy(execution.job_execution_id)}
                    size="small"
                  >
                    <ContentCopyIcon
                      fontSize="small"
                      sx={{ fontSize: "1rem" }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: isMobile ? "9px !important" : "12px",
                }}
                flexBasis={"14%"}
                textAlign={"center"}
              >
                {formatDateTime(execution.created_at)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: isMobile ? "9px !important" : "12px",
                }}
                flexBasis={"14%"}
                textAlign={"center"}
              >
                {execution.status}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontSize: isMobile ? "9px !important" : "12px",
                }}
                flexBasis={"14%"}
                textAlign={"center"}
              >
                {formatDateTime(execution.start_time)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: isMobile ? "9px !important" : "12px",
                }}
                flexBasis={"14%"}
                textAlign={"center"}
              >
                {formatDateTime(execution.end_time)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: isMobile ? "9px !important" : "12px",
                }}
                flexBasis={"14%"}
                textAlign={"center"}
              >
                {execution.gpu_info?.type || "N/A"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: isMobile ? "9px !important" : "12px",
                }}
                flexBasis={"14%"}
                textAlign={"center"}
              >
                {execution.health_status || "N/A"}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Box>
          {executions.map((execution) => (
            <Box
              key={execution.job_execution_id}
              sx={{
                border: "1px solid rgba(0,0,0,.12)",
                borderRadius: "16px",
                p: 2,
                mb: 2,
                boxShadow: "0 2px 8px 0 rgba(102, 179, 238, 0.07)",
                background: "white",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{ fontWeight: 600, fontSize: 12, color: "#8698b0" }}
                >
                  JOB EXEC ID:
                </Typography>
                <Typography sx={{ fontSize: 12, flex: 1 }}>
                  {formatJobExecutionId(execution.job_execution_id)}
                </Typography>
                <Tooltip title="Скопировать ID выполнения">
                  <IconButton
                    onClick={() => handleCopy(execution.job_execution_id)}
                    size="small"
                  >
                    <ContentCopyIcon
                      fontSize="small"
                      sx={{ fontSize: "1rem" }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 12,
                    color: "#8698b0",
                    minWidth: 80,
                  }}
                >
                  СОЗДАНО:
                </Typography>
                <Typography sx={{ fontSize: 12 }}>
                  {formatDateTime(execution.created_at)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 12,
                    color: "#8698b0",
                    minWidth: 80,
                  }}
                >
                  СТАТУС:
                </Typography>
                <Typography sx={{ fontSize: 12 }}>
                  {execution.status}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 12,
                    color: "#8698b0",
                    minWidth: 80,
                  }}
                >
                  НАЧАЛО:
                </Typography>
                <Typography sx={{ fontSize: 12 }}>
                  {formatDateTime(execution.start_time)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 12,
                    color: "#8698b0",
                    minWidth: 80,
                  }}
                >
                  КОНЕЦ:
                </Typography>
                <Typography sx={{ fontSize: 12 }}>
                  {formatDateTime(execution.end_time)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 12,
                    color: "#8698b0",
                    minWidth: 80,
                  }}
                >
                  GPU:
                </Typography>
                <Typography sx={{ fontSize: 12 }}>
                  {execution.gpu_info?.type || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 12,
                    color: "#8698b0",
                    minWidth: 80,
                  }}
                >
                  HEALTH:
                </Typography>
                <Typography sx={{ fontSize: 12 }}>
                  {execution.health_status || "N/A"}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </div>
  );
}

export default JobTable;
