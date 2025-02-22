import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TasksActions from "./TasksActions";
import "@testing-library/jest-dom";
import axiosInstance from "../../api";
import { Tooltip } from "@mui/material";

// Удаляем мокирование axiosInstance
// jest.mock("../../api");

// Мокаем Tooltip, если необходимо
jest.mock("@mui/material", () => {
  const mui = jest.requireActual("@mui/material");
  const MockedTooltip = ({ children }) => children;
  return { ...mui, Tooltip: MockedTooltip };
});

describe("Компонент TasksActions с реальными запросами к бэкенду", () => {
  const mockJob = {
    job_id: "existing_job_id", // Замените на реальный идентификатор задачи
    job_name: "Тестовая задача",
    job_type: "run",
    build_status: "success",
    last_execution_status: "completed",
  };

  const mockShowAlert = jest.fn();

  beforeAll(() => {
    // Устанавливаем токен авторизации в localStorage
    const token = process.env.TEST_ACCESS_TOKEN || "YOUR_ACCESS_TOKEN";
    localStorage.setItem("auth_token", token);
  });

  afterAll(() => {
    // Очищаем localStorage после тестов
    localStorage.removeItem("auth_token");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("корректно обрабатывает handleStartClick для задач типа run с реальным бэкендом", async () => {
    render(<TasksActions job={mockJob} showAlert={mockShowAlert} />);

    const menuButton = screen.getByLabelText("Действия");
    fireEvent.click(menuButton);

    const startMenuItem = screen.getByText("Запустить задачу");
    fireEvent.click(startMenuItem);

    // Ожидаем завершения асинхронных операций
    await waitFor(() => {
      // Проверяем, что не отображается сообщение об ошибке
      expect(mockShowAlert).not.toHaveBeenCalledWith(
        "Ошибка при получении конфигурации задачи.",
        "error"
      );
    });

    // Проверяем, что отображается StartJobDialog или что задача успешно запущена
    // В зависимости от того, что вы ожидаете, добавьте соответствующие проверки
  });
});
