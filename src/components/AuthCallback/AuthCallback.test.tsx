import { render, screen, waitFor } from "@testing-library/react";
import AuthCallback from "./AuthCallback";

describe("AuthCallback", () => {
  beforeEach(() => {
    // Очищаем голову перед каждым тестом
    document.head.innerHTML = "";
  });

  it("отображает сообщение о процессе авторизации", () => {
    render(<AuthCallback />);
    expect(screen.getByText(/processing authentication/i)).toBeInTheDocument();
  });

  it("добавляет скрипт в head и вызывает YaSendSuggestToken", async () => {
    // Создаём мок функции
    const mockSendToken = jest.fn();
    // Вставляем в window
    (window as any).YaSendSuggestToken = mockSendToken;

    render(<AuthCallback />);

    // Ждём пока скрипт "загрузится" (симулируем загрузку)
    await waitFor(() => {
      const script = document.querySelector(
        "script[src*='sdk-suggest-token']"
      ) as HTMLScriptElement;
      expect(script).toBeInTheDocument();
      // Симулируем событие загрузки скрипта
      if (script?.onload) script.onload(new Event("load"));
    });

    // Проверяем, что функция была вызвана
    expect(mockSendToken).toHaveBeenCalledWith(
      `${process.env.REACT_APP_PLATFORM_URL}/auth/callback`,
      { status: "success" }
    );
  });

  it("удаляет скрипт при размонтировании", () => {
    const { unmount } = render(<AuthCallback />);
    const script = document.querySelector("script[src*='sdk-suggest-token']");
    expect(script).toBeInTheDocument();

    unmount();

    expect(
      document.querySelector("script[src*='sdk-suggest-token']")
    ).not.toBeInTheDocument();
  });
});
