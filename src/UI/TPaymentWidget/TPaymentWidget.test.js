// TPaymentWidget.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TPaymentWidget from "../../components/TPaymentWidget";
import { useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";

// Mock useNavigate from react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

// Mock the Tinkoff logo component if needed
jest.mock("../assets/tbank.svg", () => ({
  ReactComponent: () => <svg data-testid="tinkoff-logo" />,
}));

describe("TPaymentWidget Component", () => {
  let mockNavigate;
  let mockFetch;
  let mockWindowPay;
  let originalAlert;

  const user = {
    id: "user123",
    billing_account_id: "billing123",
    email: "user@example.com",
    phone: "+1234567890",
  };

  const token = "test-token";

  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock useNavigate
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // Mock window.pay
    mockWindowPay = jest.fn();
    global.window.pay = mockWindowPay;

    // Mock alert
    originalAlert = global.alert;
    global.alert = jest.fn();
  });

  afterEach(() => {
    // Restore original alert function
    global.alert = originalAlert;

    // Clean up any scripts added to the document
    const script = document.getElementById("tinkoff-pay-script");
    if (script) {
      document.body.removeChild(script);
    }

    delete global.window.pay;
  });

  test("renders the component correctly", () => {
    render(
      <TPaymentWidget
        user={user}
        token={token}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    // Check that amount input is present
    expect(screen.getByLabelText(/Сумма пополнения/i)).toBeInTheDocument();

    // Check that the Tinkoff logo is present
    expect(screen.getByText(/Оплатить c/i)).toBeInTheDocument();
    expect(screen.getByTestId("tinkoff-logo")).toBeInTheDocument();
  });

  test("loads the Tinkoff payment script on mount", () => {
    render(
      <TPaymentWidget
        user={user}
        token={token}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const script = document.getElementById("tinkoff-pay-script");
    expect(script).toBeInTheDocument();
    expect(script.src).toContain(
      "https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js"
    );
  });

  test("shows alert if entered amount is invalid", () => {
    render(
      <TPaymentWidget
        user={user}
        token={token}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    // Enter an invalid amount (0)
    const amountInput = screen.getByLabelText(/Сумма пополнения/i);
    fireEvent.change(amountInput, { target: { value: "0" } });

    // Click the submit button
    const submitButton = screen.getByRole("button", { name: /Оплатить c/i });
    fireEvent.click(submitButton);

    expect(global.alert).toHaveBeenCalledWith(
      "Пожалуйста, введите сумму не менее 1 рубля."
    );
  });

  test("initiates payment flow on valid amount", async () => {
    render(
      <TPaymentWidget
        user={user}
        token={token}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    // Mock successful fetch response
    const mockOrderId = "order123";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orderId: mockOrderId }),
    });

    // Enter a valid amount
    const amountInput = screen.getByLabelText(/Сумма пополнения/i);
    fireEvent.change(amountInput, { target: { value: "100" } });

    // Click the submit button
    const submitButton = screen.getByRole("button", { name: /Оплатить c/i });
    fireEvent.click(submitButton);

    // Wait for fetch to be called
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    // Check that fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.primeway.io/tbank/inner/create-payment",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Authorization': `Bearer ${token}`, // Uncomment if needed
        },
        body: JSON.stringify({
          billing_account_id: user.billing_account_id,
          user_id: user.id,
          credits: 100,
        }),
      })
    );

    // Check that window.pay was called
    expect(mockWindowPay).toHaveBeenCalledTimes(1);

    // Simulate successful payment
    const paymentResult = { Success: true };
    const payOptions = mockWindowPay.mock.calls[0][1];
    payOptions.completeCallback(paymentResult);

    // Check that onSuccess and navigate were called
    expect(onSuccess).toHaveBeenCalledWith(paymentResult);
    expect(mockNavigate).toHaveBeenCalledWith("/billing");
  });

  test("handles payment error correctly", async () => {
    render(
      <TPaymentWidget
        user={user}
        token={token}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    // Mock successful fetch response
    const mockOrderId = "order123";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orderId: mockOrderId }),
    });

    // Enter a valid amount
    const amountInput = screen.getByLabelText(/Сумма пополнения/i);
    fireEvent.change(amountInput, { target: { value: "100" } });

    // Click the submit button
    const submitButton = screen.getByRole("button", { name: /Оплатить c/i });
    fireEvent.click(submitButton);

    // Wait for fetch to be called
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    // Check that fetch was called
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Check that window.pay was called
    expect(mockWindowPay).toHaveBeenCalledTimes(1);

    // Simulate payment error
    const paymentResult = { Success: false, Error: "Payment failed" };
    const payOptions = mockWindowPay.mock.calls[0][1];
    payOptions.completeCallback(paymentResult);

    // Check that onError and navigate were called
    expect(onError).toHaveBeenCalledWith(paymentResult);
    expect(mockNavigate).toHaveBeenCalledWith("/billing");
  });

  test("handles fetch error correctly", async () => {
    render(
      <TPaymentWidget
        user={user}
        token={token}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    // Mock fetch error
    const errorMessage = "Network error";
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    // Enter a valid amount
    const amountInput = screen.getByLabelText(/Сумма пополнения/i);
    fireEvent.change(amountInput, { target: { value: "100" } });

    // Click the submit button
    const submitButton = screen.getByRole("button", { name: /Оплатить c/i });
    fireEvent.click(submitButton);

    // Wait for fetch to be called and error to be handled
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    // Check that alert was called with error message
    expect(global.alert).toHaveBeenCalledWith(
      "Ошибка при создании оплаты: " + errorMessage
    );

    // Ensure window.pay was not called
    expect(mockWindowPay).not.toHaveBeenCalled();
  });

  test("logs error if window.pay is not available", async () => {
    // Remove window.pay
    delete global.window.pay;

    // Mock console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <TPaymentWidget
        user={user}
        token={token}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    // Mock successful fetch response
    const mockOrderId = "order123";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orderId: mockOrderId }),
    });

    // Enter a valid amount
    const amountInput = screen.getByLabelText(/Сумма пополнения/i);
    fireEvent.change(amountInput, { target: { value: "100" } });

    // Click the submit button
    const submitButton = screen.getByRole("button", { name: /Оплатить c/i });
    fireEvent.click(submitButton);

    // Wait for fetch to be called
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith("Функция pay недоступна");

    // Ensure onError was not called since the error is not caught in onError
    expect(onError).not.toHaveBeenCalled();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
