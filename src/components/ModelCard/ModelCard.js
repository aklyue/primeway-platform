import React, { useState, useContext, useEffect } from "react";
import {
  Typography,
  Button,
  Modal,
  Box,
  Grid,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import ConfigureModelForm from "../ConfigureModelForm";
import axiosInstance from "../../api";
import CloseIcon from "@mui/icons-material/Close";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import ModelsDialog from "../ModelsDialog";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Импорт SVG как React-компонентов
import { ReactComponent as DeepSeek } from "../../assets/deepseek-color.svg";
import { ReactComponent as Google } from "../../assets/gemma-color.svg";
import { ReactComponent as HuggingFace } from "../../assets/huggingface-color.svg";
import { useNavigate } from "react-router-dom";
import useModelActions from "../../hooks/useModelActions";
import useModelButtonLogic from "../../hooks/useModelButtonLogic";
import ModelActions from "../../UI/ModelActions";
import { ContentCopy } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import { format, parseISO } from "date-fns";

function ModelCard({ model, isLast, isBasic, isMobile, isTablet }) {
  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);
  const navigate = useNavigate();

  // **Состояния**
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);

  // **Состояния для логов**
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  // **Переменные модели**
  const isLaunched = !isBasic;
  const jobId = isLaunched ? model.job_id : null;

  const modelName = isBasic ? model.name : model.job_name || "N/A";
  const modelType = isBasic ? model.type : model.author || "N/A";

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipCopyOpen, setTooltipCopyOpen] = useState(false);

  useEffect(() => {
    if (!tooltipOpen && !tooltipCopyOpen) return;
    const handleScroll = () => {
      setTooltipOpen(false);
      setTooltipCopyOpen(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [tooltipOpen, tooltipCopyOpen]);

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
  } else if (
    modelNameImg.includes("google") ||
    modelNameImg.includes("gemma")
  ) {
    ModelImageComponent = Google;
  } else {
    ModelImageComponent = HuggingFace;
  }

  // **Обработчики открытия и закрытия модальных окон**

  const handleModelDialogClose = () => {
    setIsModelDialogOpen(false);
  };

  const { handleRun, handleStart, handleStop, loading } = useModelActions({
    model,
    currentOrganization,
    authToken,
    setModelStatus,
  });

  const { actionButtonText, actionButtonHandler, isActionButtonDisabled } =
    useModelButtonLogic({
      model,
      isBasic,
      jobId,
      modelStatus,
      setModelStatus,
      handleRun,
      handleStart,
      handleStop,
      loading,
      authToken,
      currentOrganization,
    });

  // **Функция для получения логов модели**
  const handleLogsClick = async (e) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    if (isBasic) return; // Получать логи можно только для запущенных моделей
    setLogsModalOpen(true);
    setLogsLoading(true);
    setCurrentLogs(""); // Сбрасываем предыдущие логи

    try {
      if (!jobId) {
        setCurrentLogs("Идентификатор задачи отсутствует.");
        setLogsLoading(false);
        return;
      }

      const response = await axiosInstance.get("/jobs/job-logs", {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const logs = response.data.logs || "Логи отсутствуют.";
      setCurrentLogs(logs);
    } catch (error) {
      console.error(`Ошибка при получении логов для задачи ${jobId}:`, error);
      const errorMessage =
        error.response?.data?.detail ||
        (error.response?.status === 404
          ? "Логи недоступны."
          : "Ошибка при получении логов.");
      setCurrentLogs(errorMessage);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      alert("Не удалось скопировать");
    }
  };

  // **Определяем текст и действие кнопки в зависимости от статуса модели**

  return (
    <>
      <Grid
        container
        spacing={0}
        alignItems="center"
        sx={{
          justifyContent: "space-between",
          cursor: "pointer",
          // transition: "background 0.2s",
          "&:hover": {
            background: "rgba(102, 179, 238, 0.2)",
            borderBottomLeftRadius: isLast ? "16px" : "",
            borderBottomRightRadius: isLast ? "16px" : "",
          },
          padding: isBasic ? "6px 0" : "12px 0",
          overflow: "hidden",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        }}
        onClick={(e) => {
          if (e.target.closest("[data-no-navigate]")) {
            e.stopPropagation();
            return;
          }

          navigate(
            `/models/${(model.job_id || model.id).replaceAll("/", "__")}`,
            {
              state: {
                isMobile,
                isTablet,
                model,
                isBasic,
                actionButtonText,
                isActionButtonDisabled,
                jobId,
              },
            }
          );
        }}
      >
        {/* **Название модели** */}
        {isBasic && (
          <Grid
            item
            xs={isMobile && isBasic ? 5 : isMobile ? 4 : isBasic ? 6 : 4.8}
          >
            <Typography
              fontSize={{ xs: 10, sm: 14 }}
              variant="body2"
              sx={{
                pl: "16px",
                fontSize: isMobile ? "9px !important" : "12px",
              }}
            >
              {modelName}
            </Typography>
          </Grid>
        )}

        {isBasic ? (
          // **Базовые модели**
          <>
            <Grid item xs={isMobile ? 1 : 2} sx={{ textAlign: "center" }}>
              {ModelImageComponent && (
                <ModelImageComponent
                  width={isMobile ? 20 : 26}
                  height={isMobile ? 20 : 26}
                  alt={modelName}
                />
              )}
            </Grid>
            {/* **Тип модели** */}
            <Grid item xs={isMobile ? 1 : 2} sx={{ textAlign: "center" }}>
              <Typography fontSize={{ xs: 10, sm: 14 }} variant="body2">
                {modelType}
              </Typography>
            </Grid>

            {/* **Действие (Кнопка запуска)** */}
            <Grid
              item
              xs={isMobile ? 3 : 2}
              sx={{ textAlign: "center", pr: "24px" }}
            >
              <ModelActions
                isMobile={isMobile}
                actionButtonHandler={actionButtonHandler}
                actionButtonText={actionButtonText}
                isActionButtonDisabled={isActionButtonDisabled}
              />
            </Grid>
          </>
        ) : (
          // **Запущенные модели**
          <>
            {/* **Дата создания** */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: "16px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  flexBasis: "40%",
                  fontSize: isMobile ? "9px !important" : "12px",
                }}
              >
                {modelName}
              </Typography>
              {!isMobile && (
                <Typography
                  variant="body2"
                  sx={{
                    flexBasis: "20%",
                    textAlign: "center",
                    fontSize: isMobile ? "9px !important" : "12px",
                  }}
                >
                  {model.base_model}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{
                  flexBasis: "20%",
                  textAlign: "center",
                  fontSize: isMobile ? "9px !important" : "12px",
                }}
              >
                {model.created_at
                  ? format(parseISO(model.created_at), "dd.MM.yyyy")
                  : "N/A"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  flexBasis: "20%",
                  textAlign: "center",
                  fontSize: isMobile ? "9px !important" : "12px",
                }}
              >
                Базовая
              </Typography>
            </Box>

            {/* **Состояние** */}
            {/* <Grid item xs={isMobile ? 1 : 2} sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  width: isMobile ? "50px" : "120px",
                  mx: "auto",
                  fontSize: isMobile ? "9px !important" : "12px",
                }}
              >
                {modelStatus || "N/A"}
              </Typography>
            </Grid> */}

            {/* **URL** */}
            {/* <Grid item xs={isMobile ? 3 : 2} sx={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Tooltip
                  title={model.job_url || "N/A"}
                  arrow
                  placement="top"
                  open={tooltipOpen}
                  onOpen={() => setTooltipOpen(true)}
                  onClose={() => setTooltipOpen(false)}
                >
                  <Typography
                    variant="body2"
                    onMouseEnter={() => setTooltipOpen(true)}
                    onMouseLeave={() => setTooltipOpen(false)}
                    sx={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      width: isMobile ? "100px" : "auto",
                      textAlign: "center",
                      mx: isMobile ? "5px" : "10px",
                      marginLeft: !isMobile && "0",
                      fontSize: isMobile ? "9px !important" : "12px",
                      cursor: "pointer",
                      userSelect: "text",
                    }}
                  >
                    {model.job_url || "N/A"}
                  </Typography>
                </Tooltip>
                {model.job_url && (
                  <Tooltip
                    title="Скопировать"
                    placement="top"
                    open={tooltipCopyOpen}
                    onOpen={() => setTooltipCopyOpen(true)}
                    onClose={() => setTooltipCopyOpen(false)}
                  >
                    <IconButton
                      onMouseEnter={() => setTooltipCopyOpen(true)}
                      onMouseLeave={() => setTooltipCopyOpen(false)}
                      data-no-navigate
                      size="small"
                      onClick={() => handleCopy(model.job_url)}
                      sx={{ p: isMobile ? "2px" : "5px" }}
                    >
                      <ContentCopy
                        sx={{ fontSize: isMobile ? "12px" : "18px" }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </Grid> */}

            {/* **Действия (Кнопка получения логов)** */}
            {/* {!isMobile && (
              <Grid
                item
                xs={isMobile ? 3 : 3}
                sx={{
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  gap: 0.5,
                  pr: "10px",
                }}
              >
                <Button
                  onClick={handleLogsClick}
                  variant="outlined"
                  sx={{
                    bgcolor: "#597ad3",
                    "&:hover": {
                      bgcolor: "#7c97de",
                    },
                    color: "white",
                    fontSize: "12px",
                  }}
                >
                  Логи
                </Button>
              </Grid>
            )} */}
          </>
        )}
      </Grid>

      {/* {!isLast && <Divider sx={{ mb: 1 }} />} */}

      {/* **Модальное окно с деталями модели** */}
      <ModelsDialog
        open={isModelDialogOpen}
        onClose={handleModelDialogClose}
        model={model}
        isBasic={isBasic}
      />

      {/* **Диалоговое окно логов модели** */}
      <Dialog
        open={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Логи модели: ${modelName}`}</DialogTitle>
        <DialogContent dividers>
          {logsLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Typography
              variant="body2"
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            >
              {currentLogs}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsModalOpen(false)}>Закрыть</Button>
          <Button
            onClick={() => {
              // Копирование логов в буфер обмена
              if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(currentLogs).catch((error) => {
                  console.error("Ошибка при копировании:", error);
                });
              } else {
                const textarea = document.createElement("textarea");
                textarea.value = currentLogs;
                textarea.style.position = "fixed"; // Предотвращаем прокрутку страницы
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                try {
                  document.execCommand("copy");
                } catch (error) {
                  console.error("Ошибка при копировании:", error);
                }
                document.body.removeChild(textarea);
              }
            }}
          >
            Скопировать Логи
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ModelCard;
