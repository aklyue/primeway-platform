import React, { useState } from "react";
import { Box, Button, Divider, Grid, Modal, Typography } from "@mui/material";
import ModelCard from "./ModelCard";
import { modelsData } from "../data/modelsData";
import ConfigureModelForm from "./ConfigureModelForm";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

function ModelsPage() {
  // Include an extra item for the suggestion card
  const cards = [...modelsData];

  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  const handleConfigureOpen = () => {
    setIsConfigureOpen(true);
  };

  const handleConfigureClose = () => {
    setIsConfigureOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
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

      <Box
        sx={{
          border: "2px solid rgba(0, 0, 0, 0.12)",
          borderRadius: "16px",
          pt: 2,
          pb: 1,
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

        {/* Список моделей */}
        {cards.map((model, index) => (
          <ModelCard
            key={model.id || index}
            model={model}
            isLast={index === cards.length - 1}
          />
        ))}
      </Box>
    </Box>
  );
}

export default ModelsPage;
