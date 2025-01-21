
import React from 'react';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import {
  ContentPasteSearch as ContentPasteSearchIcon,
  EventNote as EventNoteIcon,
  BugReport as BugReportIcon,
  Download as DownloadIcon,
  Stop as StopIcon,
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
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onLogsClick(job);
        }}
        variant="contained"
        color="secondary"
        sx={{ mr: 1, padding:'4px 5px' }}
      >
        Логи
      </Button>

      <Tooltip title="Выполнения">
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onExecutionsClick(job);
          }}
          color="primary"
        >
          <ContentPasteSearchIcon />
        </IconButton>
      </Tooltip>

      {job.is_scheduled && (
        <Tooltip title="Расписание">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onScheduleClick(job);
            }}
            color="primary"
          >
            <EventNoteIcon />
          </IconButton>
        </Tooltip>
      )}

      {(job.build_status === "failed" || job.build_status === "building") && (
        <Tooltip title="Build Logs">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onBuildLogsClick(job);
            }}
            color="primary"
          >
            <BugReportIcon />
          </IconButton>
        </Tooltip>
      )}

      {job.job_type === "run" && job.last_execution_status === "completed" && (
        <Tooltip title="Скачать артефакты">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDownloadArtifacts(job);
            }}
            color="primary"
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Кнопка остановки */}
      {(job.last_execution_status === "creating" || job.last_execution_status === "running") && (
        <Tooltip title="Остановить задачу">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onStopClick(job);
            }}
            sx={{
              backgroundColor: "rgba(255,0,0,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,0,0,0.2)",
              },
            }}
          >
            <StopIcon sx={{ color: "red" }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

export default TasksActions;