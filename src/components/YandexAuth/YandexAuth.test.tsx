import { render, screen, waitFor } from "@testing-library/react";
import YandexAuth from "./YandexAuth";
import { useNavigate } from "react-router-dom";
import { login } from "../../store/slices/authSlice";
import * as reduxHooks from "../../store/hooks";

// Моки
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../store/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("../../store/slices/authSlice", () => ({
  login: jest.fn(),
}));

describe("YandexAuth", () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();
  const setAuthenticating = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (reduxHooks.useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: {
          authToken: null,
          loading: false,
          isLoggedIn: false,
          user: null,
          openCaptchaModal: false,
          openRegistrationModal: false,
        },
      })
    );
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    // Мокаем глобальный объект YaAuthSuggest
    window.YaAuthSuggest = {
      init: jest.fn().mockResolvedValue({
        handler: jest.fn().mockResolvedValue({
          access_token: "fake_token",
        }),
      }),
    };

    // Мокаем fetch
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        jwt_token: "jwt_token",
        user: { id: "1", email: "test@example.com" },
      }),
    }) as jest.Mock;
  });

  it("должен отобразить индикатор загрузки кнопки", async () => {
    render(<YandexAuth setAuthenticating={setAuthenticating} />);

    // Контейнер кнопки существует
    expect(
      screen.getByTestId("yandex-auth-container", { exact: false })
    ).toBeInTheDocument();

    // Появляется CircularProgress
    expect(screen.getAllByRole("progressbar").length).toBeGreaterThan(0);

    await waitFor(() => {
      if (window.YaAuthSuggest) {
        expect(window.YaAuthSuggest.init).toHaveBeenCalled();
      }
    });
  });

  it("вызывает login и редирект при успешной авторизации", async () => {
    render(<YandexAuth setAuthenticating={setAuthenticating} />);

    await waitFor(() => {
      if (window.YaAuthSuggest) {
        expect(window.YaAuthSuggest.init).toHaveBeenCalled();
      }
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/yandex`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ token: "fake_token" }),
        })
      );
    });

    await waitFor(() => {
      const fakeUser = {
        id: "1",
        email: "test@example.com",
        username: "testuser",
        billing_account_id: "billing-123",
        organizations: [],
      };
      expect(mockDispatch).toHaveBeenCalledWith(
        login({
          token: "jwt_token",
          user: fakeUser,
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/tasks");
    });
  });
});
