// Billing.jsx

import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Modal } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import PaymentForm from './PaymentForm'; // Импортируем наш PaymentForm

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Billing() {
  const [currentMonth] = useState('Сентябрь');
  const [walletBalance, setWalletBalance] = useState(1000); // Default wallet balance
  const [addFunds, setAddFunds] = useState(''); // For adding funds
  const [paymentOpen, setPaymentOpen] = useState(false); // Контролируем отображение PaymentForm

  // Mock data for spending in September
  const spendingData = {
    labels: Array.from({ length: 30 }, (_, i) => (i + 1).toString()), // Days of the month
    datasets: [
      {
        label: 'Ежедневные расходы (₽)',
        data: [
          50, 100, 75, 200, 125, 90, 60, 130, 80, 150, 120, 170, 140, 60, 110, 95,
          180, 75, 90, 130, 160, 120, 100, 140, 180, 110, 90, 100, 170, 160,
        ], // Mock spending data for each day
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const handleAddFunds = () => {
    if (!addFunds || parseFloat(addFunds) <= 0) {
      alert('Пожалуйста, введите корректную сумму для пополнения.');
      return;
    }
    // Открываем PaymentForm
    setPaymentOpen(true);
  };

  const handlePaymentClose = () => {
    // Закрываем PaymentForm
    setPaymentOpen(false);
    // Обновляем баланс кошелька
    // Здесь необходимо дополнительно реализовать проверку успешности платежа
    // Для демонстрации просто увеличим баланс на сумму пополнения
    setWalletBalance(walletBalance + parseFloat(addFunds));
    setAddFunds('');
  };

  return (
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Billing and Wallet
      </Typography>

      {/* Wallet Balance Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <Typography variant="h6">Current Wallet Balance: {walletBalance}₽</Typography>
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <TextField
            type="number"
            label="Add Funds"
            value={addFunds}
            onChange={(e) => setAddFunds(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleAddFunds}>
            Add to Wallet
          </Button>
        </Box>
      </Box>

      {/* Spending Chart for Current Month */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <Box sx={{ width: '600px' }}> {/* Set max width for the chart */}
          <Typography variant="h6" gutterBottom>
            Spending for {currentMonth}
          </Typography>
          <Bar
            data={spendingData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: `Spending Breakdown for ${currentMonth}`,
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Модальное окно для PaymentForm */}
      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        aria-labelledby="payment-modal-title"
        aria-describedby="payment-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            outline: 'none',
          }}
        >
          <PaymentForm amount={addFunds} onClose={handlePaymentClose} />
        </Box>
      </Modal>
    </Box>
  );
}

export default Billing;