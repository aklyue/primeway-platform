// Billing.test.js

import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import Billing from "./Billing";
import { AuthContext } from "../AuthContext";
import { OrganizationContext } from "./Organization/OrganizationContext";

// Мокаем модуль '../api'
jest.mock("../api");

// Импортируем замоканный axiosInstance из '../api'
import axiosInstance from "../api";

// Создаём переменную для хранения пропсов TPaymentWidget
let tPaymentWidgetProps = {};

// Мокаем компонент TPaymentWidget
jest.mock("./TPaymentWidget", () => {
  return function MockedTPaymentWidget(props) {
    tPaymentWidgetProps = props; // Сохраняем пропсы
    return <div data-testid="payment-widget" />;
  };
});

// Импортируем зависимости для преобразования дат (если используются в тестах)
import "chartjs-adapter-date-fns";

describe("Компонент Billing", () => {
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
    ...props
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
          <Billing {...props} />
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

  test("Делает корректные запросы к API и отображает данные после успешных запросов", async () => {
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

    // Проверяем, что запросы к API были сделаны с правильными параметрами
    const config = {
      headers: {
        Authorization: `Bearer ${mockUser.token}`,
      },
    };

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/billing/${mockUser.billing_account_id}/transactions/credit_usage`,
      config
    );

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/billing/${mockUser.billing_account_id}/transactions/credit_purchase`,
      config
    );

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/billing/${mockUser.billing_account_id}/credits_usage`,
      config
    );

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

  test("Обрабатывает ошибки при запросах к API и отображает сообщение об ошибке", async () => {
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

    // Проверяем, что запросы к API были сделаны
    expect(axiosInstance.get).toHaveBeenCalledTimes(3);

    // Ожидаем окончания загрузки данных и появления сообщения об ошибке
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Проверяем, что сообщение об ошибке отображается
    expect(screen.getByText("Network Error")).toBeInTheDocument();
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

  test("Обрабатывает случай, когда нет данных для графика покупок кредитов", async () => {
    // Мокаем ответы от сервера
    const mockUsagePerDay = {};

    const mockCreditPurchasesTransactions = [];

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

    // Проверяем, что отображается сообщение об отсутствии данных
    expect(
      screen.getByText("Нет данных о покупках кредитов")
    ).toBeInTheDocument();
  });

  test("Обрабатывает случай, когда нет данных для графика расходов", async () => {
    // Мокаем ответы от сервера
    const mockUsagePerDay = {};

    const mockCreditPurchasesTransactions = [
      {
        created_at: "2023-10-01T12:00:00Z",
        credits: "100",
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

    // Проверяем, что отображается сообщение об отсутствии данных для графика расходов
    expect(
      screen.getByText("Нет данных для отображения графика.")
    ).toBeInTheDocument();
  });

  test("Обрабатывает ошибку при загрузке баланса кошелька", async () => {
    const walletError = "Ошибка при загрузке баланса кошелька";

    // Оборачиваем рендеринг в act
    await act(async () => {
      renderComponent({ walletError });
    });

    // Ожидаем окончания загрузки данных
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Проверяем, что отображается сообщение об ошибке баланса
    expect(screen.getByText(walletError)).toBeInTheDocument();
  });

  test("Вызывает функцию обновления данных после успешной оплаты", async () => {
    // Мокаем ответы от сервера
    axiosInstance.get.mockResolvedValue({ data: { transactions: [] } });

    // Оборачиваем рендеринг в act
    await act(async () => {
      renderComponent();
    });

    // Ожидаем окончания загрузки данных
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Проверяем, что пропсы сохранены
    expect(tPaymentWidgetProps).toBeDefined();

    // Симулируем успешную оплату
    const onSuccess = tPaymentWidgetProps.onSuccess;
    if (onSuccess) {
      await act(async () => {
        onSuccess();
      });
    }

    // Проверяем, что запросы к API были вызваны еще раз после оплаты
    expect(axiosInstance.get).toHaveBeenCalledTimes(6); // 3 при начальной загрузке и еще 3 после оплаты
  });
});
