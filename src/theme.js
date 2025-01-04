// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      default: "#F5F5F5", // Основной фоновый цвет
      paper: "#FFFFFF", // #282828 #17252a #222629
    },
    primary: {
      main: "#353740", // Основной цвет
    },
    secondary: {
      main: "#5282ff", // Третий цвет, добавленный в палитру
    },
    text: {
      primary: "#9AA0A6", // Белый текст на тёмном фоне
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
      color: "#202123",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
      color: "#202123",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 700,
      lineHeight: 1.3,
      color: "#202123",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.35,
      color: "#202123",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#202123",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
      color: "#202123",
    },
    body1: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
      color: "#202123",
    },
    body2: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
      color: "#202123",
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
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "15px",
          "&:hover": {
            backgroundColor: "#ECECF1",
          },
          // Стили для активного (выбранного) состояния
          "&.Mui-selected": {
            backgroundColor: "#ECECF1",
            // Сохранение цвета при наведении на выбранный элемент
            "&:hover": {
              backgroundColor: "#e6e6eb",
            },
          },
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000", // Цвет шапки (чёрный)
          color: "#d1e8e2", // Цвет текста в шапке (белый для контраста)
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
          color: "#202123", // Цвет текста на кнопках
          "&:hover": {
            backgroundColor: "#2E3239", // Более тёмный оттенок при наведении
          },
        },
        outlined: {
          color: '#202123',
          borderColor: '#ececf1',
          backgroundColor:'#ececf1',
          '&:hover': {
            borderColor: '#6E6E80',
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
          color: "#202123",
          fontFamily: "Söhне, Arial, sans-serif",
        },
      },
    },
  },
});

export default theme;
