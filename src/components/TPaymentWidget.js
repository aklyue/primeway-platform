// TPaymentWidget.jsx
import React, { useEffect, useRef } from "react";
import CryptoJS from "crypto-js";

function TPaymentWidget(props) {
  const { amount, description, email, phone, onSuccess, onError } = props;

  const formRef = useRef(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Используем тестовый пароль
    const Password = "12345678";

    // Собираем параметры для вычисления Token
    const params = {
      TerminalKey: "TinkoffBankTest",
      Amount: Math.round(amount * 100),
      Description: description,
      Email: email,
      Phone: phone,
    };

    // !!!Работает без этого токена

    // const sortedKeys = Object.keys(params).sort();
    // let tokenString = "";
    // sortedKeys.forEach((key) => {
    //   tokenString += params[key];
    // });
    // tokenString += Password;
    // const Token = CryptoJS.SHA256(tokenString).toString();
    // const tokenInput = document.createElement("input");
    // tokenInput.type = "hidden";
    // tokenInput.name = "token";
    // tokenInput.value = Token;
    // formRef.current.appendChild(tokenInput);

    if (window.pay && formRef.current) {
      try {
        // Открытие платежной формы
        window.pay(formRef.current);

        // Для тестирования считаем, что платеж успешен
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Ошибка при инициации платежа:", error);
        if (onError) {
          onError(error);
        }
      }
    } else {
      console.error("Функция pay недоступна");
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="payform-tbank">
      <input type="hidden" name="terminalkey" value="1734697526905DEMO" />
      <input type="hidden" name="frame" value="true" />
      <input type="hidden" name="language" value="ru" />
      <input type="hidden" name="amount" value={Math.round(amount)} />
      <input type="hidden" name="description" value={description} />
      {email && <input type="hidden" name="email" value={email} />}
      {phone && <input type="hidden" name="phone" value={phone} />}
      <button
        style={{
          width: "100%",
          backgroundColor: "#ffd976",
          color: "#1a1a1a",
          padding: "10px 16px",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
        }}
        type="submit"
        className="payform-tbank-btn"
      >
        Оплатить
      </button>
    </form>
  );
}

export default TPaymentWidget;
