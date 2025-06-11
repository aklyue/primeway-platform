import React from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Typography } from "@mui/material";

function BackArrow({ path, name, model, config }) {
  const modelName =
    model?.name ||
    config?.modelConfig?.job_name ||
    model?.job_name ||
    null
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
          <Typography variant="body1" fontSize={"1.25rem"} fontWeight={500}>
            {name}
            {modelName && (
              <>
                {" "}
                / <span style={{ color: "black" }}>{modelName}</span>
              </>
            )}
          </Typography>
        </Box>
      </Link>
    </Box>
  );
}

export default BackArrow;
