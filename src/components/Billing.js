import React, { useState } from "react";
import { Box, Typography, Button, TextField, Modal } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import TPaymentWidget from "./TPaymentWidget";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Billing() {
  const [currentMonth] = useState("Сентябрь");
  const [walletBalance, setWalletBalance] = useState(1000); // Баланс кошелька
  const [addFunds, setAddFunds] = useState(""); // Сумма для пополнения
  const [paymentOpen, setPaymentOpen] = useState(false); // Контроль видимости модального окна

  const [email, setEmail] = useState(""); // Email пользователя
  const [modalAmount, setModalAmount] = useState(""); // Сумма в модальном окне
  const [orderId, setOrderId] = useState(""); // OrderId для платежа
  const userId = "USER_ID_HERE"; // Замените это на реальный ID пользователя

  // Данные для графика расходов
  const spendingData = {
    labels: Array.from({ length: 30 }, (_, i) => (i + 1).toString()), // Дни месяца
    datasets: [
      {
        label: "Ежедневные расходы (₽)",
        data: [
          50, 100, 75, 200, 125, 90, 60, 130, 80, 150, 120, 170, 140, 60, 110,
          95, 180, 75, 90, 130, 160, 120, 100, 140, 180, 110, 90, 100, 170, 160,
        ],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Обработчик нажатия кнопки "Add to Wallet"
  const handleAddFunds = () => {
    const amount = parseFloat(addFunds);
    if (!addFunds || isNaN(amount) || amount < 1) {
      alert("Пожалуйста, введите сумму не менее 1 рубля для пополнения.");
      return;
    }
    // Сгенерируйте уникальный OrderId
    const generatedOrderId = Date.now().toString();
    setOrderId(generatedOrderId);
    // Округляем сумму и устанавливаем начальное значение в модальном окне
    setModalAmount(amount);
    setEmail(""); // Вы можете установить email по умолчанию, если необходимо
    // Открываем модальное окно
    setPaymentOpen(true);
  };

  // Обработчик успешной оплаты
  const handlePaymentSuccess = (paymentResult) => {
    console.log("Payment successful, paymentResult:", orderId);
    const paymentId = paymentResult.PaymentId;
    const returnedOrderId = paymentResult.OrderId || orderId;

    setWalletBalance((prev) => prev + parseFloat(modalAmount));
    setPaymentOpen(false);
    setAddFunds("");

    // Подготовьте данные для отправки на эндпоинт
    const data = {
      OrderId: returnedOrderId,
      email: email,
      userId: userId,
    };

    // Отправьте POST-запрос на эндпоинт
    fetch('/tbank/inner/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
      console.log('Данные платежа успешно отправлены', result);
    })
    .catch(error => {
      console.error('Ошибка при отправке данных платежа:', error);
    });
  };

  // Обработчик ошибки оплаты
  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    alert("Оплата не прошла. Пожалуйста, попробуйте снова.");
    setPaymentOpen(false);
  };

  return (
    <Box sx={{ padding: "16px" }}>
      <Typography variant="h4" gutterBottom>
        Billing and Wallet
      </Typography>

      {/* Раздел баланса кошелька */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap", // Для адаптации на небольших экранах
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <Typography variant="h6">
          Current Wallet Balance: {walletBalance}₽
        </Typography>
        <Box sx={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <TextField
            type="number"
            label="Сумма пополнения"
            value={addFunds}
            onChange={(e) => setAddFunds(e.target.value)}
            InputProps={{ inputProps: { min: 1, step: 1 } }}
            helperText="Минимальная сумма пополнения: 1 ₽"
            error={parseFloat(addFunds) < 1}
          />
          <Button
            sx={{ maxHeight: "53px" }}
            variant="contained"
            color="primary"
            onClick={handleAddFunds}
          >
            Add to Wallet
          </Button>
        </Box>
      </Box>

      {/* График расходов за текущий месяц */}
      <Box
        sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}
      >
        <Box sx={{ width: "600px" }}>
          <Typography variant="h6" gutterBottom>
            Расходы за {currentMonth}
          </Typography>
          <Bar
            data={spendingData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                title: {
                  display: true,
                  text: `Статистика расходов за ${currentMonth}`,
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Модальное окно для оплаты */}
      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        aria-labelledby="payment-modal-title"
        aria-describedby="payment-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: "none",
            minWidth: 320,
            maxWidth: 400,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Пополнение кошелька
          </Typography>
          {/* Поле для ввода email */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          {/* Поле для ввода суммы */}
          <TextField
            fullWidth
            label="Сумма пополнения (₽)"
            type="number"
            value={modalAmount}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value) && value >= 1) {
                setModalAmount(Math.round(value));
              } else {
                setModalAmount("");
              }
            }}
            InputProps={{
              inputProps: {
                min: 1,
                step: 1,
                inputMode: "numeric",
                pattern: "[0-9]*",
              },
            }}
            helperText="Минимальная сумма пополнения: 1 ₽"
            error={modalAmount === "" || parseFloat(modalAmount) < 1}
            sx={{ marginBottom: 2 }}
          />
          {/* Платежный виджет */}
          <TPaymentWidget
            amount={parseFloat(modalAmount)} // Передаем округленное значение
            description="Пополнение кошелька"
            email={email}
            phone="+79991234567" // Вы можете добавить поле для телефона, если необходимо
            orderId={orderId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Box>
      </Modal>
    </Box>
  );
}

export default Billing;