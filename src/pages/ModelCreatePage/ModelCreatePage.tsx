import React from "react";
import ModelCreate from "../../components/ModelCreate";
import { useLocation } from "react-router-dom";
import BackArrow from "../../UI/BackArrow";
import { Box } from "@mui/material";

interface ModelCreatePageProps {
  isMobile: boolean;
}

function ModelCreatePage({ isMobile }: ModelCreatePageProps) {
  const location = useLocation();
  const { isCreate } = location.state || {};
  return (
    <Box>
      <BackArrow path={"/models"} name={"Models"} />
      <ModelCreate isMobile={isMobile} isCreate={isCreate} />
    </Box>
  );
}

export default ModelCreatePage;
