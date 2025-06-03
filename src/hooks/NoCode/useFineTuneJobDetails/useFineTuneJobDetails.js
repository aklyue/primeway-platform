import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../../api";

export const useFineTuneJobDetails = ({ jobId, currentOrganization }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ─── NEW: state for logs ───────────────────────────────── */
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [firstLogsLoading, setFirstLogsLoading] = useState(true);

  /* ─── Fetch job once ───────────────────────────────────── */
  useEffect(() => {
    if (!currentOrganization?.id) return;

    (async () => {
      try {
        const { data } = await axiosInstance.get(
          "/finetuning/get-running-jobs",
          { params: { organization_id: currentOrganization.id } }
        );
        const found = data.find((j) => j.job_id === jobId);
        setJob(found || null);
      } catch (err) {
        console.error("Failed to load job", err);
      } finally {
        setLoading(false);
      }
    })();
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
          `Ошибка при получении логов для задачи ${job.id}:`,
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

  useEffect(() => {
    if (!isLogsOpen || !job) return;

    let isFirst = true;

    const fetchLogs = () => {
      setLogsLoading(isFirst);
      if (isFirst) {
        setFirstLogsLoading(true);
        setCurrentLogs("");
      }
      axiosInstance
        .get("/jobs/job-logs", { params: { job_id: job.job_id } })
        .then(({ data }) => {
          setCurrentLogs(data.logs || "Логи отсутствуют.");
        })
        .catch((error) => {
          console.error(
            `Ошибка при получении логов для задачи ${job.id}:`,
            error
          );
          const msg =
            error.response?.data?.detail ||
            (error.response?.status === 404
              ? "Логи недоступны."
              : "Ошибка при получении логов.");
          setCurrentLogs(msg);
        })
        .finally(() => {
          setLogsLoading(false);
          if (isFirst) {
            setFirstLogsLoading(false);
            isFirst = false;
          }
        });
    };

    fetchLogs();

    const interval = setInterval(fetchLogs, 2000);

    return () => clearInterval(interval);
  }, [isLogsOpen, job]);

  /* ─── Helper ───────────────────────────────────────────── */
  const formatGpu = (gpu) => {
    if (!gpu) return "-";
    if (typeof gpu === "string") return gpu;
    if (gpu.type && gpu.count !== undefined)
      return `${gpu.type} × ${gpu.count}`;
    return JSON.stringify(gpu);
  };

  return {
    loading,
    job,
    formatGpu,
    handleLogsClick,
    setIsLogsOpen,
    logsLoading,
    firstLogsLoading,
    currentLogs,
  };
};
