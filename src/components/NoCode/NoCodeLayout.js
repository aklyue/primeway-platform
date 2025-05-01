import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Tabs, Tab, Box } from "@mui/material";

export default function NoCodeLayout() {
  const p = useLocation().pathname;
  const value = p.includes("/datasets")
    ? 0
    : p.includes("/train")
    ? 1
    : p.includes("/deploy")
    ? 2
    : 3;

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={value} sx={{ mb: 2 }}>
        <Tab label="Datasets" component={NavLink} to="datasets" />
        <Tab label="Train" component={NavLink} to="train" />
        <Tab label="Deploy" component={NavLink} to="deploy" />
        <Tab label="Models" component={NavLink} to="models" />
      </Tabs>
      <Outlet />
    </Box>
  );
}
