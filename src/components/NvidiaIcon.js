// components/NvidiaIcon.js
import React from "react";
import { Box } from "@mui/material";

import { ReactComponent as NvidiaColor } from "../assets/nvidia-color.svg";
import { ReactComponent as NvidiaText } from "../assets/nvidia-text.svg";

const NvidiaIcon = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center", 
        width: "110px",
        height: "auto",
        gap:'4px',
        marginBottom:'10px'
      }}
    >
      <NvidiaColor style={{ width: "23px", height: "25px" }} />
      <NvidiaText style={{ width: "65px", height: "20px" }} />
    </Box>
  );
};

export default NvidiaIcon;