import React, { useState, useEffect, useRef } from "react";
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
  Stack,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  DialogTitle,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  BugReport as BugReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { format, parseISO, isValid } from "date-fns";
import axiosInstance from "../../api";
import TasksActions from "../Tasks/TasksActions";
import { ru } from "date-fns/locale";
import yaml from "js-yaml";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import useJobDetailsDialogMobile from "../../hooks/Tasks/useJobDetailsDialogMobile";

const statusColors = {
  success: "#28a745",
  failed: "#dc3545",
  building: "#007bff",
};

function JobDetailsDialogMobile({ open, onClose, job, getStatusIndicator }) {
  // Состояния компонента

  const {
    formatDateTime,
    handleStopClick,
    handleStartClick,
    activeTab,
    setActiveTab,
    executionsLoading,
    executionsError,
    executions,
    formatJobExecutionId,
    handleLogsClick,
    handleDownloadArtifacts,
    schedulesLoading,
    schedulesError,
    schedules,
    renderScheduleDetails,
    handleEditSchedule,
    handleDeleteSchedule,
    handleAddSchedule,
    configLoading,
    config,
    eventsLoading,
    eventsError,
    events,
    scheduleFormOpen,
    handleScheduleFormClose,
    isEditingSchedule,
    handleScheduleFormSubmit,
    logsModalOpen,
    setLogsModalOpen,
    currentJobName,
    logsLoading,
    currentLogs,
    alertOpen,
    setAlertOpen,
    alertSeverity,
    alertMessage,
    handleCopy,
  } = useJobDetailsDialogMobile({
    open,
    onClose,
    job,
    getStatusIndicator,
  });

  if (!job) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        scroll="paper"
        PaperProps={{
          style: {
            borderRadius: 0,
          },
        }}
      >
        {/* Заголовок и информация о задаче */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            position: "relative",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
            }}
          >
            {getStatusIndicator(job)}
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            {job.job_name}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              textTransform: "uppercase",
              textAlign: "center",
              color: "gray",
            }}
          >
            {job.job_type}
          </Typography>
          <Typography
            variant="caption"
            sx={{ textAlign: "center", color: "gray" }}
          >
            Создано: {formatDateTime(job.created_at)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: statusColors[job.build_status] || "black",
              textAlign: "center",
              mt: 1,
            }}
          >
            Статус сборки: {job.build_status}
          </Typography>

          {/* Кнопки управления */}
          <Box sx={{ mt: 2 }}>
            <TasksActions
              job={job}
              onStopClick={(job) => handleStopClick(job)}
              onStartClick={(job) => handleStartClick(job)}
              displayMode="buttons"
            />
          </Box>
        </Box>

        {/* Вкладки */}
        <Tabs
          value={activeTab}
          onChange={(e, value) => setActiveTab(value)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ backgroundColor: "#fafafa" }}
        >
          <Tab label="Выполнения" value="executions" />
          <Tab label="Расписание" value="schedule" />
          <Tab label="Конфиг" value="config" />
          <Tab label="События" value="events" />
        </Tabs>

        <Divider />

        {/* Содержимое */}
        <DialogContent dividers>
          {activeTab === "executions" && (
            <Box sx={{ mt: 2 }}>
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
                  {executions.map((execution) => (
                    <Grid item xs={12} key={execution.job_execution_id}>
                      <Paper variant="outlined" sx={{ p: 2, pt: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box>
                            ID:{" "}
                            {formatJobExecutionId(execution.job_execution_id)}
                          </Box>
                          {/* Кнопки действий */}
                          <Box sx={{ mt: 1 }}>
                            <TasksActions
                              job={job}
                              onLogsClick={() => handleLogsClick(execution)}
                              onDownloadArtifacts={() =>
                                handleDownloadArtifacts(job, execution)
                              }
                              onStopClick={() =>
                                handleStopClick(execution.job_execution_id)
                              }
                              showStartButton={false}
                            />
                          </Box>
                        </Typography>
                        <Typography variant="body2">
                          <strong>Статус:</strong> {execution.status}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Создано:</strong>{" "}
                          {formatDateTime(execution.created_at)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Начало:</strong>{" "}
                          {formatDateTime(execution.start_time)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Конец:</strong>{" "}
                          {formatDateTime(execution.end_time)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>GPU:</strong>{" "}
                          {execution.gpu_info?.type || "N/A"}
                        </Typography>
                        {job.job_type !== "run" && (
                          <Typography variant="body2">
                            <strong>Health:</strong>{" "}
                            {execution.health_status || "N/A"}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography>Нет выполнений для этой задачи.</Typography>
              )}
            </Box>
          )}

          {activeTab === "schedule" && (
            <Box sx={{ mt: 2 }}>
              {schedulesLoading ? (
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
              ) : schedulesError ? (
                <Typography color="error">{schedulesError}</Typography>
              ) : (
                <>
                  {schedules.length > 0 ? (
                    <List>
                      {schedules.map((schedule) => (
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, mb: 2 }}
                          key={schedule.schedule_id}
                        >
                          {renderScheduleDetails(schedule)}
                          {/* Кнопки действий */}
                          <Box sx={{ mt: 1, display: "flex" }}>
                            <Tooltip title="Редактировать расписание">
                              <IconButton
                                onClick={() => handleEditSchedule(schedule)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить расписание">
                              <IconButton
                                onClick={() =>
                                  handleDeleteSchedule(schedule.schedule_id)
                                }
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Typography>Нет расписаний для этой задачи.</Typography>
                  )}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleAddSchedule}
                    sx={{ mt: 2 }}
                  >
                    Добавить расписание
                  </Button>
                </>
              )}
            </Box>
          )}

          {activeTab === "config" && (
            <Box sx={{ mt: 2 }}>
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
                  customStyle={{
                    borderRadius: "10px",
                    maxHeight: "400px",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  {config}
                </SyntaxHighlighter>
              )}
            </Box>
          )}

          {activeTab === "events" && (
            <Box sx={{ mt: 2 }}>
              {eventsLoading ? (
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
              ) : eventsError ? (
                <Typography color="error">{eventsError}</Typography>
              ) : (
                <>
                  {Object.keys(events).length > 0 ? (
                    <List>
                      {Object.entries(events).map(([dateTime, log], index) => (
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, mb: 2 }}
                          key={index}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {formatDateTime(dateTime)}
                          </Typography>
                          <Typography variant="body2">{log}</Typography>
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Typography>Событий нет.</Typography>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно с формой расписания */}
      <Dialog
        open={scheduleFormOpen}
        onClose={handleScheduleFormClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditingSchedule
            ? "Редактировать расписание"
            : "Добавить новое расписание"}
        </DialogTitle>
        <DialogContent>
          {/* Здесь размещается форма для добавления или редактирования расписания */}
          {/* Форма аналогична той, что в десктопной версии, но адаптирована для мобильного интерфейса */}
          {/* Добавьте здесь компоненты формы для ввода расписания */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleFormClose}>Отмена</Button>
          <Button onClick={handleScheduleFormSubmit}>
            {isEditingSchedule ? "Сохранить" : "Добавить"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно с логами */}
      <Dialog
        open={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Логи: ${currentJobName}`}</DialogTitle>
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
          <Button
            onClick={() => {
              handleCopy(currentLogs);
            }}
          >
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

export default JobDetailsDialogMobile;
