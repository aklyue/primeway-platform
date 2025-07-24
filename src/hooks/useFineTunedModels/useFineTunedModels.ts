import { useEffect, useRef, useState } from "react";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import axiosInstance from "../../api";
import { useAppSelector } from "../../store/hooks";
import { FinetunedModel } from "../../types";

export default function useFineTunedModels() {
  const [fineTunedModels, setFineTunedModels] = useState<FinetunedModel[]>([]);
  const [fineTunedLoading, setFineTunedLoading] = useState(true);
  const finetuneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const authToken = useAppSelector((state) => state.auth.authToken);
  const currentOrganization = useAppSelector(selectCurrentOrganization);

  const fetchFineTunedModels = async () => {
    if (!currentOrganization || !authToken) return;
    try {
      const { data = [] } = await axiosInstance.get<FinetunedModel[]>(
        "/models/finetuned",
        {
          params: { organization_id: currentOrganization.id },
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
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
    return () => {
      if (finetuneIntervalRef.current) {
        clearInterval(finetuneIntervalRef.current);
      }
    };
  }, [currentOrganization, authToken]);

  return { fineTunedModels, fineTunedLoading, fetchFineTunedModels };
}
