import { PaletteColorOptions, PaletteColor } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface PaletteColor {
    selected?: string;
    icon?: string;
  }

  interface SimplePaletteColorOptions {
    selected?: string;
    icon?: string;
  }
}
