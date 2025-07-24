import { useState } from "react";
import axiosInstance from "../../../api";
import { Job, JupyterSession } from "../../../types";

interface useTasksActionsProps {
  job: Job;
  showAlert?: (msg: string, type: string) => void;
}

export const useTasksActions = ({ job, showAlert }: useTasksActionsProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [startDialogOpen, setStartDialogOpen] = useState<boolean>(false);
  const [jobWithConfig, setJobWithConfig] = useState<Job | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event: React.MouseEvent<HTMLLIElement>) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleMenuItemClick =
    (action: (job: Job) => void) =>
    (event: React.MouseEvent<HTMLLIElement>) => {
      event.stopPropagation();
      action(job);
      handleMenuClose(event);
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
    job.build_status === "stopped" ||
    (job.build_status === "failed" &&
      job.last_execution_status &&
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

  const handleStartClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    const allowedJobTypes = ["run", "deploy"];

    if (!job.job_type || !allowedJobTypes.includes(job.job_type)) {
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

  const startJob = async (job: Job, files: File[] = []): Promise<void> => {
    let data;
    let headers: Record<string, string> = {};

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

  return {
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
  };
};
