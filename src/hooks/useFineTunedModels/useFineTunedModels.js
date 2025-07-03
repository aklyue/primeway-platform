import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import axiosInstance from "../../api";

export default function useFineTunedModels() {
  const [fineTunedModels, setFineTunedModels] = useState([]);
  const [fineTunedLoading, setFineTunedLoading] = useState(true);
  const finetuneIntervalRef = useRef(null);
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);

  const fetchFineTunedModels = async () => {
    if (!currentOrganization || !authToken) return;
    try {
      const { data = [] } = await axiosInstance.get("/models/finetuned", {
        params: { organization_id: currentOrganization.id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setFineTunedModels(data);
    } catch (err) {
      console.error("Ошибка при получении fine-tune моделей:", err);
    } finally {
      setFineTunedLoading(false);
    }
  };

  useEffect(() => {
    fetchFineTunedModels();
    if (finetuneIntervalRef.current) clearInterval(finetuneIntervalRef.current);
    finetuneIntervalRef.current = setInterval(fetchFineTunedModels, 5000);
    return () => clearInterval(finetuneIntervalRef.current);
  }, [currentOrganization, authToken]);

  return { fineTunedModels, fineTunedLoading, fetchFineTunedModels };
}
