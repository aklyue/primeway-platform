import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { modelsData } from "../../data/modelsData";
import { Box, Typography, Button, Modal, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ConfigureModelForm from "../ConfigureModelForm";

function SpecificModel({
  model: passedModel,
  initialConfig,
  isBasic: passedIsBasic,
}) {
  const { modelId } = useParams();
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  const model =
    passedModel ||
    modelsData.find((m) => m.id.replace(/^.*\//, "") === modelId);

  if (!model) {
    return <Typography sx={{ p: 4 }}>Модель не найдена</Typography>;
  }

  const isBasic = passedIsBasic ?? model.isBasic;

  const handleConfigureOpen = () => setIsConfigureOpen(true);
  const handleConfigureClose = () => setIsConfigureOpen(false);

  return (
    <Box
      sx={{
        border: "1px solid rgba(0, 0, 0, 0.12)",
        borderRadius: "16px",
        overflow: "hidden",
        m: 4,
        maxWidth: 1000,
        mx: "auto",
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
          {
            label: "GPU",
            value: model.defaultConfig.modelConfig.gpu_types
              .map((gpu) => `${gpu.type} x${gpu.count}`)
              .join(", "),
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

      <Box sx={{ p: 2, textAlign: "right" }}>
        <Button
          onClick={handleConfigureOpen}
          sx={{
            color: "white",
            padding: "8px 16px",
            bgcolor: "#597ad3",
            "&:hover": {
              bgcolor: "#7c97de",
            },
          }}
        >
          Настроить
        </Button>
      </Box>

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
            overflowY: "auto",
            borderRadius: 3,
            outline: "none",
            width: "90%",
            maxWidth: 800,
          }}
        >
          <Button
            sx={{ position: "absolute", left: 1, top: 12 }}
            onClick={handleConfigureClose}
          >
            <CloseIcon />
          </Button>
          <ConfigureModelForm
            initialConfig={initialConfig || model.defaultConfig}
            onClose={handleConfigureClose}
          />
        </Box>
      </Modal>
    </Box>
  );
}

export default SpecificModel;
