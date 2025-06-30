import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  List,
  Paper,
  Button,
} from "@mui/material";
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

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      setEventsLoading(false);
      setEventsError("Сервер не отвечает более 10 секунд.");
    }, 10000);

    try {
      const response = await axiosInstance.get(
        `/organizations/${organizationId}/events`,
        {
          params: { amount },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      setEvents(response.data || []);
    } catch (error) {
      clearTimeout(timeout);
      console.error("Ошибка при получении событий организации:", error);

      if (axiosInstance.isAxiosError?.(error) && error.response) {
        const status = error.response.status;
        if (status === 404) {
          setEventsError("События не найдены (404).");
        } else if (status === 500) {
          setEventsError("Ошибка сервера (500).");
        } else {
          setEventsError(`Ошибка ${status}: ${error.response.statusText}`);
        }
      } else if (
        error.name === "CanceledError" ||
        error.name === "AbortError"
      ) {
        setEventsError("Ошибка при загрузке событий.");
      } else {
        setEventsError("Ошибка при загрузке событий.");
      }
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchEvents();
    } else {
      setEventsLoading(false);
    }
  }, [organizationId]);

  if (!organizationId) {
    return null;
  }

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
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : eventsError ? (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography color="error" gutterBottom>
            {eventsError}
          </Typography>
          <Button
            variant="contained"
            onClick={fetchEvents}
            sx={{
              bgcolor: "#597ad3",
              color: "white",
              "&:hover": { bgcolor: "#7c97de" },
              textTransform: "none",
            }}
          >
            Попробовать ещё раз
          </Button>
        </Box>
      ) : events.length > 0 ? (
        <List>
          {events.map((event, index) => {
            const level = event.level.toLowerCase();
            const isValidLevel = ALLOWED_EVENT_LEVELS.includes(level);
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
                key={event.id || index}
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
