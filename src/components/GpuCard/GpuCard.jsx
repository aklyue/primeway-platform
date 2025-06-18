import { Box, Card, CardContent, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import NvidiaIcon from "../../UI/NvidiaIcon/NvidiaIcon";

const GpuCard = ({ gpu, onCopy }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onCopy(gpu.name)}
        sx={{
          position: "relative",
          borderRadius: "15px",
          transition: "transform 0.3s",
          backgroundColor: "#060606",
          color: "#fff",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {/* Иконка копирования в правом верхнем углу при наведении */}
        {isHovered && (
          <Tooltip title="Скопировать имя" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Чтобы клик не срабатывал на карточке
                onCopy(gpu.name);
              }}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 2,
                color: "#fff",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <CardContent
          sx={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "8px",
          }}
        >
          {/* Используем компонент NvidiaIcon */}
          <NvidiaIcon />

          <Typography
            sx={{ fontSize: "15px", fontWeight: "bold", color: "#fff" }}
            component="div"
            gutterBottom
          >
            {gpu.name}
          </Typography>

          <Typography
            sx={{ fontSize: "14px", color: "#fff" }}
            color="textSecondary"
          >
            <strong>Память:</strong> {gpu.memoryInGb} GB
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 1, mt: 1 }}
          >
            <Box
              component="span"
              sx={{
                color: "#0bff04",
                padding: "5px 20px",
                borderRadius: "5px",
                fontSize: "15px",
              }}
            >
              <strong>{gpu.costPerHour}</strong> ₽/час
            </Box>
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default GpuCard;
