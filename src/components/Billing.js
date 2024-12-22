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
  const [walletBalance, setWalletBalance] = useState(1000); // Default wallet balance
  const [addFunds, setAddFunds] = useState(""); // For adding funds
  const [paymentOpen, setPaymentOpen] = useState(false); // Control PaymentForm visibility

  const [email, setEmail] = useState(""); // New state for email
  const [modalAmount, setModalAmount] = useState(""); // New state for amount in modal

  // Mock data for spending in September
  const spendingData = {
    labels: Array.from({ length: 30 }, (_, i) => (i + 1).toString()), // Days of the month
    datasets: [
      {
        label: "Ежедневные расходы (₽)",
        data: [
          50, 100, 75, 200, 125, 90, 60, 130, 80, 150, 120, 170, 140, 60, 110,
          95, 180, 75, 90, 130, 160, 120, 100, 140, 180, 110, 90, 100, 170, 160,
        ], // Mock spending data for each day
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const handleAddFunds = () => {
    const amount = parseFloat(addFunds);
    console.log("amount", amount);
    if (!addFunds || isNaN(amount) || amount < 1) {
      alert("Пожалуйста, введите сумму не менее 1 рубля для пополнения.");
      return;
    }
    // Set initial values in modal
    setModalAmount(addFunds);
    setEmail(""); // Optionally, set a default email here
    // Open the PaymentForm modal
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = (orderId) => {
    console.log("Payment successful, order ID:", orderId);
    setWalletBalance((prev) => prev + parseFloat(modalAmount));
    setPaymentOpen(false);
    setAddFunds("");
  };

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

      {/* Wallet Balance Section */}
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

      {/* Spending Chart for Current Month */}
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

      {/* Modal for PaymentForm */}
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
          {/* Input for email */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          {/* Input for amount */}
          <TextField
            fullWidth
            label="Сумма пополнения (₽)"
            type="number"
            value={modalAmount}
            onChange={(e) => setModalAmount(e.target.value)}
            InputProps={{ inputProps: { min: 1, step: 1 } }}
            helperText="Минимальная сумма пополнения: 1 ₽"
            error={parseFloat(modalAmount) < 1}
            sx={{ marginBottom: 2 }}
          />
          {/* Payment Widget */}
          <TPaymentWidget
            amount={parseFloat(modalAmount)}
            description="Пополнение кошелька"
            email={email}
            phone="+79991234567" // Вы можете добавить поле для телефона, если необходимо
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Box>
      </Modal>
    </Box>
  );
}

export default Billing;
