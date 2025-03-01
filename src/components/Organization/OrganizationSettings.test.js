// src/components/Organization/OrganizationSettings.test.js

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import OrganizationSettings from "./OrganizationSettings.js";
import { OrganizationContext } from "./OrganizationContext.js";
import { AuthContext } from "../../AuthContext.js";

import {
  getOrgMembers,
  addOrgMember,
  // removeOrgMember, // Удаляем импорт removeOrgMember
} from "../../api.js";

// Мокаем компонент OrganizationEvents
jest.mock("./OrganizationEvents", () => () => (
  <div data-testid="OrganizationEventsMock" />
));

// Мокаем функции API
jest.mock("../../api.js", () => {
  const getOrgMembers = jest.fn();
  const addOrgMember = jest.fn();
  // const removeOrgMember = jest.fn(); // Удаляем мок removeOrgMember

  const mockApi = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    // Другие методы, если необходимо
  };

  return {
    __esModule: true,
    default: mockApi,
    getOrgMembers,
    addOrgMember,
    // removeOrgMember, // Удаляем экспорт removeOrgMember
  };
});

describe("OrganizationSettings Component", () => {
  // Моковые данные пользователя
  const mockUser = {
    id: "user-1",
    email: "user@example.com",
    role: "owner",
  };

  // Моковая организация
  const mockOrganization = {
    id: "org-1",
    name: "Organization 1",
  };

  // Функция для определения, является ли пользователь владельцем организации
  const isCurrentOrgOwner = jest.fn(() => true);

  // Мокаем контекст организации
  const mockOrganizationContextValue = {
    currentOrganization: mockOrganization,
    isCurrentOrgOwner,
  };

  // Мокаем контекст аутентификации
  const mockAuthContextValue = {
    user: mockUser,
  };

  // Вспомогательная функция для рендеринга компонента с контекстами
  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <OrganizationContext.Provider value={mockOrganizationContextValue}>
          <OrganizationSettings />
        </OrganizationContext.Provider>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Сбрасываем значение currentOrganization перед каждым тестом
    mockOrganizationContextValue.currentOrganization = mockOrganization;
    // Сбрасываем возвращаемое значение isCurrentOrgOwner на true
    isCurrentOrgOwner.mockReturnValue(true);

    // Устанавливаем поведение getOrgMembers по умолчанию
    getOrgMembers.mockImplementation(() => Promise.resolve({ data: [] }));
  });

  test("Отображает сообщение, если организация не выбрана", () => {
    // Организация не выбрана
    mockOrganizationContextValue.currentOrganization = null;

    renderComponent();

    expect(
      screen.getByText("Пожалуйста, выберите организацию для настройки.")
    ).toBeInTheDocument();
  });

  test("Отображает список участников после загрузки", async () => {
    const mockMembers = [
      {
        user_id: "user-1",
        email: "member1@example.com",
        role: "member",
        avatar_url: "https://example.com/avatar1.png",
      },
      {
        user_id: "user-2",
        email: "member2@example.com",
        role: "owner",
        avatar_url: "https://example.com/avatar2.png",
      },
    ];

    getOrgMembers.mockResolvedValueOnce({ data: mockMembers });

    renderComponent();

    // Ожидаем, что индикатор загрузки отображается
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // Ждем завершения загрузки и отображения участников
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.getByText("member1@example.com")).toBeInTheDocument();
      expect(screen.getByText("member2@example.com")).toBeInTheDocument();
    });

    expect(getOrgMembers).toHaveBeenCalledWith(mockOrganization.id);
  });

  test("Отображает сообщение об ошибке при неудачной загрузке участников", async () => {
    getOrgMembers.mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText("Ошибка при получении членов организации.")
      ).toBeInTheDocument();
    });

    // Проверяем, что индикатор загрузки исчез
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  test("Добавляет нового участника в организацию", async () => {
    const initialMembers = [];

    // Первоначальный мок для getOrgMembers
    getOrgMembers.mockResolvedValueOnce({ data: initialMembers });

    renderComponent();

    // Ждем завершения начальной загрузки
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Устанавливаем моки перед кликом
    addOrgMember.mockResolvedValueOnce({});

    const updatedMembers = [
      {
        user_id: "user-3",
        email: "newmember@example.com",
        role: "member",
        avatar_url: "https://example.com/avatar3.png",
      },
    ];
    getOrgMembers.mockResolvedValueOnce({ data: updatedMembers });

    // Вводим email нового участника и нажимаем кнопку
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Email нового участника"), {
        target: { value: "newmember@example.com" },
      });

      fireEvent.click(screen.getByText("Добавить участника"));
    });

    // Проверяем, что функция addOrgMember была вызвана
    expect(addOrgMember).toHaveBeenCalledWith(
      mockOrganization.id,
      "newmember@example.com"
    );

    // Ждем обновления списка участников
    await waitFor(() => {
      expect(screen.getByText("newmember@example.com")).toBeInTheDocument();
    });
  });

  test("Отображает сообщение об ошибке при неудачном добавлении участника", async () => {
    const initialMembers = [];

    getOrgMembers.mockResolvedValueOnce({ data: initialMembers });
    addOrgMember.mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText("Email нового участника"), {
        target: { value: "newmember@example.com" },
      });

      fireEvent.click(screen.getByText("Добавить участника"));
    });

    // Проверяем, что функция addOrgMember была вызвана
    expect(addOrgMember).toHaveBeenCalledWith(
      mockOrganization.id,
      "newmember@example.com"
    );

    // Ждем отображения сообщения об ошибке
    await waitFor(() => {
      expect(
        screen.getByText("Ошибка при добавлении члена организации.")
      ).toBeInTheDocument();
    });
  });

  test("Отображает форму добавления участника только для владельца организации", () => {
    isCurrentOrgOwner.mockReturnValueOnce(false);

    renderComponent();

    expect(
      screen.queryByLabelText("Email нового участника")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Добавить участника")).not.toBeInTheDocument();
  });
});
