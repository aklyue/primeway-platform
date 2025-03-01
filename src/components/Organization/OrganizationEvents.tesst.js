// src/components/Organization/OrganizationEvents.test.js

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import axiosInstance from "../../api";
import OrganizationEvents from "./OrganizationEvents";

jest.mock("../../api");

describe("Компонент OrganizationEvents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Отображает индикатор загрузки во время получения событий", async () => {
    // Создаем незавершающийся промис, чтобы имитировать загрузку
    let resolvePromise;
    axiosInstance.get.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<OrganizationEvents organizationId="org-1" />);

    // Проверяем, что запрос был сделан с правильными параметрами
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/organizations/org-1/events",
      { params: { amount: undefined } }
    );

    // Проверяем, что индикатор загрузки отображается
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // Завершаем промис, чтобы избежать утечки
    await act(async () => {
      resolvePromise({ data: [] });
    });
  });

  test("Отображает сообщение об ошибке при неудачной загрузке событий", async () => {
    axiosInstance.get.mockRejectedValue(new Error("Network Error"));

    render(<OrganizationEvents organizationId="org-1" />);

    // Проверяем, что запрос был сделан с правильными параметрами
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/organizations/org-1/events",
      { params: { amount: undefined } }
    );

    // Ожидаем, что сообщение об ошибке отображается
    await waitFor(() => {
      expect(
        screen.getByText("Ошибка при загрузке событий")
      ).toBeInTheDocument();
    });
  });

  test("Отображает список событий при успешной загрузке", async () => {
    const mockEvents = [
      {
        timestamp: "2023-10-05T12:34:56.789Z",
        level: "info",
        event: "Событие 1 произошло",
      },
      {
        timestamp: "2023-10-04T10:00:00.000Z",
        level: "error",
        event: "Событие 2 произошло",
      },
    ];

    axiosInstance.get.mockResolvedValue({ data: mockEvents });

    render(<OrganizationEvents organizationId="org-1" amount={10} />);

    // Проверяем, что запрос был сделан с правильными параметрами
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/organizations/org-1/events",
      { params: { amount: 10 } }
    );

    // Ожидаем завершения загрузки
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Проверяем, что события отображаются
    expect(screen.getByText("Событие 1 произошло")).toBeInTheDocument();
    expect(screen.getByText("Событие 2 произошло")).toBeInTheDocument();

    // Проверяем форматирование даты и уровня события
    expect(screen.getByText(/05\.10\.2023 15:34:56/i)).toBeInTheDocument();
    expect(screen.getByText(/INFO$/)).toBeInTheDocument();

    expect(screen.getByText(/04\.10\.2023 13:00:00/i)).toBeInTheDocument();
    expect(screen.getByText(/ERROR$/)).toBeInTheDocument();
  });

  test("Отображает сообщение, если событий нет", async () => {
    axiosInstance.get.mockResolvedValue({ data: [] });

    render(<OrganizationEvents organizationId="org-1" />);

    // Проверяем, что запрос был сделан с правильными параметрами
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/organizations/org-1/events",
      { params: { amount: undefined } }
    );

    // Ожидаем завершения загрузки и отображения сообщения
    await waitFor(() => {
      expect(screen.getByText("Событий нет.")).toBeInTheDocument();
    });
  });

  test("Не выполняет запрос, если organizationId не указан", async () => {
    render(<OrganizationEvents />);

    expect(axiosInstance.get).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Проверяем, что нет сообщений или данных
    expect(screen.queryByText("Событий нет.")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Ошибка при загрузке событий")
    ).not.toBeInTheDocument();
  });
});
