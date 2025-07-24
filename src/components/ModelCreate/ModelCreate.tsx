import React from "react";
import ConfigureModelForm from "../ConfigureModelForm";
import { Box, Typography } from "@mui/material";
import { Model } from "../../types";

interface ModelCreateProps {
  isMobile: boolean;
  isCreate: boolean;
}

function ModelCreate({ isMobile, isCreate }: ModelCreateProps) {
  return (
    <Box
      style={{
        border: "1px solid lightgray",
        borderRadius: isMobile ? "10px" : "30px",
        overflow: "hidden",
        maxHeight: "74dvh",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid lightgray",
          backgroundColor: "rgba(102, 179, 238, 0.1)",
        }}
      >
        <Typography>СОЗДАНИЕ НОВОЙ МОДЕЛИ</Typography>
      </Box>
      <ConfigureModelForm
        initialConfig={{} as Model}
        onClose={() => {}}
        readOnlyModelName={false}
        isFineTuned={false}
        onFlagsChange={() => {}}
        onModelConfigChange={() => {}}
        onModelNameChange={() => {}}
        onArgsChange={() => {}}
        isCreate={true}
        isInference={false}
        isEmbedding={false}
        isSmall={false}
      />
    </Box>
  );
}

export default ModelCreate;
