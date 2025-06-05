// src/components/ModelsDialog.jsx

import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  DialogTitle,
  Grid,
  Paper,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import axiosInstance from "../../api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { styled } from "@mui/material/styles";
import {
  PlayCircleFilled as PlayCircleFilledIcon,
  Stop as StopIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import JobEvents from "../Tasks/JobEvents";

// Импортируем модуль yaml
import yaml from "js-yaml";
import TasksActions from "../Tasks/TasksActions"; // Импортируем TasksActions
import useModelsDialogActions from "../../hooks/useModelsDialogActions";
import { useSelector } from "react-redux";

const ActionIconButton = styled(IconButton)(({ theme, colorvariant }) => ({
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.1)",
    backgroundColor:
      colorvariant === "error"
        ? theme.palette.error.light
        : theme.palette.success.light,
  },
  "&.Mui-disabled": {
    opacity: 0.5,
    transform: "none",
  },
}));

function ModelsDialog({ open, onClose, model }) {
  const authToken = useSelector((state) => state.auth.authToken);

  const {
    jobDetails,
    formatDateTime,
    handleLogsClick,
    handleCopy,
    handleStartModel,
    modelStatus,
    handleStopModel,
    executionsLoading,
    executionsError,
    executions,
    handleDownloadArtifacts,
    handleStopJob,
    setActiveTab,
    activeTab,
    configLoading,
    config,
    job_id,
    logsModalOpen,
    setLogsModalOpen,
    logsLoading,
    currentLogs,
    buildLogsModalOpen,
    buildLogsLoading,
    setBuildLogsModalOpen,
    alertOpen,
    setAlertOpen,
    alertSeverity,
    alertMessage,
    formatJobExecutionId,
  } = useModelsDialogActions({ authToken, open, onClose, model });

  // Проверка наличия задачи
  if (!jobDetails) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        scroll="paper"
        PaperProps={{
          style: {
            height: "92vh",
            borderRadius: "15px",
          },
        }}
      >
        {/* Заголовок и информация о задаче */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Левая часть заголовка */}
          <Typography variant="h6" sx={{ fontWeight: "bold", mr: 2 }}>
            {jobDetails.job_name}
          </Typography>

          {/* Разделитель */}
          <Box
            sx={{
              height: "2px",
              flexGrow: 1,
              minWidth: "3px",
              maxWidth: "130px",
              borderRadius: "5px",
              mr: 2,
              bgcolor: "black",
            }}
          />

          <Typography variant="body1" sx={{ mr: 2 }}>
            <strong>{formatDateTime(jobDetails.created_at)}</strong>
          </Typography>
          <Box
            sx={{
              height: "2px",
              flexGrow: 1,
              minWidth: "3px",
              maxWidth: "130px",
              borderRadius: "5px",
              mr: 2,
              bgcolor: "black",
            }}
          />

          {/* Кнопка "Логи" */}
          <Tooltip title="Посмотреть логи">
            <Button
              onClick={handleLogsClick}
              color="primary"
              variant="outlined"
              sx={{
                bgcolor: "#505156",
                color: "#FFFFFF",
                mr: 2,
              }}
            >
              Логи
            </Button>
          </Tooltip>

          {/* URL задачи */}
          {jobDetails.job_url && (
            <>
              <Box
                sx={{
                  height: "2px",
                  flexGrow: 1,
                  minWidth: "3px",
                  maxWidth: "130px",
                  borderRadius: "5px",
                  mr: 2,
                  bgcolor: "black",
                }}
              />
              <Tooltip title="Скопировать URL">
                <Typography
                  variant="body2"
                  sx={{
                    padding: "3px 8px",
                    borderRadius: "12px",
                    border: "1px solid #5282ff",
                    backgroundColor: "none",
                    color: "secondary.main",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "200px",
                    "&:hover": {
                      backgroundColor: "#8fa8ea",
                      color: "white",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(jobDetails.job_url);
                  }}
                >
                  {jobDetails.job_url}
                </Typography>
              </Tooltip>
            </>
          )}

          {/* Правая часть заголовка */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Tooltip title="Запустить модель">
              <span>
                <ActionIconButton
                  onClick={handleStartModel}
                  colorvariant="success"
                  size="small"
                  disabled={modelStatus === "running"}
                  aria-label="Запустить модель"
                >
                  <PlayCircleFilledIcon
                    sx={{
                      color:
                        modelStatus === "running"
                          ? "text.disabled"
                          : "success.main",
                    }}
                  />
                </ActionIconButton>
              </span>
            </Tooltip>

            <Tooltip title="Остановить модель">
              <span>
                <ActionIconButton
                  onClick={handleStopModel}
                  colorvariant="error"
                  size="small"
                  disabled={modelStatus !== "running"}
                  aria-label="Остановить модель"
                >
                  <StopIcon
                    sx={{
                      color:
                        modelStatus === "running"
                          ? "error.main"
                          : "text.disabled",
                    }}
                  />
                </ActionIconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Divider />

        {/* Содержимое */}
        <DialogContent dividers>
          <Box sx={{ display: "flex", height: "100%", mt: 1 }}>
            {/* Левая часть - Выполнения */}
            <Box sx={{ flex: 1.4, mr: 2, overflow: "auto" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ textAlign: "center", mb: 2 }}
              >
                Выполнения
              </Typography>
              {executionsLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : executionsError ? (
                <Typography color="error">{executionsError}</Typography>
              ) : executions.length > 0 ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {/* Заголовки столбцов */}
                    <Grid
                      container
                      spacing={1}
                      sx={{
                        p: 1,
                        borderBottom: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Job Exec ID
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Создано
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Статус
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Начало
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Конец
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          GPU
                        </Typography>
                      </Grid>
                      {jobDetails.job_type !== "run" && (
                        <Grid item xs>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Health
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Действия
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {executions.map((execution) => (
                    <Grid
                      item
                      xs={12}
                      key={execution.job_execution_id}
                      style={{ paddingTop: "8px" }}
                    >
                      <Paper variant="outlined" sx={{ border: "none" }}>
                        <Grid
                          container
                          spacing={1}
                          alignItems="center"
                          sx={{
                            p: 0.5,
                            textAlign: "center",
                            borderBottom: "1px solid #ccc",
                            "& > .MuiGrid-item": {
                              paddingTop: 0,
                            },
                          }}
                        >
                          <Grid item xs>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography variant="body2">
                                {formatJobExecutionId(
                                  execution.job_execution_id
                                )}
                              </Typography>
                              <Tooltip title="Скопировать ID выполнения">
                                <IconButton
                                  onClick={() =>
                                    handleCopy(execution.job_execution_id)
                                  }
                                  size="small"
                                >
                                  <ContentCopyIcon
                                    fontSize="small"
                                    sx={{ fontSize: "1rem" }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {formatDateTime(execution.created_at)}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {execution.status}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {formatDateTime(execution.start_time)}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {formatDateTime(execution.end_time)}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2">
                              {execution.gpu_info?.type || "N/A"}
                            </Typography>
                          </Grid>
                          {jobDetails.job_type !== "run" && (
                            <Grid item xs>
                              <Typography variant="body2">
                                {execution.health_status || "N/A"}
                              </Typography>
                            </Grid>
                          )}
                          <Grid item xs>
                            {/* Кнопки действий */}
                            <TasksActions
                              job={execution}
                              onLogsClick={() => handleLogsClick(execution)}
                              onDownloadArtifacts={() =>
                                handleDownloadArtifacts(jobDetails, execution)
                              }
                              onStopClick={() => handleStopJob(execution)}
                              showStartButton={false}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography align="center" sx={{ mt: 2 }}>
                  Нет выполнений для этой задачи.
                </Typography>
              )}
            </Box>

            {/* Разделитель */}
            <Divider orientation="vertical" flexItem />

            {/* Правая часть - Конфигурация и события */}
            <Box sx={{ flex: 1, ml: 2, overflow: "auto" }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Button
                  variant={"outlined"}
                  onClick={() => setActiveTab("schedule")}
                  sx={{
                    mr: 1,
                    backgroundColor:
                      activeTab === "schedule" ? "#c0c0c5" : "#ececf1",
                  }}
                >
                  Расписание
                </Button>

                <Button
                  variant={"outlined"}
                  onClick={() => setActiveTab("config")}
                  sx={{
                    mr: 1,
                    backgroundColor:
                      activeTab === "config" ? "#c0c0c5" : "#ececf1",
                  }}
                >
                  Конфигурация
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setActiveTab("events")}
                  sx={{
                    backgroundColor:
                      activeTab === "events" ? "#c0c0c5" : "#ececf1",
                  }}
                >
                  События
                </Button>
              </Box>

              {activeTab === "config" && (
                <Box
                  sx={{
                    height: "500px",
                    overflow: "auto",
                    borderRadius: "10px",
                  }}
                >
                  {configLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "200px",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <SyntaxHighlighter
                      language="yaml"
                      style={coy}
                      showLineNumbers
                      customStyle={{ borderRadius: "10px" }}
                    >
                      {config}
                    </SyntaxHighlighter>
                  )}
                </Box>
              )}
              {activeTab === "schedule" && (
                <Box sx={{ height: "100%", overflow: "auto" }}>
                  <Typography>Нет расписаний для этой задачи.</Typography>

                  <Button variant="outlined" sx={{ mt: 2 }}>
                    Добавить расписание
                  </Button>
                </Box>
              )}

              {activeTab === "events" && <JobEvents jobId={job_id} />}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно с логами выполнения */}
      <Dialog
        open={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Логи: ${jobDetails.job_name}`}</DialogTitle>
        <DialogContent dividers>
          {logsLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Typography
              variant="body2"
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            >
              {currentLogs}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsModalOpen(false)}>Закрыть</Button>
          <Button onClick={() => handleCopy(currentLogs)}>
            Скопировать Логи
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно с логами сборки */}
      <Dialog
        open={buildLogsModalOpen}
        onClose={() => setBuildLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Build Логи: ${jobDetails.job_name}`}</DialogTitle>
        <DialogContent dividers>
          {buildLogsLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Typography
              variant="body2"
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            >
              {currentLogs}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuildLogsModalOpen(false)}>Закрыть</Button>
          <Button onClick={() => handleCopy(currentLogs)}>
            Скопировать Логи
          </Button>
        </DialogActions>
      </Dialog>

      {/* Оповещения */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={10000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ModelsDialog;
