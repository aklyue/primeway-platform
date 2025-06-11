// src/components/Tasks/Tasks.js

import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Snackbar,
  Alert,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  FiberManualRecord as FiberManualRecordIcon,
} from "@mui/icons-material";
import TasksDetailsDialog from "./TasksDetailsDialog";
import TasksActions from "./TasksActions";
import useTasks from "../../hooks/Tasks/useTasks";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import { Assignment } from "@mui/icons-material";

function Tasks() {
  const dispatch = useDispatch();

  const authToken = useSelector((state) => state.auth.authToken);
  const currentOrganization = useSelector(selectCurrentOrganization);

  const {
    // Селекторы, значения
    selectedJobType,
    selectedStatus,
    statusOptions,
    statusColors,
    isMobile,
    isTablet,
    isMinDesktop,
    jobTypeLoading,
    loading,
    jobs,
    detailsModalOpen,
    logsModalOpen,
    buildLogsModalOpen,
    executionsModalOpen,
    confirmDialogOpen,
    scheduleModalOpen,
    alertOpen,
    alertSeverity,
    alertMessage,
    currentJob,
    currentJobName,
    currentLogs,
    logsLoading,
    buildLogsLoading,
    executionsLoading,
    currentExecutions,
    logsByExecutionId,
    currentScheduleData,
    jobToStop,
    scheduleLoading,
    // Сеттеры
    setSelectedStatus,
    setDetailsModalOpen,
    setLogsModalOpen,
    setBuildLogsModalOpen,
    setExecutionsModalOpen,
    setConfirmDialogOpen,
    setScheduleModalOpen,
    setAlertOpen,
    // Обработчики и утилиты
    handleJobTypeChange,
    handleTaskClick,
    getStatusIndicator,
    formatJobId,
    handleCopy,
    formatDateTime,
    handleLogsClick,
    handleExecutionsClick,
    handleScheduleClick,
    handleBuildLogsClick,
    handleDownloadArtifacts,
    handleStopClick,
    handleExecutionLogsToggle,
    confirmStopJob,
    buildStatusColors,
  } = useTasks({
    authToken,
    currentOrganization,
    // statusOptions,
    // statusColors,
    // buildStatusColors,
  });

  return (
    <Box>
      {/* Заголовок страницы */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Assignment />
          <Typography ml={1} fontSize={"1.25rem"} fontWeight={500}>
            Задачи
          </Typography>
        </Box>
        <Box>
          <Button
            variant={"outlined"}
            onClick={() => handleJobTypeChange("deploy")}
            sx={{
              mr: 1,
              borderRadius: "12px",
              color: "secondary.main",
              fontWeight: "bold",
              textTransform: "uppercase",
              backgroundColor:
                selectedJobType === "deploy" ? "#c0d4d3" : "#e0f7fa",
            }}
          >
            Deploy
          </Button>
          <Button
            variant={"outlined"}
            sx={{
              borderRadius: "12px",
              fontWeight: "bold",
              color: "#10a37f",
              backgroundColor:
                selectedJobType === "run" ? "#c0d4d3" : "#e0f7fa",
              textTransform: "uppercase",
            }}
            onClick={() => handleJobTypeChange("run")}
          >
            Run
          </Button>
        </Box>
      </Box>
      {/* Кнопки фильтров статусов */}
      <Box sx={{ mb: 1, display: "flex", flexWrap: "wrap" }}>
        <Button
          key="all"
          variant={selectedStatus === "" ? "contained" : "outlined"}
          onClick={() => dispatch(setSelectedStatus(""))}
          size="small"
          sx={{
            borderRadius: "12px",
            fontSize: "12px",
            mr: 1,
            backgroundColor: selectedStatus === "" ? "#597ad3" : "inherit",
            color: selectedStatus === "" ? "white" : "#6c757d",
            "&:hover":
              selectedStatus === ""
                ? {
                    backgroundColor: "#7c97de",
                  }
                : undefined,
          }}
        >
          Все
        </Button>
        {statusOptions.map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "contained" : "outlined"}
            onClick={() => dispatch(setSelectedStatus(status))}
            size="small"
            sx={{
              borderRadius: "12px",
              fontSize: "12px",
              mr: 1,

              backgroundColor:
                selectedStatus === status ? "#597ad3" : "inherit",
              color: selectedStatus === status ? "white" : statusColors[status],
              "&:hover":
                selectedStatus === status
                  ? {
                      backgroundColor: "#7c97de",
                    }
                  : undefined,
            }}
          >
            {status}
          </Button>
        ))}
      </Box>

      {/* Основное содержимое */}
      <Box sx={{ p: 2, wordWrap: "break-word" }}>
        {jobTypeLoading ? (
          // Если идет загрузка при переключении типов задач, показываем спиннер на всю таблицу
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={isMobile ? 1 : 2}>
            {/* Заголовки столбцов */}
            {!(isMobile || isTablet) && (
              <Grid item xs={12}>
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  sx={{
                    p: 1,
                    borderBottom: "1px solid #ccc",
                    textAlign: "center",
                    display: isMobile ? "none" : "flex",
                  }}
                >
                  {/* Ваши заголовки */}
                  <Grid item xs={selectedJobType === "run" ? 1.7 : 1.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Имя
                    </Typography>
                  </Grid>
                  <Grid item xs={selectedJobType === "run" ? 1.7 : 1.3}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      ID
                    </Typography>
                  </Grid>
                  <Grid item xs={1.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Создана
                    </Typography>
                  </Grid>
                  <Grid item xs={selectedJobType === "run" ? 1.7 : 1.1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Статус образа
                    </Typography>
                  </Grid>
                  <Grid item xs={selectedJobType === "run" ? 1.7 : 1.4}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Начало
                    </Typography>
                  </Grid>
                  <Grid item xs={selectedJobType === "run" ? 1.7 : 1.1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Статус
                    </Typography>
                  </Grid>
                  {/* Дополнительные колонки для "deploy" */}
                  {selectedJobType === "deploy" && (
                    <>
                      <Grid item xs={2.2}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          URL
                        </Typography>
                      </Grid>
                      <Grid item xs={1.2}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Health
                        </Typography>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={selectedJobType === "run" ? 1.5 : 0.7}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Действия
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Если идет загрузка данных, показываем спиннер под заголовками */}
            {loading ? (
              <Grid item xs={12}>
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
              </Grid>
            ) : (
              <>
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <Grid
                      item
                      xs={12}
                      key={job.job_id || job.id}
                      style={{ paddingTop: "8px" }}
                    >
                      {isMobile || isTablet ? (
                        // Отображение в виде карточек на мобильных устройствах
                        <Card
                          onClick={() => handleTaskClick(job)}
                          sx={{
                            position: "relative",
                            cursor: "pointer",
                            backgroundColor: "background.paper",
                            borderRadius: "12px",
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <CardContent sx={{ position: "relative" }}>
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                              }}
                            >
                              {getStatusIndicator(job)}
                            </Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              {job.job_name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>ID:</strong> {formatJobId(job.job_id)}
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(job.job_id);
                                }}
                              >
                                <ContentCopyIcon
                                  fontSize="small"
                                  sx={{ fontSize: "1.1rem" }}
                                />
                              </IconButton>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>Создана:</strong>{" "}
                              {formatDateTime(job.created_at)}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>Статус образа:</strong>{" "}
                              <span
                                style={{
                                  color:
                                    buildStatusColors[job.build_status] ||
                                    "black",
                                }}
                              >
                                {job.build_status}
                              </span>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>Начало:</strong>{" "}
                              {job.last_execution_start_time
                                ? formatDateTime(job.last_execution_start_time)
                                : "N/A"}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Статус:</strong>{" "}
                              <span
                                style={{
                                  color:
                                    statusColors[job.last_execution_status] ||
                                    "black",
                                }}
                              >
                                {job.last_execution_status || "N/A"}
                              </span>
                            </Typography>
                            {/* Дополнительные поля для "deploy" */}
                            {selectedJobType === "deploy" && (
                              <>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  <strong>URL:</strong> {job.job_url || "N/A"}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  <strong>Health:</strong>{" "}
                                  {job.health_status || "N/A"}
                                </Typography>
                              </>
                            )}
                          </CardContent>
                          <CardActions>
                            <TasksActions
                              job={job}
                              onLogsClick={handleLogsClick}
                              onExecutionsClick={handleExecutionsClick}
                              onScheduleClick={handleScheduleClick}
                              onBuildLogsClick={handleBuildLogsClick}
                              onDownloadArtifacts={handleDownloadArtifacts}
                              onStopClick={handleStopClick}
                            />
                          </CardActions>
                        </Card>
                      ) : (
                        // Отображение в виде таблицы на больших экранах
                        <Box
                          onClick={() => handleTaskClick(job)}
                          sx={{
                            position: "relative",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          >
                            {getStatusIndicator(job)}
                          </Box>

                          <Paper variant="outlined" sx={{ border: "none" }}>
                            <Grid
                              container
                              spacing={1}
                              alignItems="center"
                              sx={{
                                textAlign: "center",
                                borderBottom: "1px solid #ccc",
                                p: 1,
                                cursor: "pointer",
                                position: "relative",
                                background: "rgba(0,0,0,0)",
                                transition: "background 0.2s",
                                "&:hover": {
                                  background: "rgba(0,0,0,0.08)",
                                },
                                "& > .MuiGrid-item": {
                                  paddingTop: 0,
                                },
                              }}
                            >
                              {/* Имя */}
                              <Grid
                                item
                                xs={selectedJobType === "run" ? 1.7 : 1.5}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "13px" }}
                                >
                                  {job.job_name}
                                </Typography>
                              </Grid>
                              {/* ID */}
                              <Grid
                                item
                                xs={selectedJobType === "run" ? 1.7 : 1.3}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography variant="body2">
                                    {formatJobId(job.job_id)}
                                  </Typography>
                                  <Tooltip title="Скопировать ID задачи">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(job.job_id);
                                      }}
                                    >
                                      <ContentCopyIcon
                                        fontSize="small"
                                        sx={{ fontSize: "1.1rem" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Grid>
                              {/* Создана */}
                              <Grid item xs={1.5}>
                                <Typography variant="body2">
                                  {formatDateTime(job.created_at)}
                                </Typography>
                              </Grid>
                              {/* Статус образа */}
                              <Grid
                                item
                                xs={selectedJobType === "run" ? 1.7 : 1.1}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color:
                                      buildStatusColors[job.build_status] ||
                                      "black",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {job.build_status}
                                </Typography>
                              </Grid>
                              {/* Начало */}
                              <Grid
                                item
                                xs={selectedJobType === "run" ? 1.7 : 1.4}
                              >
                                <Typography variant="body2">
                                  {job.last_execution_start_time
                                    ? formatDateTime(
                                        job.last_execution_start_time
                                      )
                                    : "N/A"}
                                </Typography>
                              </Grid>
                              {/* Статус */}
                              <Grid
                                item
                                xs={selectedJobType === "run" ? 1.7 : 1.1}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color:
                                      statusColors[job.last_execution_status] ||
                                      "black",
                                  }}
                                >
                                  {job.last_execution_status || "N/A"}
                                </Typography>
                              </Grid>
                              {/* Дополнительные колонки для "deploy" */}
                              {selectedJobType === "deploy" && (
                                <>
                                  <Grid item xs={2.2}>
                                    <Tooltip title={job.job_url || "N/A"} arrow>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontSize: job.job_url
                                            ? "11px"
                                            : "14px",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          maxWidth: "170px",
                                          mx: "auto",
                                          textAlign: "center",
                                          cursor: job.job_url
                                            ? "pointer"
                                            : "default",
                                          display: "block",
                                        }}
                                      >
                                        {job.job_url || "N/A"}
                                      </Typography>
                                    </Tooltip>
                                  </Grid>
                                  <Grid item xs={1.2}>
                                    <Typography variant="body2">
                                      {job.health_status || "N/A"}
                                    </Typography>
                                  </Grid>
                                </>
                              )}
                              {/* Действия */}
                              <Grid
                                item
                                xs={selectedJobType === "run" ? 1.5 : 0.7}
                              >
                                <TasksActions
                                  job={job}
                                  onLogsClick={handleLogsClick}
                                  onExecutionsClick={handleExecutionsClick}
                                  onScheduleClick={handleScheduleClick}
                                  onBuildLogsClick={handleBuildLogsClick}
                                  onDownloadArtifacts={handleDownloadArtifacts}
                                  onStopClick={handleStopClick}
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        </Box>
                      )}
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography align="center" sx={{ mt: 2 }}>
                      Нет доступных задач.
                    </Typography>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        )}
      </Box>
      {/* Компоненты модальных окон */}
      <TasksDetailsDialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        job={currentJob}
        getStatusIndicator={getStatusIndicator}
      />

      {/* Диалоговое окно логов */}
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
              // Копирование логов в буфер обмена
              handleCopy(currentLogs);
            }}
          >
            Скопировать Логи
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно логов сборки */}
      <Dialog
        open={buildLogsModalOpen}
        onClose={() => setBuildLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Логи сборки: ${currentJobName}`}</DialogTitle>
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
          <Button
            onClick={() => {
              // Копирование логов сборки в буфер обмена
              handleCopy(currentLogs);
            }}
          >
            Скопировать Логи
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно Выполнений */}
      <Dialog
        open={executionsModalOpen}
        onClose={() => setExecutionsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Выполнения задачи: ${currentJobName}`}</DialogTitle>
        <DialogContent dividers>
          {executionsLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : currentExecutions.length > 0 ? (
            // Отображаем список выполнений
            <Box>
              {currentExecutions.map((execution) => {
                const executionId =
                  execution.job_execution_id || execution.execution_id;
                const logsData = logsByExecutionId[executionId];
                return (
                  <Box key={executionId} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f0f0f0",
                          cursor: "pointer",
                        },
                        p: 1,
                        borderRadius: "5px",
                      }}
                      onClick={() => handleExecutionLogsToggle(execution)}
                    >
                      <Typography variant="body2">
                        <strong>ID выполнения:</strong> {executionId}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Статус:</strong> {execution.status}
                      </Typography>
                      {execution.created_at && (
                        <Typography variant="body2">
                          <strong>Создано:</strong>{" "}
                          {formatDateTime(execution.created_at)}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        <strong>Начало:</strong>{" "}
                        {execution.start_time
                          ? formatDateTime(execution.start_time)
                          : "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Окончание:</strong>{" "}
                        {execution.end_time
                          ? formatDateTime(execution.end_time)
                          : "N/A"}
                      </Typography>
                      {execution.gpu_info && (
                        <Typography variant="body2">
                          <strong>GPU:</strong> {execution.gpu_info.type} (
                          {execution.gpu_info.memory})
                        </Typography>
                      )}
                      {execution.health_status && (
                        <Typography variant="body2">
                          <strong>Состояние:</strong> {execution.health_status}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        sx={{ color: "gray", mt: 1 }}
                      >
                        Нажмите, чтобы увидеть логи выполнения
                      </Typography>
                    </Box>
                    {/* Отображение логов под выполнением */}
                    {logsData && (
                      <Box sx={{ pl: 2, mt: 1 }}>
                        {logsData.loading ? (
                          <CircularProgress size={24} />
                        ) : (
                          <Typography
                            variant="body2"
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            {logsData.logs}
                          </Typography>
                        )}
                      </Box>
                    )}
                    <Box
                      sx={{
                        borderBottom: "1px solid #ccc",
                        mt: 1,
                        mb: 1,
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography>Нет доступных выполнений для этой задачи.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecutionsModalOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения остановки */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Подтверждение остановки</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите остановить задачу "{jobToStop?.job_name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Отмена</Button>
          <Button onClick={confirmStopJob} color="secondary">
            Остановить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно Расписания */}
      <Dialog
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Расписание задачи: ${currentJobName}`}</DialogTitle>
        <DialogContent dividers>
          {scheduleLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : currentScheduleData ? (
            <Box>
              <Typography variant="body1">
                <strong>Начало:</strong>{" "}
                {formatDateTime(currentScheduleData.start_date)}
              </Typography>
              <Typography variant="body1">
                <strong>Конец:</strong>{" "}
                {formatDateTime(currentScheduleData.end_date)}
              </Typography>
              <Typography variant="body1">
                <strong>Дни недели:</strong>{" "}
                {currentScheduleData.days_of_week.join(", ")}
              </Typography>
              {/* Добавьте отображение других данных расписания по необходимости */}
            </Box>
          ) : (
            <Typography>Информация о расписании недоступна.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleModalOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
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
    </Box>
  );
}

export default Tasks;
