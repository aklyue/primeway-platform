import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import { useAppSelector } from "../../store/hooks";
import { Job, OrganizationJob } from "../../types";

export default function useJobsActions() {
  const authToken = useAppSelector((state) => state.auth.authToken);
  const currentOrganization = useAppSelector(selectCurrentOrganization);
  const { modelId: jobId } = useParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [job, setJob] = useState<Job | null>(null);

  const [currentLogs, setCurrentLogs] = useState<string>("");
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [firstLogsLoading, setFirstLogsLoading] = useState<boolean>(true);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const isFirstRef = useRef<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Fetch organization jobs ─────────────────────────────
  const fetchJobs = useCallback(() => {
    if (!currentOrganization || !authToken) return;

    axiosInstance
      .get<Job[]>("/jobs/get-organization-jobs", {
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
      .get<string>("/jobs/job-logs", {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        setCurrentLogs(res.data || "Логи отсутствуют.");
      })
      .catch((error) => {
        let msg = "Ошибка при получении логов.";

        const detail = error.response?.data?.detail;

        if (typeof detail === "string") {
          msg = detail;
        } else if (Array.isArray(detail) && detail[0]?.msg) {
          msg = detail[0].msg;
        } else if (error.response?.status === 404) {
          msg = "Логи недоступны.";
        }

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLogsOpen, fetchLogs]);

  // ─── Initial jobs fetch ─────────────────────────────
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ─── Watch jobs list and select current ───────────────
  useEffect(() => {
    if (jobs && jobs.length > 0 && jobId) {
      const currentJob = jobs.find((j) => j.job_id === jobId);
      setJob(currentJob ?? null);
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
