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
  TextField,
  Divider,
  Stack,
  DialogTitle,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  BugReport as BugReportIcon,
} from "@mui/icons-material";
import { format, parseISO, isValid } from "date-fns";
import axiosInstance from "../../api"; // Импортируем axiosInstance
import TasksActions from "./TasksActions"; // Импортируем кнопки из TasksActions
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale";
import yaml from "js-yaml";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism";
import JobDetailsDialogMobile from "./JobDetailsDialogMobile";
import { useTheme } from "@mui/material/styles";
import JobEvents from "./JobEvents";
import useTasksDetailsDialog from "../../hooks/Tasks/useTasksDetailsDialog";
import { Job, TimeWindow } from "../../types";
import { ReactNode } from "react";
const statusColors = {
  success: "#28a745", // зеленый
  failed: "#dc3545", // красный
  building: "#007bff", // синий
};

interface JobDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  job: Job;
  getStatusIndicator: (job: Job) => ReactNode;
}

function JobDetailsDialog({
  open,
  onClose,
  job,
  getStatusIndicator,
}: JobDetailsDialogProps) {
  const {
    isMobile,
    isTablet,
    jobWithConfig,
    formatDateTime,
    handleBuildLogsClick,
    handleCopy,
    handleCardStopClick,
    executionsLoading,
    executionsError,
    executions,
    formatJobExecutionId,
    handleLogsClick,
    handleDownloadArtifacts,
    handleStopClick,
    setActiveTab,
    activeTab,
    schedulesLoading,
    schedulesError,
    schedules,
    renderScheduleDetails,
    handleEditSchedule,
    handleDeleteSchedule,
    handleAddSchedule,
    configLoading,
    config,
    scheduleFormOpen,
    handleScheduleFormClose,
    isEditingSchedule,
    handleScheduleFormSubmit,
    editedSchedule,
    setEditedSchedule,
    addWorkdayWindow,
    newSchedule,
    setNewSchedule,
    removeWorkdayWindow,
    addWeekendWindow,
    removeWeekendWindow,
    handleAddSpecificDay,
    handleSpecificDayChange,
    handleRemoveSpecificDay,
    handleSpecificDayWindowsChange,
    logsModalOpen,
    setLogsModalOpen,
    currentJobName,
    logsLoading,
    currentLogs,
    buildLogsModalOpen,
    setBuildLogsModalOpen,
    buildLogsLoading,
    alertOpen,
    setAlertOpen,
    alertSeverity,
    alertMessage,
  } = useTasksDetailsDialog({
    open,
    job,
  });

  // Проверка наличия задания
  if (!job) {
    return null;
  }

  if (isMobile) {
    // Если устройство мобильное, отображаем JobDetailsDialogMobile
    return (
      <JobDetailsDialogMobile
        open={open}
        onClose={onClose}
        job={job}
        getStatusIndicator={getStatusIndicator}
      />
    );
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
            height: "90vh",
            borderRadius: "15px",
          },
        }}
        BackdropProps={{
          sx: {
            zIndex: 0,
            cursor: "pointer",
            "&:hover": {
              background: "rgba(0, 0, 0, 0.48)", // Сделать фон светлее при наведении
            },
          },
        }}
      >
        {/* Заголовок и информация о задаче */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-around",
            position: "relative",
            flexWrap: isTablet ? "wrap" : "nowrap",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 7,
              left: 8,
            }}
          >
            {getStatusIndicator(jobWithConfig)}
          </Box>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ width: "100%" }}
          >
            {/* Название задачи */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                {job.job_name}
              </Typography>
            </Box>
            <Box
              sx={{
                height: "2px",
                flexGrow: 1,
                minWidth: "3px", // Минимальная ширина, чтобы полоска не исчезала на маленьких экранах
                borderRadius: "5px",
                bgcolor: "black",
              }}
            />
            {/* Тип задачи */}
            <Box>
              <Typography
                variant="body1"
                sx={{
                  textTransform: "uppercase",
                  color: job.job_type === "run" ? "#10a37f" : "secondary.main",
                }}
              >
                <strong>{job.job_type}</strong>
              </Typography>
            </Box>
            <Box
              sx={{
                height: "2px",
                flexGrow: 1,
                minWidth: "3px", // Минимальная ширина, чтобы полоска не исчезала на маленьких экранах
                borderRadius: "5px",
                bgcolor: "black",
              }}
            />
            {/* Дата создания */}
            <Box>
              <Typography variant="body1">
                <strong>
                  {job.created_at && formatDateTime(job.created_at)}
                </strong>
              </Typography>
            </Box>
            <Box
              sx={{
                height: "2px",
                flexGrow: 1,
                minWidth: "3px",
                borderRadius: "5px",
                bgcolor: "black",
              }}
            />
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color:
                    statusColors[
                      job.build_status as keyof typeof statusColors
                    ] || "black",
                }}
              >
                <strong>{job.build_status}</strong>
              </Typography>
            </Box>
            <Box
              sx={{
                height: "2px",
                flexGrow: 1,
                minWidth: "3px", // Минимальная ширина, чтобы полоска не исчезала на маленьких экранах
                borderRadius: "5px",
                bgcolor: "black",
              }}
            />
            <Button
              sx={{
                border: "1px solid rgba(0,0,0,0.3)",
                borderRadius: "12px",
                padding: "4px 7px",
              }}
              startIcon={isTablet ? "" : <BugReportIcon />}
              onClick={handleBuildLogsClick}
            >
              {isTablet ? <BugReportIcon /> : "Build Логи"}
            </Button>
            {job.job_type === "deploy" && job.job_url && (
              <>
                <Box
                  sx={{
                    height: "2px",
                    flexGrow: 1,
                    minWidth: "3px", // Минимальная ширина, чтобы полоска не исчезала на маленьких экранах
                    borderRadius: "5px",
                    bgcolor: "black",
                  }}
                />
                <Tooltip title="Скопировать URL">
                  <Typography
                    variant="body2"
                    sx={{
                      marginLeft: 2,
                      padding: "3px 8px",
                      borderRadius: "12px",
                      border: "1px solid #5282ff",
                      backgroundColor: "none",
                      color: "secondary.main",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        backgroundColor: "#8fa8ea",
                        color: "white",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(job.job_url);
                    }}
                  >
                    {isTablet ? "URL" : job.job_url}
                  </Typography>
                </Tooltip>
              </>
            )}
          </Stack>

          {/* Кнопки */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TasksActions
                job={jobWithConfig}
                onLogsClick={() => {}}
                onBuildLogsClick={() => {}}
                onDownloadArtifacts={() => {}}
                onStopClick={handleCardStopClick}
                showStartButton={false}
                showLogsArtButton={false}
                displayMode="buttons"
                showAlert={(message: string) => {
                  window.alert(message);
                }}
              />
            </Box>
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
                isTablet ? (
                  // Рендеринг карточек для планшетов
                  <Grid container spacing={2}>
                    {executions.map((execution) => (
                      <Grid
                        item
                        xs={12}
                        key={execution.job_execution_id}
                        style={{ paddingTop: "8px" }}
                      >
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="subtitle1">
                              Job Exec ID:{" "}
                              {execution.job_execution_id &&
                                formatJobExecutionId(
                                  execution.job_execution_id
                                )}
                            </Typography>
                            <Tooltip title="Скопировать ID выполнения">
                              <IconButton
                                onClick={() =>
                                  execution.job_execution_id &&
                                  handleCopy(execution.job_execution_id)
                                }
                                size="small"
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Typography variant="body2">
                            <strong>Создано:</strong>{" "}
                            {execution.created_at &&
                              formatDateTime(execution.created_at)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Статус:</strong> {execution.status}
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
                          {/* Кнопки действий */}
                          <Box sx={{ mt: 2 }}>
                            <TasksActions
                              job={execution}
                              onLogsClick={() => handleLogsClick(execution)}
                              onDownloadArtifacts={() =>
                                handleDownloadArtifacts(job, execution)
                              }
                              showAlert={(message: string) => {
                                window.alert(message);
                              }}
                              onBuildLogsClick={() => {}}
                              showLogsArtButton={false}
                              onStopClick={() => handleStopClick(execution)}
                              showStartButton={false}
                              displayMode="buttons"
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  // Рендеринг таблицы для десктопа
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
                        {job.job_type !== "run" && (
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
                                  {execution.job_execution_id &&
                                    formatJobExecutionId(
                                      execution.job_execution_id
                                    )}
                                </Typography>
                                <Tooltip title="Скопировать ID выполнения">
                                  <IconButton
                                    onClick={() =>
                                      execution.job_execution_id &&
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
                                {execution.created_at &&
                                  formatDateTime(execution.created_at)}
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
                            {job.job_type !== "run" && (
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
                                  handleDownloadArtifacts(job, execution)
                                }
                                onStopClick={() => handleStopClick(execution)}
                                showStartButton={false}
                                showLogsArtButton={false}
                                onBuildLogsClick={() => {}}
                                showAlert={(message: string) => {
                                  window.alert(message);
                                }}
                                displayMode={"buttons"}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )
              ) : (
                <Typography align="center" sx={{ mt: 2 }}>
                  Нет выполнений для этой задачи.
                </Typography>
              )}
            </Box>

            {/* Разделитель */}
            <Divider orientation="vertical" flexItem />

            {/* Правая часть - Переключение между расписанием и конфигурацией */}
            <Box sx={{ flex: isTablet ? 0.4 : 0.7, ml: 2 }}>
              {/* Переключатель вкладок */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Button
                  data-testid="tab-schedule"
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

              {/* Отображаем расписание или конфигурацию */}
              {activeTab === "schedule" && (
                <Box sx={{ height: "100%", overflow: "auto" }}>
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
                  ) : schedules.length > 0 ? (
                    <List
                      dense={true}
                      sx={{ maxHeight: "510px", overflow: "auto" }}
                    >
                      {schedules.map((schedule) => (
                        <ListItem key={schedule.schedule_id}>
                          <ListItemText
                            secondary={renderScheduleDetails(schedule)}
                            secondaryTypographyProps={{ component: "div" }}
                          />
                          {/* Кнопки действий */}
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
                                schedule.schedule_id &&
                                handleDeleteSchedule(schedule.schedule_id)
                              }
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>Нет расписаний для этой задачи.</Typography>
                  )}
                  <Button
                    variant="outlined"
                    onClick={handleAddSchedule}
                    sx={{ mt: 2 }}
                  >
                    Добавить расписание
                  </Button>
                </Box>
              )}

              {activeTab === "config" && (
                <Box
                  sx={{
                    maxWidth: "500px",
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
              {activeTab === "events" && <JobEvents jobId={job.job_id} />}
            </Box>
          </Box>
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
          {/* Форма расписания */}
          {isEditingSchedule ? (
            // Форма редактирования расписания
            <>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="schedule-type-label">Тип расписания</InputLabel>
                <Select
                  labelId="schedule-type-label"
                  label="Тип расписания"
                  value={editedSchedule?.schedule_type ?? ""}
                  onChange={(e) =>
                    setEditedSchedule((prev) => ({
                      ...prev,
                      schedule_type: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="DAILY">Ежедневно</MenuItem>
                  <MenuItem value="WEEKLY">Еженедельно</MenuItem>
                  <MenuItem value="ONCE">Однократно</MenuItem>
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Время начала"
                  value={
                    editedSchedule?.start_time
                      ? new Date(`1970-01-01T${editedSchedule?.start_time}`)
                      : null
                  }
                  onChange={(time) => {
                    if (time && isValid(time)) {
                      const hours = time.getHours().toString().padStart(2, "0");
                      const minutes = time
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                      const formattedTime = `${hours}:${minutes}:00`;
                      setEditedSchedule((prev) => ({
                        ...prev,
                        start_time: formattedTime,
                      }));
                    } else {
                      setEditedSchedule((prev) => ({
                        ...prev,
                        start_time: "",
                      }));
                    }
                  }}
                />
                <TimePicker
                  label="Время окончания"
                  value={
                    editedSchedule?.end_time
                      ? new Date(`1970-01-01T${editedSchedule?.end_time}`)
                      : null
                  }
                  onChange={(time) => {
                    if (time && isValid(time)) {
                      const hours = time.getHours().toString().padStart(2, "0");
                      const minutes = time
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                      const formattedTime = `${hours}:${minutes}:00`;
                      setEditedSchedule((prev) => ({
                        ...prev,
                        end_time: formattedTime,
                      }));
                    } else {
                      setEditedSchedule((prev) => ({
                        ...prev,
                        end_time: "",
                      }));
                    }
                  }}
                />
              </LocalizationProvider>

              {editedSchedule?.schedule_type === "WEEKLY" && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="day-of-week-label">День недели</InputLabel>
                  <Select
                    labelId="day-of-week-label"
                    label="День недели"
                    value={editedSchedule?.day_of_week || ""}
                    onChange={(e) =>
                      setEditedSchedule((prev) => ({
                        ...prev,
                        day_of_week: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="MONDAY">Понедельник</MenuItem>
                    <MenuItem value="TUESDAY">Вторник</MenuItem>
                    <MenuItem value="WEDNESDAY">Среда</MenuItem>
                    <MenuItem value="THURSDAY">Четверг</MenuItem>
                    <MenuItem value="FRIDAY">Пятница</MenuItem>
                    <MenuItem value="SATURDAY">Суббота</MenuItem>
                    <MenuItem value="SUNDAY">Воскресенье</MenuItem>
                  </Select>
                </FormControl>
              )}
            </>
          ) : (
            // Форма добавления нового расписания
            <>
              {/* Рабочие дни */}
              <Typography variant="h6" sx={{ mt: 2 }}>
                Рабочие дни:
              </Typography>
              <Button onClick={addWorkdayWindow} sx={{ mt: 1 }}>
                Добавить временное окно
              </Button>
              {newSchedule.workdays.map((window, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", mt: 1 }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Начало"
                      value={
                        window.start
                          ? new Date(`1970-01-01T${window.start}`)
                          : null
                      }
                      onChange={(time) => {
                        if (time && isValid(time)) {
                          const hours = time
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          const formattedTime = `${hours}:${minutes}:00`;
                          const updatedWorkdays = [...newSchedule.workdays];
                          updatedWorkdays[index].start = formattedTime;
                          setNewSchedule((prev) => ({
                            ...prev,
                            workdays: updatedWorkdays,
                          }));
                        } else {
                          const updatedWorkdays = [...newSchedule.workdays];
                          updatedWorkdays[index].start = "";
                          setNewSchedule((prev) => ({
                            ...prev,
                            workdays: updatedWorkdays,
                          }));
                        }
                      }}
                    />
                    <TimePicker
                      label="Конец"
                      value={
                        window.end ? new Date(`1970-01-01T${window.end}`) : null
                      }
                      onChange={(time) => {
                        if (time && isValid(time)) {
                          const hours = time
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          const formattedTime = `${hours}:${minutes}:00`;
                          const updatedWorkdays = [...newSchedule.workdays];
                          updatedWorkdays[index].end = formattedTime;
                          setNewSchedule((prev) => ({
                            ...prev,
                            workdays: updatedWorkdays,
                          }));
                        } else {
                          const updatedWorkdays = [...newSchedule.workdays];
                          updatedWorkdays[index].end = "";
                          setNewSchedule((prev) => ({
                            ...prev,
                            workdays: updatedWorkdays,
                          }));
                        }
                      }}
                    />
                  </LocalizationProvider>
                  <IconButton onClick={() => removeWorkdayWindow(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              {/* Выходные дни */}
              <Typography variant="h6" sx={{ mt: 2 }}>
                Выходные дни:
              </Typography>
              <Button onClick={addWeekendWindow} sx={{ mt: 1 }}>
                Добавить временное окно
              </Button>
              {newSchedule.weekends.map((window, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", mt: 1 }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Начало"
                      value={
                        window.start
                          ? new Date(`1970-01-01T${window.start}`)
                          : null
                      }
                      onChange={(time) => {
                        if (time && isValid(time)) {
                          const hours = time
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          const formattedTime = `${hours}:${minutes}:00`;
                          const updatedWeekends = [...newSchedule.weekends];
                          updatedWeekends[index].start = formattedTime;
                          setNewSchedule((prev) => ({
                            ...prev,
                            weekends: updatedWeekends,
                          }));
                        } else {
                          const updatedWeekends = [...newSchedule.weekends];
                          updatedWeekends[index].start = "";
                          setNewSchedule((prev) => ({
                            ...prev,
                            weekends: updatedWeekends,
                          }));
                        }
                      }}
                    />
                    <TimePicker
                      label="Конец"
                      value={
                        window.end ? new Date(`1970-01-01T${window.end}`) : null
                      }
                      onChange={(time) => {
                        if (time && isValid(time)) {
                          const hours = time
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          const formattedTime = `${hours}:${minutes}:00`;
                          const updatedWeekends = [...newSchedule.weekends];
                          updatedWeekends[index].end = formattedTime;
                          setNewSchedule((prev) => ({
                            ...prev,
                            weekends: updatedWeekends,
                          }));
                        } else {
                          const updatedWeekends = [...newSchedule.weekends];
                          updatedWeekends[index].end = "";
                          setNewSchedule((prev) => ({
                            ...prev,
                            weekends: updatedWeekends,
                          }));
                        }
                      }}
                    />
                  </LocalizationProvider>
                  <IconButton onClick={() => removeWeekendWindow(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              {/* Конкретные даты */}
              <Typography variant="h6" sx={{ mt: 2 }}>
                Конкретные даты:
              </Typography>
              <Button onClick={handleAddSpecificDay} sx={{ mt: 1 }}>
                Добавить дату
              </Button>
              {newSchedule.specific_days.map((day, index) => (
                <Box key={index} sx={{ mt: 1, border: "1px solid #ccc", p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                      label="День (например, 'friday' или '2023-12-31')"
                      value={day.date}
                      onChange={(e) =>
                        handleSpecificDayChange(index, "date", e.target.value)
                      }
                      fullWidth
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => handleRemoveSpecificDay(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    Временные окна:
                  </Typography>
                  {day.time_windows.map(
                    (window: TimeWindow, wIndex: number) => (
                      <Box
                        key={wIndex}
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <TimePicker
                            label="Начало"
                            value={
                              window.start
                                ? new Date(`1970-01-01T${window.start}`)
                                : null
                            }
                            onChange={(time) => {
                              if (time && isValid(time)) {
                                const hours = time
                                  .getHours()
                                  .toString()
                                  .padStart(2, "0");
                                const minutes = time
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, "0");
                                const formattedTime = `${hours}:${minutes}:00`;
                                const updatedWindows = [...day.time_windows];
                                updatedWindows[wIndex].start = formattedTime;
                                handleSpecificDayWindowsChange(
                                  index,
                                  updatedWindows
                                );
                              } else {
                                const updatedWindows = [...day.time_windows];
                                updatedWindows[wIndex].start = "";
                                handleSpecificDayWindowsChange(
                                  index,
                                  updatedWindows
                                );
                              }
                            }}
                          />
                          <TimePicker
                            label="Конец"
                            value={
                              window.end
                                ? new Date(`1970-01-01T${window.end}`)
                                : null
                            }
                            onChange={(time) => {
                              if (time && isValid(time)) {
                                const hours = time
                                  .getHours()
                                  .toString()
                                  .padStart(2, "0");
                                const minutes = time
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, "0");
                                const formattedTime = `${hours}:${minutes}:00`;
                                const updatedWindows = [...day.time_windows];
                                updatedWindows[wIndex].end = formattedTime;
                                handleSpecificDayWindowsChange(
                                  index,
                                  updatedWindows
                                );
                              } else {
                                const updatedWindows = [...day.time_windows];
                                updatedWindows[wIndex].end = "";
                                handleSpecificDayWindowsChange(
                                  index,
                                  updatedWindows
                                );
                              }
                            }}
                          />
                        </LocalizationProvider>
                        <IconButton
                          onClick={() => {
                            const updatedWindows = [...day.time_windows];
                            updatedWindows.splice(wIndex, 1);
                            handleSpecificDayWindowsChange(
                              index,
                              updatedWindows
                            );
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )
                  )}
                  <Button
                    onClick={() => {
                      const updatedWindows = [
                        ...day.time_windows,
                        { start: "", end: "" },
                      ];
                      handleSpecificDayWindowsChange(index, updatedWindows);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Добавить временное окно
                  </Button>
                </Box>
              ))}
            </>
          )}
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

      {/* Диалоговое окно с логами сборки */}
      <Dialog
        open={buildLogsModalOpen}
        onClose={() => setBuildLogsModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{`Build Логи: ${currentJobName}`}</DialogTitle>
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

export default JobDetailsDialog;
