// Billing.test.js

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import Billing from "./Billing";
import { AuthContext } from "../AuthContext";
import { OrganizationContext } from "./Organization/OrganizationContext";

// Мокаем модуль '../api'
jest.mock("../api");

// Импортируем замоканный axiosInstance из '../api'
import axiosInstance from "../api";

// Мокаем компонент TPaymentWidget
jest.mock("./TPaymentWidget", () => () => <div data-testid="payment-widget" />);

// Импортируем зависимости для преобразования дат (если используются в тестах)
import "chartjs-adapter-date-fns";

describe("Billing Component", () => {
  const mockUser = {
    token: "mock-token",
    billing_account_id: "123",
  };

  const mockOrganization = {
    name: "Mock Organization",
  };

  // Функция для рендеринга компонента с контекстами
  const renderComponent = ({
    user = mockUser,
    currentOrganization = mockOrganization,
    isCurrentOrgOwner = () => true,
    walletBalance = 100,
    walletLoading = false,
    walletError = null,
  } = {}) => {
    return render(
      <AuthContext.Provider value={{ user }}>
        <OrganizationContext.Provider
          value={{
            currentOrganization,
            isCurrentOrgOwner,
            walletBalance,
            walletLoading,
            walletError,
          }}
        >
          <Billing />
        </OrganizationContext.Provider>
      </AuthContext.Provider>
    );
  };

  // Очищаем моки после каждого теста
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Отображает индикатор загрузки во время выполнения запросов", () => {
    // Рендерим компонент
    renderComponent();

    // Проверяем, что индикатор загрузки отображается
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("Корректно отображает данные после успешных запросов", async () => {
    // Мокаем ответы от сервера
    const mockUsagePerDay = {
      "2023-10-01": 50,
      "2023-10-02": 75,
    };

    const mockCreditPurchasesTransactions = [
      {
        created_at: "2023-10-01T12:00:00Z",
        credits: "100",
      },
      {
        created_at: "2023-10-02T13:00:00Z",
        credits: "150",
      },
    ];

    // Мокаем ответы от axiosInstance.get
    axiosInstance.get
      .mockResolvedValueOnce({ data: { transactions: [] } }) // Для /billing/{id}/transactions/credit_usage
      .mockResolvedValueOnce({
        data: { transactions: mockCreditPurchasesTransactions },
      }) // Для /billing/{id}/transactions/credit_purchase
      .mockResolvedValueOnce({ data: { usage_per_day: mockUsagePerDay } }); // Для /billing/{id}/credits_usage

    // Оборачиваем рендеринг в act
    await act(async () => {
      renderComponent();
    });

    // Ожидаем окончания загрузки данных
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Проверяем, что баланс кошелька отображается
    expect(screen.getByText(/Баланс кошелька:/)).toBeInTheDocument();
    expect(screen.getByText("100 ₽")).toBeInTheDocument();

    // Проверяем, что виджет оплаты отображается
    expect(screen.getByTestId("payment-widget")).toBeInTheDocument();

    // Проверяем, что заголовки графиков отображаются
    expect(screen.getByText("Покупки кредитов")).toBeInTheDocument();
    expect(screen.getByText("Расходы за последние 7 дней")).toBeInTheDocument();
  });

  test("Отображает сообщение об ошибке при неудачных запросах", async () => {
    const errorResponse = {
      response: {
        data: {
          detail: "Network Error",
        },
      },
      message: "Network Error",
    };

    // Замокаем все вызовы axiosInstance.get, чтобы они выбрасывали ошибку
    axiosInstance.get
      .mockRejectedValueOnce(errorResponse) // Первый вызов
      .mockRejectedValueOnce(errorResponse) // Второй вызов
      .mockRejectedValueOnce(errorResponse); // Третий вызов

    // Оборачиваем рендеринг в act
    await act(async () => {
      renderComponent();
    });

    // Ожидаем окончания загрузки данных и появления сообщения об ошибке
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Проверяем, что сообщение об ошибке отображается
    expect(screen.getByText(/Network Error/)).toBeInTheDocument();
  });

  test("Отображает сообщение, если организация не выбрана", () => {
    // Рендерим компонент без выбранной организации
    renderComponent({ currentOrganization: null });

    // Проверяем, что отображается соответствующее сообщение
    expect(
      screen.getByText(
        "Пожалуйста, выберите организацию для просмотра информации о биллинге."
      )
    ).toBeInTheDocument();
  });

  test("Отображает корректное сообщение для пользователя, не являющегося владельцем организации", () => {
    // Функция, возвращающая false, чтобы имитировать пользователя, не являющегося владельцем
    const isCurrentOrgOwner = () => false;

    // Рендерим компонент с данным условием
    renderComponent({ isCurrentOrgOwner });

    // Проверяем, что отображается заголовок
    expect(screen.getByText("Биллинг и Кошелек")).toBeInTheDocument();

    // Проверяем, что отображается соответствующее сообщение
    expect(
      screen.getByText(
        `Биллинг для Mock Organization управляется владельцем организации. Пожалуйста, свяжитесь с администратором организации по любым вопросам, связанным с биллингом.`
      )
    ).toBeInTheDocument();
  });
});
