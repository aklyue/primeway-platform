import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import axiosInstance from "../../api";

export default function useRunFineTunedModel(modelsData) {
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);

  const runFineTunedModel = async (ft) => {
    if (!currentOrganization || !authToken) return;

    const base = modelsData.find((m) => m.name === ft.base_model);
    if (!base?.defaultConfig) {
      alert("Не могу найти базовую конфигурацию для " + ft.base_model);
      return;
    }

    const modelConfig = {
      ...base.defaultConfig.modelConfig,
      job_name: `${ft.artifact_name}-deploy`,
      gpu_types: [{ type: "A100", count: 1 }],
    };

    const vllmConfig = {
      model: base.defaultConfig.modelName ?? ft.base_model,
      args: base.defaultConfig.args ?? {},
      flags: base.defaultConfig.flags ?? {},
      finetuned_job_id: ft.job_id,
    };

    try {
      const form = new FormData();
      form.append("organization_id", currentOrganization.id);
      form.append("config_str", JSON.stringify(modelConfig));
      form.append("vllm_config_str", JSON.stringify(vllmConfig));

      await axiosInstance.post("/models/run", form, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      alert("Fine-tune запущен! Проверьте раздел «Задачи».");
    } catch (e) {
      console.error("Не удалось запустить fine-tune:", e);
      alert("Ошибка при запуске модели.");
    }
  };

  return { runFineTunedModel };
}
