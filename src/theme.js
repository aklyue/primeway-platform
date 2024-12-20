// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      default: "#202123", // Основной фоновый цвет
      paper: "#353740", // Второй фоновый цвет
    },
    primary: {
      main: "#353740", // Основной цвет
    },
    secondary: {
      main: "#1A7F64", // Третий цвет, добавленный в палитру
    },
    text: {
      primary: "#FFFFFF", // Белый текст на тёмном фоне
      secondary: "#6E6E80",
    },
  },
  typography: {
    fontFamily: "Söhne, Arial, sans-serif", // Используем шрифт Söhne
    fontSize: 14, // Базовый размер шрифта
    lineHeight: "20px",
    fontWeight: 400,
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      color: "#ACACBE;",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
      color: "#ACACBE;",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 700,
      lineHeight: 1.3,
      color: "#ACACBE;",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.35,
      color: "#ACACBE;",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "white",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
      color: "#ACACBE;",
    },
    body1: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
      color: "#ACACBE;",
    },
    body2: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
      color: "#ACACBE;",
    },
    button: {
      textTransform: "none",
      fontSize: "14px",
      fontWeight: 600,
      lineHeight: "20px",
      fontFamily: "Söhne, Arial, sans-serif",
    },
  },
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: "15px",
          "&:hover": {
            backgroundColor: "#6E6E80",
          },
          // Стили для активного (выбранного) состояния
          "&.Mui-selected": {
            backgroundColor: "#6E6E80",
            // Сохранение цвета при наведении на выбранный элемент
            "&:hover": {
              backgroundColor: "#6E6E80",
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000", // Цвет шапки (чёрный)
          color: "#FFFFFF", // Цвет текста в шапке (белый для контраста)
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: "20px",
          padding: "6px 16px",
          fontFamily: "Söhne, Arial, sans-serif",
        },
        containedPrimary: {
          backgroundColor: "#353740", // Основной цвет для заполненных кнопок
          color: "#FFFFFF", // Цвет текста на кнопках
          "&:hover": {
            backgroundColor: "#2E3239", // Более тёмный оттенок при наведении
          },
        },
        outlined: {
          color: '#FFFFFF',
          borderColor: '#6E6E80',
          '&:hover': {
            borderColor: '#FFFFFF',
          },
        },
        textPrimary: {
          color: "#353740",
          "&:hover": {
            backgroundColor: "rgba(53, 55, 64, 0.1)",
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#353740",
          fontWeight: 600,
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
          fontFamily: "Söhне, Arial, sans-serif",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#ACACBE",
          fontFamily: "Söhне, Arial, sans-serif",
        },
      },
    },
  },
});

export default theme;
