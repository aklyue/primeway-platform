import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Layout } from "./Layout";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { BrowserRouter } from "react-router-dom";
import { useTour } from "@reactour/tour";

// Мокаем хуки
jest.mock("../../store/hooks");
jest.mock("@reactour/tour", () => ({
  useTour: jest.fn(),
}));
jest.mock("../../store/slices/authSlice", () => ({
  fetchUserData: jest.fn(),
  setOpenCaptchaModal: jest.fn(),
  setOpenRegistrationModal: jest.fn(),
}));
jest.mock("../../store/slices/organizationSlice", () => ({
  setOrganizations: jest.fn(),
  fetchWalletBalance: jest.fn(),
}));
jest.mock("../../store/selectors/organizationsSelectors", () => ({
  selectCurrentOrganization: jest.fn(() => null),
}));
jest.mock("../../Router", () => () => <div>Router Content</div>);
jest.mock("../SubscriptionToCaptcha", () => () => (
  <div data-testid="captcha-modal">Captcha Modal</div>
));
jest.mock("../YandexAuth", () => () => <div>YandexAuth</div>);
jest.mock("../Organization/OrganizationSwitcher", () => () => (
  <div>OrganizationSwitcher</div>
));
jest.mock("../Organization/OrganizationEvents", () => () => (
  <div>OrganizationEvents</div>
));

// Переопределяем типы
const useAppSelectorMock = useAppSelector as jest.Mock;
const useAppDispatchMock = useAppDispatch as jest.Mock;

describe("Layout", () => {
  let dispatchMock: jest.Mock;

  beforeEach(() => {
    dispatchMock = jest.fn();
    useAppDispatchMock.mockReturnValue(dispatchMock);

    (useTour as jest.Mock).mockReturnValue({
      setIsOpen: jest.fn(),
      setSteps: jest.fn(),
      setCurrentStep: jest.fn(),
    });

    // Общие значения для useAppSelector
    useAppSelectorMock.mockImplementation((selectorFn) =>
      selectorFn({
        auth: {
          user: {
            username: "testuser",
            avatar_url: "",
            billing_account_id: "billing-id",
            organizations: [{ id: "org-id", name: "Org Name" }],
          },
          isLoggedIn: true,
          openCaptchaModal: false,
          openRegistrationModal: false,
          loading: false,
        },
        organization: {
          organizations: [],
        },
      })
    );
  });

  const renderWithRouter = (ui: React.ReactElement) =>
    render(<BrowserRouter>{ui}</BrowserRouter>);

  test("рендерит layout и контент роутера", () => {
    renderWithRouter(<Layout />);
    expect(screen.getByText("Router Content")).toBeInTheDocument();
  });

  test("отображает модалку регистрации, если openRegistrationModal=true", () => {
    useAppSelectorMock.mockImplementation((selectorFn) =>
      selectorFn({
        auth: {
          ...selectorFn({ auth: {} }).auth,
          openRegistrationModal: true,
          loading: false,
          isLoggedIn: false,
        },
      })
    );
    renderWithRouter(<Layout />);
    expect(screen.getByText("YandexAuth")).toBeInTheDocument();
  });

  test("отображает модалку капчи, если openCaptchaModal=true", () => {
    useAppSelectorMock.mockImplementation((selectorFn) =>
      selectorFn({
        auth: {
          ...selectorFn({ auth: {} }).auth,
          openCaptchaModal: true,
          loading: false,
        },
      })
    );
    renderWithRouter(<Layout />);
    expect(screen.getByTestId("captcha-modal")).toBeInTheDocument();
  });

  test("отображает loader при загрузке", () => {
    useAppSelectorMock.mockImplementation((selectorFn) =>
      selectorFn({
        auth: {
          ...selectorFn({ auth: {} }).auth,
          loading: true,
        },
      })
    );
    renderWithRouter(<Layout />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("клик на кнопку подсказки запускает тур", () => {
    const setIsOpen = jest.fn();
    (useTour as jest.Mock).mockReturnValue({
      setIsOpen,
      setSteps: jest.fn(),
      setCurrentStep: jest.fn(),
    });

    renderWithRouter(<Layout />);
    const helpButton = screen.getAllByLabelText("Показать подсказки")[0];
    fireEvent.click(helpButton);

    expect(setIsOpen).toHaveBeenCalledWith(true);
  });

  test("клик по иконке уведомлений открывает поповер", () => {
    renderWithRouter(<Layout />);
    const button = screen.getByLabelText("Открыть события");
    fireEvent.click(button);

    expect(screen.getByText("События")).toBeInTheDocument();
  });
});
