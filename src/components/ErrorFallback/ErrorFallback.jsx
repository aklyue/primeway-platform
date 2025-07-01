import { Box, Typography, Button } from "@mui/material";

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Box
      role="alert"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="80vh"
      p={2}
    >
      <Typography variant="h4" gutterBottom>
        Упс! Произошла ошибка
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {error?.message || "Не удалось загрузить страницу."}
      </Typography>
      <Button
        variant="contained"
        s
        sx={{
          bgcolor: "#597ad3",
          fontSize: "12px",
          color: "white",
          "&:hover": { bgcolor: "#7c97de" },
          mt: 1,
        }}
        onClick={resetErrorBoundary}
      >
        Попробовать снова
      </Button>
    </Box>
  );
}
