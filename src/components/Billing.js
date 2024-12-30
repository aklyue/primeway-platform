import React, { useState, useContext } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
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
import { AuthContext } from "../AuthContext"; // Контекст авторизации

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Billing() {
  const { user, authToken: token } = useContext(AuthContext); // Получаем данные пользователя из контекста
  const [walletBalance, setWalletBalance] = useState(1000); // Баланс кошелька
  const [addFunds, setAddFunds] = useState(""); // Сумма пополнения
  const [currentMonth, setCurrentMonth] = useState("Сентябрь");
  const [orderId, setOrderId] = useState(""); // ID платежа
  const [paymentData, setPaymentData] = useState(null); // Данные для платежа
  const [loading, setLoading] = useState(false); // Индикатор загрузки
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

  // Функция для создания оплаты на сервере
  const createPaymentOnBackend = async (amount) => {
    try {
      setLoading(true);
      const response = await fetch('/tbank/inner/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          billing_account_id: user?.billing_account_id || '',
          organization_id: user?.organization_id || '',
          user_id: user?.id || '',
          credits: amount,
        }),
      });

      const result = await response.json();

      if (response.ok && result?.orderId) {
        setOrderId(result.orderId);
        return result.orderId;
      } else {
        throw new Error(result.message || 'Ошибка при создании оплаты.');
      }
    } catch (error) {
      console.error('Ошибка создания оплаты:', error);
      alert('Ошибка при создании оплаты: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  // Обработчик создания и начала оплаты
  const handleStartPayment = async () => {
    const amount = parseFloat(addFunds);
    if (!amount || isNaN(amount) || amount < 1) {
      alert("Пожалуйста, введите сумму не менее 1 рубля.");
      return;
    }

    // Создание оплаты на сервере
    const createdOrderId = await createPaymentOnBackend(amount);

    if (createdOrderId) {
      // Устанавливаем данные для TPaymentWidget
      setPaymentData({
        amount: amount * 100, // Сумма в копейках
        description: "Пополнение кошелька",
        email: user?.email || "",
        phone: user?.phone || "",
        orderId: createdOrderId,
      });
    }
  };

  // Обработчик успешной оплаты
  const handlePaymentSuccess = (paymentResult) => {
    console.log("Оплата успешна:", paymentResult);
    setWalletBalance((prev) => prev + parseFloat(addFunds)); // Обновляем баланс кошелька
    setAddFunds("");

    // Отправляем данные платежа на сервер
    fetch("/tbank/inner/payments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        OrderId: paymentResult.OrderId || orderId,
        email: user?.email || "",
        userId: user?.id || "",
        organization_id: user?.organization_id || "",
        billing_account_id: user?.billing_account_id || "",
        amount: addFunds,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Данные платежа успешно отправлены:", result);
      })
      .catch((error) => {
        console.error("Ошибка при отправке данных платежа:", error);
      });
  };

  // Обработчик ошибки оплаты
  const handlePaymentError = (error) => {
    console.error("Ошибка оплаты:", error);
    alert("Оплата не прошла. Пожалуйста, попробуйте снова.");
  };

  return (
    <Box sx={{ padding: "16px" }}>
      <Typography variant="h4" gutterBottom>
      Billing and Wallet
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <Typography variant="h6">
          Баланс кошелька:{" "}
          <Box component="span" sx={{ color: "secondary.main" }}>
            {walletBalance} ₽
          </Box>
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          <TextField
            type="number"
            label="Сумма пополнения"
            value={addFunds}
            onChange={(e) => setAddFunds(e.target.value)}
            InputProps={{ inputProps: { min: 1, step: 1 } }}
            helperText="Минимальная сумма: 1 ₽"
          />
          <Button
          sx={{height:'50px', backgroundColor: "#FFDD2D"}}
            variant="contained"
            color="primary"
            onClick={handleStartPayment}
            disabled={!addFunds || parseFloat(addFunds) < 1 || loading}
          >
            {loading ? "Создание оплаты..." : "Пополнить"}
          </Button>
        </Box>
      </Box>

      {/* Виджет оплаты */}
      {paymentData && (
        <TPaymentWidget
          amount={paymentData.amount}
          description={paymentData.description}
          email={paymentData.email}
          phone={paymentData.phone}
          orderId={paymentData.orderId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}

      <Box
        sx={{ display: "flex", justifyContent: "center", marginTop: "36px" }}
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
    </Box>
  );
}

export default Billing;
