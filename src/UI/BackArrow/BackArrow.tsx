import React from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Typography } from "@mui/material";

interface BackArrowProps {
  path: string;
  name: string;
  model?: {
    name?: string;
    job_name?: string;
  };
  config?: {
    modelConfig?: {
      job_name?: string;
    };
  };
  postText?: string;
}

const BackArrow: React.FC<BackArrowProps> = ({
  path,
  name,
  model,
  config,
  postText,
}) => {
  const modelName =
    model?.name || config?.modelConfig?.job_name || model?.job_name || null;

  return (
    <Box sx={{ my: 1, width: "fit-content" }}>
      <Link to={path} style={{ textDecoration: "none" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#5282ff",
            "&:hover": {
              color: "#3a63cc",
              transform: "scale(1.05)",
            },
            transition: "all 0.2s",
          }}
        >
          <ArrowBackIcon sx={{ mr: 1 }} />
          <Typography variant="body1" fontSize={"1.25rem"} fontWeight={500}>
            {name}
            {(modelName || postText) && (
              <>
                {" "}
                /{" "}
                <span style={{ color: "black" }}>{modelName || postText}</span>
              </>
            )}
          </Typography>
        </Box>
      </Link>
    </Box>
  );
};

export default BackArrow;
