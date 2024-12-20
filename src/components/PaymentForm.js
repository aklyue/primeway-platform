// PaymentForm.jsx

import React, { useEffect } from 'react';
import axios from 'axios';

function PaymentForm({ amount, onClose }) {
  useEffect(() => {
    // Функция для инициализации платежа
    const initPayment = async () => {
      try {
        const response = await axios.post('http://localhost:8080/api/init-payment', { amount });
        if (response.data && response.data.PaymentURL) {
          // Перенаправляем пользователя на PaymentURL
          window.location.href = response.data.PaymentURL;
        } else {
          alert('Ошибка при инициализации платежа.');
          onClose();
        }
      } catch (error) {
        console.error('Ошибка при инициализации платежа:', error);
        alert('Ошибка при инициализации платежа.');
        onClose();
      }
    };

    initPayment();
  }, [amount, onClose]);

  return (
    <div>
      <p>Перенаправляем на страницу оплаты...</p>
    </div>
  );
}

export default PaymentForm;