import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TasksActions from "./TasksActions";
import "@testing-library/jest-dom";
import axiosInstance from "../../api";
import { AxiosInstance } from "axios";
import { Job } from "../../types";

const mockedAxios = axiosInstance as jest.Mocked<AxiosInstance>;

// Мокаем Tooltip, чтобы избежать багов с порталом
jest.mock("@mui/material", () => {
  const mui = jest.requireActual("@mui/material");
  const MockedTooltip = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
  return { ...mui, Tooltip: MockedTooltip };
});

describe("Компонент TasksActions", () => {
  const mockJob: Job = {
    job_id: "existing_job_id",
    job_name: "Тестовая задача",
    job_type: "run",
    build_status: "success",
    last_execution_status: "completed",
    last_execution_start_time: "2024-01-01T12:00:00Z",
    last_execution_end_time: "2024-01-01T12:10:00Z",
    gpu_type: { type: "A100 PCIe" as const, count: "1" },
    job_url: "https://example.com/job",
    health_status: "healthy",
    start_time: "2024-01-01T11:50:00Z",
    end_time: "2024-01-01T12:20:00Z",
  };

  const mockShowAlert = jest.fn();
  const mockOnStopClick = jest.fn();
  const mockFn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("корректно обрабатывает handleStartClick для задач типа run", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { request_input_dir: false },
    });
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: "Job started successfully" },
    });

    render(
      <TasksActions
        job={mockJob}
        showAlert={mockShowAlert}
        onLogsClick={mockFn}
        onBuildLogsClick={mockFn}
        onDownloadArtifacts={mockFn}
        onStopClick={mockFn}
        showStartButton={true}
        showLogsArtButton={true}
        displayMode="menu"
      />
    );

    fireEvent.click(screen.getByLabelText("Действия"));
    fireEvent.click(screen.getByText("Запустить задачу"));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/jobs/get-config", {
        params: { job_id: mockJob.job_id },
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/jobs/job-start",
        {},
        {
          headers: { "Content-Type": "application/json" },
          params: { job_id: mockJob.job_id },
        }
      );
    });

    expect(mockShowAlert).not.toHaveBeenCalledWith(
      "Ошибка при запуске задачи.",
      expect.anything()
    );
  });

  test("отображает сообщение об ошибке при неудачной загрузке конфигурации", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <TasksActions
        job={mockJob}
        showAlert={mockShowAlert}
        onLogsClick={mockFn}
        onBuildLogsClick={mockFn}
        onDownloadArtifacts={mockFn}
        onStopClick={mockFn}
        showStartButton={true}
        showLogsArtButton={true}
        displayMode="menu"
      />
    );

    fireEvent.click(screen.getByLabelText("Действия"));
    fireEvent.click(screen.getByText("Запустить задачу"));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        "Ошибка при получении конфигурации задачи.",
        "error"
      );
    });

    expect(mockedAxios.get).toHaveBeenCalledWith("/jobs/get-config", {
      params: { job_id: mockJob.job_id },
    });
  });

  test("отображает сообщение об ошибке при неудачном запуске задачи", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { request_input_dir: false },
    });
    mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <TasksActions
        job={mockJob}
        showAlert={mockShowAlert}
        onLogsClick={mockFn}
        onBuildLogsClick={mockFn}
        onDownloadArtifacts={mockFn}
        onStopClick={mockFn}
        showStartButton={true}
        showLogsArtButton={true}
        displayMode="menu"
      />
    );

    fireEvent.click(screen.getByLabelText("Действия"));
    fireEvent.click(screen.getByText("Запустить задачу"));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        "Ошибка при запуске задачи.",
        expect.anything()
      );
    });
  });

  test("корректно обрабатывает handleStopClick", () => {
    render(
      <TasksActions
        job={{ ...mockJob, build_status: "running" }}
        showAlert={mockShowAlert}
        onLogsClick={mockFn}
        onBuildLogsClick={mockFn}
        onDownloadArtifacts={mockFn}
        onStopClick={mockFn}
        showStartButton={true}
        showLogsArtButton={true}
        displayMode="menu"
      />
    );

    fireEvent.click(screen.getByLabelText("Действия"));
    fireEvent.click(screen.getByText("Остановить задачу"));

    expect(mockOnStopClick).toHaveBeenCalledWith({
      ...mockJob,
      status: "running",
    });
  });

  test("отображает сообщение об ошибке при попытке запустить неподдерживаемый тип задачи", () => {
    const unsupportedJob = { ...mockJob, job_type: "unsupported_type" };

    render(
      <TasksActions
        job={unsupportedJob}
        showAlert={mockShowAlert}
        onLogsClick={mockFn}
        onBuildLogsClick={mockFn}
        onDownloadArtifacts={mockFn}
        onStopClick={mockFn}
        showStartButton={true}
        showLogsArtButton={true}
        displayMode="menu"
      />
    );

    fireEvent.click(screen.getByLabelText("Действия"));
    fireEvent.click(screen.getByText("Запустить задачу"));

    expect(mockShowAlert).toHaveBeenCalledWith(
      "Эту задачу нельзя запустить из интерфейса.",
      "error"
    );

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});
