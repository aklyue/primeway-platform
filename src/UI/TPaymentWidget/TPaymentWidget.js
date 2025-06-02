import React, { useState, useEffect, useRef } from "react";
import { Box, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ReactComponent as TBankLogo } from '../../assets/tbank.svg';

function TPaymentWidget(props) {
  const { user, token, onSuccess, onError } = props;
  const [addFunds, setAddFunds] = useState(""); // Сумма пополнения
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false); // Индикатор загрузки
  const formRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Загрузка скрипта платежного виджета
    const scriptId = "tinkoff-pay-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        console.log("Платежный скрипт Тинькофф успешно загружен");
      };
    }
  }, []);

  // Функция для создания оплаты на сервере
  const createPaymentOnBackend = async (amount) => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.primeway.io/tbank/inner/create-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Если требуется авторизация, раскомментируйте следующую строку
            // 'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            billing_account_id: user?.billing_account_id || "",
            user_id: user?.id || "",
            credits: amount,
          }),
        }
      );
      console.log("User в TPaymentWidget:", user);
      console.log("billing_account_id:", user?.billing_account_id);
      const result = await response.json();

      if (response.ok && result?.orderId) {
        setOrderId(result.orderId);
        return result.orderId;
      } else {
        throw new Error(result.message || "Ошибка при создании оплаты.");
      }
    } catch (error) {
      console.error("Ошибка создания оплаты:", error);
      alert("Ошибка при создании оплаты: " + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleStartPayment = async (e) => {
    e.preventDefault();

    const amount = parseFloat(addFunds);
    if (!amount || isNaN(amount) || amount < 1) {
      alert("Пожалуйста, введите сумму не менее 1 рубля.");
      return;
    }

    // Создание оплаты на бэкенде
    const createdOrderId = await createPaymentOnBackend(amount);
    console.log("createdOrderId", createdOrderId);

    if (createdOrderId) {
      // Обновляем значение orderId в форме
      if (formRef.current) {
        const orderIdInput = formRef.current.querySelector(
          'input[name="order"]'
        );
        console.log("orderIdInput", orderIdInput);
        if (orderIdInput) {
          orderIdInput.value = createdOrderId;
        }
      }

      // Запускаем платеж через Tinkoff Pay
      if (window.pay && formRef.current) {
        try {
          window.pay(formRef.current, {
            completeCallback: (paymentResult) => {
              if (paymentResult.Success) {
                // Платеж успешен
                if (onSuccess) {
                  console.log("paymentResult", paymentResult);
                  onSuccess(paymentResult);
                }
                navigate("/billing");
              } else {
                // Платеж неуспешен
                if (onError) {
                  onError(paymentResult);
                }
                navigate("/billing");
              }
            },
          });
        } catch (error) {
          console.error("Ошибка при инициации платежа:", error);
          if (onError) {
            onError(error);
          }
        }
      } else {
        console.error("Функция pay недоступна");
      }
    }
  };

  return (
    <form ref={formRef} onSubmit={handleStartPayment} className="payform-tbank">
      <input
        type="hidden"
        name="terminalkey"
        value={process.env.REACT_APP_TINKOFF_TERMINAL_KEY}
      />
      <input type="hidden" name="frame" value="false" />
      <input type="hidden" name="language" value="ru" />
      <input type="hidden" name="amount" value={parseFloat(addFunds)} />
      <input type="hidden" name="description" value="Пополнение кошелька" />
      <input type="hidden" name="order" value={orderId} />
      <input
        type="hidden"
        name="SuccessURL"
        value="https://platform.primeway.io/billing"
      />
      <input
        type="hidden"
        name="FailURL"
        value="https://platform.primeway.io/billing"
      />
      {user?.email && <input type="hidden" name="email" value={user.email} />}
      {user?.phone && <input type="hidden" name="phone" value={user.phone} />}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "15px",
          marginTop: "16px",
        }}
      >
        <TextField
          type="number"
          label="Сумма пополнения"
          value={addFunds}
          onChange={(e) => setAddFunds(e.target.value)}
          InputProps={{ inputProps: { min: 100, step: 1 } }}
          helperText="Минимальная сумма: 100 ₽"
        />
        <button
          style={{
            height: "48px",
            backgroundColor: "#FFDD2D", //#fab619
            color: "#333",
            fontSize: "15px",
            padding: "6px 12px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
          type="submit"
          className="payform-tbank-btn"
          disabled={loading}
        >
          Оплатить c
          <TBankLogo width={75} height={40} />
        </button>
      </Box>
    </form>
  );
}

export default TPaymentWidget;
