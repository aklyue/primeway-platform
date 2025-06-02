// src/Settings.test.js

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Settings from "./Settings";
import { AuthContext } from "../../AuthContext";
import { MemoryRouter } from "react-router-dom";

// Мокаем useNavigate из react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Мокаем localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Settings Component", () => {
  const mockUser = {
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    avatar_url: "https://example.com/avatar.jpg",
  };

  const mockLogout = jest.fn();
  const mockSetAuthenticating = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Обновляем mock для useNavigate перед каждым тестом
    require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);
  });

  test("Отображает информацию о пользователе", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
        <Settings setAuthenticating={mockSetAuthenticating} />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    // Проверяем, что отображаются основные элементы
    expect(screen.getByText("Настройки")).toBeInTheDocument();
    expect(screen.getByText("Информация о профиле")).toBeInTheDocument();

    // Проверяем имя пользователя
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    // Проверяем email пользователя
    expect(screen.getByText("john@example.com")).toBeInTheDocument();

    // Проверяем наличие аватара (используем alt текст)
    const avatar = screen.getByAltText("John Doe");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  test('Вызывает logout и перенаправляет при нажатии на кнопку "Выйти из аккаунта"', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
        <Settings setAuthenticating={mockSetAuthenticating} />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );

    // Нажимаем на кнопку "Выйти из аккаунта"
    const logoutButton = screen.getByText("Выйти из аккаунта");
    fireEvent.click(logoutButton);

    // Проверяем, что функция logout была вызвана
    expect(mockLogout).toHaveBeenCalledTimes(1);

    // Проверяем, что navigate был вызван с аргументом "/"
    expect(mockNavigate).toHaveBeenCalledWith("/");

    // Проверяем, что localStorage.removeItem был вызван с "lastCaptchaTime"
    expect(localStorage.removeItem).toHaveBeenCalledWith("lastCaptchaTime");

    // Проверяем, что setAuthenticating был вызван с false
    expect(mockSetAuthenticating).toHaveBeenCalledWith(false);
  });
});
