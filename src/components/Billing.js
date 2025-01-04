// Billing.js

import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress, // Добавлено для индикаторов загрузки
} from "@mui/material";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Billing() {
  const { user } = useContext(AuthContext);
  const { currentOrganization, isCurrentOrgOwner } =
    useContext(OrganizationContext);

  // Wallet/balance
  const [walletBalance, setWalletBalance] = useState(null); // Изначально баланс неизвестен
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState(null);

  const [currentMonth] = useState("Сентябрь");

  // **New state for transactions history**
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [errorTransactions, setErrorTransactions] = useState(null);

  // Fetch wallet balance and transaction history when currentOrganization changes
  useEffect(() => {
    if (currentOrganization && isCurrentOrgOwner()) {
      // Загрузка баланса кошелька
      setIsLoadingBalance(true);
      setErrorBalance(null);

      // Замените этот URL на ваш реальный эндпоинт
      axiosInstance
        .get(`/billing/${user.billing_account_id}/balance`)
        .then((response) => {
          setWalletBalance(response.data.balance);
        })
        .catch((error) => {
          setErrorBalance(error?.response?.data?.detail || error.message);
        })
        .finally(() => {
          setIsLoadingBalance(false);
        });

      // Загрузка истории транзакций
      setIsLoadingTransactions(true);
      setErrorTransactions(null);

      // Замените этот URL на ваш реальный эндпоинт
      axiosInstance
        .get(`/billing/${user.billing_account_id}/transactions`)
        .then((response) => {
          setTransactions(response.data.transactions || []);
        })
        .catch((error) => {
          setErrorTransactions(error?.response?.data?.detail || error.message);
        })
        .finally(() => {
          setIsLoadingTransactions(false);
        });
    }
  }, [currentOrganization, isCurrentOrgOwner, user.billing_account_id]);

  // Handle payment result
  const handlePaymentSuccess = (paymentResult) => {
    console.log("Оплата успешна:", paymentResult);
    // Вы можете обновить баланс и историю транзакций здесь
    // Например, вызвать повторно загрузку данных
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
          Пожалуйста, выберите организацию для просмотра информации о биллинге.
        </Alert>
      </Box>
    );
  }

  // If user is not the owner
  if (!isCurrentOrgOwner()) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Биллинг и Кошелек
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Биллинг для {currentOrganization.name} управляется владельцем
          организации. Пожалуйста, свяжитесь с администратором организации по
          любым вопросам, связанным с биллингом.
        </Alert>
      </Box>
    );
  }

  // If user is the owner, show full billing interface
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Биллинг и Кошелек
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
        {isLoadingBalance ? (
          // Плейсхолдер загрузки баланса
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="h6">Загрузка баланса...</Typography>
          </Box>
        ) : errorBalance ? (
          <Alert severity="error">{errorBalance}</Alert>
        ) : (
          <Typography variant="h6">
            Баланс кошелька:{" "}
            <Box component="span" sx={{ color: "secondary.main" }}>
              {walletBalance} ₽
            </Box>
          </Typography>
        )}

        <TPaymentWidget
          user={user}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </Box>
      {/* Transaction history section */}
      <Box sx={{ marginTop: "36px" }}>
        <Typography variant="h6" gutterBottom>
          История операций
        </Typography>
        {isLoadingTransactions ? (
          // Плейсхолдер загрузки транзакций
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Загрузка транзакций...</Typography>
          </Box>
        ) : errorTransactions ? (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {errorTransactions}
          </Alert>
        ) : transactions.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Тип транзакции</TableCell>
                  <TableCell>Статус / Код ошибки</TableCell>
                  <TableCell>Количество (₽ / Кредиты)</TableCell>
                  <TableCell>Ссылка (Reference)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleString()}
                    </TableCell>
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
        ) : (
          <Typography>Нет транзакций для отображения.</Typography>
        )}
      </Box>

      {/* Chart of spending data */}
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
