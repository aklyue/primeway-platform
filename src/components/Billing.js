import React, { useState, useContext } from "react";
import { Box, Typography } from "@mui/material";
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
  const [currentMonth] = useState("Сентябрь");

  // Обработчик успешной оплаты
  const handlePaymentSuccess = (paymentResult) => {
    console.log("Оплата успешна:", paymentResult);
    // Здесь вы можете обновить баланс кошелька или выполнить другие действия
    // Например, обновить баланс:
    // setWalletBalance((prev) => prev + parseFloat(paymentResult.Amount) / 100);
  };

  // Обработчик ошибки оплаты
  const handlePaymentError = (error) => {
    console.error("Ошибка оплаты:", error);
    alert("Оплата не прошла. Пожалуйста, попробуйте снова.");
  };

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
        {/* Поле суммы и кнопка перемещены в TPaymentWidget */}
      </Box>

      {/* Виджет оплаты */}
      <TPaymentWidget
        user={user}
        token={token}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

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