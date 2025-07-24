import React, { useState } from "react";
import { Box, Button, Grid, Typography, CircularProgress } from "@mui/material";
import { ModelTraining } from "@mui/icons-material";
import ModelCard from "../../components/ModelCard";
import AddIcon from "@mui/icons-material/Add";
import FineTunedModelCard from "../../components/FineTunedModelCard";
import { modelsData } from "../../data/modelsData";
import { useNavigate } from "react-router-dom";
import useLaunchedModels from "../../hooks/useLaunchedModels";
import useFineTunedModels from "../../hooks/useFineTunedModels";
import useRunFineTunedModel from "../../hooks/useRunFineTunedModel";
import { BasicModel, FinetunedModel, Job } from "../../types";

interface ModelsPageProps {
  isMobile: boolean;
  isTablet: boolean;
}

function ModelsPage({ isMobile, isTablet }: ModelsPageProps) {
  const navigate = useNavigate();
  const [isCreate, setIsCreate] = useState(true);

  const { launchedModels, launchedLoading } = useLaunchedModels();

  const { fineTunedModels, fineTunedLoading } = useFineTunedModels();

  const { runFineTunedModel } = useRunFineTunedModel(modelsData);

  const allBasic = modelsData;

  return (
    <Box sx={{ boxSizing: "border-box" }}>
      {/* ---------- container for sections -------------------------------- */}
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center" }}
            data-tour-id="model-page"
          >
            <ModelTraining />
            <Typography ml={1} fontSize={"1.25rem"} fontWeight={500}>
              Models
            </Typography>
          </Box>
          <Box data-tour-id="model-create">
            <Button
              onClick={() =>
                navigate("/model-create", {
                  state: {
                    isCreate,
                  },
                })
              }
              variant="contained"
              color="primary"
              sx={{
                height: "40px",
                color: "white",
                padding: "8px 16px",
                bgcolor: "#597ad3",
                "&:hover": {
                  bgcolor: "#7c97de",
                },
              }}
            >
              Добавить модель
              <AddIcon sx={{ color: "#FFFFFF", fontSize: "20px", ml: 0.5 }} />
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            maxHeight: "60vh",
            // mt: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              my: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                maxHeight: "60vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h5" gutterBottom>
                Мои модели
              </Typography>
              <Typography gutterBottom>
                Здесь находятся дообученные и запущенные модели
              </Typography>
            </Box>
          </Box>

          <Box
            data-tour-id="my-models"
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
                p: { xs: 1, sm: 2 },
                backgroundColor: "rgba(102, 179, 238, 0.1)",
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
                justifyContent: "space-between",
                gap: isMobile ? "5px" : undefined,
              }}
            >
              <Typography
                sx={{ flexBasis: "40%" }}
                fontSize={{ xs: 10, sm: 14 }}
              >
                НАЗВАНИЕ
              </Typography>
              {!isMobile && (
                <Typography
                  sx={{ flexBasis: "20%", textAlign: "center" }}
                  fontSize={{ xs: 10, sm: 14 }}
                >
                  БАЗОВАЯ МОДЕЛЬ
                </Typography>
              )}
              {/* <Typography
                sx={{ flexBasis: "24%", textAlign: "center" }}
                fontSize={{ xs: 10, sm: 14 }}
              >
                НАБОР ДАННЫХ
              </Typography> */}
              <Typography
                sx={{ flexBasis: "20%", textAlign: "center" }}
                fontSize={{ xs: 10, sm: 14 }}
              >
                ДАТА
              </Typography>
              <Typography
                sx={{ flexBasis: "20%", textAlign: "center" }}
                fontSize={{ xs: 10, sm: 14 }}
              >
                ТИП
              </Typography>
              {/* <Typography
                sx={{ flexBasis: "15%", textAlign: "center" }}
                fontSize={{ xs: 10, sm: 14 }}
              >
                СТАТУС
              </Typography> */}
            </Box>
            {/* <Divider /> */}

            {/* ---------- rows ---------- */}
            <Box sx={{ overflowY: "auto", minHeight: 0 }}>
              {fineTunedLoading && launchedLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 60,
                  }}
                >
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <>
                  {fineTunedModels.length > 0 &&
                    fineTunedModels.map((ft: FinetunedModel, idx) => (
                      <FineTunedModelCard
                        isMobile={isMobile}
                        key={ft.job_id}
                        ft={ft}
                        isLast={idx === fineTunedModels.length - 1}
                        onRun={runFineTunedModel}
                      />
                    ))}
                  {launchedModels.length > 0 &&
                    launchedModels.map((model: BasicModel, idx) => (
                      <ModelCard
                        isMobile={isMobile}
                        isTablet={isTablet}
                        key={model.job_id || idx}
                        model={model}
                        isLast={idx === launchedModels.length - 1}
                        isBasic={false}
                      />
                    ))}
                  {!launchedModels.length &&
                    !fineTunedModels.length &&
                    !launchedLoading &&
                    !fineTunedLoading && (
                      <Typography p={2} fontSize={"12px"} textAlign={"center"}>
                        Нет моделей
                      </Typography>
                    )}
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* ============ Базовые модели ===================================== */}
        <Box
          data-tour-id="basic-models"
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
                p: { xs: 1, sm: 2 },
                backgroundColor: "rgba(102, 179, 238, 0.1)",
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
              container
              spacing={0}
              alignItems="center"
            >
              <Grid item xs={isMobile ? 5 : 6}>
                <Typography
                  variant="subtitle2"
                  fontWeight="light"
                  fontSize={{ xs: 10, sm: 14 }}
                >
                  НАЗВАНИЕ
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="light"
                  fontSize={{ xs: 10, sm: 14 }}
                >
                  АВТОР
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "center" }}>
                {isMobile ? (
                  <Typography
                    variant="subtitle2"
                    fontWeight="light"
                    fontSize={{ xs: 10, sm: 14 }}
                  >
                    ТИП
                  </Typography>
                ) : (
                  <Typography
                    variant="subtitle2"
                    fontWeight="light"
                    fontSize={{ xs: 10, sm: 14 }}
                  >
                    ТИП МОДЕЛИ
                  </Typography>
                )}
              </Grid>
              <Grid item xs={isMobile ? 3 : 2} sx={{ textAlign: "center" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="light"
                  fontSize={{ xs: 10, sm: 14 }}
                >
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
                  isMobile={isMobile}
                  isTablet={isTablet}
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
