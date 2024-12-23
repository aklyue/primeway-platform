import React, { useEffect, useRef } from "react";

function TPaymentWidget(props) {
  const { amount, description, email, phone, orderId, onSuccess, onError } = props;

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

    const completeCallback = (paymentResult) => {
      console.log("Платеж завершен", paymentResult);
      if (paymentResult.Success) {
        console.log('платеж завершен')
        if (onSuccess) {
          console.log('Платеж завершен')
          onSuccess(paymentResult);
        }
      } else {
        console.log('платеж не завершен')
        // Платеж не удался или был отменен
        if (onError) {
          console.log('Платеж не завершен')
          onError(paymentResult);
        }
      }
    };

    if (window.pay && formRef.current) {
      try {
        window.pay(formRef.current, { completeCallback });
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
      <input type="hidden" name="frame" value="false" />
      <input type="hidden" name="language" value="ru" />
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="description" value={description} />
      {orderId && <input type="hidden" name="OrderId" value={orderId} />}
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