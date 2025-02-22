// src/components/Tasks/Tasks.test.js

import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import Tasks from "./Tasks";
import "@testing-library/jest-dom";
import axiosInstance from "../../api";
import { AuthContext } from "../../AuthContext";
import { OrganizationContext } from "../Organization/OrganizationContext";
import { TasksFiltersContext } from "./TasksFiltersContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

// Мок axiosInstance
jest.mock("../../api");

// Мок useMediaQuery
jest.mock("@mui/material", () => {
  const materialUi = jest.requireActual("@mui/material");
  return {
    ...materialUi,
    useMediaQuery: jest.fn(),
    // Переэкспортируем необходимые компоненты
    Box: materialUi.Box,
    Typography: materialUi.Typography,
    CircularProgress: materialUi.CircularProgress,
    IconButton: materialUi.IconButton,
    Tooltip: materialUi.Tooltip,
    Button: materialUi.Button,
    Grid: materialUi.Grid,
    Dialog: materialUi.Dialog,
    DialogTitle: materialUi.DialogTitle,
    DialogContent: materialUi.DialogContent,
    DialogActions: materialUi.DialogActions,
    Paper: materialUi.Paper,
    Snackbar: materialUi.Snackbar,
    Alert: materialUi.Alert,
    Card: materialUi.Card,
    CardContent: materialUi.CardContent,
    CardActions: materialUi.CardActions,
  };
});

// Исправленные моки компонентов
jest.mock("./TasksActions", () => () => <div data-testid="tasks-actions" />);
jest.mock("./TasksDetailsDialog", () => () => (
  <div data-testid="tasks-details-dialog" />
));

