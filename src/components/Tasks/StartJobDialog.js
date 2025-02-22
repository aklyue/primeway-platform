// src/components/Tasks/StartJobDialog.js

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import axiosInstance from "../../api";

function StartJobDialog({ open, onClose, job, onJobStarted, startJob }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleStartJob = async () => {
    setLoading(true);
    setError("");

    try {
      // Мы ожидаем завершения startJob
      await startJob(job, files);
      onClose();
    } catch (e) {
      setError(e.message || "Произошла ошибка при запуске задачи.");
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return null; // Или отобразите индикатор загрузки
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      onClick={(event) => event.stopPropagation()}
    >
      <DialogTitle>Запуск задачи: {job.job_name}</DialogTitle>
      <DialogContent onClick={(event) => event.stopPropagation()}>
        <Typography variant="body1" gutterBottom>
          {job.config?.request_input_dir
            ? "Эта задача позволяет загрузить файл. Пожалуйста, выберите файл для загрузки или запустите задачу без него."
            : "Вы можете запустить эту задачу."}
        </Typography>
        {job.config?.request_input_dir && (
          <Box
            {...getRootProps()}
            sx={{
              border: "2px dashed #ccc",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
              marginTop: "10px",
              backgroundColor: isDragActive ? "#f0f0f0" : "transparent",
            }}
          >
            <input {...getInputProps()} aria-label="Выберите файл" />
            <Typography variant="body2" color="textSecondary">
              Перетащите файл сюда или нажмите для выбора
            </Typography>
            {files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {files.map((file) => (
                  <Chip
                    key={file.path}
                    label={file.path}
                    onDelete={() => setFiles([])}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          onClick={handleStartJob}
          variant="outlined"
          disabled={loading}
          data-testid="start-button"
        >
          {loading ? <CircularProgress size={24} /> : "Запустить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StartJobDialog;
