import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  Modal,
  Typography,
} from "@mui/material";
import ModelCard from "./ModelCard";
import ConfigureModelForm from "./ConfigureModelForm";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
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
        <Box sx={{ maxHeight: "40vh", display: "flex", flexDirection: "column", minHeight: 0, mt: 3 }}>
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
              <Grid item xs={3}><Typography variant="subtitle2" fontWeight="bold">Название модели</Typography></Grid>
              <Grid item xs={3} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">Базовая модель</Typography></Grid>
              <Grid item xs={3} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">Датасет</Typography></Grid>
              <Grid item xs={3} sx={{ textAlign: "center" }}><Typography variant="subtitle2" fontWeight="bold">Дата создания</Typography></Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ overflowY: "auto", minHeight: 0 }}>
              {fineTunedModels.length ? (
                fineTunedModels.map((ft, idx) => (
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    key={ft.job_id || idx}
                    sx={{ pl: 2, pb: 1 }}
                  >
                    <Grid item xs={3}><Typography>{ft.model_artifact_name}</Typography></Grid>
                    <Grid item xs={3} sx={{ textAlign: "center" }}><Typography>{ft.base_model || "—"}</Typography></Grid>
                    <Grid item xs={3} sx={{ textAlign: "center" }}><Typography>{ft.dataset_name || "—"}</Typography></Grid>
                    <Grid item xs={3} sx={{ textAlign: "center" }}>
                      <Typography>
                        {new Date(ft.created_at).toLocaleString("ru-RU")}
                      </Typography>
                    </Grid>
                  </Grid>
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
