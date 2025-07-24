import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate, useParams } from "react-router-dom";
import BackArrow from "../../../../UI/BackArrow";
import {
  Check,
  ContentCopy,
  Description,
  ExpandMore,
} from "@mui/icons-material";
import useFineTuneJobDetails from "../../../../hooks/NoCode/useFineTuneJobDetails";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../../../store/selectors/organizationsSelectors";
import { useState } from "react";

export default function FineTuneJobDetails({
  isMobile,
}: {
  isMobile: boolean;
}) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const currentOrganization = useSelector(selectCurrentOrganization);
  const [copied, setCopied] = useState(false);

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
      <Box>
        <BackArrow
          path={"/fine-tuning"}
          name={"Задачи Дообучения"}
          model={job}
        />

        <Typography
          variant="h6"
          sx={{ mb: 3, fontSize: "14px", fontWeight: "normal" }}
        >
          {" "}
          Здесь вы можете просмотреть детали дообучения{" "}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 2,
            p: { xs: 1.5, md: 3 },
            overflowX: "auto",
            maxWidth: "100%",
          }}
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
                [
                  "Created at",
                  job.created_at
                    ? new Date(job.created_at).toLocaleString()
                    : "-",
                ],
                ["Runtime", job.run_time],
                ["GPU type", formatGpu(job.gpu_type)],
                ["Build status", job.build_status],
              ].map(([label, value, clipboard]) => (
                <Box
                  key={String(label)}
                  sx={{
                    display: "flex",
                    mb: 1,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    sx={{
                      width: isMobile ? 90 : 120,
                      color: "text.secondary",
                      flexShrink: 0,
                      fontSize: isMobile ? "9px !important" : "14px",
                    }}
                  >
                    {label}:
                  </Typography>
                  <Typography
                    sx={{
                      mr: isMobile ? 0 : 1,
                      fontSize: isMobile ? "9px !important" : "14px",
                    }}
                  >
                    {value ?? "-"}
                  </Typography>
                  {clipboard && (
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigator.clipboard.writeText(String(value ?? ""))
                      }
                    >
                      <ContentCopyIcon
                        sx={{ fontSize: isMobile ? "15px" : "inherit" }}
                      />
                    </IconButton>
                  )}
                </Box>
              ))}
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
                        width: isMobile ? 130 : 190,
                        color: "text.secondary",
                        flexShrink: 0,
                        fontSize: isMobile ? "9px !important" : "14px",
                      }}
                    >
                      {name}:
                    </Typography>
                    <Typography
                      sx={{ fontSize: isMobile ? "9px !important" : "14px" }}
                    >
                      {value}
                    </Typography>
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
      <Box sx={{ mt: 2 }}>
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
            <Tooltip
              arrow
              placement="top"
              title={copied ? "Скопировано" : "Скопировать"}
            >
              <span>
                <IconButton
                  sx={{ ml: 1 }}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(String(currentLogs ?? ""));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? (
                    <Check
                      sx={{
                        fontSize: isMobile ? "15px" : "inherit",
                        color: "success.main",
                      }}
                    />
                  ) : (
                    <ContentCopy
                      sx={{ fontSize: isMobile ? "15px" : "inherit" }}
                    />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails>
            {firstLogsLoading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  maxHeight: 320,
                  overflowY: "auto",
                  borderRadius: 1,
                  bgcolor: "#f8f9fa",
                  px: 1,
                  py: 0.5,
                }}
              >
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
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
}
