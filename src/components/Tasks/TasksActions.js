import React from 'react';
import { Box, Button, IconButton, Tooltip, Stack } from '@mui/material';
import {
  ContentPasteSearch as ContentPasteSearchIcon,
  BugReport as BugReportIcon,
  Download as DownloadIcon,
  Stop as StopIcon,
  PlayCircleFilled as PlayCircleFilledIcon,
} from '@mui/icons-material';

function TasksActions({
  job,
  onLogsClick,
  onExecutionsClick,
  onScheduleClick,
  onBuildLogsClick,
  onDownloadArtifacts,
  onStopClick,
}) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Кнопка "Логи" */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onLogsClick(job);
          }}
          variant="outlined"
          color="primary"
          sx={{padding:'4px 2px'}}
        >
          Логи
        </Button>

        {/* Кнопка "Build Logs" */}
        {(job.build_status === "failed" || job.build_status === "building") && (
          <Tooltip title="Логи сборки">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onBuildLogsClick(job);
              }}
              color="secondary"
              size="small"
            >
              <BugReportIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Кнопка "Скачать артефакты" */}
        {job.job_type === "run" && job.last_execution_status === "completed" && (
          <Tooltip title="Скачать артефакты">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDownloadArtifacts(job);
              }}
              color="primary"
              size="small"
              
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Кнопка "Остановить задачу" */}
        {(job.last_execution_status === "creating" || job.last_execution_status === "running") && (
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
        <Tooltip title="Запустить задачу">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              alert('Запуск');
            }}
            color="success"
            size="small"
          >
            <PlayCircleFilledIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

export default TasksActions;