// PaymentPage.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TPaymentWidget from './TPaymentWidget';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { amount, email, orderId } = location.state || {};

  useEffect(() => {
    if (!amount || !orderId) {
      navigate('/');
    }
  }, [amount, orderId, navigate]);

  const handlePaymentSuccess = (paymentResult) => {
    console.log("Payment successful", paymentResult);

    navigate('/payment-success', { state: { paymentResult } });
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed", error);
    alert("Оплата не прошла. Пожалуйста, попробуйте снова.");
    navigate('/payment-error', { state: { error } });
  };

  return (
    <div>
      <h2>Оплата</h2>
      <TPaymentWidget
        amount={amount}
        description="Пополнение кошелька"
        email={email}
        phone="+79991234567"
        orderId={orderId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
}

export default PaymentPage;