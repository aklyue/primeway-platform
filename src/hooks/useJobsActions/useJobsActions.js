import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";

export default function useJobsActions() {
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);
  const { modelId: jobId } = useParams();

  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);

  const [currentLogs, setCurrentLogs] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [firstLogsLoading, setFirstLogsLoading] = useState(true);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const isFirstRef = useRef(true);
  const intervalRef = useRef(null);

  // ─── Fetch organization jobs ─────────────────────────────
  const fetchJobs = useCallback(() => {
    if (!currentOrganization || !authToken) return;

    axiosInstance
      .get("/jobs/get-organization-jobs", {
        params: { organization_id: currentOrganization.id },
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        setJobs(response.data || []);
      })
      .catch((error) => {
        console.error("Ошибка при получении списка задач:", error);
      });
  }, [currentOrganization, authToken]);

  // ─── Fetch single logs ─────────────────────────────
  const fetchLogs = useCallback(() => {
    if (!jobId) return;

    setLogsLoading(isFirstRef.current);
    if (isFirstRef.current) {
      setFirstLogsLoading(true);
      setCurrentLogs("");
    }

    axiosInstance
      .get("/jobs/job-logs", {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        setCurrentLogs(res.data.logs || "Логи отсутствуют.");
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
  }, [jobId, authToken]);

  // ─── Open logs modal ─────────────────────────────
  const handleLogsOpen = useCallback(() => {
    setIsLogsOpen(true);
    isFirstRef.current = true;
    fetchLogs();
  }, [fetchLogs]);

  const handleLogsClose = useCallback(() => {
    setIsLogsOpen(false);
    setCurrentLogs("");
  }, []);   

  // ─── Poll logs when modal open ─────────────────────────────
  useEffect(() => {
    if (isLogsOpen) {
      intervalRef.current = setInterval(fetchLogs, 2000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isLogsOpen, fetchLogs]);

  // ─── Initial jobs fetch ─────────────────────────────
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ─── Watch jobs list and select current ───────────────
  useEffect(() => {
    if (jobs && jobs.length > 0 && jobId) {
      const currentJob = jobs.find((j) => j.job_id === jobId);
      setJob(currentJob);
    }
  }, [jobs, jobId]);

  return {
    jobs,
    job,
    jobId,
    currentLogs,
    logsLoading,
    firstLogsLoading,
    isLogsOpen,
    handleLogsOpen,
    handleLogsClose,
    fetchJobs,
    fetchLogs,
  };
}
