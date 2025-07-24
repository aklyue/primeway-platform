import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import OrganizationSettings from "./OrganizationSettings";
import * as reduxHooks from "../../store/hooks";
import * as orgSelectors from "../../store/selectors/organizationsSelectors";
import * as api from "../../api";
import axios, { AxiosHeaders } from "axios";

// Мокаем зависимые модули
jest.mock("./OrganizationEvents", () => () => <div>OrganizationEvents</div>);

describe("OrganizationSettings", () => {
  const useAppSelector = jest.spyOn(reduxHooks, "useAppSelector");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("показывает сообщение, если нет выбранной организации", () => {
    useAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isLoggedIn: false,
          authToken: null,
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
        market: {
          marketplace: "jupyter",
        },
        hints: {
          restartAt: null,
        },
        introSlider: {
          visible: false,
        },
      })
    );
    jest.spyOn(orgSelectors, "selectCurrentOrganization").mockReturnValue(null);

    render(<OrganizationSettings />);
    expect(screen.getByText(/выберите организацию/i)).toBeInTheDocument();
  });

  it("показывает индикатор загрузки", () => {
    useAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isLoggedIn: false,
          authToken: null,
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
        market: {
          marketplace: "jupyter",
        },
        hints: {
          restartAt: null,
        },
        introSlider: {
          visible: false,
        },
      })
    );
    jest.spyOn(orgSelectors, "selectCurrentOrganization").mockReturnValue({
      id: "1",
      name: "Org",
      role: "owner",
    });
    jest.spyOn(orgSelectors, "selectIsCurrentOrgOwner").mockReturnValue(true);

    jest.spyOn(api, "getOrgMembers").mockImplementation(() => {
      return new Promise(() => {}); // Не завершаем fetch
    });

    render(<OrganizationSettings />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("показывает ошибку при загрузке", async () => {
    useAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isLoggedIn: false,
          authToken: null,
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
        market: {
          marketplace: "jupyter",
        },
        hints: {
          restartAt: null,
        },
        introSlider: {
          visible: false,
        },
      })
    );
    jest.spyOn(orgSelectors, "selectCurrentOrganization").mockReturnValue({
      id: "1",
      name: "Org",
      role: "owner",
    });
    jest.spyOn(orgSelectors, "selectIsCurrentOrgOwner").mockReturnValue(true);

    jest.spyOn(api, "getOrgMembers").mockRejectedValue(new Error("fail"));

    render(<OrganizationSettings />);
    await waitFor(() =>
      expect(
        screen.getByText(/ошибка при получении членов/i)
      ).toBeInTheDocument()
    );
  });

  it("отображает таблицу участников", async () => {
    useAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isLoggedIn: false,
          authToken: null,
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
        market: {
          marketplace: "jupyter",
        },
        hints: {
          restartAt: null,
        },
        introSlider: {
          visible: false,
        },
      })
    );
    jest.spyOn(orgSelectors, "selectCurrentOrganization").mockReturnValue({
      id: "1",
      name: "Org",
      role: "owner",
    });
    jest.spyOn(orgSelectors, "selectIsCurrentOrgOwner").mockReturnValue(true);

    jest.spyOn(api, "getOrgMembers").mockResolvedValue({
      data: [
        {
          user_id: "u1",
          email: "test@example.com",
          avatar_url: "",
          role: "member",
        },
      ],
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      },
    });

    render(<OrganizationSettings />);
    expect(await screen.findByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Участник")).toBeInTheDocument();
  });

  it("отображает поле добавления участника только владельцу", async () => {
    useAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isLoggedIn: false,
          authToken: null,
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
        market: {
          marketplace: "jupyter",
        },
        hints: {
          restartAt: null,
        },
        introSlider: {
          visible: false,
        },
      })
    );
    jest.spyOn(orgSelectors, "selectCurrentOrganization").mockReturnValue({
      id: "1",
      name: "Org",
      role: "owner",
    });
    jest.spyOn(orgSelectors, "selectIsCurrentOrgOwner").mockReturnValue(true);

    jest.spyOn(api, "getOrgMembers").mockResolvedValue({
      data: [
        {
          user_id: "u1",
          email: "test@example.com",
          avatar_url: "",
          role: "member",
        },
      ],
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      },
    });

    render(<OrganizationSettings />);
    expect(
      await screen.findByLabelText(/email нового участника/i)
    ).toBeInTheDocument();
  });

  it("не показывает поле добавления участника не владельцу", async () => {
    useAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isLoggedIn: false,
          authToken: null,
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
        market: {
          marketplace: "jupyter",
        },
        hints: {
          restartAt: null,
        },
        introSlider: {
          visible: false,
        },
      })
    );
    jest.spyOn(orgSelectors, "selectCurrentOrganization").mockReturnValue({
      id: "1",
      name: "Org",
      role: "owner",
    });
    jest.spyOn(orgSelectors, "selectIsCurrentOrgOwner").mockReturnValue(false);

    jest.spyOn(api, "getOrgMembers").mockResolvedValue({
      data: [
        {
          user_id: "u1",
          email: "test@example.com",
          avatar_url: "",
          role: "member",
        },
      ],
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      },
    });

    render(<OrganizationSettings />);
    expect(
      screen.queryByLabelText(/email нового участника/i)
    ).not.toBeInTheDocument();
  });
});
