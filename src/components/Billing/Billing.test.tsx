import { render, screen } from "@testing-library/react";
import Billing from "./Billing";
import * as reduxHooks from "../../store/hooks";
import * as billingActions from "../../hooks/useBillingActions";
import * as billingCharts from "../../hooks/useBillingCharts";
import * as organizationSelectors from "../../store/selectors/organizationsSelectors";

jest.mock("../../hooks/useBillingActions");
jest.mock("../../hooks/useBillingCharts");
jest.mock("../../UI/TPaymentWidget/TPaymentWidget", () => () => (
  <div>TPaymentWidget</div>
));

describe("Billing", () => {
  const useAppSelector = jest.spyOn(reduxHooks, "useAppSelector");

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("показывает сообщение, если нет организации", () => {
    useAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          authToken: null,
          isLoggedIn: false,
          openCaptchaModal: false,
          openRegistrationModal: false,
          loading: false,
        },
        organization: {
          organizations: [],
          currentOrganization: null,
          walletBalance: null,
          walletLoading: false,
          walletSilentLoading: false,
          walletError: null,
        },
        tasksFilters: {
          selectedStatus: "",
          selectedJobType: "deploy",
          isScheduledFilter: false,
        },
        market: { marketplace: "jupyter" },
        hints: { restartAt: null },
        introSlider: { visible: false },
      })
    );

    render(<Billing />);
    expect(
      screen.getByText(/пожалуйста, выберите организацию/i)
    ).toBeInTheDocument();
  });

  it("показывает предупреждение, если пользователь не владелец", () => {
    useAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          authToken: null,
          isLoggedIn: false,
          openCaptchaModal: false,
          openRegistrationModal: false,
          loading: false,
        },
        organization: {
          organizations: [],
          currentOrganization: { id: "1", name: "Org", role: "member" },
          walletBalance: null,
          walletLoading: false,
          walletSilentLoading: false,
          walletError: null,
        },
        tasksFilters: {
          selectedStatus: "",
          selectedJobType: "deploy",
          isScheduledFilter: false,
        },
        market: { marketplace: "jupyter" },
        hints: { restartAt: null },
        introSlider: { visible: false },
      })
    );

    jest
      .spyOn(organizationSelectors, "selectIsCurrentOrgOwner")
      .mockReturnValue(false);

    render(<Billing />);
    expect(
      screen.getByText(/управляется владельцем организации/i)
    ).toBeInTheDocument();
  });

  it("показывает крутилку при загрузке", () => {
    useAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          authToken: null,
          isLoggedIn: false,
          openCaptchaModal: false,
          openRegistrationModal: false,
          loading: false,
        },
        organization: {
          organizations: [],
          currentOrganization: { id: "1", name: "Org", role: "owner" },
          walletBalance: null,
          walletLoading: true,
          walletSilentLoading: false,
          walletError: null,
        },
        tasksFilters: {
          selectedStatus: "",
          selectedJobType: "deploy",
          isScheduledFilter: false,
        },
        market: { marketplace: "jupyter" },
        hints: { restartAt: null },
        introSlider: { visible: false },
      })
    );

    jest
      .spyOn(organizationSelectors, "selectIsCurrentOrgOwner")
      .mockReturnValue(true);

    (billingActions.default as jest.Mock).mockReturnValue({ isLoading: true });

    render(<Billing />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("показывает баланс и графики", () => {
    useAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: {
            id: "1",
            email: "test@test.com",
            username: "test",
            billing_account_id: "abc",
            organizations: [],
          },
          authToken: "token",
          isLoggedIn: true,
          openCaptchaModal: false,
          openRegistrationModal: false,
          loading: false,
        },
        organization: {
          organizations: [],
          currentOrganization: { id: "1", name: "Org", role: "owner" },
          walletBalance: 1500,
          walletLoading: false,
          walletSilentLoading: false,
          walletError: null,
        },
        tasksFilters: {
          selectedStatus: "",
          selectedJobType: "deploy",
          isScheduledFilter: false,
        },
        market: { marketplace: "jupyter" },
        hints: { restartAt: null },
        introSlider: { visible: false },
      })
    );

    jest
      .spyOn(organizationSelectors, "selectIsCurrentOrgOwner")
      .mockReturnValue(true);

    (billingActions.default as jest.Mock).mockReturnValue({
      isLoading: false,
      creditPurchasesData: [1],
      creditUsagePerDay: [1],
      isMobile: false,
      isTablet: false,
      handlePaymentSuccess: jest.fn(),
      handlePaymentError: jest.fn(),
      error: null,
    });

    (billingCharts.default as jest.Mock).mockReturnValue({
      purchasesChartData: {},
      purchasesChartOptionsBar: {},
      purchasesChartOptionsLine: {},
      expensesChartData: {},
      expensesChartOptionsLine: {},
      expensesChartOptionsBar: {},
    });

    render(<Billing />);

    expect(screen.getByText(/баланс кошелька/i)).toBeInTheDocument();
    expect(screen.getByText("TPaymentWidget")).toBeInTheDocument();
    expect(screen.getByText(/история операций/i)).toBeInTheDocument();
  });
});
