import React from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Typography } from "@mui/material";

function BackArrow({ path, name, model }) {
  return (
    <Box sx={{ my: 2, width: "fit-content", }}>
      <Link to={path} style={{ textDecoration: "none" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#5282ff",
            "&:hover": {
              color: "#3a63cc",
              transform: "scale(1.1)",
            },
            transition: "all 0.2s",
          }}
        >
          <ArrowBackIcon sx={{ mr: 1 }} />
          <Typography variant="body1" fontSize={20} fontWeight={500}>
            {name}
            {model && model.name && (
              <>
                {" "}
                / <span style={{ color: "black" }}>{model.name}</span>
              </>
            )}
          </Typography>
        </Box>
      </Link>
    </Box>
  );
}

export default BackArrow;
