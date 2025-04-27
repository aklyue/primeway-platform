import React, { useState, useEffect, useRef, useContext } from "react";
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
  // **Состояния**
  const [launchedModels, setLaunchedModels] = useState([]);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  // **Контексты**
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);

  // **Ссылка на интервал**
  const intervalRef = useRef(null);

  // **Функция для получения запущенных моделей**
  const fetchLaunchedModels = async () => {
    if (currentOrganization && authToken) {
      try {
        const response = await axiosInstance.get("/jobs/get-vllm-deploy-jobs", {
          params: {
            organization_id: currentOrganization.id,
          },
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = response.data || [];
        setLaunchedModels(data);
        console.log(data);
      } catch (error) {
        console.error("Ошибка при получении запущенных моделей:", error);
        // Обработка ошибки (отображение уведомления и т.д.)
      }
    }
  };

  // **Получение запущенных моделей при монтировании и обновление каждые 5 секунд**
  useEffect(() => {
    fetchLaunchedModels(); // Первоначальный вызов при монтировании или изменении зависимостей

    // Очищаем предыдущий интервал, если он существует
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Устанавливаем новый интервал для периодического обновления
    intervalRef.current = setInterval(() => {
      fetchLaunchedModels();
    }, 5000); // Интервал в 5 секунд

    // Функция очистки, вызывается при размонтировании или изменении зависимостей
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [currentOrganization, authToken]);

  // **Обработчики открытия и закрытия модального окна настройки**
  const handleConfigureOpen = () => {
    setIsConfigureOpen(true);
  };

  const handleConfigureClose = () => {
    setIsConfigureOpen(false);
  };

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

      {/* **Контейнер для двух секций** */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {/* **Верхняя секция - "Запущенные модели"** */}
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
            {/* **Заголовки колонок** */}
            <Grid sx={{ pl: 2 }} container spacing={2} alignItems="center">
              <Grid item xs={3}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Название
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Дата создания
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Состояние
                </Typography>
              </Grid>
              <Grid item xs={3} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  URL
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Действие
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* **Область с прокруткой** */}
            <Box
              sx={{
                overflowY: "auto",
                minHeight: 0,
              }}
            >
              {/* **Список "Запущенных моделей"** */}
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
        </Box>

        {/* **Нижняя секция - "Базовые модели"** */}
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
              border: "2px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "16px",
              pt: 2,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {/* **Заголовки колонок** */}
            <Grid sx={{ pl: 2 }} container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Название
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Тип модели
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Действие
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* **Область с прокруткой** */}
            <Box
              sx={{
                overflowY: "auto",
                minHeight: 0,
              }}
            >
              {/* **Список "Базовых моделей"** */}
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
    </Box>
  );
}

export default ModelsPage;
