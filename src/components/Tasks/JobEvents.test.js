// src/components/Tasks/JobEvents.test.jsx

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axiosInstance from "../../api";
import JobEvents from "./JobEvents";
import "@testing-library/jest-dom";

// Мокаем axiosInstance
jest.mock("../../api");

describe("Компонент JobEvents", () => {
  const mockJobId = "job-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Отображает индикатор загрузки при начальной загрузке", () => {
    render(<JobEvents jobId={mockJobId} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("Отправляет запрос к бэкенду при монтировании и отображает данные при успешном ответе", async () => {
    const mockEvents = [
      {
        timestamp: "2023-10-01T12:34:56Z",
        level: "info",
        event: "Событие 1",
      },
      {
        timestamp: "2023-10-01T13:00:00Z",
        level: "warning",
        event: "Событие 2",
      },
    ];

    axiosInstance.get.mockResolvedValueOnce({ data: mockEvents });

    render(<JobEvents jobId={mockJobId} />);

    // Проверяем, что запрос был отправлен с правильными параметрами
    expect(axiosInstance.get).toHaveBeenCalledWith("/jobs/get-events", {
      params: { job_id: mockJobId },
    });

    // Ждём, пока данные загрузятся и будут отображены
    await waitFor(() => {
      expect(screen.getByText("Событие 1")).toBeInTheDocument();
      expect(screen.getByText("Событие 2")).toBeInTheDocument();
    });

    // Проверяем, что индикатор загрузки исчез
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  test("Отображает сообщение об ошибке, если запрос завершается с ошибкой", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("Network Error"));

    render(<JobEvents jobId={mockJobId} />);

    // Ждём, пока произойдёт обновление состояния
    await waitFor(() => {
      expect(
        screen.getByText("Ошибка при загрузке событий")
      ).toBeInTheDocument();
    });

    // Проверяем, что индикатор загрузки исчез
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  test("Отображает сообщение, если список событий пуст", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: [] });

    render(<JobEvents jobId={mockJobId} />);

    await waitFor(() => {
      expect(screen.getByText("Событий нет.")).toBeInTheDocument();
    });
  });

  test("Не делает запрос, если jobId не передан", () => {
    render(<JobEvents />);

    // Проверяем, что запрос не был отправлен
    expect(axiosInstance.get).not.toHaveBeenCalled();

    // Проверяем, что ничего не отображается
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("Событий нет.")).not.toBeInTheDocument();
  });

  test("Применяет правильные стили для уровней событий", async () => {
    const mockEvents = [
      {
        timestamp: "2023-10-01T12:34:56Z",
        level: "info",
        event: "Информационное событие",
      },
      {
        timestamp: "2023-10-01T13:00:00Z",
        level: "warning",
        event: "Предупреждение",
      },
      {
        timestamp: "2023-10-01T14:00:00Z",
        level: "error",
        event: "Ошибка",
      },
      {
        timestamp: "2023-10-01T15:00:00Z",
        level: "success",
        event: "Успех",
      },
    ];

    axiosInstance.get.mockResolvedValueOnce({ data: mockEvents });

    render(<JobEvents jobId={mockJobId} />);

    await waitFor(() => {
      mockEvents.forEach((event) => {
        expect(screen.getByText(event.event)).toBeInTheDocument();
      });
    });

    // Дополнительные проверки стилей могут быть добавлены при необходимости
  });
});
