// src/components/Billing.js

import React, { useState, useContext, useEffect, useRef } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import TPaymentWidget from "./TPaymentWidget";
import { AuthContext } from "../AuthContext";
import { OrganizationContext } from "./Organization/OrganizationContext";
import axiosInstance from "../api";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

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

// Импортируем адаптер для работы с временем
import "chartjs-adapter-date-fns";
import { ru } from "date-fns/locale";

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
  const { user } = useContext(AuthContext);
  const {
    currentOrganization,
    isCurrentOrgOwner,
    walletBalance,
    walletLoading,
    walletError,
  } = useContext(OrganizationContext);

  // Состояния для данных
  const [creditUsagePerDay, setCreditUsagePerDay] = useState([]); // Данные для графика расходов
  const [creditPurchasesData, setCreditPurchasesData] = useState([]); // Данные для графика покупок

  // Состояния для загрузки и ошибок
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Используем useRef для отслеживания первой загрузки
  const initialLoadRef = useRef(true);

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

    Promise.all([
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
      // Загрузка использования кредитов по дням
      axiosInstance.get(
        `/billing/${user.billing_account_id}/credits_usage`,
        config
      ),
    ])
      .then(
        ([
          usageTransactionsResponse,
          purchaseTransactionsResponse,
          usagePerDayResponse,
        ]) => {
          // Обработка данных для графика расходов
          const usageData = usagePerDayResponse.data.usage_per_day;
          const usageArray = Object.keys(usageData).map((date) => ({
            date,
            credits: usageData[date],
          }));

          // Сортировка дат по возрастанию
          usageArray.sort((a, b) => new Date(a.date) - new Date(b.date));

          setCreditUsagePerDay(usageArray);

          // Обработка данных для графика покупок кредитов
          const purchasesData = (
            purchaseTransactionsResponse.data.transactions || []
          ).map((tx) => {
            const date = tx.created_at.split("T")[0]; // Получаем только дату без времени
            return {
              date,
              credits: parseFloat(tx.credits),
            };
          });

          // Группируем покупки по дате
          const purchasesByDate = {};
          purchasesData.forEach((purchase) => {
            if (purchasesByDate[purchase.date]) {
              purchasesByDate[purchase.date] += purchase.credits;
            } else {
              purchasesByDate[purchase.date] = purchase.credits;
            }
          });

          // Преобразуем в массив и сортируем по дате
          const purchasesArray = Object.keys(purchasesByDate).map((date) => ({
            date,
            credits: purchasesByDate[date],
          }));
          purchasesArray.sort((a, b) => new Date(a.date) - new Date(b.date));

          setCreditPurchasesData(purchasesArray);
        }
      )
      .catch((error) => {
        console.error("Ошибка при загрузке данных биллинга:", error);
        const errorMessage =
          error?.response?.data?.detail ||
          error?.message ||
          "Ошибка при загрузке данных.";
        setError(errorMessage);
      })
      .finally(() => {
        if (initialLoadRef.current) {
          setIsLoading(false);
          initialLoadRef.current = false;
        }
      });
  };

  // useEffect для начальной загрузки данных
  useEffect(() => {
    if (currentOrganization && isCurrentOrgOwner()) {
      initialLoadRef.current = true;
      fetchAllData();
    }
  }, [
    currentOrganization,
    isCurrentOrgOwner,
    user.billing_account_id,
    user.token,
  ]);

  // Обработка успешной оплаты
  const handlePaymentSuccess = () => {
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

  // Если данные загружаются, отображаем индикатор загрузки
  if (isLoading || walletLoading) {
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

  // Формирование данных для графика покупок кредитов (Bar Chart)
  const purchasesChartData = {
    labels: creditPurchasesData.map((item) =>
      new Date(item.date).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
      })
    ),
    datasets: [
      {
        label: "Сумма покупки (₽)",
        data: creditPurchasesData.map((item) => item.credits),
        backgroundColor: "#82ca9d",
        borderColor: "#82ca9d",
        borderWidth: 1,
        barThickness: 20, // Устанавливаем толщину столбцов
      },
    ],
  };

  // Опции для графика покупок кредитов
  const purchasesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Сумма покупки: ${context.parsed.y} ₽`;
          },
          title: function (context) {
            return `Дата: ${creditPurchasesData[context[0].dataIndex].date}`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
  };

  // Формирование данных для графика расходов (Line Chart)
  const expensesChartData = {
    labels: creditUsagePerDay.map((item) => item.date),
    datasets: [
      {
        label: "Расходы (₽)",
        data: creditUsagePerDay.map((item) => item.credits),
        backgroundColor: "rgba(136, 132, 216, 0.2)", // Полупрозрачный фон для градиента
        borderColor: "#8884d8",
        borderWidth: 2,
        fill: true, // Включаем заливку под линией
        tension: 0.4, // Более сглаженная линия
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#8884d8",
        pointHoverBackgroundColor: "#8884d8",
        pointHoverBorderColor: "#fff",
      },
    ],
  };

  // Опции для графика расходов
  const expensesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time", // Используем временную шкалу
        time: {
          unit: "day",
          tooltipFormat: "dd MMMM yyyy",
          displayFormats: {
            day: "dd MMM",
          },
        },
        adapters: {
          date: {
            locale: ru, // Устанавливаем локаль на русский
          },
        },
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false, // Отключаем сетку по оси X
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#e0e0e0", // Цвет горизонтальной сетки
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#8884d8",
        bodyColor: "#000",
        borderColor: "#8884d8",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return ` Расход: ${context.parsed.y} ₽`;
          },
          title: function (context) {
            const date = new Date(context[0].parsed.x);
            return `Дата: ${date.toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
  };

  // Основной контент после загрузки данных
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Биллинг и Кошелек
      </Typography>

      {/* Кнопка оплаты и баланс кошелька */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: isMobile ? 2 : 0,
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
