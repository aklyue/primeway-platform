// src/components/Tasks/Tasks.test.js

import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import Tasks from "./Tasks";
import "@testing-library/jest-dom";
import axiosInstance from "../../api";
import { AuthContext } from "../../AuthContext";
import { OrganizationContext } from "../Organization/OrganizationContext";
import { TasksFiltersContext } from "./TasksFiltersContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

// Мокаем axiosInstance
jest.mock("../../api");

// Мокаем useMediaQuery
jest.mock("@mui/material", () => {
  const materialUi = jest.requireActual("@mui/material");
  return {
    ...materialUi,
    useMediaQuery: jest.fn(),
  };
});

// Мокаем TasksActions компонент
jest.mock("./TasksActions", () => (props) => (
  <div data-testid="tasks-actions">
    <button
      aria-label="Остановить задачу"
      onClick={(e) => {
        e.stopPropagation();
        props.onStopClick(props.job);
      }}
    >
      Остановить задачу
    </button>
    <button
      aria-label="Логи"
      onClick={(e) => {
        e.stopPropagation();
        props.onLogsClick(props.job);
      }}
    >
      Логи
    </button>
  </div>
));

// Мокаем контексты
const mockAuthContext = {
  authToken: "test-token",
};

const mockOrganizationContext = {
  currentOrganization: { id: "org123" },
};

const mockTasksFiltersContext = {
  selectedStatus: "",
  setSelectedStatus: jest.fn(),
  selectedJobType: "run",
  setSelectedJobType: jest.fn(),
  isScheduledFilter: false,
  setIsScheduledFilter: jest.fn(),
};

describe("Компонент Tasks", () => {
  beforeEach(() => {
    axiosInstance.get.mockReset();
    axiosInstance.post.mockReset();
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    useMediaQuery.mockImplementation(() => false);

    const theme = createTheme();

    return render(
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={mockAuthContext}>
          <OrganizationContext.Provider value={mockOrganizationContext}>
            <TasksFiltersContext.Provider value={mockTasksFiltersContext}>
              <Tasks />
            </TasksFiltersContext.Provider>
          </OrganizationContext.Provider>
        </AuthContext.Provider>
      </ThemeProvider>
    );
  };

  test("загружает и отображает список задач при монтировании", async () => {
    const mockJobsData = [
      {
        job_id: "job1",
        job_name: "Тестовая задача 1",
        created_at: "2023-08-01T12:00:00Z",
        build_status: "success",
        last_execution_status: "running",
        last_execution_start_time: "2023-08-01T12:30:00Z",
        job_type: "run",
      },
    ];

    // Мокаем axiosInstance.get для /jobs/get-organization-jobs
    axiosInstance.get.mockImplementation((url, config) => {
      if (url === "/jobs/get-organization-jobs") {
        return Promise.resolve({ data: mockJobsData });
      } else {
        return Promise.reject(new Error(`Unhandled GET request to ${url}`));
      }
    });

    renderComponent();

    // Ожидаем, что запрос был сделан с правильными параметрами
    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/jobs/get-organization-jobs",
        {
          params: {
            organization_id: mockOrganizationContext.currentOrganization.id,
            is_scheduled: undefined,
            status: undefined,
            job_type: "run",
          },
        }
      );
    });

    // Проверяем, что задача отображается в интерфейсе
    expect(await screen.findByText("Тестовая задача 1")).toBeInTheDocument();
  });

  test("отправляет запрос на остановку задачи при подтверждении остановки", async () => {
    const mockJob = {
      job_id: "job1",
      job_name: "Тестовая задача 1",
      created_at: "2023-08-01T12:00:00Z",
      build_status: "success",
      last_execution_status: "running",
      last_execution_start_time: "2023-08-01T12:30:00Z",
      job_type: "run",
    };

    // Мокаем axiosInstance.get
    axiosInstance.get.mockImplementation((url, config) => {
      if (url === "/jobs/get-organization-jobs") {
        return Promise.resolve({ data: [mockJob] });
      } else {
        return Promise.reject(new Error(`Unhandled GET request to ${url}`));
      }
    });

    // Мокаем axiosInstance.post
    axiosInstance.post.mockImplementation((url, data, config) => {
      if (url === "/jobs/job-stop") {
        return Promise.resolve({
          data: { message: "Задача успешно остановлена." },
        });
      } else {
        return Promise.reject(new Error(`Unhandled POST request to ${url}`));
      }
    });

    renderComponent();

    // Ожидаем отображения задачи
    expect(await screen.findByText("Тестовая задача 1")).toBeInTheDocument();

    // Симулируем нажатие на кнопку "Остановить задачу"
    fireEvent.click(screen.getByLabelText("Остановить задачу"));

    // Ожидаем появления диалогового окна подтверждения
    const confirmDialog = await screen.findByRole("dialog", {
      name: /Подтверждение остановки/i,
    });

    // Находим кнопку "Остановить" внутри диалога
    const stopButton = within(confirmDialog).getByText("Остановить");

    // Нажимаем на кнопку "Остановить"
    fireEvent.click(stopButton);

    // Ожидаем, что axios.post был вызван с правильными параметрами
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/jobs/job-stop", null, {
        params: { job_id: mockJob.job_id },
      });
    });

    // Ожидаем, что диалоговое окно закроется
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: /Подтверждение остановки/i })
      ).not.toBeInTheDocument();
    });
  });

  test("отображает сообщение об ошибке при неудачной загрузке списка задач", async () => {
    // Мокаем, чтобы axiosInstance.get выбрасывал ошибку
    axiosInstance.get.mockRejectedValueOnce({
      response: {
        data: { detail: "Не удалось загрузить список задач." },
      },
    });

    renderComponent();

    // Ожидаем, что запрос был сделан
    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalled();
    });

    // Ожидаем, что сообщение об ошибке отображается
    expect(await screen.findByText("Нет доступных задач.")).toBeInTheDocument();
  });
});
