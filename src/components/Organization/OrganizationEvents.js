// OrganizationEvents.jsx
import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, List, Paper } from "@mui/material";
import { format, parseISO } from "date-fns";
import axiosInstance from "../../api";
import { ru } from "date-fns/locale";

const ALLOWED_EVENT_LEVELS = ["info", "warning", "error", "success"];

const eventLevelStyles = {
  info: {
    backgroundColor: "transparent",
  },
  warning: {
    backgroundColor: "rgba(255, 255, 0, 0.1)",
  },
  error: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  },
  success: {
    backgroundColor: "rgba(0, 255, 0, 0.1)",
  },
};

function OrganizationEvents({ organizationId, amount }) {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);

    try {
      const response = await axiosInstance.get(
        `/organizations/${organizationId}/events`,
        {
          params: {
            amount: amount,
          },
        }
      );
      setEvents(response.data || []);
    } catch (error) {
      console.error("Ошибка при получении событий организации:", error);
      setEventsError("Ошибка при загрузке событий");
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchEvents();
    } else {
      setEventsLoading(false); // Добавляем эту строку
    }
  }, [organizationId]);

  if (!organizationId) {
    return null; // Добавлено раннее возвращение null
  }

  // Функция для форматирования даты и времени
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = parseISO(dateTimeString);
      return format(date, "dd.MM.yyyy HH:mm:ss", { locale: ru });
    } catch (error) {
      console.error("Ошибка при форматировании даты:", error);
      return dateTimeString;
    }
  };

  return (
    <Box sx={{ width: "100%", maxHeight: 390, overflowY: "auto" }}>
      {eventsLoading ? (
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : eventsError ? (
        <Typography color="error" sx={{ p: 2 }}>
          {eventsError}
        </Typography>
      ) : events.length > 0 ? (
        <List>
          {events.map((event, index) => {
            // Приводим уровень события к нижнему регистру
            const level = event.level.toLowerCase();
            // Проверяем, является ли уровень допустимым
            const isValidLevel = ALLOWED_EVENT_LEVELS.includes(level);
            // Получаем стили для уровня события
            const eventStyles = isValidLevel ? eventLevelStyles[level] : {};

            return (
              <Paper
                variant="outlined"
                sx={{
                  border: "none",
                  borderRadius: "10px",
                  p: 2,
                  pl: 1,
                  mb: 2,
                  ...eventStyles,
                }}
                key={index}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "600", fontSize: "12px", opacity: 0.5 }}
                >
                  {formatDateTime(event.timestamp)}{" "}
                  <strong>{event.level.toUpperCase()}</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "14px" }}>
                  {event.event}
                </Typography>
              </Paper>
            );
          })}
        </List>
      ) : (
        <Typography sx={{ p: 2 }}>Событий нет.</Typography>
      )}
    </Box>
  );
}

export default OrganizationEvents;
