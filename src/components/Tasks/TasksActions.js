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

import useTasksActions from "../../hooks/Tasks/useTasksActions";

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
  const {
    stopButtonDisabledReason,
    canStopJob,
    startButtonDisabledReason,
    handleStartClick,
    canStartJob,
    startDialogOpen,
    jobWithConfig,
    setStartDialogOpen,
    setJobWithConfig,
    startJob,
    handleMenuOpen,
    anchorEl,
    handleMenuClose,
    handleMenuItemClick,
    menuIconStyle,
    logsButtonDisabledReason,
    canViewLogs,
  } = useTasksActions({
    job,
    onLogsClick,
    onBuildLogsClick,
    onDownloadArtifacts,
    onStopClick,
    showStartButton,
    showLogsArtButton,
    displayMode,
    showAlert,
  });

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
