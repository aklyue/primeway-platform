import React, { useState, useEffect, useContext } from "react";
import { Box, Button, Divider, Grid, Modal, Typography } from "@mui/material";
import ModelCard from "./ModelCard";
import { modelsData } from "../data/modelsData";
import ConfigureModelForm from "./ConfigureModelForm";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../api";
import { OrganizationContext } from "./Organization/OrganizationContext";

function ModelsPage() {
  // Состояния для запущенных моделей
  const [launchedModels, setLaunchedModels] = useState([]);
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);

  useEffect(() => {
    const fetchLaunchedModels = async () => {
      if (currentOrganization && authToken) {
        try {
          const response = await axiosInstance.get(
            "/jobs/get-vllm-deploy-jobs",
            {
              params: {
                organization_id: currentOrganization.id,
              },
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          const data = response.data || [];
          setLaunchedModels(data);
        } catch (error) {
          console.error("Ошибка при получении запущенных моделей:", error);
          // Обработка ошибки (отображение уведомления и т.д.)
        }
      }
    };
    fetchLaunchedModels();
  }, [currentOrganization, authToken]);

  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  const handleConfigureOpen = () => {
    setIsConfigureOpen(true);
  };

  const handleConfigureClose = () => {
    setIsConfigureOpen(false);
  };

  return (
    <Box sx={{ p: 3, height: "100vh", boxSizing: "border-box" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Доступные Модели
        </Typography>
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

      {/* Модальное окно для настройки новой модели */}
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

      {/* Контейнер для двух секций */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: `calc(100% - 80px)`, // Подгоните 80px под высоту вашего заголовка и отступов
        }}
      >
        {/* Верхняя секция - "Запущенные модели" */}
        <Box
          sx={{
            overflowY: "auto",
            maxHeight: "50%",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Запущенные модели
          </Typography>

          <Box
            sx={{
              border: "2px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "16px",
              pt: 2,
            }}
          >
            <Grid sx={{ pl: 2 }} container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Название
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }} item xs={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Автор
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }} item xs={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  URL
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }} item xs={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Действие
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }} item xs={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Настройки
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* Список "Запущенных моделей" */}
            {launchedModels.length > 0 ? (
              launchedModels.map((model, index) => (
                <ModelCard
                  key={model.job_id || index}
                  model={model}
                  isLast={index === launchedModels.length - 1}
                  isBasic={false} // Запущенные модели не базовые
                />
              ))
            ) : (
              <Typography align="center" sx={{ mt: 2, mb: 2 }}>
                Нет запущенных моделей.
              </Typography>
            )}
          </Box>
        </Box>

        {/* Нижняя секция - "Базовые модели" */}
        <Box
          sx={{
            overflowY: "auto",
            maxHeight: "50%",
            mt: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Базовые модели
          </Typography>

          <Box
            sx={{
              border: "2px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "16px",
              pt: 2,
            }}
          >
            <Grid sx={{ pl: 2 }} container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Название
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }} item xs={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Тип модели
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }} item xs={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Действие
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "center" }} item xs={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Настройки
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* Список "Базовых моделей" */}
            {modelsData.map((model, index) => (
              <ModelCard
                key={model.id || index}
                model={model}
                isLast={index === modelsData.length - 1}
                isBasic={true} // Базовые модели
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ModelsPage;
