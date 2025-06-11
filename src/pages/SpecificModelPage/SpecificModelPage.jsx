import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import BackArrow from "../../UI/BackArrow";
import SpecificModel from "../../components/SpecificModel";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import axiosInstance from "../../api";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import {
  Description,
  ExpandMore,
  ContentCopy,
  Check,
} from "@mui/icons-material";
import JobTable from "../../UI/JobTable";

function SpecificModelPage() {
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);
  const [copied, setCopied] = useState(false);

  const location = useLocation();
  const { model, initialConfig, isBasic, isMobile } = location.state || {};
  const { modelId: jobId } = useParams();
  console.log(jobId);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentLogs, setCurrentLogs] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [firstLogsLoading, setFirstLogsLoading] = useState(true);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const intervalRef = useRef(null);
  const isFirstRef = useRef(true);
  const [isLaunchedModel, setIsLaunchedModel] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!currentOrganization?.id || !jobId) return;

    const fetchLogs = async () => {
      try {
        const response = await axiosInstance.get("/jobs/job-logs", {
          params: { job_id: jobId },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const logs = response.data.logs || "Логи отсутствуют.";
        setCurrentLogs(logs);
      } catch (err) {
        console.error("Failed to load logs", err);
      } finally {
        if (initialLoading) setInitialLoading(false);
      }
    };

    fetchLogs();
    intervalRef.current = setInterval(fetchLogs, 5000);

    return () => clearInterval(intervalRef.current);
  }, [jobId, currentOrganization?.id]);

  /* ─── NEW: fetch logs on-demand ─────────────────────────── */
  const handleLogsClick = useCallback(() => {
    if (!jobId) return;
    setIsLogsOpen(true);
    setLogsLoading(true);
    setCurrentLogs("");

    axiosInstance
      .get("/jobs/job-logs", { params: { job_id: jobId } })
      .then(({ data }) => {
        setCurrentLogs(data.logs || "Логи отсутствуют.");
      })
      .catch((error) => {
        const msg =
          error.response?.data?.detail ||
          (error.response?.status === 404
            ? "Логи недоступны."
            : "Ошибка при получении логов.");
        setCurrentLogs(msg);
      })
      .finally(() => setLogsLoading(false));
  }, [jobId]);

  useEffect(() => {
    if (!isLogsOpen || !jobId) return;

    const fetchLogs = () => {
      setLogsLoading(isFirstRef.current);
      if (isFirstRef.current) {
        setFirstLogsLoading(true);
        setCurrentLogs("");
      }

      axiosInstance
        .get("/jobs/job-logs", { params: { job_id: jobId } })
        .then(({ data }) => {
          setCurrentLogs(data.logs || "Логи отсутствуют.");
        })
        .catch((error) => {
          const msg =
            error.response?.data?.detail ||
            (error.response?.status === 404
              ? "Логи недоступны."
              : "Ошибка при получении логов.");
          setCurrentLogs(msg);
        })
        .finally(() => {
          setLogsLoading(false);
          if (isFirstRef.current) {
            setFirstLogsLoading(false);
            isFirstRef.current = false;
          }
        });
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [isLogsOpen, jobId]);

  const fetchJobs = () => {
    if (currentOrganization && authToken) {
      const endpoint = `/jobs/get-organization-jobs`;
      const params = {
        organization_id: currentOrganization.id,
      };

      axiosInstance
        .get(endpoint, { params })
        .then((response) => {
          const data = response.data || [];
          setJobs(data);
          console.log(data);
        })
        .catch((error) => {
          console.error("Ошибка при получении списка задач:", error);
          const errorMessage =
            error.response?.data?.detail ||
            "Не удалось загрузить список задач.";
        });
    }
  };

  useEffect(() => {
    if (currentOrganization && authToken) {
      fetchJobs();
    }
  }, [currentOrganization, authToken]);

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      const currentJob = jobs.find((j) => j.job_id === jobId);
      setJob(currentJob);
      console.log("Current job:", currentJob);
    }
  }, [jobs, jobId]);

  return (
    <div>
      <Box>
        <BackArrow
          path={"/models"}
          name={"Models"}
          model={model}
          config={initialConfig}
        />
      </Box>
      <SpecificModel
        isMobile={isMobile}
        model={model}
        initialConfig={initialConfig}
        isBasic={isBasic}
        jobId={jobId}
        onLaunchedModelChange={setIsLaunchedModel}
      />
      {!isBasic && !isLaunchedModel && (
        <Box>
          <JobTable job={job} isMobile={isMobile} />
        </Box>
      )}
      {isLaunchedModel && (
        <Box>
          <Accordion
            onClick={handleLogsClick}
            onChange={(_, expanded) => {
              setIsLogsOpen(expanded);
              if (expanded) handleLogsClick();
            }}
            sx={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 2,
              background: "#fff",
              boxShadow: "none",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="logs-content"
              id="logs-header"
            >
              <Description />
              <Typography variant="h6" sx={{ userSelect: "none" }}>
                Логи задачи
              </Typography>
              <Tooltip
                arrow
                placement="top"
                title={copied ? "Скопировано" : "Скопировать"}
              >
                <IconButton
                  sx={{ ml: 1 }}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(String(currentLogs ?? ""));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? (
                    <Check
                      sx={{
                        fontSize: isMobile ? "15px" : "inherit",
                        color: "success.main",
                      }}
                    />
                  ) : (
                    <ContentCopy
                      sx={{ fontSize: isMobile ? "15px" : "inherit" }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            </AccordionSummary>
            <AccordionDetails>
              {firstLogsLoading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box
                  sx={{
                    maxHeight: 320,
                    overflowY: "auto",
                    borderRadius: 1,
                    bgcolor: "#f8f9fa",
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      margin: 0,
                      fontFamily: "monospace",
                      fontSize: 14,
                    }}
                  >
                    {currentLogs}
                  </pre>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </div>
  );
}

export default SpecificModelPage;