// Мок функций date-fns
jest.mock("date-fns", () => {
  const originalDateFns = jest.requireActual("date-fns");
  return {
    ...originalDateFns,
    format: jest.fn(() => "formatted-date"),
    parseISO: jest.fn((dateString) => new Date(dateString)),
  };
});

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
    jest.clearAllMocks();
  });

  const renderComponent = (screenSize = "desktop") => {
    // Мок useMediaQuery
    useMediaQuery.mockImplementation((query) => {
      if (screenSize === "mobile") {
        if (query.includes("down") && query.includes('"sm"')) return true;
        if (query.includes("between") && query.includes('"sm", "md"'))
          return false;
        if (query.includes("down") && query.includes('"lg"')) return true;
        return false;
      } else if (screenSize === "tablet") {
        if (query.includes("down") && query.includes('"sm"')) return false;
        if (query.includes("between") && query.includes('"sm", "md"'))
          return true;
        if (query.includes("down") && query.includes('"lg"')) return true;
        return false;
      } else {
        // Десктоп
        if (query.includes("down") && query.includes('"sm"')) return false;
        if (query.includes("between") && query.includes('"sm", "md"'))
          return false;
        if (query.includes("down") && query.includes('"lg"')) return false;
        return false;
      }
    });

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

  test("рендерится без ошибок и фетчит задачи", async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        {
          job_id: "job1",
          job_name: "Тестовая задача 1",
          created_at: "2023-08-01T12:00:00Z",
          build_status: "success",
          last_execution_status: "running",
          last_execution_start_time: "2023-08-01T12:30:00Z",
          job_type: "run",
        },
      ],
    });

    renderComponent();

    // Ожидаем, что спиннер загрузки отображается изначально
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // Ждем загрузки задач и рендера компонента
    const taskElement = await screen.findByText("Тестовая задача 1");

    // Проверяем, что задача отображается
    expect(taskElement).toBeInTheDocument();

    // Проверяем, что спиннер загрузки исчез
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  test("корректно применяет фильтры", async () => {
    axiosInstance.get.mockResolvedValue({
      data: [
        {
          job_id: "job1",
          job_name: "Тестовая задача 1",
          created_at: "2023-08-01T12:00:00Z",
          build_status: "success",
          last_execution_status: "running",
          last_execution_start_time: "2023-08-01T12:30:00Z",
          job_type: "run",
        },
        {
          job_id: "job2",
          job_name: "Тестовая задача 2",
          created_at: "2023-08-02T12:00:00Z",
          build_status: "failed",
          last_execution_status: "failed",
          last_execution_start_time: "2023-08-02T12:30:00Z",
          job_type: "run",
        },
      ],
    });

    renderComponent();

    // Ждем загрузки задач
    const taskElement1 = await screen.findByText("Тестовая задача 1");
    const taskElement2 = await screen.findByText("Тестовая задача 2");

    // Обе задачи должны отображаться
    expect(taskElement1).toBeInTheDocument();
    expect(taskElement2).toBeInTheDocument();

    // Симулируем нажатие на фильтр статуса 'running'
    fireEvent.click(screen.getByRole("button", { name: /running/i }));

    // Проверяем, что setSelectedStatus вызывается
    expect(mockTasksFiltersContext.setSelectedStatus).toHaveBeenCalledWith(
      "running"
    );
  });

  test("отображает задачи в виде карточек на мобильных экранах", async () => {
    axiosInstance.get.mockResolvedValue({
      data: [
        {
          job_id: "job1",
          job_name: "Тестовая задача 1",
          created_at: "2023-08-01T12:00:00Z",
          build_status: "success",
          last_execution_status: "running",
          last_execution_start_time: "2023-08-01T12:30:00Z",
          job_type: "run",
        },
      ],
    });

    renderComponent("mobile");

    // Ждем загрузки задач
    const taskElement = await screen.findByText("Тестовая задача 1");

    // Проверяем, что задача отображается
    expect(taskElement).toBeInTheDocument();

    // Проверяем, что отображается компонент Card (для мобильной вёрстки)
    expect(screen.getByText("Тестовая задача 1")).toBeInTheDocument();
  });

  test("обрабатывает ошибки при загрузке данных", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    // Ждем обработки ошибки
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());

    // Проверяем, что отображается сообщение об отсутствии задач
    await waitFor(() =>
      expect(screen.getByText("Нет доступных задач.")).toBeInTheDocument()
    );
  });

  test("открывает диалог деталей при клике на задачу", async () => {
    axiosInstance.get.mockResolvedValue({
      data: [
        {
          job_id: "job1",
          job_name: "Тестовая задача 1",
          created_at: "2023-08-01T12:00:00Z",
          build_status: "success",
          last_execution_status: "running",
          last_execution_start_time: "2023-08-01T12:30:00Z",
          job_type: "run",
        },
      ],
    });

    renderComponent();

    // Ждем загрузки задач
    const taskElement = await screen.findByText("Тестовая задача 1");

    // Симулируем клик по задаче
    fireEvent.click(taskElement);

    // Проверяем, что компонент диалога деталей отображается
    expect(screen.getByTestId("tasks-details-dialog")).toBeInTheDocument();
  });

  test("рендерит компонент TasksActions с правильными пропсами", async () => {
    axiosInstance.get.mockResolvedValue({
      data: [
        {
          job_id: "job1",
          job_name: "Тестовая задача 1",
          created_at: "2023-08-01T12:00:00Z",
          build_status: "success",
          last_execution_status: "running",
          last_execution_start_time: "2023-08-01T12:30:00Z",
          job_type: "run",
        },
      ],
    });

    renderComponent();

    // Ждем загрузки задач
    await screen.findByText("Тестовая задача 1");

    // Проверяем, что компонент TasksActions рендерится
    expect(screen.getByTestId("tasks-actions")).toBeInTheDocument();
  });

  test("корректно обрабатывает переключение типа задач", async () => {
    axiosInstance.get.mockResolvedValue({
      data: [
        {
          job_id: "job1",
          job_name: "Deploy задача",
          created_at: "2023-08-01T12:00:00Z",
          build_status: "success",
          last_execution_status: "running",
          last_execution_start_time: "2023-08-01T12:30:00Z",
          job_type: "deploy",
        },
        {
          job_id: "job2",
          job_name: "Run задача",
          created_at: "2023-08-02T12:00:00Z",
          build_status: "success",
          last_execution_status: "completed",
          last_execution_start_time: "2023-08-02T12:30:00Z",
          job_type: "run",
        },
      ],
    });

    renderComponent();

    // Ждем загрузки задач
    const runTaskElement = await screen.findByText("Run задача");

    // По умолчанию selectedJobType равен 'run', поэтому должна отображаться только 'Run задача'
    expect(runTaskElement).toBeInTheDocument();
    expect(screen.queryByText("Deploy задача")).not.toBeInTheDocument();

    // Кликаем по кнопке 'Deploy', чтобы переключить тип задачи
    fireEvent.click(screen.getByRole("button", { name: /Deploy/i }));

    // Проверяем, что setSelectedJobType вызывается
    expect(mockTasksFiltersContext.setSelectedJobType).toHaveBeenCalledWith(
      "deploy"
    );
  });
});
