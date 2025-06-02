import axiosInstance from "../../api";
import { useState, useEffect, useMemo } from "react";

export const useFineTuneActions = ({ currentOrganization }) => {
  const [jobs, setJobs] = useState([]);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");

  const refreshJobs = async (showLoader = false) => {
    if (!currentOrganization?.id) return;
    try {
      if (showLoader) setIsJobsLoading(true);
      const { data } = await axiosInstance.get("/finetuning/get-running-jobs", {
        params: { organization_id: currentOrganization.id },
      });

      setJobs(
        data.map((j) => ({
          id: j.job_id,
          baseModel: j.base_model,
          suffix: j.suffix,
          lastExecutionStatus: j.last_execution_status,
          runTime: j.run_time ?? "-",
          createdAt: new Date(j.created_at).toLocaleString(),
        }))
      );
    } catch (e) {
      console.error("Failed to load fine‑tune jobs", e);
    } finally {
      if (showLoader) setIsJobsLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    refreshJobs(true);
    const id = setInterval(() => refreshJobs(false), 3_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization?.id]);

  const handleCopy = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
    });
  };

  const filteredJobs = useMemo(() => {
    if (!query.trim()) return jobs;
    const q = query.toLowerCase();
    return jobs.filter((j) =>
      Object.values(j).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [query, jobs]);

  return {
    jobs,
    initialLoading,
    refreshJobs,
    handleCopy,
    copied,
    setCopied,
    filteredJobs,
    query,
    setQuery,
  };
};
