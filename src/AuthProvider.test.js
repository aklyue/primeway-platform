// src/AuthProvider.test.js

import React from "react";
import { render, act } from "@testing-library/react";

import axiosInstance from "./api";
import AuthProvider, { AuthContext } from "./AuthContext";

jest.mock("./api"); // Мокаем axiosInstance

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("Загружает данные пользователя при наличии токена", async () => {
    // Устанавливаем токен в localStorage
    localStorage.setItem("auth_token", "mock_token");

    // Мокаем ответ от бэкенда
    const mockUserData = { id: 1, name: "John Doe" };
    axiosInstance.get.mockResolvedValueOnce({ data: mockUserData });

    let contextValue;
    await act(async () => {
      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );
    });

    // Проверяем, что был сделан запрос к бэкенду
    expect(axiosInstance.get).toHaveBeenCalledWith("/auth/me");

    // Проверяем, что состояние обновилось корректно
    expect(contextValue.isLoggedIn).toBe(true);
    expect(contextValue.user).toEqual(mockUserData);
    expect(contextValue.authToken).toBe("mock_token");
  });

  test("Не делает запрос к бэкенду при отсутствии токена", async () => {
    let contextValue;
    await act(async () => {
      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );
    });

    // Проверяем, что запрос к бэкенду не был сделан
    expect(axiosInstance.get).not.toHaveBeenCalled();

    // Проверяем, что состояние устанавливается корректно
    expect(contextValue.isLoggedIn).toBe(false);
    expect(contextValue.user).toBe(null);
    expect(contextValue.authToken).toBe(null);
  });

  test("Очищает данные при ошибке во время запроса", async () => {
    // Устанавливаем токен в localStorage
    localStorage.setItem("auth_token", "mock_token");

    // Мокаем ошибку от бэкенда
    axiosInstance.get.mockRejectedValueOnce(new Error("Unauthorized"));

    let contextValue;
    await act(async () => {
      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );
    });

    // Проверяем, что был сделан запрос к бэкенду
    expect(axiosInstance.get).toHaveBeenCalledWith("/auth/me");

    // Проверяем, что токен удалён из localStorage
    expect(localStorage.getItem("auth_token")).toBe(null);

    // Проверяем, что состояние очищено
    expect(contextValue.isLoggedIn).toBe(false);
    expect(contextValue.user).toBe(null);
    expect(contextValue.authToken).toBe(null);
  });

  test("Функция login устанавливает данные пользователя и сохраняет токен", () => {
    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    const mockToken = "new_mock_token";
    const mockUserData = { id: 2, name: "Jane Smith" };

    act(() => {
      contextValue.login(mockToken, mockUserData);
    });

    // Проверяем, что состояние обновилось
    expect(contextValue.isLoggedIn).toBe(true);
    expect(contextValue.user).toEqual(mockUserData);
    expect(contextValue.authToken).toBe(mockToken);

    // Проверяем, что токен сохранён в localStorage
    expect(localStorage.getItem("auth_token")).toBe(mockToken);
  });

  test("Функция logout очищает данные пользователя и удаляет токен", () => {
    // Предварительно устанавливаем состояние
    localStorage.setItem("auth_token", "mock_token");
    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    act(() => {
      contextValue.logout();
    });

    // Проверяем, что состояние очищено
    expect(contextValue.isLoggedIn).toBe(false);
    expect(contextValue.user).toBe(null);
    expect(contextValue.authToken).toBe(null);
    expect(contextValue.openCaptchaModal).toBe(false);
    expect(contextValue.openRegistrationModal).toBe(false);

    // Проверяем, что токен удалён из localStorage
    expect(localStorage.getItem("auth_token")).toBe(null);
  });
});
