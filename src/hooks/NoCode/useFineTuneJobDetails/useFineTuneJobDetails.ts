import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "../../../api";
import { Organization } from "../../../store/slices/authSlice";
import { GpuTypes, Job } from "../../../types";

interface useFineTuneJobDetailsProps {
  jobId?: string;
  currentOrganization: Organization | null;
}

export const useFineTuneJobDetails = ({
  jobId,
  currentOrganization,
}: useFineTuneJobDetailsProps) => {
  const [job, setJob] = useState<Job | null>(null);

  /* ─── NEW: state for logs ───────────────────────────────── */
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [currentLogs, setCurrentLogs] = useState<string>("");
  const [firstLogsLoading, setFirstLogsLoading] = useState<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  /* ─── Fetch job once ───────────────────────────────────── */

  useEffect(() => {
    if (!currentOrganization?.id) return;

    const fetchJob = async () => {
      try {
        const { data } = await axiosInstance.get(
          "/finetuning/get-running-jobs",
          { params: { organization_id: currentOrganization.id } }
        );
        const found = data.find((j: Job) => j.job_id === jobId);
        setJob(found || null);
        if (
          found?.last_execution_status === "completed" ||
          found?.last_execution_status === "failed"
        ) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        console.error("Failed to load job", err);
      } finally {
        if (initialLoading) setInitialLoading(false);
      }
    };

    fetchJob();

    intervalRef.current = setInterval(fetchJob, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId, currentOrganization?.id]);

  /* ─── NEW: fetch logs on-demand ─────────────────────────── */
  const handleLogsClick = useCallback(() => {
    if (!job) return;

    setIsLogsOpen(true);
    setLogsLoading(true);
    setCurrentLogs("");

    axiosInstance
      .get("/jobs/job-logs", { params: { job_id: job.job_id } })
      .then(({ data }) => {
        setCurrentLogs(data.logs || "Логи отсутствуют.");
      })
      .catch((error) => {
        console.error(
          `Ошибка при получении логов для задачи ${job.job_id}:`,
          error
        );
        const msg =
          error.response?.data?.detail ||
          (error.response?.status === 404
            ? "Логи недоступны."
            : "Ошибка при получении логов.");
        setCurrentLogs(msg);
      })
      .finally(() => setLogsLoading(false));
  }, [job]);

  const isFirstRef = useRef(true);

  useEffect(() => {
    if (!isLogsOpen || !job) return;

    const fetchLogs = () => {
      setLogsLoading(isFirstRef.current);
      if (isFirstRef.current) {
        setFirstLogsLoading(true);
        setCurrentLogs("");
      }

      axiosInstance
        .get("/jobs/job-logs", { params: { job_id: job.job_id } })
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
  }, [isLogsOpen, job]);

  /* ─── Helper ───────────────────────────────────────────── */
  const formatGpu = (gpu: GpuTypes) => {
    if (!gpu) return "-";
    if (typeof gpu === "string") return gpu;
    if (gpu.type && gpu.count !== undefined)
      return `${gpu.type} × ${gpu.count}`;
    return JSON.stringify(gpu);
  };

  return {
    loading: initialLoading,
    job,
    formatGpu,
    handleLogsClick,
    setIsLogsOpen,
    logsLoading,
    firstLogsLoading,
    currentLogs,
  };
};
