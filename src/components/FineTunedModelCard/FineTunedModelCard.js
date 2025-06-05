import React, { useState } from "react";
import { Box, Typography, Button, Divider, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import ConfigureModelForm from "../ConfigureModelForm";
import { modelsData } from "../../data/modelsData";

const buildDefaultConfig = (ft) => {
  const base = modelsData.find((m) => m.name === ft.base_model) || {};
  const cfg = base.defaultConfig || {};
  return {
    ...cfg,
    modelName: cfg.modelName ?? ft.base_model,
    finetuned_job_id: ft.job_id,
    modelConfig: {
      ...(cfg.modelConfig || {}),
      job_name: `${ft.artifact_name}-deploy`,
    },
  };
};

function FineTunedModelCard({ ft, isLast, onRun, isMobile }) {
  const [openCfg, setOpenCfg] = useState(false);
  const defaultConfig = buildDefaultConfig(ft);

  return (
    <>
      {/* --------- строка списка --------- */}
      <Box
        onClick={() => setOpenCfg(true)}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: "16px",
          py: 1,
          cursor: "pointer",
          "&:hover": { background: "rgba(102, 179, 238, 0.2)" },
        }}
      >
        <Typography
          sx={{
            flexBasis: "25%",
            fontSize: isMobile ? "9px !important" : "12px",
          }}
        >
          {ft.artifact_name}
        </Typography>
        {!isMobile && (
          <Typography
            sx={{
              flexBasis: "18%",
              textAlign: "center",
              fontSize: isMobile ? "9px !important" : "12px",
            }}
          >
            {ft.base_model || "—"}
          </Typography>
        )}
        <Typography
          sx={{
            flexBasis: "24%",
            textAlign: "center",
            fontSize: isMobile ? "9px !important" : "12px",
            ...(isMobile && {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }),
          }}
        >
          {ft.dataset_id || "—"}
        </Typography>
        <Typography
          sx={{
            flexBasis: "18%",
            textAlign: "center",
            fontSize: isMobile ? "9px !important" : "12px",
          }}
        >
          {new Date(ft.created_at).toLocaleDateString()}
        </Typography>
        <Typography
          sx={{
            flexBasis: "15%",
            textAlign: "center",
            fontSize: isMobile ? "9px !important" : "12px",
          }}
        >
          {ft.status || "—"}
        </Typography>
      </Box>

      {!isLast && <Divider />}

      {/* --------- модальное окно --------- */}
      <Modal open={openCfg} onClose={() => setOpenCfg(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "95vh",
            overflowY: "auto",
          }}
        >
          <Button
            sx={{ position: "absolute", left: 8, top: 8 }}
            onClick={() => setOpenCfg(false)}
          >
            <CloseIcon />
          </Button>

          <ConfigureModelForm
            initialConfig={defaultConfig}
            readOnlyModelName
            onClose={() => setOpenCfg(false)}
          />

          {/* кнопка запуска */}
          <Button
            variant="contained"
            sx={{ mt: 3, bgcolor: "#505156", color: "#fff" }}
            onClick={(e) => {
              e.stopPropagation();
              console.log("clicked-run", ft);
              onRun(ft);
              setOpenCfg(false);
            }}
          >
            Запустить
            <RocketLaunchOutlinedIcon sx={{ ml: 1 }} />
          </Button>
        </Box>
      </Modal>
    </>
  );
}

export default FineTunedModelCard;
