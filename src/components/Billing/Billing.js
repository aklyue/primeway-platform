// src/components/Billing.js

import React, { useState, useContext, useEffect, useRef } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import TPaymentWidget from "../../UI/TPaymentWidget/TPaymentWidget";

// Импортируем необходимые компоненты из react-chartjs-2 и chart.js
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler, // Добавляем Filler для градиентной заливки
  TimeScale,
} from "chart.js";
import { PriceChange } from "@mui/icons-material";

// Импортируем адаптер для работы с временем
import "chartjs-adapter-date-fns";
import { ru } from "date-fns/locale";
import useBillingActions from "../../hooks/useBillingActions";
import {
  selectCurrentOrganization,
  selectWalletBalance,
  selectWalletLoading,
  selectWalletError,
  selectIsCurrentOrgOwner,
  selectWalletSilentLoading,
} from "../../store/selectors/organizationsSelectors";
import { useSelector } from "react-redux";
import useBillingCharts from "../../hooks/useBillingCharts";

// Регистрируем компоненты Chart.js
ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ChartTooltip,
  Legend,
  Filler, // Регистрируем Filler
  TimeScale
);

function Billing() {
  const user = useSelector((state) => state.auth.user);
  const currentOrganization = useSelector(selectCurrentOrganization);
  const walletBalance = useSelector(selectWalletBalance);
  const walletLoading = useSelector(selectWalletLoading);
  const walletSilentLoading = useSelector(selectWalletSilentLoading);
  const walletError = useSelector(selectWalletError);
  const isCurrentOrgOwner = useSelector(selectIsCurrentOrgOwner);

  const {
    isLoading,
    creditPurchasesData,
    creditUsagePerDay,
    isMobile,
    isTablet,
    handlePaymentSuccess,
    handlePaymentError,
    error,
  } = useBillingActions({
    currentOrganization,
    isCurrentOrgOwner,
    walletBalance,
    walletLoading,
    walletError,
    user,
  });

  const {
    purchasesChartData,
    purchasesChartOptions,
    expensesChartData,
    expensesChartOptions,
  } = useBillingCharts(creditPurchasesData, creditUsagePerDay);

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
  if (!isCurrentOrgOwner) {
    return (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PriceChange />
          <Typography fontSize={"1.25rem"} fontWeight={500} sx={{ ml: 1 }}>
            Биллинг и Кошелек
          </Typography>
        </Box>
        <Alert severity="info" sx={{ mt: 2 }}>
          Биллинг для {currentOrganization.name} управляется владельцем
          организации. Пожалуйста, свяжитесь с администратором организации по
          любым вопросам, связанным с биллингом.
        </Alert>
      </Box>
    );
  }

  // Если данные загружаются, отображаем индикатор загрузки
  if (isLoading || (walletLoading && walletBalance === null)) {
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "calc(100vh - 64px)",
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
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <PriceChange />
        <Typography fontSize={"1.25rem"} fontWeight={500} sx={{ ml: 1 }}>
          Биллинг и Кошелек
        </Typography>
      </Box>

      {/* Кнопка оплаты и баланс кошелька */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isTablet ? "start" : "center",
          mt: isMobile || isTablet ? 2 : 0,
          flexDirection: isMobile || isTablet ? "column" : "row",
          marginBottom: "10px",
          whiteSpace: "nowrap",
          gap: "8px",
        }}
      >
        {/* Отображение баланса кошелька */}
        {walletError ? (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {walletError}
          </Alert>
        ) : (
          <Typography variant="h6">
            Баланс кошелька:{" "}
            <Typography
              component="span"
              sx={{ color: "secondary.main", fontWeight: "bold" }}
            >
              {walletBalance} ₽
            </Typography>
          </Typography>
        )}
        <TPaymentWidget
          user={user}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          isMobile={isMobile}
        />
      </Box>

      {/* Секция истории операций и графиков */}
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
              flexDirection: isMobile || isTablet ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile || isTablet ? "center" : "flex-start",
              marginTop: "20px",
              gap: "15px",
              pr: 2,
            }}
          >
            {/* Левая секция: График покупок кредитов (Bar Chart) */}
            <Box
              sx={{
                flex: 0.6,
                marginRight: isMobile ? 0 : "20px",
                marginBottom: isMobile ? "20px" : 0,
                width: "100%",
                maxHeight: "300px", // Устанавливаем фиксированную высоту для графика
              }}
            >
              <Typography variant="h6" gutterBottom>
                Покупки кредитов
              </Typography>
              {creditPurchasesData.length > 0 ? (
                <Bar
                  data={purchasesChartData}
                  options={purchasesChartOptions}
                />
              ) : (
                <Typography>Нет данных о покупках кредитов</Typography>
              )}
            </Box>

            {/* Правая секция: График расходов (Line Chart) */}
            <Box
              sx={{
                flex: 0.7,
                width: "100%",
                maxHeight: "300px", // Устанавливаем фиксированную высоту для графика
              }}
            >
              <Typography variant="h6" gutterBottom>
                Расходы за последние 7 дней
              </Typography>
              {creditUsagePerDay.length > 0 ? (
                <Line data={expensesChartData} options={expensesChartOptions} />
              ) : (
                <Typography>Нет данных для отображения графика.</Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Billing;
