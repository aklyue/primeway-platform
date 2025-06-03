import { useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api";

export const useBillingActions = ({
  currentOrganization,
  isCurrentOrgOwner,
  walletBalance,
  walletLoading,
  walletError,
  user
}) => {
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

  return {
    isLoading,
    creditPurchasesData,
    creditUsagePerDay,
    isMobile,
    isTablet,
    handlePaymentSuccess,
    handlePaymentError,
    error
  }
};
