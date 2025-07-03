import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import BackArrow from "../../UI/BackArrow";
import SpecificModel from "../../components/SpecificModel";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Description,
  ExpandMore,
  ContentCopy,
  Check,
} from "@mui/icons-material";
import JobTable from "../../UI/JobTable";
import useJobsActions from "../../hooks/useJobsActions";

function SpecificModelPage() {
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const { model, initialConfig, isBasic, isMobile, isTablet } =
    location.state || {};
  const [isLaunchedModel, setIsLaunchedModel] = useState(false);

  const {
    job,
    jobId,
    currentLogs,
    firstLogsLoading,
    isLogsOpen,
    handleLogsOpen,
    handleLogsClose,
  } = useJobsActions();

  return (
    <div>
      <Box>
        <BackArrow
          path={"/models"}
          name={"Models"}
          model={model}
          config={initialConfig}
        />
      </Box>
      <SpecificModel
        isMobile={isMobile}
        model={model}
        initialConfig={initialConfig}
        isBasic={isBasic}
        jobId={jobId}
        onLaunchedModelChange={setIsLaunchedModel}
      />
      {!isBasic && !isLaunchedModel && (
        <Box>
          <JobTable job={job} isMobile={isMobile} isTablet={isTablet} />
        </Box>
      )}
      {isLaunchedModel && (
        <Box>
          <Accordion
            expanded={isLogsOpen}
            onChange={(_, expanded) => {
              if (expanded) {
                handleLogsOpen();
              } else {
                handleLogsClose();
              }
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
      )}
    </div>
  );
}

export default SpecificModelPage;
