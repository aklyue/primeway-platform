// src/components/Organization/OrganizationContext.test.js

import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import { OrganizationProvider, useOrganization } from "./OrganizationContext";
import { AuthContext } from "../../AuthContext"; // Убедитесь, что импортируете из правильного места
import axiosInstance from "../../api";

jest.mock("../../api");

describe("OrganizationContext", () => {
  let mockUser;
  let TestComponent;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      organizations: [
        { id: "org-1", name: "Organization 1", role: "owner" },
        { id: "org-2", name: "Organization 2", role: "member" },
      ],
      billing_account_id: "billing-123",
    };

    // Создаем тестовый компонент для проверки хука useOrganization
    TestComponent = () => {
      const {
        organizations,
        currentOrganization,
        switchOrganization,
        getCurrentUserRole,
        isCurrentOrgOwner,
        walletBalance,
        walletLoading,
        walletError,
        fetchWalletBalance,
      } = useOrganization();

      return (
        <div>
          <div data-testid="organizations">{JSON.stringify(organizations)}</div>
          <div data-testid="currentOrganization">
            {JSON.stringify(currentOrganization)}
          </div>
          <div data-testid="currentUserRole">{getCurrentUserRole() || ""}</div>
          <div data-testid="isCurrentOrgOwner">
            {isCurrentOrgOwner() ? "true" : "false"}
          </div>
          <div data-testid="walletBalance">{walletBalance}</div>
          <div data-testid="walletLoading">
            {walletLoading ? "true" : "false"}
          </div>
          <div data-testid="walletError">{walletError}</div>
          <button
            data-testid="switchOrgButton"
            onClick={() => switchOrganization("org-2")}
          >
            Switch Organization
          </button>
          <button
            data-testid="fetchWalletButton"
            onClick={() => fetchWalletBalance(true)}
          >
            Fetch Wallet Balance
          </button>
        </div>
      );
    };
  });

  test("Проверка начального состояния без пользователя", () => {
    const mockAuthContext = { user: null };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrganizationProvider>
          <TestComponent />
        </OrganizationProvider>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId("organizations").textContent).toBe("[]");
    expect(screen.getByTestId("currentOrganization").textContent).toBe("null");
    expect(screen.getByTestId("currentUserRole").textContent).toBe("");
    expect(screen.getByTestId("isCurrentOrgOwner").textContent).toBe("false");
    expect(screen.getByTestId("walletBalance").textContent).toBe("");
    expect(screen.getByTestId("walletLoading").textContent).toBe("false");
    expect(screen.getByTestId("walletError").textContent).toBe("");
  });

  test("Проверка состояния с пользователем", async () => {
    const mockAuthContext = { user: mockUser };

    axiosInstance.get.mockResolvedValue({ data: { balance: 100 } });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrganizationProvider>
          <TestComponent />
        </OrganizationProvider>
      </AuthContext.Provider>
    );

    // Ожидаем, пока загрузится организация и обновится состояние
    await waitFor(() => {
      expect(screen.getByTestId("organizations").textContent).toBe(
        JSON.stringify(mockUser.organizations)
      );
    });

    expect(screen.getByTestId("currentOrganization").textContent).toBe(
      JSON.stringify(mockUser.organizations[0])
    );
    expect(screen.getByTestId("currentUserRole").textContent).toBe("owner");
    expect(screen.getByTestId("isCurrentOrgOwner").textContent).toBe("true");

    // Ожидаем, пока загрузится баланс кошелька
    await waitFor(() => {
      expect(screen.getByTestId("walletLoading").textContent).toBe("false");
    });

    expect(screen.getByTestId("walletBalance").textContent).toBe("100");
    expect(screen.getByTestId("walletError").textContent).toBe("");
  });

  test("Проверка смены организации", async () => {
    const mockAuthContext = { user: mockUser };

    axiosInstance.get.mockResolvedValue({ data: { balance: 100 } });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrganizationProvider>
          <TestComponent />
        </OrganizationProvider>
      </AuthContext.Provider>
    );

    // Ожидаем первоначальной загрузки
    await waitFor(() => {
      expect(screen.getByTestId("currentOrganization").textContent).toBe(
        JSON.stringify(mockUser.organizations[0])
      );
    });

    // Симулируем нажатие на кнопку смены организации
    await waitFor(() => {
      screen.getByTestId("switchOrgButton").click();
    });

    // Проверяем, что текущая организация изменилась
    await waitFor(() => {
      expect(screen.getByTestId("currentOrganization").textContent).toBe(
        JSON.stringify(mockUser.organizations[1])
      );
    });

    expect(screen.getByTestId("currentUserRole").textContent).toBe("member");
    expect(screen.getByTestId("isCurrentOrgOwner").textContent).toBe("false");
  });

  test("Проверка обработки ошибки при загрузке баланса", async () => {
    const mockAuthContext = { user: mockUser };

    axiosInstance.get.mockRejectedValue(new Error("Network Error"));

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrganizationProvider>
          <TestComponent />
        </OrganizationProvider>
      </AuthContext.Provider>
    );

    // Ожидаем, пока walletLoading станет false
    await waitFor(() => {
      expect(screen.getByTestId("walletLoading").textContent).toBe("false");
    });

    expect(screen.getByTestId("walletBalance").textContent).toBe("");
    expect(screen.getByTestId("walletError").textContent).toBe(
      "Ошибка при загрузке баланса."
    );
  });
});
