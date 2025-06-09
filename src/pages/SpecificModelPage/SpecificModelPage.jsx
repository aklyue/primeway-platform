import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import BackArrow from "../../UI/BackArrow";
import SpecificModel from "../../components/SpecificModel";
import { Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress, Typography } from "@mui/material";
import axiosInstance from "../../api";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import { Description, ExpandMore } from "@mui/icons-material";

function SpecificModelPage() {
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);

  const location = useLocation();
  const { model, initialConfig, isBasic, isMobile, jobId } = location.state || {};
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentLogs, setCurrentLogs] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [firstLogsLoading, setFirstLogsLoading] = useState(true);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const intervalRef = useRef(null);
  const isFirstRef = useRef(true);
  const [isLaunchedModel, setIsLaunchedModel] = useState(false);

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

  return (
    <div>
      <Box sx={{ mx: isMobile ? 0 : 4 }}>
        <BackArrow path={"/models"} name={"Models"} model={model} config={initialConfig} />
      </Box>
      <SpecificModel
        isMobile={isMobile}
        model={model}
        initialConfig={initialConfig}
        isBasic={isBasic}
        jobId={jobId}
        onLaunchedModelChange={setIsLaunchedModel}
      />
      {isLaunchedModel && (
        <Box sx={{ mx: isMobile ? 0 : 4 }}>
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
            </AccordionSummary>
            <AccordionDetails>
              {firstLogsLoading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
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
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </div>
  );
}

export default SpecificModelPage;
