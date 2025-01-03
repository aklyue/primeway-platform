import React, { useState, useContext, useEffect } from "react";
import { Box, Typography, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
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
import { AuthContext } from "../AuthContext";
import { OrganizationContext } from "./Organization/OrganizationContext";
import axiosInstance from "../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Billing() {
  const { user } = useContext(AuthContext);
  const { currentOrganization, isCurrentOrgOwner } = useContext(OrganizationContext);

  // Wallet/balance
  const [walletBalance, setWalletBalance] = useState(1000);
  const [currentMonth] = useState("Сентябрь");
  
  // **New state for transactions history**
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [errorTransactions, setErrorTransactions] = useState(null);

  // Fetch transaction history when currentOrganization changes
  useEffect(() => {
    if (currentOrganization && isCurrentOrgOwner()) {
      setIsLoadingTransactions(true);
      setErrorTransactions(null);
      console.log("currentOrganization", currentOrganization)
      console.log("user", user)

      // Replace this URL with your actual endpoint
      axiosInstance
        .get(`/billing/${user.billing_account_id}/transactions`)
        .then((response) => {
          setTransactions(response.data);
        })
        .catch((error) => {
          setErrorTransactions(error?.response?.data?.detail || error.message);
        })
        .finally(() => {
          setIsLoadingTransactions(false);
        });
      }
  }, [currentOrganization, isCurrentOrgOwner]);

  // Handle payment result
  const handlePaymentSuccess = (paymentResult) => {
    console.log("Оплата успешна:", paymentResult);
    // You might want to trigger a transactions refetch here or update state
  };

  const handlePaymentError = (error) => {
    console.error("Ошибка оплаты:", error);
    alert("Оплата не прошла. Пожалуйста, попробуйте снова.");
  };

  // Chart data for spending
  const spendingData = {
    labels: Array.from({ length: 30 }, (_, i) => (i + 1).toString()),
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

  // If no organization is selected
  if (!currentOrganization) {
    return (
      <Box sx={{ padding: "16px" }}>
        <Alert severity="info">
          Please select an organization to view billing information.
        </Alert>
      </Box>
    );
  }

  // If user is not the owner
  if (!isCurrentOrgOwner()) {
    return (
      <Box sx={{ padding: "16px" }}>
        <Typography variant="h4" gutterBottom>
          Billing and Wallet
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          The billing account for {currentOrganization.name} is managed by the organization owner. 
          Please contact your organization administrator for any billing-related questions.
        </Alert>
      </Box>
    );
  }

  // If user is the owner, show full billing interface
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
      </Box>

      <TPaymentWidget
        user={user}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      {/* Transaction history section */}
      <Box sx={{ marginTop: "36px" }}>
        <Typography variant="h6" gutterBottom>
          История операций
        </Typography>
        {isLoadingTransactions && <Typography>Loading transactions...</Typography>}
        {errorTransactions && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {errorTransactions}
          </Alert>
        )}
        {transactions.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Тип транзакции</TableCell>
                  <TableCell>Статус / Код ошибки</TableCell>
                  <TableCell>Количество (₽ / Credits)</TableCell>
                  <TableCell>Ссылка (Reference)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                    <TableCell>{tx.transaction_type || tx.status}</TableCell>
                    <TableCell>
                      {tx.status}
                      {tx.error_code && ` / ${tx.error_code}`}
                    </TableCell>
                    <TableCell>{tx.credits}</TableCell>
                    <TableCell>{tx.reference_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Chart of spending data */}
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: "36px" }}>
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
