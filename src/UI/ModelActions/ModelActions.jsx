import React from "react";
import { Button } from "@mui/material";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

export default function ModelActions({
  isMobile,
  actionButtonHandler,
  actionButtonText,
  isActionButtonDisabled,
}) {
  return (
    <Button
      onClick={actionButtonHandler}
      disabled={isActionButtonDisabled}
      variant="outlined"
      sx={{
        color: "white",
        padding: isMobile
          ? "4px 8px"
          : actionButtonText === "Остановить"
          ? "6px 13px"
          : "6px 18px !important",
        bgcolor: "#597ad3",
        "&:hover": {
          bgcolor: "#7c97de",
        },
        maxWidth: "100px",
        fontSize: isMobile ? "9px !important" : "12px",
      }}
    >
      {actionButtonText}
      {actionButtonText === "Запустить" && (
        <RocketLaunchOutlinedIcon
          sx={{ ml: 1, fontSize: isMobile ? 16 : 20, color: "#FFFFFF" }}
        />
      )}
    </Button>
  );
}
