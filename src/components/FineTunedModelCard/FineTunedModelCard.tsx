import React, { useState } from "react";
import { Box, Typography, Button, Divider, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import ConfigureModelForm from "../ConfigureModelForm";
import { modelsData } from "../../data/modelsData";
import { useNavigate } from "react-router-dom";
import { fineTunedData } from "../../data/fineTunedData";
import { BasicModel, FinetunedModel } from "../../types";

const buildDefaultConfig = (ft: FinetunedModel) => {
  const base = fineTunedData.find((m) => m.name === ft.base_model);

  const cfg = base?.defaultConfig;

  return {
    ...cfg,
    modelName: cfg?.modelName ?? ft.base_model,
    finetuned_job_id: ft.job_id,
    modelConfig: {
      ...cfg?.modelConfig,
      job_name: `${ft.artifact_name}-deploy`,
      port: cfg?.modelConfig?.port ?? 8000,
      disk_space: cfg?.modelConfig?.disk_space ?? 80,
      health_check_timeout: cfg?.modelConfig?.health_check_timeout ?? 3500,
      autoscaler_timeout: cfg?.modelConfig?.autoscaler_timeout ?? 600,
      gpu_types: cfg?.modelConfig?.gpu_types ?? [
        { type: "A40" as const, count: 1 },
      ],
      env: cfg?.modelConfig?.env ?? [
        {
          name: "HUGGING_FACE_HUB_TOKEN",
          value: "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",
        },
      ],
      min_gpu_count: cfg?.modelConfig?.min_gpu_count ?? 0,
      max_gpu_count: cfg?.modelConfig?.max_gpu_count ?? 1,
      schedule: cfg?.modelConfig?.schedule ?? {
        workdays: [],
        weekends: [],
        specific_days: [],
      },
      max_requests: cfg?.modelConfig?.max_requests ?? 10,
    },
    args: cfg?.args ?? [],
    flags: cfg?.flags ?? [],
  };
};

interface FineTunedModelCardProps {
  ft: FinetunedModel;
  isLast: boolean;
  onRun: (ft: FinetunedModel) => void;
  isMobile: boolean;
}

function FineTunedModelCard({
  ft,
  isLast,
  onRun,
  isMobile,
}: FineTunedModelCardProps) {
  const navigate = useNavigate();
  const [openCfg, setOpenCfg] = useState(false);
  const defaultConfig = buildDefaultConfig(ft);
  console.log(defaultConfig);

  return (
    <>
      {/* --------- строка списка --------- */}
      <Box
        onClick={(e) => {
          const target = e.target as Element;
          if (target.closest("[data-no-navigate]")) {
            e.stopPropagation();
            return;
          }

          navigate(
            `/models/${defaultConfig.finetuned_job_id.replaceAll("/", "__")}`,
            {
              state: {
                model: defaultConfig.modelName,
                initialConfig: defaultConfig,
                isMobile,
                jobId: defaultConfig.finetuned_job_id,
              },
            }
          );
        }}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: "16px",
          py: "12px",
          cursor: "pointer",
          "&:hover": { background: "rgba(102, 179, 238, 0.2)" },
        }}
      >
        <Typography
          sx={{
            flexBasis: "40%",
            fontSize: isMobile ? "9px !important" : "12px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "40%",
          }}
        >
          {ft.artifact_name}
        </Typography>
        {!isMobile && (
          <Typography
            sx={{
              flexBasis: "20%",
              textAlign: "center",
              fontSize: isMobile ? "9px !important" : "12px",
            }}
          >
            {ft.base_model || "—"}
          </Typography>
        )}
        <Typography
          sx={{
            flexBasis: "20%",
            textAlign: "center",
            fontSize: isMobile ? "9px !important" : "12px",
          }}
        >
          {new Date(ft.created_at).toLocaleDateString()}
        </Typography>
        <Typography
          sx={{
            flexBasis: "20%",
            textAlign: "center",
            fontSize: isMobile ? "9px !important" : "12px",
          }}
        >
          Дообученная
        </Typography>
      </Box>

      <Divider />

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

export default React.memo(FineTunedModelCard);
