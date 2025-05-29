import React, { useState, useEffect, useRef, useContext } from "react";
import { Box, Button, Grid, Divider, Modal, Typography } from "@mui/material";
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
  const [fineTunedModels, setFineTunedModels] = useState([]); /* 💡 */
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  // If you still want to keep the local-storage fallback, leave this in:
  // const [fine, setFine] = useState(getFineTuned());
  // useEffect(() => subscribeFineTuned(setFine), []);
  // const allBasic = [...modelsData, ...fine];
  const allBasic = modelsData; /* 💡 */

  /* ---------------- context --------------------------------------------- */
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);

  /* ---------------- polling refs ---------------------------------------- */
  const launchedIntervalRef = useRef(null); // ref to window.setInterval timer
  const finetuneIntervalRef = useRef(null); /* 💡 */

  /* ---------------- fetch helpers --------------------------------------- */
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
    }
  };

  // put this just above the /* ---------------- ui ---------------- */ section
  const runFineTunedModel = async (ft) => {
    console.log("clicked-run", ft);
    if (!currentOrganization || !authToken) return;

    const base = modelsData.find((m) => m.name === ft.base_model);
    if (!base?.defaultConfig) {
      alert("Не могу найти базовую конфигурацию для " + ft.base_model);
      return;
    }

    /* ---------- JOB (runtime) CONFIG ---------- */
    const modelConfig = {
      ...base.defaultConfig.modelConfig,
      job_name: `${ft.artifact_name}-deploy`,
      gpu_types: [{ type: "A100", count: 1 }],
    };

    /* ---------- VLLM CONFIG (backend schema) --- */
    const vllmConfig = {
      model: base.defaultConfig.modelName ?? ft.base_model,
      args: base.defaultConfig.args ?? {},
      flags: base.defaultConfig.flags ?? {},
      finetuned_job_id: ft.job_id, // ⭐ stays intact
    };

    console.table(vllmConfig);
    console.log("vllmConfig", vllmConfig);
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
      if (launchedIntervalRef.current)
        clearInterval(launchedIntervalRef.current);
      if (finetuneIntervalRef.current)
        clearInterval(finetuneIntervalRef.current);
    };
  }, [currentOrganization, authToken]);

  /* ---------------- ui --------------------------------------------------- */
  const handleConfigureOpen = () => setIsConfigureOpen(true);
  const handleConfigureClose = () => setIsConfigureOpen(false);

  return (
    <Box sx={{ boxSizing: "border-box" }}>
      {/* **Модальное окно для настройки новой модели** */}
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
        <Box
          sx={{
            maxHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Запущенные модели
            </Typography>
            <Button
              onClick={handleConfigureOpen}
              variant="contained"
              color="primary"
              sx={{
                color: "white",
                padding: "8px 16px",
                bgcolor: "#96cce3",
                "&:hover": {
                  bgcolor: "#4e92b0",
                },
              }}
            >
              Добавить модель
              <AddIcon sx={{ color: "#FFFFFF", fontSize: "20px", ml: 0.5 }} />
            </Button>
          </Box>
          <Box
            sx={{
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              maxHeight: "90%",
              overflow: "hidden",
            }}
          >
            {/* **Заголовки колонок** */}
            <Grid
              sx={{
                padding: 2,
                backgroundColor: "rgba(102, 179, 238, 0.1)",
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
              container
              spacing={0}
              alignItems="center"
            >
              <Grid item xs={3}>
                <Typography variant="subtitle2" fontWeight="light">
                  НАЗВАНИЕ
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="light">
                  ДАТА СОЗДАНИЯ
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="light">
                  СОСТОЯНИЕ
                </Typography>
              </Grid>
              <Grid item xs={3} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="light">
                  URL
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="light">
                  ДЕЙСТВИЕ
                </Typography>
              </Grid>
            </Grid>

            {/* <Divider sx={{ my: 1 }} /> */}

            {/* **Область с прокруткой** */}
            <Box
              sx={{
                overflowY: "auto",
                minHeight: 0,
              }}
            >
              {/* **Список "Запущенных моделей"** */}
              {launchedModels.length > 0 ? (
                launchedModels.map((model, idx) => (
                  <ModelCard
                    key={model.job_id || idx}
                    model={model}
                    isLast={idx === launchedModels.length - 1}
                    isBasic={false}
                  />
                ))
              ) : (
                <Typography align="center" sx={{ my: 2 }}>
                  Нет запущенных моделей.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* === Дообученные модели ============================================= */}
        <Box
          sx={{
            maxHeight: "40vh",
            mt: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Дообученные модели
          </Typography>

          <Box
            sx={{
              border: "1px solid rgba(0,0,0,.12)",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {/* ---------- header row ---------- */}
            <Box
              sx={{
                display: "flex",
                padding: 2,
                backgroundColor: "rgba(102, 179, 238, 0.1)",
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
            >
              <Typography sx={{ flexBasis: "25%" }}>НАЗВАНИЕ</Typography>
              <Typography sx={{ flexBasis: "18%", textAlign: "center" }}>
                БАЗОВАЯ МОДЕЛЬ
              </Typography>
              <Typography sx={{ flexBasis: "18%", textAlign: "center" }}>
                НАБОР ДАННЫХ
              </Typography>
              <Typography sx={{ flexBasis: "18%", textAlign: "center" }}>
                ДАТА
              </Typography>
              <Typography sx={{ flexBasis: "15%", textAlign: "center" }}>
                СТАТУС
              </Typography>
              <Typography sx={{ flexBasis: "6%", textAlign: "center" }}>
                {" "}
              </Typography>
            </Box>
            {/* <Divider /> */}

            {/* ---------- rows ---------- */}
            <Box sx={{ overflowY: "auto", minHeight: 0 }}>
              {fineTunedModels.length ? (
                fineTunedModels.map((ft, idx) => (
                  <FineTunedModelCard
                    key={ft.job_id}
                    ft={ft}
                    isLast={idx === fineTunedModels.length - 1}
                    onRun={runFineTunedModel}
                  />
                ))
              ) : (
                <Typography align="center" sx={{ my: 2 }}>
                  Нет fine-tune моделей.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* ============ Базовые модели ===================================== */}
        <Box
          sx={{
            maxHeight: "40vh",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            mt: 3,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Базовые модели
          </Typography>
          <Box
            sx={{
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "16px",
              // pt: 2,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {/* **Заголовки колонок** */}
            <Grid
              sx={{
                // pl: 2,
                padding: 2,
                backgroundColor: "rgba(102, 179, 238, 0.1)",
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
              container
              spacing={0}
              alignItems="center"
            >
              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight="light">
                  НАЗВАНИЕ
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="light">
                  АВТОР
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="light">
                  ТИП МОДЕЛИ
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="light">
                  ДЕЙСТВИЕ
                </Typography>
              </Grid>
            </Grid>

            {/* <Divider sx={{ my: 1 }} /> */}

            {/* **Область с прокруткой** */}
            <Box
              sx={{
                overflowY: "auto",
                minHeight: 0,
              }}
            >
              {/* **Список "Базовых моделей"** */}
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
