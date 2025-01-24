// src/components/Tasks/TasksActions.js

import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  ContentPasteSearch as ContentPasteSearchIcon,
  BugReport as BugReportIcon,
  Download as DownloadIcon,
  Stop as StopIcon,
  PlayCircleFilled as PlayCircleFilledIcon,
} from "@mui/icons-material";

function TasksActions({
  job,
  onLogsClick,
  onExecutionsClick,
  onScheduleClick,
  onBuildLogsClick,
  onDownloadArtifacts,
  onStopClick,
  onStartClick,
  showStartButton = true,
  showLogsArtButton = true,
  displayMode = "menu", // Новый проп
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => (event) => {
    event.stopPropagation();
    action(job);
    setAnchorEl(null);
  };

  // Проверка условий отображения кнопок
  const showStopButton =
    job.last_execution_status === "creating" ||
    job.last_execution_status === "running";

  // Определяем, какие действия отображать
  const actionsMenu = (
    <Box>
      <Tooltip title="Действия">
        <IconButton
          onClick={handleMenuOpen}
          size="small"
          aria-controls={`actions-menu-${job.job_id}`}
          aria-haspopup="true"
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id={`actions-menu-${job.job_id}`}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка "Build Logs" */}
        {(job.build_status === "failed" ||
          job.build_status === "building") && (
          <MenuItem onClick={handleMenuItemClick(onBuildLogsClick)}>
            <ListItemIcon>
              <BugReportIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Логи сборки</Typography>
          </MenuItem>
        )}

        {showLogsArtButton && (
          <>
            {/* Кнопка "Логи" */}
            <MenuItem onClick={handleMenuItemClick(onLogsClick)}>
              <ListItemIcon>
                <ContentPasteSearchIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Логи</Typography>
            </MenuItem>

            {/* Кнопка "Скачать артефакты" */}
            {job.job_type === "run" &&
              job.last_execution_status === "completed" && (
                <MenuItem onClick={handleMenuItemClick(onDownloadArtifacts)}>
                  <ListItemIcon>
                    <DownloadIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">Скачать артефакты</Typography>
                </MenuItem>
              )}
          </>
        )}

        {/* Кнопка "Остановить задачу" */}
        {showStopButton && (
          <MenuItem onClick={handleMenuItemClick(onStopClick)}>
            <ListItemIcon>
              <StopIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Остановить задачу</Typography>
          </MenuItem>
        )}

        {/* Кнопка "Запустить задачу" */}
        {showStartButton && (
          <MenuItem onClick={handleMenuItemClick(onStartClick)}>
            <ListItemIcon>
              <PlayCircleFilledIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Запустить задачу</Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );

  const actionsButtons = (
    <Stack direction="row" spacing={1} alignItems="center">
      {/* Кнопка "Остановить задачу" */}
      {showStopButton && (
        <Tooltip title="Остановить задачу">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onStopClick(job);
            }}
            color="error"
            size="small"
          >
            <StopIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Кнопка "Запустить задачу" */}
      {showStartButton && (
        <Tooltip title="Запустить задачу">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onStartClick(job);
            }}
            color="success"
            size="small"
          >
            <PlayCircleFilledIcon />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );

  return displayMode === "buttons" ? actionsButtons : actionsMenu;
}

export default TasksActions;