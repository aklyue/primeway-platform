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
  Assignment as AssignmentIcon ,
  BugReport as BugReportIcon,
  Download as DownloadIcon,
  Stop as StopIcon,
  PlayCircleFilled as PlayCircleFilledIcon,
} from "@mui/icons-material";

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
  onStartClick,
  showStartButton = true,
  showLogsArtButton = true,
  displayMode = "menu",
}) {
  const [anchorEl, setAnchorEl] = useState(null);

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

  const canStopJob =
    job.last_execution_status === "creating" ||
    job.last_execution_status === "running";

  // Список допустимых статусов последнего выполнения
  const allowedLastExecutionStatuses = [
    "stopped",
    "terminated",
    "completed",
    "failed",
  ];

  // Определяем, может ли задача быть запущена
  const canStartJob =
    job.build_status === "success" &&
    (!job.last_execution_status || // Если последнего выполнения нет
      allowedLastExecutionStatuses.includes(job.last_execution_status)); // Или оно имеет допустимый статус

  const canViewLogs =
    job.build_status === "success" &&
    !["pending", "provisioning", "creating"].includes(
      job.last_execution_status
    );

  const stopButtonDisabledReason = canStopJob
    ? ""
    : "Задача не запущена и не может быть остановлена.";

  const startButtonDisabledReason = canStartJob
    ? ""
    : "Задачу можно запустить только если статус образа 'success' и последнее выполнение отсутствует или завершилось.";

  const logsButtonDisabledReason = canViewLogs
    ? ""
    : "Логи недоступны, так как задача завершена и не находится в процессе выполнения.";

  const menuIconStyle = {
    color: "inherit",
    fontSize: "1.1rem",
  };

  return displayMode === "buttons" ? (
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
              onClick={(e) => {
                e.stopPropagation();
                onStartClick(job);
              }}
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
  ) : (
    <Box>
      <Tooltip title="Действия">
        <IconButton
          onClick={handleMenuOpen}
          size="small"
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
        {(job.build_status === "failed" || job.build_status === "building") && (
          <MenuItem onClick={handleMenuItemClick(onBuildLogsClick)}>
            <ListItemIcon>
              <BugReportIcon sx={{ ...menuIconStyle, color: "warning.main" }} />
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
                onClick={
                  canStartJob ? handleMenuItemClick(onStartClick) : undefined
                }
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
                <Typography variant="body2" fontWeight={600} sx={{color:'rgb(22 163 74)'}}>
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
                <StopIcon sx={{ ...menuIconStyle, color: "error.main",  }} />
              </ListItemIcon>
              <Typography variant="body2" fontWeight={500} sx={{color:'red'}} >
                Остановить задачу
              </Typography>
            </MenuItem>
          </span>
        </Tooltip>
      </StyledMenu>
    </Box>
  );
}

export default TasksActions;
