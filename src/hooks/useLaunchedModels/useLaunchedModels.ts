import { useEffect, useRef, useState } from "react";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import axiosInstance from "../../api";
import { useAppSelector } from "../../store/hooks";
import { BasicModel, Job } from "../../types";

export default function useLaunchedModels() {
  const [launchedModels, setLaunchedModels] = useState<BasicModel[]>([]);
  const [launchedLoading, setLaunchedLoading] = useState<boolean>(true);
  const launchedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const authToken = useAppSelector((state) => state.auth.authToken);
  const currentOrganization = useAppSelector(selectCurrentOrganization);

  const fetchLaunchedModels = async () => {
    if (!currentOrganization || !authToken) return;
    try {
      const { data = [] } = await axiosInstance.get<BasicModel[]>(
        "/jobs/get-vllm-deploy-jobs",
        {
          params: { organization_id: currentOrganization.id },
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setLaunchedModels(data);
    } catch (err) {
      console.error("Ошибка при получении запущенных моделей:", err);
    } finally {
      setLaunchedLoading(false);
    }
  };

  useEffect(() => {
    fetchLaunchedModels();
    if (launchedIntervalRef.current) clearInterval(launchedIntervalRef.current);
    launchedIntervalRef.current = setInterval(fetchLaunchedModels, 5000);
    return () => {
      if (launchedIntervalRef.current) {
        clearInterval(launchedIntervalRef.current);
      }
    };
  }, [currentOrganization, authToken]);

  return { launchedModels, launchedLoading, fetchLaunchedModels };
}
