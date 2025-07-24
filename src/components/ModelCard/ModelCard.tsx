import React, { useState, useEffect } from "react";
import { Typography, Box, Grid } from "@mui/material";

// Импорт SVG как React-компонентов
import { ReactComponent as DeepSeek } from "../../assets/deepseek-color.svg";
import { ReactComponent as Google } from "../../assets/gemma-color.svg";
import { ReactComponent as HuggingFace } from "../../assets/huggingface-color.svg";
import { useNavigate } from "react-router-dom";
import useModelActions from "../../hooks/useModelActions";
import useModelButtonLogic from "../../hooks/useModelButtonLogic";
import ModelActions from "../../UI/ModelActions";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";

import { format, parseISO } from "date-fns";
import { BasicModel, Job, Model, ModelConfig } from "../../types";
import { useAppSelector } from "../../store/hooks";

interface ModelCardProps {
  model: BasicModel;
  isLast: boolean;
  isBasic: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

function ModelCard({
  model,
  isLast,
  isBasic,
  isMobile,
  isTablet,
}: ModelCardProps) {
  const authToken = useAppSelector((state) => state.auth.authToken);
  const currentOrganization = useAppSelector(selectCurrentOrganization);
  const navigate = useNavigate();

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

  const { handleRun, handleStart, handleStop, loading } = useModelActions({
    model,
    modelConfig: model.defaultConfig?.modelConfig,
    currentOrganization,
    authToken,
    setModelStatus,
  });

  const { actionButtonText, actionButtonHandler, isActionButtonDisabled } =
    useModelButtonLogic({
      model,
      isBasic,
      isFineTuned: !isBasic,
      jobId: jobId ?? model.defaultConfig.modelConfig.job_name,
      modelStatus,
      setModelStatus,
      authToken,
      currentOrganization,
      handleConfirmLaunchClose: () => {},
      args: model.defaultConfig?.args ?? [],
      flags: model.defaultConfig?.flags ?? [],
      modelConfig: model.defaultConfig?.modelConfig,
    });

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
          const target = e.target as HTMLElement;
          if (target.closest("[data-no-navigate]")) {
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
                actionButtonHandler={actionButtonHandler ?? (() => {})}
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
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "40%",
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
          </>
        )}
      </Grid>
    </>
  );
}

export default React.memo(ModelCard);
