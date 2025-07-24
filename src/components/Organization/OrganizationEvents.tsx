import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import axiosInstance from "../../api";
import { ru } from "date-fns/locale";
import { Virtuoso } from "react-virtuoso";
import { Events } from "../../types";
import { AxiosResponse } from "axios";

const PAGE_SIZE = 20;

const ALLOWED_EVENT_LEVELS = ["info", "warning", "error", "success"];
const eventLevelStyles = {
  info: { backgroundColor: "transparent" },
  warning: { backgroundColor: "rgba(255, 255, 0, 0.1)" },
  error: { backgroundColor: "rgba(255, 0, 0, 0.1)" },
  success: { backgroundColor: "rgba(0, 255, 0, 0.1)" },
};

type EventLevel = typeof eventLevelStyles;

interface OrganizationEventsProps {
  organizationId: string;
}

function OrganizationEvents({ organizationId }: OrganizationEventsProps) {
  const [events, setEvents] = useState<Events[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = parseISO(dateTimeString);
      return format(date, "dd.MM.yyyy HH:mm:ss", { locale: ru });
    } catch {
      return dateTimeString;
    }
  };

  const loadEvents = useCallback(
    async (pageToLoad: number) => {
      try {
        const response = await axiosInstance.get(
          `/organizations/${organizationId}/events`,
          {
            params: {
              limit: PAGE_SIZE,
              offset: pageToLoad * PAGE_SIZE,
            },
          }
        );
        const fetchedEvents: Events[] = response.data || [];
        setEvents((prev) => [...prev, ...fetchedEvents]);
        if (fetchedEvents.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (e) {
        console.error("Ошибка при загрузке событий:", e);
        setError("Не удалось загрузить события.");
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [organizationId]
  );

  useEffect(() => {
    if (organizationId) {
      setLoading(true);
      setEvents([]);
      setPage(0);
      setHasMore(true);
      loadEvents(0);
    }
  }, [organizationId, loadEvents]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      loadEvents(nextPage);
    }
  };

  const EventItem = ({ event }: { event: Events }) => {
    const level = event.level?.toLowerCase();
    const eventStyles: { backgroundColor?: string } =
      ALLOWED_EVENT_LEVELS.includes(level)
        ? eventLevelStyles[level as keyof EventLevel]
        : {};
    return (
      <Paper
        variant="outlined"
        sx={{
          border: "none",
          borderRadius: "10px",
          p: 2,
          pl: 1,
          m: 1,
          ...eventStyles,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "600", fontSize: "12px", opacity: 0.5 }}
        >
          {formatDateTime(event.timestamp)}{" "}
          <strong>{event.level?.toUpperCase()}</strong>
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "14px" }}>
          {event.event}
        </Typography>
      </Paper>
    );
  };

  return (
    <Box sx={{ width: "100%", maxHeight: 390, height: 390 }}>
      {loading ? (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={() => loadEvents(page)}>Попробовать ещё раз</Button>
        </Box>
      ) : events.length === 0 ? (
        <Typography sx={{ p: 2 }}>Событий нет.</Typography>
      ) : (
        <Virtuoso
          style={{ height: "100%" }}
          data={events}
          endReached={loadMore}
          overscan={50}
          itemContent={(index, event) => <EventItem event={event} />}
          components={{
            Footer: () =>
              loadingMore ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : null,
          }}
        />
      )}
    </Box>
  );
}

export default OrganizationEvents;
