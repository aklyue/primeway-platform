import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Box,
  Button,
  Grid,
  Divider,
  Modal,
  Typography,
} from "@mui/material";
import ModelCard from "./ModelCard";
import ConfigureModelForm from "./ConfigureModelForm";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import FineTunedModelCard from "./FineTunedModelCard";
import { modelsData } from "../data/modelsData";
import { AuthContext } from "../AuthContext";
import { OrganizationContext } from "./Organization/OrganizationContext";
import axiosInstance from "../api";
import {
  getFineTuned,
  subscribeFineTuned, // (you can delete these two lines if local storage is no longer needed)
} from "./NoCode/fineTuneStorage";

function ModelsPage() {
  /* ---------------- state ------------------------------------------------ */
  const [launchedModels, setLaunchedModels] = useState([]);
  const [fineTunedModels, setFineTunedModels] = useState([]);          /* 💡 */
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  // If you still want to keep the local-storage fallback, leave this in:
  // const [fine, setFine] = useState(getFineTuned());
  // useEffect(() => subscribeFineTuned(setFine), []);
  // const allBasic = [...modelsData, ...fine];
  const allBasic = modelsData;                                         /* 💡 */

  /* ---------------- context --------------------------------------------- */
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);

  /* ---------------- polling refs ---------------------------------------- */
  const launchedIntervalRef = useRef(null);   // ref to window.setInterval timer
  const finetuneIntervalRef = useRef(null);     /* 💡 */

  /* ---------------- fetch helpers --------------------------------------- */
  const fetchLaunchedModels = async () => {
    if (!currentOrganization || !authToken) return;
    try {
      const { data = [] } = await axiosInstance.get("/jobs/get-vllm-deploy-jobs", {
        params: { organization_id: currentOrganization.id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setLaunchedModels(data);
    } catch (err) {
      console.error("Ошибка при получении запущенных моделей:", err);
    }
  };

  // put this just above the /* ---------------- ui ---------------- */ section
  const runFineTunedModel = async (ft) => {
    if (!currentOrganization || !authToken) return;

    /* ① Pick the base model’s defaultConfig so we don’t have to
          hard-code all model-specific env-vars, ports, etc.            */
    const base = modelsData.find((m) => m.name === ft.base_model);
    if (!base?.defaultConfig) {
      alert("Не могу найти базовую конфигурацию для " + ft.base_model);
      return;
    }

    /* ② Clone it and tweak only what’s different for a LoRA adapter.   */
    const modelConfig = {
      ...base.defaultConfig.modelConfig,
      job_name: `${ft.artifact_name}-deploy`,
      // ✅ VALID GpuType object ↓↓↓
      gpu_types: [{ type: "A100", count: 1 }],
    };

    const vllmConfig = {
      ...base.defaultConfig,
      model: base.defaultConfig.modelName,     // e.g. "meta-llama/Llama-3-8B"
      finetuned_job_id: ft.job_id,             // ⭐ tell backend which LoRA to load
    };

    /* ③ Send multipart/form-data exactly like ModelCard.handleRun      */
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

  /* 💡 fetch fine-tuned models */
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
    }
  };

  /* ---------------- effects --------------------------------------------- */
  useEffect(() => {
    /* launched */
    fetchLaunchedModels();
    if (launchedIntervalRef.current) clearInterval(launchedIntervalRef.current);
    launchedIntervalRef.current = setInterval(fetchLaunchedModels, 5000);

    /* fine-tuned 💡 */
    fetchFineTunedModels();
    if (finetuneIntervalRef.current) clearInterval(finetuneIntervalRef.current);
    finetuneIntervalRef.current = setInterval(fetchFineTunedModels, 5000);

    return () => {
      if (launchedIntervalRef.current) clearInterval(launchedIntervalRef.current);
      if (finetuneIntervalRef.current) clearInterval(finetuneIntervalRef.current);
    };
  }, [currentOrganization, authToken]);

  /* ---------------- ui --------------------------------------------------- */
  const handleConfigureOpen = () => setIsConfigureOpen(true);
  const handleConfigureClose = () => setIsConfigureOpen(false);

  return (
    <Box sx={{ boxSizing: "border-box" }}>
      {/* ---------- modal configure -------------------------------------- */}
      <Modal open={isConfigureOpen} onClose={handleConfigureClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            pr: 2,
            maxHeight: "95vh",
            overflowY: "hidden",
            borderRadius: 3,
            outline: "none",
          }}
        >
          <Button
            sx={{ position: "absolute", left: 1, top: 12 }}
            onClick={handleConfigureClose}
          >
            <CloseIcon />
          </Button>
          <ConfigureModelForm onClose={handleConfigureClose} />
        </Box>
      </Modal>

      {/* ---------- container for sections -------------------------------- */}
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* ============ Запущенные модели ================================= */}
        <Box sx={{ maxHeight: "50vh", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5" gutterBottom>Запущенные модели</Typography>
            <Button
              onClick={handleConfigureOpen}
              variant="contained"
              color="primary"
              sx={{ color: "white", padding: "8px 16px" }}
            >
              Добавить модель
              <AddIcon sx={{ color: "#FFFFFF", fontSize: "20px", ml: 0.5 }} />
            </Button>
          </Box>
          <Box
            sx={{
              border: "2px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "16px",
              pt: 2,
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              maxHeight: "90%",
            }}
          >
            {/* column headers */}
            <Grid sx={{ pl: 2 }} container spacing={2} alignItems="center">
              <Grid item xs={3}><Typography variant="subtitle2" fontWeight="bold">Название</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">Дата создания</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">Состояние</Typography></Grid>
              <Grid item xs={3} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">URL</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">Действие</Typography></Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ overflowY: "auto", minHeight: 0 }}>
              {launchedModels.length ? (
                launchedModels.map((model, idx) => (
                  <ModelCard
                    key={model.job_id || idx}
                    model={model}
                    isLast={idx === launchedModels.length - 1}
                    isBasic={false}
                  />
                ))
              ) : (
                <Typography align="center" sx={{ my: 2 }}>Нет запущенных моделей.</Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* ============ Дообученные модели 💡 ================================= */}
        <Box sx={{ maxHeight: "40vh", mt: 3, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Typography variant="h5" gutterBottom>Дообученные модели</Typography>

          <Box
            sx={{
              border: "2px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "16px",
              pt: 2,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {/* column headers */}
            <Grid sx={{ pl: 2 }} container spacing={2} alignItems="center">
              <Grid item xs={6}><Typography variant="subtitle2" fontWeight="bold">Название</Typography></Grid>
              <Grid item xs={4} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">Базовая модель</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">Действие</Typography></Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />

            <Box sx={{ overflowY: "auto", minHeight: 0 }}>
              {fineTunedModels.length ? (
                fineTunedModels.map((ft, idx) => (
                  <FineTunedModelCard
                    key={ft.job_id}
                    ft={ft}
                    isLast={idx === fineTunedModels.length - 1}
                  />
                ))
              ) : (
                <Typography align="center" sx={{ my: 2 }}>Нет fine-tune моделей.</Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* ============ Базовые модели ===================================== */}
        <Box sx={{ maxHeight: "40vh", display: "flex", flexDirection: "column", minHeight: 0, mt: 3 }}>
          <Typography variant="h5" gutterBottom>Базовые модели</Typography>
          <Box
            sx={{
              border: "2px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "16px",
              pt: 2,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {/* column headers */}
            <Grid sx={{ pl: 2 }} container spacing={2} alignItems="center">
              <Grid item xs={6}><Typography variant="subtitle2" fontWeight="bold">Название</Typography></Grid>
              <Grid item xs={4} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">Тип модели</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">Действие</Typography></Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ overflowY: "auto", minHeight: 0 }}>
              {allBasic.map((model, idx) => (
                <ModelCard
                  key={model.id || idx}
                  model={model}
                  isLast={idx === allBasic.length - 1}
                  isBasic
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ModelsPage;
