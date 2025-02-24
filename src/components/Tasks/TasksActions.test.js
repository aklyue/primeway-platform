// src/components/Tasks/TasksActions.test.js

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import TasksActions from "./TasksActions";
import "@testing-library/jest-dom";
import axiosInstance from "../../api";
import { Tooltip } from "@mui/material";

// Мокаем axiosInstance
jest.mock("../../api");

// Мокаем Tooltip, чтобы избежать потенциальных проблем с порталом
jest.mock("@mui/material", () => {
  const mui = jest.requireActual("@mui/material");
  const MockedTooltip = ({ children }) => children;
  return { ...mui, Tooltip: MockedTooltip };
});

describe("Компонент TasksActions", () => {
  const mockJob = {
    job_id: "existing_job_id",
    job_name: "Тестовая задача",
    job_type: "run",
    build_status: "success",
    last_execution_status: "completed",
  };

  const mockShowAlert = jest.fn();
  const mockOnStopClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("корректно обрабатывает handleStartClick для задач типа run", async () => {
    // Мокаем ответ на получение конфигурации задачи
    const mockConfig = { data: { request_input_dir: false } };
    axiosInstance.get.mockResolvedValueOnce(mockConfig);

    // Мокаем успешный запуск задачи
    const mockStartResponse = { data: { message: "Job started successfully" } };
    axiosInstance.post.mockResolvedValueOnce(mockStartResponse);

    render(<TasksActions job={mockJob} showAlert={mockShowAlert} />);

    const menuButton = screen.getByLabelText("Действия");
    fireEvent.click(menuButton);

    const startMenuItem = screen.getByText("Запустить задачу");
    fireEvent.click(startMenuItem);

    // Проверяем, что был сделан запрос на получение конфигурации задачи
    expect(axiosInstance.get).toHaveBeenCalledWith("/jobs/get-config", {
      params: { job_id: mockJob.job_id },
    });

    // Ожидаем, пока произойдёт запуск задачи
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/jobs/job-start",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            job_id: mockJob.job_id,
          },
        }
      );
    });

    // Проверяем, что отображается сообщение об успешном запуске
    expect(mockShowAlert).not.toHaveBeenCalledWith(
      "Ошибка при запуске задачи.",
      expect.anything()
    );
  });

  test("отображает сообщение об ошибке при неудачной загрузке конфигурации", async () => {
    // Мокаем ошибку при получении конфигурации
    axiosInstance.get.mockRejectedValueOnce(new Error("Network Error"));

    render(<TasksActions job={mockJob} showAlert={mockShowAlert} />);

    const menuButton = screen.getByLabelText("Действия");
    fireEvent.click(menuButton);

    const startMenuItem = screen.getByText("Запустить задачу");
    fireEvent.click(startMenuItem);

    // Ожидаем отображения сообщения об ошибке
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        "Ошибка при получении конфигурации задачи.",
        "error"
      );
    });

    // Проверяем, что запрос на получение конфигурации был сделан
    expect(axiosInstance.get).toHaveBeenCalledWith("/jobs/get-config", {
      params: { job_id: mockJob.job_id },
    });
  });

  test("отображает сообщение об ошибке при неудачном запуске задачи", async () => {
    // Мокаем успешное получение конфигурации
    const mockConfig = { data: { request_input_dir: false } };
    axiosInstance.get.mockResolvedValueOnce(mockConfig);

    // Мокаем ошибку при запуске задачи
    axiosInstance.post.mockRejectedValueOnce(new Error("Network Error"));

    render(<TasksActions job={mockJob} showAlert={mockShowAlert} />);

    const menuButton = screen.getByLabelText("Действия");
    fireEvent.click(menuButton);

    const startMenuItem = screen.getByText("Запустить задачу");
    fireEvent.click(startMenuItem);

    // Ожидаем отображения сообщения об ошибке при запуске задачи
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        "Ошибка при запуске задачи.",
        expect.anything()
      );
    });

    // Проверяем, что запросы были сделаны
    expect(axiosInstance.get).toHaveBeenCalledWith("/jobs/get-config", {
      params: { job_id: mockJob.job_id },
    });
    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/jobs/job-start",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          job_id: mockJob.job_id,
        },
      }
    );
  });

  test("корректно обрабатывает handleStopClick", () => {
    render(
      <TasksActions
        job={{ ...mockJob, status: "running" }}
        onStopClick={mockOnStopClick}
        showAlert={mockShowAlert}
      />
    );

    const menuButton = screen.getByLabelText("Действия");
    fireEvent.click(menuButton);

    const stopMenuItem = screen.getByText("Остановить задачу");
    fireEvent.click(stopMenuItem);

    // Проверяем, что функция onStopClick была вызвана с правильными параметрами
    expect(mockOnStopClick).toHaveBeenCalledWith({
      ...mockJob,
      status: "running",
    });
  });

  test("отображает сообщение об ошибке при попытке запустить неподдерживаемый тип задачи", () => {
    const unsupportedJob = { ...mockJob, job_type: "unsupported_type" };

    render(<TasksActions job={unsupportedJob} showAlert={mockShowAlert} />);

    const menuButton = screen.getByLabelText("Действия");
    fireEvent.click(menuButton);

    const startMenuItem = screen.getByText("Запустить задачу");
    fireEvent.click(startMenuItem);

    expect(mockShowAlert).toHaveBeenCalledWith(
      "Эту задачу нельзя запустить из интерфейса.",
      "error"
    );

    // Проверяем, что запросы к бэкенду не выполнялись
    expect(axiosInstance.get).not.toHaveBeenCalled();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });
});
