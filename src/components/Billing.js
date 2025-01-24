// src/components/Billing.js

import React, { useState, useContext, useEffect, useRef } from "react";
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
  Card,
  CardContent,
  CardHeader,
  Grid,
} from "@mui/material";
import TPaymentWidget from "./TPaymentWidget";
import { AuthContext } from "../AuthContext";
import { OrganizationContext } from "./Organization/OrganizationContext";
import axiosInstance from "../api";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function Billing() {
  const { user } = useContext(AuthContext);
  const { currentOrganization, isCurrentOrgOwner } =
    useContext(OrganizationContext);

  // Состояния для данных
  const [walletBalance, setWalletBalance] = useState(null);
  const [creditUsageTransactions, setCreditUsageTransactions] = useState([]);
  const [creditPurchaseTransactions, setCreditPurchaseTransactions] = useState([]);
  const [billingAccountDetails, setBillingAccountDetails] = useState(null);

  // Состояния для загрузки и ошибок
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Используем useRef для отслеживания первой загрузки и интервала
  const initialLoadRef = useRef(true);
  const intervalRef = useRef(null);

  // Функция для загрузки всех данных
  const fetchAllData = () => {
    if (initialLoadRef.current) {
      setIsLoading(true);
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    // Обещания для загрузки всех данных
    Promise.all([
      // Загрузка деталей биллингового аккаунта
      axiosInstance.get(`/billing/${user.billing_account_id}`, config),
      // Загрузка баланса кошелька
      axiosInstance.get(`/billing/${user.billing_account_id}/balance`, config),
      // Загрузка транзакций списания кредитов
      axiosInstance.get(
        `/billing/${user.billing_account_id}/transactions/credit_usage`,
        config
      ),
      // Загрузка транзакций покупки кредитов
      axiosInstance.get(
        `/billing/${user.billing_account_id}/transactions/credit_purchase`,
        config
      ),
    ])
      .then(
        ([
          billingAccountResponse,
          balanceResponse,
          usageTransactionsResponse,
          purchaseTransactionsResponse,
        ]) => {
          setBillingAccountDetails(billingAccountResponse.data);
          setWalletBalance(balanceResponse.data.balance);
          setCreditUsageTransactions(usageTransactionsResponse.data.transactions || []);
          setCreditPurchaseTransactions(purchaseTransactionsResponse.data.transactions || []);
        }
      )
      .catch((error) => {
        // Обработка ошибок
        console.error("Ошибка при загрузке данных биллинга:", error);
        const errorMessage =
          error?.response?.data?.detail || error.message || "Ошибка при загрузке данных.";
        setError(errorMessage);
      })
      .finally(() => {
        if (initialLoadRef.current) {
          setIsLoading(false);
          initialLoadRef.current = false;
        }
      });
  };

  // useEffect для начальной загрузки и установки интервала
  useEffect(() => {
    if (currentOrganization && isCurrentOrgOwner()) {
      // Сбрасываем флаг первой загрузки
      initialLoadRef.current = true;

      // Загружаем данные сразу при монтировании или изменении зависимостей
      fetchAllData();

      // Устанавливаем интервал для периодического фетчинга
      intervalRef.current = setInterval(() => {
        fetchAllData();
      }, 5000); // Интервал в 5 секунд

      // Чистим интервал при размонтировании компонента или изменении зависимостей
      return () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      };
    } else {
      // Очищаем интервал, если условия не выполнены
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [currentOrganization, isCurrentOrgOwner, user.billing_account_id, user.token]);

  // Обработка успешной оплаты
  const handlePaymentSuccess = () => {
    // Перезагружаем данные после успешной оплаты
    fetchAllData();
  };

  const handlePaymentError = (error) => {
    console.error("Ошибка оплаты:", error);
    alert("Оплата не прошла. Пожалуйста, попробуйте снова.");
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

      {/* Отображение деталей биллингового аккаунта */}
      {error ? (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      ) : billingAccountDetails ? (
        <Card sx={{ marginBottom: 2 }}>
          <CardHeader title="Детали биллингового аккаунта" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Название:</Typography>
                <Typography variant="body1">{billingAccountDetails.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Кредитный лимит:</Typography>
                <Typography variant="body1">
                  {billingAccountDetails.credit_limit !== null
                    ? `${billingAccountDetails.credit_limit} ₽`
                    : "Не установлен"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Баланс кошелька:</Typography>
                {error ? (
                  <Typography variant="body1" color="error">
                    {error}
                  </Typography>
                ) : (
                  <Typography variant="body1" sx={{ color: "secondary.main" }}>
                    {walletBalance} ₽
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Создан:</Typography>
                <Typography variant="body1">
                  {new Date(billingAccountDetails.created_at).toLocaleDateString()}
                </Typography>
              </Grid>
              {/* Добавьте любые другие поля, если они есть */}
            </Grid>
          </CardContent>
        </Card>
      ) : null}

      {/* Кнопка оплаты */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <TPaymentWidget
          user={user}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </Box>

      {/* Секция истории транзакций */}
      <Box sx={{ marginTop: "40px" }}>
        <Typography variant="h6" gutterBottom>
          История операций
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
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
            {/* Левая таблица: Покупка кредитов */}
            <Box
              sx={{
                flex: 1,
                marginRight: isMobile ? 0 : "20px",
                marginBottom: isMobile ? "20px" : 0,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Покупка кредитов
              </Typography>
              {creditPurchaseTransactions.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Количество (₽)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {creditPurchaseTransactions.map((tx, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(tx.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>+{tx.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>Нет транзакций покупки кредитов.</Typography>
              )}
            </Box>

            {/* Правая таблица: Использование кредитов */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Использование кредитов
              </Typography>
              {creditUsageTransactions.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Количество (₽)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {creditUsageTransactions.map((tx, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(tx.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{tx.job_execution_id || "Списание кредитов"}</TableCell>
                          <TableCell>-{tx.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>Нет транзакций использования кредитов.</Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Billing;