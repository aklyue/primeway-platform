import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Billing() {
  const [currentMonth] = useState('September');
  const [walletBalance, setWalletBalance] = useState(1000); // Default wallet balance
  const [addFunds, setAddFunds] = useState(0); // For adding funds

  // Mock data for spending in September
  const spendingData = {
    labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'], // Days of the month
    datasets: [
      {
        label: 'Daily Spending ($)',
        data: [50, 100, 75, 200, 125, 90, 60, 130, 80, 150, 120, 170, 140, 60, 110, 95, 180, 75, 90, 130, 160, 120, 100, 140, 180, 110, 90, 100, 170, 160], // Mock spending data for each day
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const handleAddFunds = () => {
    const newBalance = walletBalance + parseFloat(addFunds);
    setWalletBalance(newBalance);
    setAddFunds(0); // Reset the add funds field after adding
  };

  return (
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Billing and Wallet
      </Typography>

      {/* Wallet Balance Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Typography variant="h6">Current Wallet Balance: ${walletBalance}</Typography>
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
        <Box sx={{ width: '600px' }}>  {/* Set max width for the chart */}
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
    </Box>
  );
}

export default Billing;
