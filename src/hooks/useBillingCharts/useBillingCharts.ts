// hooks/useBilling.js
import { useMemo } from "react";
import { ru } from "date-fns/locale";
import { DailyCreditUsage } from "../../types";
import { ChartOptions, TooltipItem } from "chart.js";

interface useBillingChartsProps {
  creditPurchasesData: DailyCreditUsage[];
  creditUsagePerDay: DailyCreditUsage[];
}

export default function useBillingCharts({
  creditPurchasesData,
  creditUsagePerDay,
}: useBillingChartsProps) {
  const purchasesChartData = useMemo(
    () => ({
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
          barThickness: 20,
        },
      ],
    }),
    [creditPurchasesData]
  );

  const purchasesChartOptionsBar = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } },
        y: { beginAtZero: true },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"bar">) =>
              `Сумма покупки: ${context.parsed.y} ₽`,
            title: (context: TooltipItem<"bar">[]) =>
              `Дата: ${creditPurchasesData[context[0].dataIndex].date}`,
          },
        },
        legend: { display: false },
      },
    }),
    [creditPurchasesData]
  );
  const purchasesChartOptionsLine = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } },
        y: { beginAtZero: true },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"line">) =>
              `Сумма покупки: ${context.parsed.y} ₽`,
            title: (context: TooltipItem<"line">[]) =>
              `Дата: ${creditPurchasesData[context[0].dataIndex].date}`,
          },
        },
        legend: { display: false },
      },
    }),
    [creditPurchasesData]
  );

  const expensesChartData = useMemo(
    () => ({
      labels: creditUsagePerDay.map((item) => item.date),
      datasets: [
        {
          label: "Расходы (₽)",
          data: creditUsagePerDay.map((item) => item.credits),
          backgroundColor: "rgba(136, 132, 216, 0.2)",
          borderColor: "#8884d8",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#8884d8",
          pointHoverBackgroundColor: "#8884d8",
          pointHoverBorderColor: "#fff",
        },
      ],
    }),
    [creditUsagePerDay]
  );

  const expensesChartOptionsBar = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
            tooltipFormat: "dd MMMM yyyy",
            displayFormats: { day: "dd MMM" },
          },
          adapters: { date: { locale: ru } },
          ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
          grid: { display: false },
        },
        y: { beginAtZero: true, grid: { color: "#e0e0e0" } },
      },
      plugins: {
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#8884d8",
          bodyColor: "#000",
          borderColor: "#8884d8",
          borderWidth: 1,
          callbacks: {
            label: (context: TooltipItem<"bar">) =>
              ` Расход: ${context.parsed.y} ₽`,
            title: (context: TooltipItem<"bar">[]) => {
              const date = new Date(context[0].parsed.x);
              return `Дата: ${date.toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}`;
            },
          },
        },
        legend: { display: false },
      },
    }),
    []
  );

  const expensesChartOptionsLine = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
            tooltipFormat: "dd MMMM yyyy",
            displayFormats: { day: "dd MMM" },
          },
          adapters: { date: { locale: ru } },
          ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
          grid: { display: false },
        },
        y: { beginAtZero: true, grid: { color: "#e0e0e0" } },
      },
      plugins: {
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#8884d8",
          bodyColor: "#000",
          borderColor: "#8884d8",
          borderWidth: 1,
          callbacks: {
            label: (context: TooltipItem<"line">) =>
              ` Расход: ${context.parsed.y} ₽`,
            title: (context: TooltipItem<"line">[]) => {
              const date = new Date(context[0].parsed.x);
              return `Дата: ${date.toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}`;
            },
          },
        },
        legend: { display: false },
      },
    }),
    []
  );

  return {
    purchasesChartData,
    purchasesChartOptionsBar,
    purchasesChartOptionsLine,
    expensesChartData,
    expensesChartOptionsBar,
    expensesChartOptionsLine,
  };
}
