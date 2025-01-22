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

  // Состояния для баланса кошелька
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [errorBalance, setErrorBalance] = useState(null);

  // Состояния для транзакций списания и покупки кредитов
  const [creditUsageTransactions, setCreditUsageTransactions] = useState([]);
  const [creditPurchaseTransactions, setCreditPurchaseTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [errorTransactions, setErrorTransactions] = useState(null);

  // Состояния для деталей биллингового аккаунта
  const [billingAccountDetails, setBillingAccountDetails] = useState(null);
  const [isLoadingBillingAccount, setIsLoadingBillingAccount] = useState(true);
  const [errorBillingAccount, setErrorBillingAccount] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Объединенное состояние загрузки
  const isLoading =
    isLoadingBalance || isLoadingTransactions || isLoadingBillingAccount;

  // Загрузка баланса, транзакций и деталей биллингового аккаунта при изменении текущей организации
  useEffect(() => {
    if (currentOrganization && isCurrentOrgOwner()) {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // Убедитесь, что токен доступа доступен в user.token
        },
      };

      // Загрузка деталей биллингового аккаунта
      setIsLoadingBillingAccount(true);
      setErrorBillingAccount(null);

      axiosInstance
        .get(`/billing/${user.billing_account_id}`, config)
        .then((response) => {
          setBillingAccountDetails(response.data);
        })
        .catch((error) => {
          setErrorBillingAccount(error?.response?.data?.detail || error.message);
        })
        .finally(() => {
          setIsLoadingBillingAccount(false);
        });

      // Загрузка баланса кошелька
      setIsLoadingBalance(true);
      setErrorBalance(null);

      axiosInstance
        .get(`/billing/${user.billing_account_id}/balance`, config)
        .then((response) => {
          setWalletBalance(response.data.balance);
        })
        .catch((error) => {
          setErrorBalance(error?.response?.data?.detail || error.message);
        })
        .finally(() => {
          setIsLoadingBalance(false);
        });

      // Загрузка транзакций списания и покупки кредитов
      setIsLoadingTransactions(true);
      setErrorTransactions(null);

      // Обещания для одновременной загрузки транзакций
      Promise.all([
        axiosInstance.get(
          `/billing/${user.billing_account_id}/transactions/credit_usage`,
          config
        ),
        axiosInstance.get(
          `/billing/${user.billing_account_id}/transactions/credit_purchase`,
          config
        ),
      ])
        .then(([usageResponse, purchaseResponse]) => {
          setCreditUsageTransactions(usageResponse.data.transactions || []);
          setCreditPurchaseTransactions(purchaseResponse.data.transactions || []);
        })
        .catch((error) => {
          setErrorTransactions(
            error?.response?.data?.detail || error.message
          );
        })
        .finally(() => {
          setIsLoadingTransactions(false);
        });
    }
  }, [currentOrganization, isCurrentOrgOwner, user.billing_account_id, user.token]);

  // Обработка успешной оплаты
  const handlePaymentSuccess = () => {
    // Перезагрузить данные после успешной оплаты
    setIsLoadingBalance(true);
    setIsLoadingTransactions(true);
    setIsLoadingBillingAccount(true);

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    // Загрузка деталей биллингового аккаунта
    axiosInstance
      .get(`/billing/${user.billing_account_id}`, config)
      .then((response) => {
        setBillingAccountDetails(response.data);
      })
      .catch((error) => {
        setErrorBillingAccount(error?.response?.data?.detail || error.message);
      })
      .finally(() => {
        setIsLoadingBillingAccount(false);
      });

    // Загрузка баланса кошелька
    axiosInstance
      .get(`/billing/${user.billing_account_id}/balance`, config)
      .then((response) => {
        setWalletBalance(response.data.balance);
      })
      .catch((error) => {
        setErrorBalance(error?.response?.data?.detail || error.message);
      })
      .finally(() => {
        setIsLoadingBalance(false);
      });

    // Загрузка транзакций списания и покупки кредитов
    Promise.all([
      axiosInstance.get(
        `/billing/${user.billing_account_id}/transactions/credit_usage`,
        config
      ),
      axiosInstance.get(
        `/billing/${user.billing_account_id}/transactions/credit_purchase`,
        config
      ),
    ])
      .then(([usageResponse, purchaseResponse]) => {
        setCreditUsageTransactions(usageResponse.data.transactions || []);
        setCreditPurchaseTransactions(purchaseResponse.data.transactions || []);
      })
      .catch((error) => {
        setErrorTransactions(
          error?.response?.data?.detail || error.message
        );
      })
      .finally(() => {
        setIsLoadingTransactions(false);
      });
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
      {errorBillingAccount ? (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {errorBillingAccount}
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
                {errorBalance ? (
                  <Typography variant="body1" color="error">
                    {errorBalance}
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