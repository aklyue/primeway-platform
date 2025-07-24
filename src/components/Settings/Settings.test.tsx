import { render, screen, fireEvent } from "@testing-library/react";
import Settings from "./Settings";
import * as reduxHooks from "../../store/hooks";
import * as authSlice from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Settings", () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();
  const mockSetAuthenticating = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (reduxHooks.useAppDispatch as jest.Mock) = jest.fn(() => mockDispatch);
    (reduxHooks.useAppSelector as jest.Mock) = jest.fn((selector) =>
      selector({
        auth: {
          user: {
            name: "John Doe",
            username: "johndoe",
            email: "john@example.com",
            avatar_url: "https://example.com/avatar.png",
          },
        },
      })
    );
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it("отображает имя, email и аватар", () => {
    render(<Settings setAuthenticating={mockSetAuthenticating} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();

    const avatar = screen.getByRole("img") as HTMLImageElement;
    expect(avatar).toBeInTheDocument();
    expect(avatar.src).toBe("https://example.com/avatar.png");
  });

  it("вызывает logout и навигацию при клике на 'Выйти из аккаунта'", () => {
    const mockLogout = jest.spyOn(authSlice, "logout");

    render(<Settings setAuthenticating={mockSetAuthenticating} />);
    const button = screen.getByRole("button", { name: /выйти из аккаунта/i });
    fireEvent.click(button);

    expect(mockLogout).toHaveBeenCalled();

    expect(mockDispatch).toHaveBeenCalledWith(authSlice.logout());

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(mockSetAuthenticating).toHaveBeenCalledWith(false);
    expect(localStorage.getItem("lastCaptchaTime")).toBeNull();
  });
});
