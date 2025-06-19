import { Cancel, CheckCircle } from "@mui/icons-material";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

const ModelCheckInfo = ({ label, missingFields }) => {
  const isValid = missingFields.length === 0;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <Box mb={1.5}>
      <Box
        display="flex"
        alignItems="center"
        gap={isMobile || isTablet ? 0.2 : 0.75}
        mb={0.25}
      >
        {isValid ? (
          <CheckCircle
            sx={{ color: "#597ad3" }}
            fontSize={isMobile || isTablet ? "20px" : "small"}
          />
        ) : (
          <Cancel
            sx={{ color: "error.main" }}
            fontSize={isMobile || isTablet ? "20px" : "small"}
          />
        )}
        <Typography
          variant="body2"
          fontSize={isMobile || isTablet ? "9px !important" : "12px"}
        >
          {label}
        </Typography>
      </Box>
      {!isValid && (
        <Box pl={isMobile || isTablet ? 1 : 3}>
          {missingFields.map((field) => (
            <Typography
              key={field}
              variant="caption"
              color="text.secondary"
              lineHeight={1.2}
              sx={{
                display: "flex",
                flexDirection: isMobile ? "row" : "column",
                fontSize: isMobile || isTablet ? "8px !important" : "10px",
              }}
            >
              {isMobile ? `${field}` : `— ${field}`}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ModelCheckInfo;
