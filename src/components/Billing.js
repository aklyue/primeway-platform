// Billing.js
import React, { useState, useContext } from "react";
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
import { AuthContext } from '../AuthContext'; // Импортируем AuthContext

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
  const { user } = useContext(AuthContext); // Получаем пользователя из контекста

  // Используем опциональную цепочку для безопасного доступа к свойствам пользователя
  const userId = user?.id || ''; // Получаем userId из данных пользователя
  const userEmail = user?.email || ''; 

  // Состояние для email, инициализируем email пользователя
  const [email, setEmail] = useState(userEmail);

  const [currentMonth] = useState("Сентябрь");
  const [walletBalance, setWalletBalance] = useState(1000); 
  const [addFunds, setAddFunds] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);

  const [modalAmount, setModalAmount] = useState(""); 
  const [orderId, setOrderId] = useState(""); 

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
    const generatedOrderId = Date.now().toString();
    setOrderId(generatedOrderId);
    setModalAmount(amount);
    setEmail(userEmail);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    console.log("Payment successful, paymentResult:", paymentResult);

    const returnedOrderId = paymentResult.OrderId || orderId;

    setWalletBalance((prev) => prev + parseFloat(modalAmount));
    setPaymentOpen(false);
    setAddFunds("");

    const data = {
      OrderId: returnedOrderId,
      email: email,
      userId: userId, 
    };

    fetch('/tbank/inner/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'

        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    alert("Оплата не прошла. Пожалуйста, попробуйте снова.");
    setPaymentOpen(false);
  };

  if (!user) {
    return <div>Пожалуйста, войдите в систему</div>;
  }

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
          Current Wallet Balance: <Box component="span" sx={{color:'secondary.main'}}>{walletBalance}₽</Box>
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
          <TPaymentWidget
            amount={addFunds} 
            description="Пополнение кошелька"
            email={email}
            phone="+79991234567"
            orderId={orderId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Box>
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}
      >
        <Box sx={{ width: "600px" }}>
          <Typography variant="h6" gutterBottom>
            Расходы за <Box component="span" sx={{color:'secondary.main'}}>{currentMonth}</Box>
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