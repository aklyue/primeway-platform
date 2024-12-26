import React, { useEffect, useRef } from "react";

function TPaymentWidget(props) {
  const { amount, description, email, phone, orderId, onSuccess, onError } =
    props;

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
        console.log("Платеж завершен");
        if (onSuccess) {
          onSuccess(paymentResult);
        }
      } else {
        console.log("Платеж не завершен");
        // Платеж не удался или был отменен
        if (onError) {
          onError(paymentResult);
        }
      }
    };

    if (window.pay && formRef.current) {
      try {
        window.pay(formRef.current, {
          completeCallback,
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
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="payform-tbank"
    >
      <input type="hidden" name="terminalkey" value="1734697526905DEMO" />
      <input type="hidden" name="frame" value="false" />
      <input type="hidden" name="language" value="ru" />
      <input type="hidden" name="redirect" value="true" />
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="description" value={description} />
      {orderId && <input type="hidden" name="OrderId" value={orderId} />}
      {email && <input type="hidden" name="email" value={email} />}
      {phone && <input type="hidden" name="phone" value={phone} />}
      <button
        style={{
          width: "100%",
          minHeight: '50px',
          backgroundColor: "#FFDD2D", //#fab619
          color: "#333",
          fontSize: '15px',
          padding: "6px 12px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          display:'flex',
          justifyContent:'center',
          alignItems:'center',

        }}
        type="submit"
        className="payform-tbank-btn"
      >
        Оплатить c 
        <img width={80} height={40} src="./tbank.svg" alt="Tbank" />
        
      </button>
    </form>
  );
}

export default TPaymentWidget;
