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
  CircularProgress,
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
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

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

  // Состояния для баланса кошелька
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [errorBalance, setErrorBalance] = useState(null);

  // Состояния для истории транзакций
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [errorTransactions, setErrorTransactions] = useState(null);

  const [currentMonth] = useState("Сентябрь");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Объединенное состояние загрузки
  const isLoading = isLoadingBalance || isLoadingTransactions;

  // Загрузка баланса и транзакций при изменении текущей организации
  useEffect(() => {
    if (currentOrganization && isCurrentOrgOwner()) {
      // Загрузка баланса кошелька
      setIsLoadingBalance(true);
      setErrorBalance(null);

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

  // Обработка успешной оплаты
  const handlePaymentSuccess = (paymentResult) => {
    console.log("Оплата успешна:", paymentResult);
    // Здесь вы можете обновить баланс и историю транзакций
  };

  const handlePaymentError = (error) => {
    console.error("Ошибка оплаты:", error);
    alert("Оплата не прошла. Пожалуйста, попробуйте снова.");
  };

  // Данные для графика расходов
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

  // Если нет выбранной организации
  if (!currentOrganization) {
    return (
      <Box sx={{ padding: "16px" }}>
        <Alert severity="info">
          Пожалуйста, выберите организацию для просмотра информации о биллинге.
        </Alert>
      </Box>
    );
  }

  // Если пользователь не является владельцем организации
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

  // Если данные загружаются, отображаем плейсхолдер загрузки на всю страницу
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "calc(100vh - 64px)", // Вычитаем высоту AppBar, если нужно
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Основной контент после загрузки данных
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
          marginBottom: "10px",
        }}
      >
        {errorBalance ? (
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

      {/* Секция истории транзакций */}
      <Box sx={{ marginTop: "40px", }}>
        <Typography variant="h6" gutterBottom>
          История операций
        </Typography>
        {errorTransactions ? (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {errorTransactions}
          </Alert>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: "20px",
            }}
          >
            {/* Левая сторона: График расходов */}
            <Box
              sx={{
                flex: 1,
                marginRight: isMobile ? 0 : "20px",
                marginBottom: isMobile ? "20px" : 0,
              }}
            >
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

            {/* Правая сторона: Таблица транзакций */}
            <Box component={Paper}  sx={{ flex: 1, overflowY: "auto" }}>
              {transactions.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Тип транзакции</TableCell>
                        <TableCell>Количество (₽)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {new Date(tx.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {tx.transaction_type || tx.status}
                          </TableCell>
                          <TableCell>{tx.amount || tx.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>Нет транзакций для отображения.</Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Billing;
