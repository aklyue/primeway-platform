import React, { useState, useContext, useEffect } from "react";
import {
  Typography,
  Button,
  Modal,
  Box,
  Grid,
  IconButton,
  Divider,
} from "@mui/material";
import ConfigureModelForm from "./ConfigureModelForm";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../api";
import { OrganizationContext } from "./Organization/OrganizationContext";
import CloseIcon from "@mui/icons-material/Close";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import ModelsDialog from "./ModelsDialog";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Импорт SVG как React-компонентов
import { ReactComponent as DeepSeek } from "../assets/deepseek-color.svg";
import { ReactComponent as Google } from "../assets/gemma-color.svg";
import { ReactComponent as HuggingFace } from "../assets/huggingface-color.svg";

function ModelCard({ model, isLast, isBasic }) {
  // **Контексты**
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);

  // **Состояния**
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // **Переменные модели**
  const isLaunched = !isBasic;
  const jobId = isLaunched ? model.job_id : null;

  const modelName = isBasic ? model.name : model.job_name || "N/A";
  const modelType = isBasic ? model.type : model.author || "N/A";

  // **Состояние статуса модели**
  const [modelStatus, setModelStatus] = useState(model.last_execution_status);

  // Синхронизация modelStatus с props
  useEffect(() => {
    setModelStatus(model.last_execution_status);
  }, [model.last_execution_status]);

  // Получаем имя модели в нижнем регистре
  const modelNameImg = (model.name || model.job_name || "")
    .toLowerCase()
    .trim();

  // Определяем компонент изображения модели в зависимости от названия
  let ModelImageComponent;
  if (modelNameImg.includes("deepseek")) {
    ModelImageComponent = DeepSeek;
  } else if (modelNameImg.includes("google")) {
    ModelImageComponent = Google;
  } else {
    ModelImageComponent = HuggingFace;
  }

  // **Обработчики открытия и закрытия модальных окон**
  const handleModelDialogOpen = () => {
    setIsModelDialogOpen(true);
  };

  const handleModelDialogClose = () => {
    setIsModelDialogOpen(false);
  };

  const handleConfigureOpen = () => {
    setIsConfigureOpen(true);
  };

  const handleConfigureClose = () => {
    setIsConfigureOpen(false);
  };

  // **Функция запуска базовой модели**
  const handleRun = async () => {
    if (!isBasic) return; // Запускать можно только базовые модели
    setLoading(true);

    try {
      const { defaultConfig } = model;

      const vllmConfig = {
        model: defaultConfig.modelName,
        args: defaultConfig.args.reduce(
          (acc, arg) => ({ ...acc, [arg.key]: arg.value }),
          {}
        ),
        flags: defaultConfig.flags.reduce(
          (acc, flag) => ({ ...acc, [flag.key]: flag.value }),
          {}
        ),
      };

      const formData = new FormData();
      formData.append("organization_id", currentOrganization?.id || "");
      formData.append("vllm_config_str", JSON.stringify(vllmConfig));
      formData.append("config_str", JSON.stringify(defaultConfig.modelConfig));

      const response = await axiosInstance.post("/models/run", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const { job_id } = response.data;

      alert(
        'Модель успешно запущена! Вы можете просмотреть ее в разделе "Задачи".'
      );
    } catch (error) {
      console.error("Ошибка при запуске модели:", error);
      alert("Произошла ошибка при запуске модели.");
    } finally {
      setLoading(false);
    }
  };

  // **Функция запуска запущенной модели**
  const handleStart = async () => {
    if (isBasic) return; // Запускать можно только запущенные модели
    setLoading(true);

    try {
      if (!jobId) {
        alert("Идентификатор задачи отсутствует.");
        setLoading(false);
        return;
      }

      await axiosInstance.post("/jobs/job-start", null, {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      alert("Модель успешно запущена.");
    } catch (error) {
      console.error("Ошибка при запуске модели:", error);
      alert("Произошла ошибка при запуске модели.");
    } finally {
      setLoading(false);
    }
  };

  // **Функция остановки запущенной модели**
  const handleStop = async () => {
    if (isBasic) return; // Останавливать можно только запущенные модели
    setLoading(true);

    try {
      if (!jobId) {
        alert("Идентификатор задачи отсутствует.");
        setLoading(false);
        return;
      }

      await axiosInstance.post("/jobs/job-stop", null, {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setModelStatus("stopped"); // Обновляем статус модели
      alert("Модель успешно остановлена.");
    } catch (error) {
      console.error("Ошибка при остановке модели:", error);
      alert("Произошла ошибка при остановке модели.");
    } finally {
      setLoading(false);
    }
  };

  // **Определяем текст и действие кнопки в зависимости от статуса модели**
  let actionButtonText = "";
  let actionButtonHandler = null;
  let isActionButtonDisabled = false;

  if (isBasic) {
    // Для базовых моделей кнопка запуска
    actionButtonText = "Запустить";
    actionButtonHandler = (e) => {
      e.stopPropagation();
      handleRun();
    };
    isActionButtonDisabled = loading;
  } else {
    // Для запущенных моделей
    if (modelStatus === "running") {
      actionButtonText = "Остановить";
      actionButtonHandler = (e) => {
        e.stopPropagation();
        handleStop();
      };
      isActionButtonDisabled = loading;
    } else if (
      modelStatus === "failed" ||
      modelStatus === "stopped" ||
      modelStatus === undefined
    ) {
      actionButtonText = "Запустить";
      actionButtonHandler = (e) => {
        e.stopPropagation();
        handleStart();
      };
      isActionButtonDisabled = loading;
    } else {
      // Если статус модели неизвестен или в непредусмотренном состоянии
      actionButtonText = "Остановить";
      actionButtonHandler = null;
      isActionButtonDisabled = true;
    }
  }

  return (
    <>
      <Grid
        container
        spacing={1}
        alignItems="center"
        sx={{
          justifyContent: "center",
          cursor: "pointer",
          pb: 1,
          transition: "background 0.2s",
          "&:hover": {
            background: "rgba(0, 0, 0, 0.05)",
            borderBottomLeftRadius: isLast ? "24px" : "",
            borderBottomRightRadius: isLast ? "16px" : "",
          },
          overflow: "hidden",
        }}
        onClick={isBasic ? handleConfigureOpen : handleModelDialogOpen}
      >
        {/* **Название модели** */}
        <Grid item xs={isBasic ? 6 : 3}>
          <Typography
            sx={{ pl: 2, display: "flex", alignItems: "center", gap: "5px" }}
            variant="body2"
          >
            {ModelImageComponent && (
              <ModelImageComponent width={26} height={26} alt={modelName} />
            )}
            {modelName}
          </Typography>
        </Grid>

        {isBasic ? (
          // **Базовые модели**
          <>
            {/* **Тип модели** */}
            <Grid item xs={4} sx={{ textAlign: "center" }}>
              <Typography variant="body2">{modelType}</Typography>
            </Grid>

            {/* **Действие (Кнопка запуска)** */}
            <Grid item xs={2} sx={{ textAlign: "center" }}>
              <Button
                onClick={actionButtonHandler}
                disabled={isActionButtonDisabled}
                variant="outlined"
                sx={{ bgcolor: "#505156", color: "#FFFFFF" }}
              >
                {actionButtonText}
                <RocketLaunchOutlinedIcon
                  sx={{ ml: 1, fontSize: 22, color: "#FFFFFF" }}
                />
              </Button>
            </Grid>
          </>
        ) : (
          // **Запущенные модели**
          <>
            {/* **Дата создания** */}
            <Grid item xs={2} sx={{ textAlign: "center" }}>
              <Typography variant="body2">
                {model.created_at || "N/A"}
              </Typography>
            </Grid>

            {/* **Состояние** */}
            <Grid item xs={2} sx={{ textAlign: "center" }}>
              <Typography variant="body2">{modelStatus || "N/A"}</Typography>
            </Grid>

            {/* **URL** */}
            <Grid item xs={3} sx={{ textAlign: "center" }}>
              <Typography variant="body2">{model.job_url || "N/A"}</Typography>
            </Grid>

            {/* **Действие (Одна кнопка запуска или остановки)** */}
            <Grid item xs={2} sx={{ textAlign: "center" }}>
              <Button
                onClick={actionButtonHandler}
                disabled={isActionButtonDisabled}
                variant="outlined"
                sx={{
                  bgcolor: "#505156",
                  color: "#FFFFFF",
                  opacity: isActionButtonDisabled ? 0.5 : 1,
                }}
              >
                {actionButtonText}
                <RocketLaunchOutlinedIcon
                  sx={{ ml: 1, fontSize: 22, color: "#FFFFFF" }}
                />
              </Button>
            </Grid>
          </>
        )}
      </Grid>

      {!isLast && <Divider sx={{ mb: 1 }} />}

      {/* **Модальное окно с деталями модели** */}
      <ModelsDialog
        open={isModelDialogOpen}
        onClose={handleModelDialogClose}
        model={model}
        isBasic={isBasic}
      />

      {/* **Модальное окно настройки модели (только для базовых моделей)** */}
      {isBasic && (
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
            <ConfigureModelForm
              initialConfig={model.defaultConfig}
              onClose={handleConfigureClose}
            />
          </Box>
        </Modal>
      )}
    </>
  );
}

export default ModelCard;
