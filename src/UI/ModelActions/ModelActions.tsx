import React from "react";
import { Button } from "@mui/material";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

interface ModelActionsProps {
  isMobile: boolean;
  actionButtonHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
  actionButtonText: String;
  isActionButtonDisabled: boolean;
}

export default function ModelActions({
  isMobile,
  actionButtonHandler,
  actionButtonText,
  isActionButtonDisabled,
}: ModelActionsProps) {
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
          : "6px 18px",
        bgcolor: "#597ad3",
        "&:hover": {
          bgcolor: "#7c97de",
        },
        maxWidth: "120px",
        fontSize: isMobile ? "9px !important" : "12px",
      }}
    >
      {actionButtonText}
      {actionButtonText === "Запустить" && !isMobile && (
        <RocketLaunchOutlinedIcon
          sx={{ ml: 1, fontSize: 20, color: "#FFFFFF" }}
        />
      )}
    </Button>
  );
}
