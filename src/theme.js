// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          color: "inherit",
          textDecoration: "none",
          "& .MuiTypography-root": {
            color: "inherit",
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: "text.primary",
        },
      },
    },
  },
});

export default theme;