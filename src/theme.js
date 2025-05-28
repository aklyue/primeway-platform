// theme.js
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
    primary: {
      main: "#353740",
      selected: "#605cd0",
      icon: "#a2a2a2",
    },
    secondary: {
      main: "#5282ff",
    },
    text: {
      primary: "#202123",
      secondary: "#6E6E80",
    },
  },
  typography: {
    fontFamily: "JetBrains Mono, serif",
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 400,
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      color: "#202123",
      [createTheme().breakpoints.down("sm")]: {
        fontSize: "1.9rem",
      },
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
      color: "#202123",
      [createTheme().breakpoints.down("sm")]: {
        fontSize: "1.6rem",
      },
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 700,
      lineHeight: 1.3,
      color: "#202123",
      [createTheme().breakpoints.down("sm")]: {
        fontSize: "1.3rem",
      },
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.35,
      color: "#202123",
      [createTheme().breakpoints.down("sm")]: {
        fontSize: "1.2rem",
      },
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#202123",
      [createTheme().breakpoints.down("sm")]: {
        fontSize: "1rem",
      },
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
      color: "#202123",
      [createTheme().breakpoints.down("sm")]: {
        fontSize: "0.8rem",
      },
    },
    body1: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
      color: "#202123",
      [createTheme().breakpoints.down("sm")]: {
        fontSize: "12px",
      },
    },
    body2: {
      fontSize: "13px",
      fontWeight: 400,
      lineHeight: "20px",
      color: "#202123",
      [createTheme().breakpoints.down("sm")]: {
        fontSize: "11px",
      },
    },
    button: {
      textTransform: "none",
      fontSize: "14px",
      fontWeight: 600,
      lineHeight: "20px",
      fontFamily: "JetBrains Mono, serif",
      [createTheme().breakpoints.down("sm")]: {
        fontSize: "12px",
      },
    },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "5px",
          "&:hover": {
            backgroundColor: "rgba(131, 131, 131, 0.1)",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(102, 179, 238, 0.2)",
            color: "rgb(96, 92, 208)",
            "&:hover": {
              backgroundColor: "rgba(131, 131, 131, 0.3)",
            },
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "inherit", // Устанавливаем цвет по умолчанию
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#d1e8e2",
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
          fontFamily: "JetBrains Mono, serif",
          [createTheme().breakpoints.down("sm")]: {
            fontSize: "12px",
          },
        },
        containedPrimary: {
          backgroundColor: "#353740",
          color: "#202123",
          "&:hover": {
            backgroundColor: "#2E3239",
          },
        },
        outlined: {
          color: "#202123",
          borderColor: "#ececf1",
          backgroundColor: "#ececf1",
          "&:hover": {
            borderColor: "#6E6E80",
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
          fontFamily: "JetBrains Mono, serif",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          // color: "#202123",
          color: "inherit",
          fontFamily: "JetBrains Mono, serif",
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
