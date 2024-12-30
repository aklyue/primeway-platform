// server.js
const express = require('express');
const app = express();

app.use(express.json());

// Фиктивное хранилище для платежей (в реальном приложении используйте базу данных)
const payments = [];

// Генерация уникального OrderId
function generateOrderId() {
  return Date.now().toString();
}

// Эндпоинт для создания платежа
app.post('/tbank/inner/create-payment', (req, res) => {
  const {
    billing_account_id,
    organization_id,
    user_id,
    credits,
    email,
  } = req.body;

  // Проверяем наличие необходимых данных
  if (
    !billing_account_id ||
    !organization_id ||
    !user_id ||
    !credits ||
    !email
  ) {
    return res.status(400).json({ message: 'Необходимые данные не предоставлены' });
  }

  // Генерируем OrderId
  const OrderId = generateOrderId();

  // Сохраняем платеж (в реальном приложении используйте базу данных)
  const payment = {
    OrderId,
    billing_account_id,
    organization_id,
    user_id,
    credits,
    email,
  };
  payments.push(payment);

  // Возвращаем OrderId, email и user_id клиенту
  res.json({
    OrderId,
    email,
    user_id,
  });
});

// Запуск сервера
const PORT = 3000; // Или используйте process.env.PORT, если нужно
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});