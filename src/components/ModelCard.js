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

  const isLaunched = model.isLaunched;

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

  // Function to handle running a model
  const handleRun = async () => {
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

      await axiosInstance.post("/models/run", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });

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
        <Grid item xs={6}>
          <Typography
            sx={{ pl: 2, display: "flex", alignItems: "center", gap: "5px" }}
            variant="body1"
          >
            <img width={26} height={26} src={model.imgURL} alt={model.name} />
            {model.name}
          </Typography>
        </Grid>

        <Grid item xs={2} sx={{ textAlign: "center" }}>
          <Typography variant="body1">{model.type}</Typography>
        </Grid>
        <Grid item xs={2} sx={{ textAlign: "center" }}>
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Предотвращаем всплытие события
              handleRun();
            }}
            disabled={loading}
            variant="outlined"
            sx={{ bgcolor: "#505156", color: "#FFFFFF" }}
          >
            {isBasic ? "Запустить" : "Остановить"}
            <RocketLaunchOutlinedIcon
              sx={{ ml: 1, fontSize: 22, color: "#FFFFFF" }}
            />
          </Button>
        </Grid>
        <Grid item xs={2} sx={{ textAlign: "center" }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation(); // Предотвращаем всплытие события
              handleConfigureOpen();
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Grid>
      </Grid>
      {!isLast && <Divider sx={{ mb: 1 }} />}

      {/* Модальное окно для просмотра модели */}
      <ModelsDialog
        open={isModelDialogOpen}
        onClose={handleModelDialogClose}
        model={model}
      />

      {/* Модальное окно для настройки модели */}
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
    </>
  );
}

export default ModelCard;
