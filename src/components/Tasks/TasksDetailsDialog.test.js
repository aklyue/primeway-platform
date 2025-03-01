// src/components/Tasks/JobDetailsDialog.test.js

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import axiosInstance from "../../api";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import JobDetailsDialog from "./TasksDetailsDialog";

// Мокаем axiosInstance
jest.mock("../../api");

// Мокаем useMediaQuery
jest.mock("@mui/material", () => {
  const originalModule = jest.requireActual("@mui/material");
  return {
    __esModule: true,
    ...originalModule,
    useMediaQuery: jest.fn(),
  };
});

jest.mock("react-syntax-highlighter", () => {
  return {
    Prism: jest.fn(() => <div data-testid="syntax-highlighter" />),
  };
});

jest.mock("js-yaml", () => {
  return {
    dump: jest.fn(() => "yaml-config"),
  };
});

describe("Компонент JobDetailsDialog", () => {
  const mockGetStatusIndicator = jest.fn(() => (
    <div data-testid="status-indicator" />
  ));
  let mockJob;

  const renderComponent = (props = {}) => {
    const theme = createTheme();
    return render(
      <ThemeProvider theme={theme}>
        <JobDetailsDialog
          open={true}
          onClose={jest.fn()}
          job={mockJob}
          getStatusIndicator={mockGetStatusIndicator}
          {...props}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axiosInstance.get.mockReset();
    axiosInstance.post.mockReset();
    axiosInstance.put.mockReset();
    axiosInstance.delete.mockReset();

    // Мокаем поведение useMediaQuery
    useMediaQuery.mockImplementation(() => false);

    // Обновляем mockJob для каждого теста
    mockJob = {
      job_id: "test-job-id",
      job_name: "Test Job",
      job_type: "run",
      created_at: "2023-08-01T12:00:00Z",
      build_status: "success",
      last_execution_status: "running",
    };
  });

  test("При монтировании фетчит executions, schedules и config", async () => {
    // Мокаем ответы API
    axiosInstance.get.mockImplementation((url, { params }) => {
      if (url === "/jobs/executions") {
        expect(params).toEqual({ job_id: "test-job-id" });
        return Promise.resolve({
          data: [
            {
              job_execution_id: "exec1",
              status: "running",
              created_at: "2023-08-01T12:30:00Z",
            },
          ],
        });
      }
      if (url === "/jobs/get-schedules") {
        expect(params).toEqual({ job_id: "test-job-id" });
        return Promise.resolve({
          data: [{ schedule_id: "sched1", schedule_type: "DAILY" }],
        });
      }
      if (url === "/jobs/get-config") {
        expect(params).toEqual({ job_id: "test-job-id" });
        return Promise.resolve({ data: { key: "value" } });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    renderComponent();

    // Ждем, пока все запросы будут выполнены
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(3));

    expect(axiosInstance.get).toHaveBeenCalledWith("/jobs/executions", {
      params: { job_id: "test-job-id" },
    });
    expect(axiosInstance.get).toHaveBeenCalledWith("/jobs/get-schedules", {
      params: { job_id: "test-job-id" },
    });
    expect(axiosInstance.get).toHaveBeenCalledWith("/jobs/get-config", {
      params: { job_id: "test-job-id" },
    });

    // Проверяем, что данные отображаются
    expect(screen.getByText("Выполнения")).toBeInTheDocument();
    expect(screen.getByText(/exec1/)).toBeInTheDocument();
  });

  test("Обрабатывает ошибки API правильно", async () => {
    axiosInstance.get.mockImplementation(() =>
      Promise.reject(new Error("Network error"))
    );

    renderComponent();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(3));

    // Проверяем, что отображаются сообщения об ошибке
    expect(
      screen.getByText("Ошибка при загрузке выполнений")
    ).toBeInTheDocument();
  });

  test('Нажатие на кнопку "Логи" загружает логи задачи', async () => {
    axiosInstance.get.mockImplementation((url, { params }) => {
      if (url === "/jobs/executions") {
        return Promise.resolve({
          data: [
            {
              job_execution_id: "exec1",
              status: "running",
              created_at: "2023-08-01T12:30:00Z",
            },
          ],
        });
      }
      if (url === "/jobs/get-schedules") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/jobs/get-config") {
        return Promise.resolve({ data: { key: "value" } });
      }
      if (url === "/jobs/job-logs") {
        if (params.job_execution_id) {
          return Promise.resolve({ data: { logs: "Execution logs content" } });
        } else if (params.job_id) {
          return Promise.resolve({ data: { logs: "Job logs content" } });
        }
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    renderComponent();

    // Ждем, пока данные загрузятся
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(3));

    // Находим кнопку "Действия" и открываем меню
    const actionsButton = screen.getByLabelText("Действия");
    fireEvent.click(actionsButton);

    // Ждем появления меню
    const logsMenuItem = await screen.findByText("Логи");
    expect(logsMenuItem).toBeInTheDocument();

    // Нажимаем на пункт меню "Логи"
    fireEvent.click(logsMenuItem);

    // Ожидаем загрузки логов
    await waitFor(() =>
      expect(axiosInstance.get).toHaveBeenCalledWith("/jobs/job-logs", {
        params: { job_execution_id: "exec1" },
      })
    );

    expect(screen.getByText("Логи: Test Job")).toBeInTheDocument();
    expect(screen.getByText("Execution logs content")).toBeInTheDocument();
  });

  test('Нажатие на кнопку "Стоп" отправляет запрос на остановку задачи', async () => {
    axiosInstance.get.mockImplementation((url, { params }) => {
      if (url === "/jobs/executions") {
        return Promise.resolve({
          data: [
            {
              job_execution_id: "exec1",
              status: "running",
              created_at: "2023-08-01T12:30:00Z",
            },
          ],
        });
      }
      if (url === "/jobs/get-schedules") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/jobs/get-config") {
        return Promise.resolve({ data: { key: "value" } });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    axiosInstance.post.mockImplementation((url, data, config) => {
      if (url === "/jobs/job-stop") {
        expect(config.params).toEqual({ job_execution_id: "exec1" });
        return Promise.resolve({ data: { message: "Job stopped" } });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    renderComponent();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(3));

    // Находим кнопку "Остановить задачу"
    const stopButton = await screen.findByLabelText("Остановить задачу");
    expect(stopButton).toBeInTheDocument();

    // Ждем, пока кнопка станет активной
    await waitFor(() => expect(stopButton).not.toBeDisabled());

    fireEvent.click(stopButton);

    // Ожидаем отправки запроса на остановку
    await waitFor(() =>
      expect(axiosInstance.post).toHaveBeenCalledWith("/jobs/job-stop", null, {
        params: { job_execution_id: "exec1" },
      })
    );
  });

  test("Удаление расписания отправляет DELETE-запрос", async () => {
    axiosInstance.get.mockImplementation((url, { params }) => {
      if (url === "/jobs/executions") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/jobs/get-schedules") {
        return Promise.resolve({
          data: [{ schedule_id: "sched1", schedule_type: "DAILY" }],
        });
      }
      if (url === "/jobs/get-config") {
        return Promise.resolve({ data: { key: "value" } });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    axiosInstance.delete.mockImplementation((url, config) => {
      if (url === "/jobs/delete-schedules") {
        expect(config.params).toEqual({
          job_id: "test-job-id",
          schedule_id: "sched1",
        });
        return Promise.resolve();
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    renderComponent();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(3));

    // Используем data-testid для кнопки переключения на вкладку "Расписание"
    const scheduleTabButton = screen.getByTestId("tab-schedule");
    fireEvent.click(scheduleTabButton);

    // Находим кнопку "Удалить расписание" внутри списка расписаний
    const deleteButton = await screen.findByLabelText("Удалить расписание");
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    // Ожидаем отправки DELETE-запроса
    await waitFor(() =>
      expect(axiosInstance.delete).toHaveBeenCalledWith(
        "/jobs/delete-schedules",
        { params: { job_id: "test-job-id", schedule_id: "sched1" } }
      )
    );
  });
});
