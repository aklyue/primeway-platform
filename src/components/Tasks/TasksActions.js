import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Stack,
  styled,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  BugReport as BugReportIcon,
  Download as DownloadIcon,
  Stop as StopIcon,
  PlayCircleFilled as PlayCircleFilledIcon,
} from "@mui/icons-material";
import axiosInstance from "../../api";
import StartJobDialog from "./StartJobDialog";

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    minWidth: "200px",
    marginTop: theme.spacing(1),
    "& .MuiMenuItem-root": {
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
        transform: "translateX(4px)",
      },
      "& .MuiListItemIcon-root": {
        minWidth: "36px",
      },
    },
  },
}));

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

function TasksActions({
  job,
  onLogsClick,
  onBuildLogsClick,
  onDownloadArtifacts,
  onStopClick,
  // onStartClick, // Убираем этот проп
  showStartButton = true,
  showLogsArtButton = true,
  displayMode = "menu",
  showAlert,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [jobWithConfig, setJobWithConfig] = useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => (event) => {
    event.stopPropagation();
    action(job);
    handleMenuClose();
  };
  const status = job.status || job.last_execution_status;

  const canStopJob = status === "creating" || status === "running";

  const allowedLastExecutionStatuses = [
    "stopped",
    "terminated",
    "completed",
    "failed",
  ];

  const canStartJob =
    job.build_status === "success" &&
    (!status || allowedLastExecutionStatuses.includes(status));

  const canViewLogs =
    job.build_status === "success" ||
    "stopped" ||
    ("failed" &&
      !["pending", "provisioning", "creating"].includes(
        job.last_execution_status
      ));

  const stopButtonDisabledReason = canStopJob
    ? ""
    : "Задача не запущена и не может быть остановлена.";

  const startButtonDisabledReason = canStartJob
    ? ""
    : "Задачу можно запустить только если статус образа 'success' и последнее выполнение отсутствует или завершилось.";

  const logsButtonDisabledReason = canViewLogs
    ? ""
    : "Логи недоступны, так как задача не завершена.";

  const menuIconStyle = {
    color: "inherit",
    fontSize: "1.1rem",
  };

  const handleStartClick = (event) => {
    event.stopPropagation();

    const allowedJobTypes = ["run", "deploy"];

    if (!allowedJobTypes.includes(job.job_type)) {
      if (showAlert) {
        showAlert("Эту задачу нельзя запустить из интерфейса.", "error");
      }
      return;
    }

    if (job.job_type === "run") {
      // Обрабатываем задачи типа "run"
      axiosInstance
        .get("/jobs/get-config", { params: { job_id: job.job_id } })
        .then((response) => {
          const config = response.data;
          const hasRequestInputDir = config?.request_input_dir;

          const updatedJob = { ...job, config };
          setJobWithConfig(updatedJob);

          if (hasRequestInputDir) {
            setStartDialogOpen(true);
          } else {
            // Запускаем задачу без файла
            startJob(updatedJob);
          }
        })
        .catch((error) => {
          console.error("Ошибка при получении конфигурации задачи:", error);
          if (showAlert) {
            showAlert("Ошибка при получении конфигурации задачи.", "error");
          }
        });
    } else {
      // Для задач типа "deploy" запускаем задачу напрямую
      startJob(job);
    }
  };

  const startJob = (job, files = []) => {
    let data;
    let headers = {};

    // Получаем токен из локального хранилища или контекста аутентификации
    const token = localStorage.getItem("access_token"); // Или другой способ получения токена
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (files.length > 0) {
      const formData = new FormData();
      formData.append("file", files[0]);

      // Выводим содержимое FormData
      console.log("Содержимое FormData:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      data = formData;
      // Не устанавливаем Content-Type для FormData
    } else {
      // Если файлов нет, отправляем пустое тело
      data = {};
      // Устанавливаем Content-Type в application/json
      headers["Content-Type"] = "application/json";
    }

    axiosInstance
      .post("/jobs/job-start", data, {
        headers: headers,
        params: {
          job_id: job.job_id,
        },
      })
      .then((response) => {
        console.log("Задача успешно запущена");
        // Здесь вы можете обновить список задач или показать уведомление
      })
      .catch((error) => {
        if (showAlert) {
          showAlert("Ошибка при запуске задачи.", error);
        }
        if (error.response) {
          console.error("Данные ответа ошибки:", error.response.data);
          console.error("Статус ответа ошибки:", error.response.status);
          console.error("Заголовки ответа ошибки:", error.response.headers);
        } else if (error.request) {
          console.error(
            "Запрос был отправлен, но ответа не получено:",
            error.request
          );
        } else {
          console.error(
            "Произошла ошибка при настройке запроса:",
            error.message
          );
        }
      });
  };

  return displayMode === "buttons" ? (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Кнопка "Остановить задачу" */}
        <Tooltip title={stopButtonDisabledReason}>
          <span>
            <ActionIconButton
              onClick={(e) => {
                e.stopPropagation();
                onStopClick(job);
              }}
              colorvariant="error"
              size="small"
              disabled={!canStopJob}
              aria-label="Остановить задачу"
            >
              <StopIcon
                sx={{ color: canStopJob ? "error.main" : "text.disabled" }}
              />
            </ActionIconButton>
          </span>
        </Tooltip>

        {showStartButton && (
          <Tooltip title={startButtonDisabledReason}>
            <span>
              <ActionIconButton
                onClick={handleStartClick}
                colorvariant="success"
                size="small"
                disabled={!canStartJob}
                aria-label="Запустить задачу"
              >
                <PlayCircleFilledIcon
                  sx={{ color: canStartJob ? "success.main" : "text.disabled" }}
                />
              </ActionIconButton>
            </span>
          </Tooltip>
        )}
      </Stack>

      {/* Добавляем StartJobDialog */}
      {startDialogOpen && jobWithConfig && (
        <StartJobDialog
          open={startDialogOpen}
          onClose={() => {
            setStartDialogOpen(false);
            setJobWithConfig(null); // Очищаем состояние
          }}
          job={jobWithConfig} // Передаём сохранённую задачу с конфигурацией
          startJob={startJob}
        />
      )}
    </>
  ) : (
    <>
      <Box>
        <Tooltip title="Действия">
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            aria-label="Действия"
            aria-controls={`actions-menu-${job.job_id}`}
            aria-haspopup="true"
            sx={{
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <MoreVertIcon sx={{ color: "text.secondary" }} />
          </IconButton>
        </Tooltip>
        <StyledMenu
          id={`actions-menu-${job.job_id}`}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          MenuListProps={{
            "aria-labelledby": `actions-button-${job.job_id}`,
          }}
        >
          {(job.build_status === "failed" ||
            job.build_status === "building") && (
            <MenuItem onClick={handleMenuItemClick(onBuildLogsClick)}>
              <ListItemIcon>
                <BugReportIcon
                  sx={{ ...menuIconStyle, color: "warning.main" }}
                />
              </ListItemIcon>
              <Typography variant="body2" fontWeight={600}>
                Логи сборки
              </Typography>
            </MenuItem>
          )}

          {showLogsArtButton && (
            <>
              {/* Кнопка "Логи" с учетом доступности */}
              <Tooltip title={logsButtonDisabledReason} placement="left" arrow>
                <span>
                  <MenuItem
                    onClick={
                      canViewLogs ? handleMenuItemClick(onLogsClick) : undefined
                    }
                    disabled={!canViewLogs}
                    sx={{
                      "&.Mui-disabled": { opacity: 0.5 },
                    }}
                  >
                    <ListItemIcon>
                      <AssignmentIcon
                        sx={{ ...menuIconStyle, color: "info.main" }}
                      />
                    </ListItemIcon>
                    <Typography variant="body2" fontWeight={600}>
                      Логи
                    </Typography>
                  </MenuItem>
                </span>
              </Tooltip>

              {job.job_type === "run" &&
                job.last_execution_status === "completed" && (
                  <MenuItem onClick={handleMenuItemClick(onDownloadArtifacts)}>
                    <ListItemIcon>
                      <DownloadIcon
                        sx={{ ...menuIconStyle, color: "primary.main" }}
                      />
                    </ListItemIcon>
                    <Typography variant="body2" fontWeight={600}>
                      Скачать артефакты
                    </Typography>
                  </MenuItem>
                )}
            </>
          )}

          {showStartButton && (
            <Tooltip title={startButtonDisabledReason} placement="left" arrow>
              <span>
                <MenuItem
                  onClick={canStartJob ? handleStartClick : undefined}
                  disabled={!canStartJob}
                  sx={{
                    "&.Mui-disabled": { opacity: 0.5 },
                  }}
                >
                  <ListItemIcon>
                    <PlayCircleFilledIcon
                      sx={{ ...menuIconStyle, color: "success.main" }}
                    />
                  </ListItemIcon>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: "rgb(22 163 74)" }}
                  >
                    Запустить задачу
                  </Typography>
                </MenuItem>
              </span>
            </Tooltip>
          )}

          {/* Кнопка "Остановить задачу" */}
          <Tooltip title={stopButtonDisabledReason} placement="left" arrow>
            <span>
              <MenuItem
                onClick={
                  canStopJob ? handleMenuItemClick(onStopClick) : undefined
                }
                disabled={!canStopJob}
                sx={{
                  "&.Mui-disabled": { opacity: 0.5 },
                }}
              >
                <ListItemIcon>
                  <StopIcon sx={{ ...menuIconStyle, color: "error.main" }} />
                </ListItemIcon>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ color: "red" }}
                >
                  Остановить задачу
                </Typography>
              </MenuItem>
            </span>
          </Tooltip>
        </StyledMenu>
      </Box>

      {/* Добавляем StartJobDialog */}
      {startDialogOpen && jobWithConfig && (
        <StartJobDialog
          open={startDialogOpen}
          onClose={() => {
            setStartDialogOpen(false);
            setJobWithConfig(null); // Очищаем состояние
          }}
          job={jobWithConfig} // Передаём сохранённую задачу с конфигурацией
          startJob={startJob}
        />
      )}
    </>
  );
}

export default TasksActions;
