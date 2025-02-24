// src/App.test.js

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AuthContext } from "./AuthContext";
import { OrganizationContext } from "./components/Organization/OrganizationContext";
import { BrowserRouter } from "react-router-dom";
import { Layout } from "./App"; // Убедитесь, что путь к компоненту Layout корректный
import axiosInstance from "./api";
import { useMediaQuery } from "@mui/material";

// Мокаем axiosInstance
jest.mock("./api");

// Мокаем useMediaQuery
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn(),
}));

describe("Компонент Layout", () => {
  let mockAuthContext;
  let mockOrganizationContext;

  beforeEach(() => {
    jest.clearAllMocks();

    // Замоканный AuthContext
    mockAuthContext = {
      isLoggedIn: true,
      user: {
        username: "testuser",
        avatar_url: "test-avatar-url",
      },
      loading: false,
      openCaptchaModal: false,
      setOpenCaptchaModal: jest.fn(),
      openRegistrationModal: false,
      setOpenRegistrationModal: jest.fn(),
      setAuthenticating: jest.fn(),
    };

    // Замоканный OrganizationContext
    mockOrganizationContext = {
      currentOrganization: {
        id: 1,
        name: "Test Organization",
      },
      organizations: [
        { id: 1, name: "Test Organization" },
        { id: 2, name: "Another Organization" },
      ],
      setCurrentOrganization: jest.fn(),
      fetchOrganizations: jest.fn(),
    };

    // Мокаем useMediaQuery, чтобы кнопка событий отображалась
    useMediaQuery.mockImplementation(() => false);
  });

  test("renders loading spinner when loading is true", () => {
    // Устанавливаем loading в true
    mockAuthContext.loading = true;

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrganizationContext.Provider value={mockOrganizationContext}>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </OrganizationContext.Provider>
      </AuthContext.Provider>
    );

    // Ожидаем, что спиннер загрузки присутствует в документе
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("shows captcha modal when openCaptchaModal is true", () => {
    // Устанавливаем openCaptchaModal в true
    mockAuthContext.openCaptchaModal = true;

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrganizationContext.Provider value={mockOrganizationContext}>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </OrganizationContext.Provider>
      </AuthContext.Provider>
    );

    // Проверяем наличие текста в модальном окне капчи
    expect(
      screen.getByText("Подтвердите, что вы не робот")
    ).toBeInTheDocument();
  });

  test("shows registration modal when openRegistrationModal is true", () => {
    // Устанавливаем openRegistrationModal в true
    mockAuthContext.openRegistrationModal = true;

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrganizationContext.Provider value={mockOrganizationContext}>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </OrganizationContext.Provider>
      </AuthContext.Provider>
    );

    // Проверяем наличие текста в модальном окне регистрации
    expect(screen.getByText("Добро пожаловать")).toBeInTheDocument();
  });

  test("renders main content when user is logged in and modals are closed", () => {
    // Рендерим компонент с пользователем, который вошел в систему, и закрытыми модальными окнами
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrganizationContext.Provider value={mockOrganizationContext}>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </OrganizationContext.Provider>
      </AuthContext.Provider>
    );

    // Проверяем, что основной контент отображается
    expect(screen.getByText("PrimeWay")).toBeInTheDocument();
    // Проверяем, что аватар пользователя отображается
    expect(screen.getByAltText("testuser")).toBeInTheDocument();
  });

  test("does not display events icon when user is not logged in", () => {
    // Устанавливаем isLoggedIn в false
    mockAuthContext.isLoggedIn = false;

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrganizationContext.Provider value={mockOrganizationContext}>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </OrganizationContext.Provider>
      </AuthContext.Provider>
    );

    // Иконка событий не должна отображаться
    const eventsButton = screen.queryByLabelText("Открыть события");
    expect(eventsButton).not.toBeInTheDocument();
  });
});
