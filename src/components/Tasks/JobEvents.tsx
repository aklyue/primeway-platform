import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, List, Paper } from "@mui/material";
import { format, parseISO } from "date-fns";
import axiosInstance from "../../api";
import { ru } from "date-fns/locale";
import { Events } from "../../types";

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

interface JobEventsProps {
  jobId: string;
}

function JobEvents({ jobId }: JobEventsProps) {
  const [events, setEvents] = useState<Events[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);

    try {
      const response = await axiosInstance.get<Events[]>("/jobs/get-events", {
        params: { job_id: jobId },
      });
      setEvents(response.data || []);
    } catch (error) {
      console.error("Ошибка при получении событий:", error);
      setEventsError("Ошибка при загрузке событий");
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchEvents();
    } else {
      setEventsLoading(false);
    }
  }, [jobId]);

  // Функция для форматирования даты и времени
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = parseISO(dateTimeString);
      return format(date, "dd.MM.yyyy HH:mm:ss", { locale: ru });
    } catch (error) {
      console.error("Ошибка при форматировании даты:", error);
      return dateTimeString;
    }
  };

  if (!jobId) {
    return null;
  }

  return (
    <Box sx={{ height: "500px", overflow: "auto", p: 1 }}>
      {eventsLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : eventsError ? (
        <Typography color="error">{eventsError}</Typography>
      ) : (
        <>
          {events.length > 0 ? (
            <List>
              {events.map((event, index) => {
                const level = event.level.toLowerCase();
                const isValidLevel = ALLOWED_EVENT_LEVELS.includes(level);
                return (
                  <Paper
                    variant="outlined"
                    sx={{
                      border: "none",
                      p: 2,
                      mb: 2,
                      ...(isValidLevel
                        ? eventLevelStyles[
                            level as keyof typeof eventLevelStyles
                          ]
                        : {}),
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
            <Typography>Событий нет.</Typography>
          )}
        </>
      )}
    </Box>
  );
}

export default JobEvents;
