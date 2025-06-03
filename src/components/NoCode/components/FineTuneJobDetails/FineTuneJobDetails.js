import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DescriptionIcon from "@mui/icons-material/Description"; // ← new (log button)
import axiosInstance from "../../../../api";
import { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OrganizationContext } from "../../../Organization/OrganizationContext";
import BackArrow from "../../../../UI/BackArrow";
import { Description, ExpandMore } from "@mui/icons-material";
import useFineTuneJobDetails from "../../../../hooks/NoCode/useFineTuneJobDetails";

export default function FineTuneJobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentOrganization } = useContext(OrganizationContext);

  const {
    loading,
    job,
    formatGpu,
    handleLogsClick,
    setIsLogsOpen,
    logsLoading,
    firstLogsLoading,
    currentLogs,
  } = useFineTuneJobDetails({ jobId, currentOrganization });

  console.log(job);

  /* ─── Render states ────────────────────────────────────── */
  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Typography>Job not found.</Typography>
        <IconButton onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
    );
  }

  /* ─── Main UI ──────────────────────────────────────────── */
  return (
    <>
      <Box sx={{ px: 4, py: 2 }}>
        <BackArrow
          path={"/fine-tuning"}
          name={"Fine-tuning jobs"}
          model={"jobs"}
        />

        <Typography
          variant="h6"
          sx={{ mb: 3, fontSize: "14px", fontWeight: "normal" }}
        >
          Fine-tuning job{" "}
          <span style={{ color: "#5282ff" }}>{job.job_name}</span> details
        </Typography>

        <Paper
          elevation={0}
          sx={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 2, p: 3 }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            Job details
          </Typography>

          {/* two-column grid exactly like Together */}
          <Grid container spacing={4}>
            {/* ——— LEFT column ——— */}
            <Grid item xs={12} md={6}>
              {[
                ["Job ID", job.job_id, true],
                ["Status", job.last_execution_status],
                ["Base model", job.finetuning_config?.base_model],
                ["Suffix", job.suffix ?? job.finetuning_config?.artifact_name],
                [
                  "Custom dataset",
                  String(job.finetuning_config?.custom_dataset),
                ],
                ["Dataset ID", job.finetuning_config?.dataset_id || "-"],
                ["Disk space (GB)", job.finetuning_config?.disk_space],
                ["Created at", new Date(job.created_at).toLocaleString()],
                ["Runtime", job.run_time],
                ["GPU type", formatGpu(job.gpu_type)],
                ["Build status", job.build_status],
              ].map(([label, value, clipboard]) => (
                <Box
                  key={label}
                  sx={{ display: "flex", mb: 1, alignItems: "center" }}
                >
                  <Typography
                    sx={{ width: 160, color: "text.secondary", flexShrink: 0 }}
                  >
                    {label}:
                  </Typography>
                  <Typography sx={{ mr: 1 }}>{value ?? "-"}</Typography>
                  {clipboard && (
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigator.clipboard.writeText(String(value ?? ""))
                      }
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </Box>
              ))}

              {/* —— NEW: button to open logs ——
              <Button
                variant="outlined"
                size="small"
                startIcon={<DescriptionIcon />}
                sx={{ mt: 2 }}
                onClick={handleLogsClick}
              >
                Показать логи
              </Button> */}
            </Grid>

            {/* ——— RIGHT column ——— */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                borderLeft: { md: "1px solid rgba(0,0,0,0.12)" },
                pl: { md: 3 },
              }}
            >
              {job.finetuning_config?.env?.length ? (
                job.finetuning_config.env.map(({ name, value }) => (
                  <Box
                    key={name}
                    sx={{ display: "flex", mb: 1, alignItems: "center" }}
                  >
                    <Typography
                      sx={{
                        width: 190,
                        color: "text.secondary",
                        flexShrink: 0,
                      }}
                    >
                      {name}:
                    </Typography>
                    <Typography>{value}</Typography>
                  </Box>
                ))
              ) : (
                <Typography>LoRA конфигурация не предоставлена.</Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* ─── NEW: modal with logs ──────────────────────────── */}
      <Box sx={{ mx: 4 }}>
        <Accordion
          onClick={handleLogsClick}
          onChange={(_, expanded) => {
            setIsLogsOpen(expanded);
            if (expanded) handleLogsClick();
          }}
          sx={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 2,
            background: "#fff",
            boxShadow: "none",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="logs-content"
            id="logs-header"
          >
            <Description />
            <Typography variant="h6" sx={{ userSelect: "none" }}>
              Логи задачи
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {firstLogsLoading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  margin: 0,
                  fontFamily: "monospace",
                  fontSize: 14,
                }}
              >
                {currentLogs}
              </pre>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
}
