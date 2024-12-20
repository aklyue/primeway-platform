// server.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
console.log('TerminalKey:', process.env.TINKOFF_TERMINAL_KEY);
console.log('Password:', process.env.TINKOFF_PASSWORD);

// Функция для генерации токена
function generateToken(params) {
  const sortedKeys = Object.keys(params)
    .filter((key) => key !== 'Password' && key !== 'Token' && key !== 'DATA')
    .sort();
  let tokenString = '';
  sortedKeys.forEach((key) => {
    tokenString += params[key];
  });
  tokenString += process.env.TINKOFF_PASSWORD;
  return crypto.createHash('sha256').update(tokenString).digest('hex');
}

// Эндпойнт для инициализации платежа
app.post('/api/init-payment', async (req, res) => {
  const { amount } = req.body;
  const orderId = Date.now().toString(); // Уникальный идентификатор заказа

  const requestParams = {
    TerminalKey: process.env.TINKOFF_TERMINAL_KEY,
    Amount: amount * 100, // Сумма в копейках
    OrderId: orderId,
    Description: 'Пополнение кошелька',
    SuccessURL: 'http://localhost:3000/payment-success',
    FailURL: 'http://localhost:3000/payment-fail',
  };

  // Генерируем токен
  requestParams.Token = generateToken(requestParams);

  try {
    const response = await axios.post('https://securepay.tinkoff.ru/v2/Init', requestParams);

    if (response.data && response.data.Success) {
      res.json({ PaymentURL: response.data.PaymentURL, OrderId: orderId });
    } else {
      console.error('Ошибка инициализации платежа:', response.data);
      res.status(500).json({ message: 'Ошибка инициализации платежа', details: response.data });
    }
  } catch (error) {
    console.error('Ошибка HTTP запроса:', error);
    res.status(500).json({ message: 'Ошибка HTTP запроса', details: error.message });
  }
});

// Эндпойнт для обработки уведомлений от Тинькофф
app.post('/api/tinkoff-notify', (req, res) => {
  const notification = req.body;

  // Проверка подписи уведомления
  const token = notification.Token;
  const expectedToken = generateToken(notification);

  if (token === expectedToken) {
    const { OrderId, Status } = notification;

    if (Status === 'CONFIRMED') {
      // TODO: Обновить баланс пользователя в базе данных по OrderId
      console.log(`Платеж по заказу ${OrderId} подтвержден.`);
    }

    res.send({ Success: true });
  } else {
    console.error('Неверная подпись уведомления.');
    res.send({ Success: false });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});