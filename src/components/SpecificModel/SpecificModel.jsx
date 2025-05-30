import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { modelsData } from "../../data/modelsData";
import { Box, Typography, Button, Modal, Grid, Collapse } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ConfigureModelForm from "../ConfigureModelForm";
import useModelActions from "../../hooks/useModelActions";
import useModelButtonLogic from "../../hooks/useModelButtonLogic";
import { AuthContext } from "../../AuthContext";
import { OrganizationContext } from "../Organization/OrganizationContext";
import ModelActions from "../../UI/ModelActions";

function SpecificModel({ initialConfig, isBasic: passedIsBasic }) {
  const { authToken } = useContext(AuthContext);
  const { currentOrganization } = useContext(OrganizationContext);
  const { modelId } = useParams();


  const decodedModelId = modelId.replaceAll("__", "/");

  const model = modelsData.find((m) => m.id === decodedModelId);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const toggleConfigure = () => setIsConfigureOpen((prev) => !prev);

  const isBasic = passedIsBasic ?? model.isBasic;
  const [modelStatus, setModelStatus] = useState(model.last_execution_status);

  useEffect(() => {
    setModelStatus(model.last_execution_status);
  }, [model.last_execution_status]);

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
      modelStatus,
      handleRun,
      handleStart,
      handleStop,
      loading,
    });

  if (!model) {
    return <Typography sx={{ p: 4 }}>Модель не найдена</Typography>;
  }

  return (
    <Box
      sx={{
        border: "1px solid rgba(0, 0, 0, 0.12)",
        borderRadius: "16px",
        overflow: "hidden",
        m: 4,
        mx:4,
        bgcolor: "#ffffff",
      }}
    >
      <Grid
        container
        sx={{
          backgroundColor: "rgba(102, 179, 238, 0.1)",
          padding: 2,
          borderBottom: "1px solid lightgray",
        }}
      >
        <Grid item xs={4}>
          <Typography variant="subtitle2" fontWeight="light">
            ПАРАМЕТР
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="subtitle2" fontWeight="light">
            ЗНАЧЕНИЕ
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ px: 2 }}>
        {[
          { label: "ID", value: model.id },
          { label: "Тип", value: model.type },
          { label: "Описание", value: model.description },
          { label: "Модель (config)", value: model.defaultConfig.modelName },
          {
            label: "Job name",
            value: model.defaultConfig.modelConfig.job_name,
          },
        ].map((row, index) => (
          <Grid
            container
            key={index}
            sx={{ borderBottom: "1px solid #e0e0e0", py: 2, my: 0.5 }}
          >
            <Grid item xs={4}>
              <Typography variant="subtitle2">{row.label}</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{row.value}</Typography>
            </Grid>
          </Grid>
        ))}
      </Box>

      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
        <Button
          onClick={toggleConfigure}
          sx={{
            color: "white",
            padding: "8px 16px",
            bgcolor: "#597ad3",
            "&:hover": {
              bgcolor: "#7c97de",
            },
          }}
        >
          {isConfigureOpen ? "Скрыть настройку" : "Настроить"}
        </Button>
        <ModelActions
          // isBasic={isBasic}
          actionButtonHandler={actionButtonHandler}
          actionButtonText={actionButtonText}
          isActionButtonDisabled={isActionButtonDisabled}
        />
      </Box>

      <Collapse in={isConfigureOpen}>
        <Box
          sx={{
            borderTop: "1px solid #e0e0e0",
            bgcolor: "#fff",
            p: 3,
          }}
        >
          <ConfigureModelForm
            initialConfig={initialConfig || model.defaultConfig}
            onClose={toggleConfigure}
          />
        </Box>
      </Collapse>
    </Box>
  );
}

export default SpecificModel;
