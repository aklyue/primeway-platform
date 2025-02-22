// YandexAuth.test.js
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import YandexAuth from "./YandexAuth";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles"; // Импортируем ThemeProvider и createTheme
import "@testing-library/jest-dom";

// Мокаем useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("YandexAuth Component", () => {
  const mockNavigate = jest.fn();
  const setAuthenticating = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("Отображает индикатор загрузки при инициализации", () => {
    const mockContext = {
      login: jest.fn(),
      authToken: null,
      loading: true,
    };

    const theme = createTheme();

    render(
      <ThemeProvider theme={theme}>
        {" "}
        {/* Оборачиваем в ThemeProvider */}
        <AuthContext.Provider value={mockContext}>
          <YandexAuth setAuthenticating={setAuthenticating} />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test('Перенаправляет на "/" если пользователь уже аутентифицирован', () => {
    const mockContext = {
      login: jest.fn(),
      authToken: "some-token",
      loading: false,
    };

    const theme = createTheme();

    render(
      <ThemeProvider theme={theme}>
        {" "}
        {/* Оборачиваем в ThemeProvider */}
        <AuthContext.Provider value={mockContext}>
          <YandexAuth setAuthenticating={setAuthenticating} />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("Пытается загрузить скрипт YaAuthSuggest при отсутствии authToken", async () => {
    const mockContext = {
      login: jest.fn(),
      authToken: null,
      loading: false,
    };

    // Мокаем document.getElementById
    const authContainer = document.createElement("div");
    authContainer.id = "yandex-auth-container";
    document.body.appendChild(authContainer);

    // Удаляем window.YaAuthSuggest, если он уже существует
    delete window.YaAuthSuggest;

    const theme = createTheme();

    render(
      <ThemeProvider theme={theme}>
        {" "}
        {/* Оборачиваем в ThemeProvider */}
        <AuthContext.Provider value={mockContext}>
          <YandexAuth setAuthenticating={setAuthenticating} />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    // Ожидаем, что скрипт будет добавлен в документ
    await waitFor(() => {
      const script = document.querySelector(
        'script[src*="sdk-suggest-with-polyfills-latest.js"]'
      );
      expect(script).toBeInTheDocument();
    });

    // Очистка
    document.body.removeChild(authContainer);
  });
});
