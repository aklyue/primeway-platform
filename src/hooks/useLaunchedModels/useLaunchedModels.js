import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import axiosInstance from "../../api";

export default function useLaunchedModels() {
  const [launchedModels, setLaunchedModels] = useState([]);
  const [launchedLoading, setLaunchedLoading] = useState(true);
  const launchedIntervalRef = useRef(null);
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);

  const fetchLaunchedModels = async () => {
    if (!currentOrganization || !authToken) return;
    try {
      const { data = [] } = await axiosInstance.get(
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
    return () => clearInterval(launchedIntervalRef.current);
  }, [currentOrganization, authToken]);

  return { launchedModels, launchedLoading, fetchLaunchedModels };
}
