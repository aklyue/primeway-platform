// YandexAuth.test.js

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import YandexAuth from "./YandexAuth";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";

// Мокаем useNavigate из react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("YandexAuth Component", () => {
  let mockNavigate;
  let mockLogin;
  let setAuthenticatingMock;

  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();

    mockNavigate = jest.fn();
    mockLogin = jest.fn();
    setAuthenticatingMock = jest.fn();

    // Мокаем useNavigate
    useNavigate.mockReturnValue(mockNavigate);

    // Мокаем window.YaAuthSuggest
    window.YaAuthSuggest = {
      init: jest.fn(),
    };

    // Мокаем fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Очищаем моки после каждого теста
    delete window.YaAuthSuggest;
  });

  test('Перенаправляет на "/" при уже аутентифицированном пользователе', () => {
    render(
      <AuthContext.Provider
        value={{ authToken: "token123", loading: false, login: mockLogin }}
      >
        <YandexAuth setAuthenticating={setAuthenticatingMock} />
      </AuthContext.Provider>
    );

    // Проверяем, что navigate('/') был вызван
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("Инициализирует YaAuthSuggest и обрабатывает успешную аутентификацию", async () => {
    // Настраиваем моки для YaAuthSuggest.init()
    const handlerMock = jest.fn();
    const initPromise = Promise.resolve({ handler: handlerMock });
    window.YaAuthSuggest.init.mockReturnValue(initPromise);

    // Настраиваем мок для handler(), возвращающий access_token
    handlerMock.mockReturnValue(
      Promise.resolve({ access_token: "ya_access_token" })
    );

    // Настраиваем мок для fetch, возвращающий данные пользователя
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        jwt_token: "jwt_token",
        user: { id: 1, name: "Test User" },
      }),
    });

    render(
      <AuthContext.Provider
        value={{ authToken: null, loading: false, login: mockLogin }}
      >
        <YandexAuth setAuthenticating={setAuthenticatingMock} />
      </AuthContext.Provider>
    );

    // Ждем, пока setAuthenticating будет вызван с true
    await waitFor(() =>
      expect(setAuthenticatingMock).toHaveBeenCalledWith(true)
    );

    // Проверяем, что YaAuthSuggest.init был вызван с правильными параметрами
    expect(window.YaAuthSuggest.init).toHaveBeenCalled();

    // Проверяем, что handler был вызван
    expect(handlerMock).toHaveBeenCalled();

    // Проверяем, что fetch был вызван с правильными параметрами
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.primeway.io/auth/yandex",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: "ya_access_token" }),
      }
    );

    // Проверяем, что login был вызван с правильными параметрами
    expect(mockLogin).toHaveBeenCalledWith("jwt_token", {
      id: 1,
      name: "Test User",
    });

    // Проверяем, что navigate('/tasks') был вызван
    expect(mockNavigate).toHaveBeenCalledWith("/tasks");
  });

  test("Обрабатывает ошибку аутентификации корректно", async () => {
    // Мокаем console.error, чтобы подавить вывод ошибок в тестах
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Настраиваем моки для YaAuthSuggest.init()
    const handlerMock = jest.fn();
    const initPromise = Promise.resolve({ handler: handlerMock });
    window.YaAuthSuggest.init.mockReturnValue(initPromise);

    // Настраиваем мок для handler(), который выдает ошибку
    handlerMock.mockReturnValue(
      Promise.reject(new Error("Authentication failed"))
    );

    render(
      <AuthContext.Provider
        value={{ authToken: null, loading: false, login: mockLogin }}
      >
        <YandexAuth setAuthenticating={setAuthenticatingMock} />
      </AuthContext.Provider>
    );

    // Ждем, чтобы убедиться, что setAuthenticating не был вызван
    await waitFor(() => expect(setAuthenticatingMock).not.toHaveBeenCalled());

    // Проверяем, что YaAuthSuggest.init был вызван
    expect(window.YaAuthSuggest.init).toHaveBeenCalled();

    // Проверяем, что handler был вызван
    expect(handlerMock).toHaveBeenCalled();

    // Проверяем, что fetch не был вызван
    expect(global.fetch).not.toHaveBeenCalled();

    // Проверяем, что login не был вызван
    expect(mockLogin).not.toHaveBeenCalled();

    // Проверяем, что navigate не был вызван
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
