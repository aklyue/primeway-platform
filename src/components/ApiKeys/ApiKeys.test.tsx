// ApiKeys.test.tsx
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import store from "../../store";
import ApiKeys from "./ApiKeys";
import userEvent from "@testing-library/user-event";
import * as useApiKeysHook from "../../hooks/useApiKeysActions";

// Мокаем хук
jest.mock("../../hooks/useApiKeysActions");

describe("ApiKeys component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("показывает загрузку", () => {
    (useApiKeysHook.default as jest.Mock).mockReturnValue({
      loading: true,
    });

    render(
      <Provider store={store}>
        <ApiKeys />
      </Provider>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("показывает список API ключей", async () => {
    (useApiKeysHook.default as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      open: false,
      newApiKey: null,
      apiKeys: [
        {
          id: "1",
          name: "Test Key",
          masked_token: "abcd****efgh",
          created_at: "2024-07-10T12:00:00Z",
        },
      ],
      handleOpen: jest.fn(),
      handleClose: jest.fn(),
      handleCopy: jest.fn(),
      handleCopyToken: jest.fn(),
      handleCreateApiKey: jest.fn(),
      handleDeleteApiKey: jest.fn(),
      handleMenuClick: jest.fn(),
      handleMenuClose: jest.fn(),
      isCopied: false,
      tokenName: "",
      setTokenName: jest.fn(),
      creating: false,
      anchorEl: null,
      menuItemId: null,
    });

    render(
      <Provider store={store}>
        <ApiKeys />
      </Provider>
    );

    expect(await screen.findByText("Test Key")).toBeInTheDocument();
    expect(screen.getByText("abcd****efgh")).toBeInTheDocument();
  });

  it("открывает модалку при нажатии на кнопку", async () => {
    const handleOpen = jest.fn();

    (useApiKeysHook.default as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      open: false,
      newApiKey: null,
      apiKeys: [],
      handleOpen,
      handleClose: jest.fn(),
      handleCopy: jest.fn(),
      handleCopyToken: jest.fn(),
      handleCreateApiKey: jest.fn(),
      handleDeleteApiKey: jest.fn(),
      handleMenuClick: jest.fn(),
      handleMenuClose: jest.fn(),
      isCopied: false,
      tokenName: "",
      setTokenName: jest.fn(),
      creating: false,
      anchorEl: null,
      menuItemId: null,
    });

    render(
      <Provider store={store}>
        <ApiKeys />
      </Provider>
    );

    const btn = screen.getByText("Создать новый API-Ключ");
    await userEvent.click(btn);

    expect(handleOpen).toHaveBeenCalled();
  });

  it("показывает сообщение об ошибке", () => {
    (useApiKeysHook.default as jest.Mock).mockReturnValue({
      loading: false,
      error: "Ошибка загрузки",
      open: false,
      newApiKey: null,
      apiKeys: [],
      handleOpen: jest.fn(),
      handleClose: jest.fn(),
      handleCopy: jest.fn(),
      handleCopyToken: jest.fn(),
      handleCreateApiKey: jest.fn(),
      handleDeleteApiKey: jest.fn(),
      handleMenuClick: jest.fn(),
      handleMenuClose: jest.fn(),
      isCopied: false,
      tokenName: "",
      setTokenName: jest.fn(),
      creating: false,
      anchorEl: null,
      menuItemId: null,
    });

    render(
      <Provider store={store}>
        <ApiKeys />
      </Provider>
    );

    expect(screen.getByText("Ошибка загрузки")).toBeInTheDocument();
  });
});
