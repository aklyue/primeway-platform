import React, { useState, useContext } from "react";
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import ModelsDialog from "./ModelsDialog";

function ModelCard({ model, isLast, isBasic }) {
  const { authToken } = useContext(AuthContext);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentOrganization } = useContext(OrganizationContext);

  // Если модель базовая, то она не запущена
  // Если модель запущенная, то она уже запущена и у нее есть jobId
  const isLaunched = !isBasic;
  const jobId = isLaunched ? model.job_id : null;

  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);

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

  // Функция для запуска базовой модели
  const handleRun = async () => {
    if (!isBasic) return; // Запускать можно только базовые модели
    setLoading(true);
    try {
      const { defaultConfig } = model;
      const formData = new FormData();
      formData.append("organization_id", currentOrganization?.id || "");
      formData.append(
        "vllm_config_str",
        JSON.stringify({
          model: defaultConfig.modelName,
          args: defaultConfig.args.reduce(
            (acc, arg) => ({ ...acc, [arg.key]: arg.value }),
            {}
          ),
          flags: defaultConfig.flags.reduce(
            (acc, flag) => ({ ...acc, [flag.key]: flag.value }),
            {}
          ),
        })
      );
      formData.append("config_str", JSON.stringify(defaultConfig.modelConfig));

      const response = await axiosInstance.post("/models/run", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Предполагаем, что в ответе приходит job_id запущенной модели
      const { job_id } = response.data;

      // Обновляем состояние или перенаправляем пользователя
      alert(
        'Модель успешно запущена! Вы можете просмотреть ее в разделе "Задачи".'
      );
    } catch (error) {
      console.error(error);
      alert("Произошла ошибка при запуске модели.");
    } finally {
      setLoading(false);
    }
  };

  // Функция для остановки запущенной модели
  const handleStop = async () => {
    if (isBasic) return; // Останавливать можно только запущенные модели
    setLoading(true);
    try {
      const params = {};
      if (jobId) {
        params.job_id = jobId;
      } else {
        alert("Идентификатор задачи отсутствует.");
        setLoading(false);
        return;
      }

      await axiosInstance.post("/jobs/job-stop", null, {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      alert("Модель успешно остановлена.");
      // Дополнительно можно обновить список запущенных моделей
    } catch (error) {
      console.error("Ошибка при остановке модели:", error);
      alert("Произошла ошибка при остановке модели.");
    } finally {
      setLoading(false);
    }
  };

  // Определяем данные для отображения в зависимости от типа модели
  const modelName = isBasic ? model.name : model.job_name || model.job_name;
  const modelType = isBasic ? model.type : model.author;
  const modelImage = isBasic ? model.imgURL : null;

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
            borderEndEndRadius: isLast ? "16px" : "",
          },
          overflow: "hidden",
        }}
        onClick={handleModelDialogOpen}
      >
        <Grid item xs={isBasic ? 6 : 4}>
          <Typography
            sx={{ pl: 2, display: "flex", alignItems: "center", gap: "5px" }}
            variant="body1"
          >
            {modelImage && (
              <img width={26} height={26} src={modelImage} alt={modelName} />
            )}
            {modelName}
          </Typography>
        </Grid>

        <Grid item xs={2} sx={{ textAlign: "center" }}>
          <Typography variant="body1">{modelType}</Typography>
        </Grid>
        {!isBasic && (
          <Grid item xs={2} sx={{ textAlign: "center" }}>
            <Typography variant="body1">{model.url}</Typography>
          </Grid>
        )}
        <Grid item xs={2} sx={{ textAlign: "center" }}>
          {isBasic ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleRun();
              }}
              disabled={loading}
              variant="outlined"
              sx={{ bgcolor: "#505156", color: "#FFFFFF" }}
            >
              Запустить
              <RocketLaunchOutlinedIcon
                sx={{ ml: 1, fontSize: 22, color: "#FFFFFF" }}
              />
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleStop();
              }}
              disabled={loading}
              variant="outlined"
              sx={{ bgcolor: "#505156", color: "#FFFFFF" }}
            >
              Остановить
              {/* Можно заменить иконку, если нужно */}
              <RocketLaunchOutlinedIcon
                sx={{ ml: 1, fontSize: 22, color: "#FFFFFF" }}
              />
            </Button>
          )}
        </Grid>
        <Grid item xs={2} sx={{ textAlign: "center" }}>
          {isBasic && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleConfigureOpen();
              }}
            >
              <MoreVertIcon />
            </IconButton>
          )}
          {/* Если нужно добавить настройки для запущенных моделей, можно добавить условие */}
        </Grid>
      </Grid>
      {!isLast && <Divider sx={{ mb: 1 }} />}

      {/* Модальное окно для просмотра модели (только для базовых моделей) */}
      {isBasic && (
        <ModelsDialog
          open={isModelDialogOpen}
          onClose={handleModelDialogClose}
          model={model}
        />
      )}

      {/* Модальное окно для настройки модели (только для базовых моделей) */}
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
