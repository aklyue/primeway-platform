// src/components/ApiKeys.test.js

jest.mock("../api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

import axiosInstance from "../../api";

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import ApiKeys from "./ApiKeys";
import { OrganizationContext } from "../Organization/OrganizationContext";

global.confirm = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe("ApiKeys Component", () => {
  const mockOrganization = {
    id: "org-1",
    name: "Организация 1",
  };

  const renderComponent = () => {
    return render(
      <OrganizationContext.Provider
        value={{ currentOrganization: mockOrganization }}
      >
        <ApiKeys />
      </OrganizationContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Получает и отображает список API ключей при монтировании", async () => {
    const mockTokens = [
      {
        id: "1",
        name: "Тестовый ключ 1",
        masked_token: "*****abcd",
        created_at: "2023-10-10T10:00:00Z",
      },
      {
        id: "2",
        name: "Тестовый ключ 2",
        masked_token: "*****efgh",
        created_at: "2023-10-11T11:00:00Z",
      },
    ];

    axiosInstance.get.mockResolvedValueOnce({ data: { tokens: mockTokens } });

    renderComponent();

    // Ожидаем, что индикатор загрузки отображается
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // Дожидаемся окончания загрузки и отображения токенов
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.getByText("Тестовый ключ 1")).toBeInTheDocument();
      expect(screen.getByText("Тестовый ключ 2")).toBeInTheDocument();
    });

    expect(axiosInstance.get).toHaveBeenCalledWith("/list-tokens", {
      params: { organization_id: mockOrganization.id },
    });
  });

  test("Отображает сообщение об ошибке при неудачном получении токенов", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText("Не удалось получить API ключи.")
      ).toBeInTheDocument();
    });
  });

  test("Создает новый API ключ и отображает его", async () => {
    const mockTokens = [];

    axiosInstance.get.mockResolvedValueOnce({ data: { tokens: mockTokens } });

    const newTokenData = {
      id: "3",
      name: "Новый ключ",
      token: "new-secret-token",
      masked_token: "*****ijkl",
      created_at: "2023-10-12T12:00:00Z",
    };

    axiosInstance.post.mockResolvedValueOnce({ data: newTokenData });

    renderComponent();

    // Дожидаемся окончания загрузки
    await waitFor(() => {
      expect(
        screen.getByText("Еще не создано ни одного API ключа")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Создать новый API-Ключ"));

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Новый ключ" },
    });

    fireEvent.click(screen.getByText("Создать ключ"));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/generate-token", {
        organization_id: mockOrganization.id,
        name: "Новый ключ",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("API ключ создан")).toBeInTheDocument();
      expect(screen.getByText("Ваш новый API ключ:")).toBeInTheDocument();
      expect(screen.getByText(newTokenData.token)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Закрыть"));

    await waitFor(() => {
      expect(screen.getByText("Новый ключ")).toBeInTheDocument();
    });
  });

  test("Отображает сообщение об ошибке при неудачном создании ключа", async () => {
    const mockTokens = [];

    axiosInstance.get.mockResolvedValueOnce({ data: { tokens: mockTokens } });
    axiosInstance.post.mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText("Еще не создано ни одного API ключа")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Создать новый API-Ключ"));

    fireEvent.click(screen.getByText("Создать ключ"));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/generate-token", {
        organization_id: mockOrganization.id,
        name: "",
      });
    });

    // Ожидаем отображения сообщения об ошибке внутри модального окна
    const modal = screen.getByRole("dialog");

    await waitFor(() => {
      expect(
        within(modal).getByText("Не удалось создать API ключ.")
      ).toBeInTheDocument();
    });
  });

  test("Удаляет API ключ из списка после подтверждения", async () => {
    const mockTokens = [
      {
        id: "1",
        name: "Тестовый ключ 1",
        masked_token: "*****abcd",
        created_at: "2023-10-10T10:00:00Z",
      },
    ];

    axiosInstance.get.mockResolvedValueOnce({ data: { tokens: mockTokens } });
    axiosInstance.delete.mockResolvedValueOnce({});

    global.confirm.mockReturnValueOnce(true);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Тестовый ключ 1")).toBeInTheDocument();
    });

    // Уточним выбор кнопки, если в таблице несколько кнопок
    const actionButtons = screen.getAllByLabelText("Открыть меню действий");
    fireEvent.click(actionButtons[0]);

    fireEvent.click(screen.getByText("Удалить"));

    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith("/tokens/1");
    });

    await waitFor(() => {
      expect(screen.queryByText("Тестовый ключ 1")).not.toBeInTheDocument();
    });
  });

  test("Отображает сообщение об ошибке при неудачном удалении ключа", async () => {
    const mockTokens = [
      {
        id: "1",
        name: "Тестовый ключ 1",
        masked_token: "*****abcd",
        created_at: "2023-10-10T10:00:00Z",
      },
    ];

    axiosInstance.get.mockResolvedValueOnce({ data: { tokens: mockTokens } });
    axiosInstance.delete.mockRejectedValueOnce(new Error("Network Error"));

    global.confirm.mockReturnValueOnce(true);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Тестовый ключ 1")).toBeInTheDocument();
    });

    // Уточним выбор кнопки, если в таблице несколько кнопок
    const actionButtons = screen.getAllByLabelText("Открыть меню действий");
    fireEvent.click(actionButtons[0]);

    fireEvent.click(screen.getByText("Удалить"));

    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith("/tokens/1");
    });

    // Ожидаем отображения сообщения об ошибке
    await waitFor(() => {
      expect(
        screen.getByText("Не удалось удалить API ключ.")
      ).toBeInTheDocument();
    });
    // Токен все еще должен отображаться в списке
    expect(screen.getByText("Тестовый ключ 1")).toBeInTheDocument();
  });
});
