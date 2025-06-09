import React from "react";
import { useLocation } from "react-router-dom";
import BackArrow from "../../UI/BackArrow";
import SpecificModel from "../../components/SpecificModel";
import { Box } from "@mui/material";

function SpecificModelPage() {
  const location = useLocation();
  const { model, initialConfig, isBasic, isMobile, jobId } = location.state || {};


  return (
    <div>
      <Box sx={{ mx: isMobile ? 0 : 4 }}>
        <BackArrow path={"/models"} name={"Models"} model={model} config={initialConfig} />
      </Box>
      <SpecificModel
        isMobile={isMobile}
        model={model}
        initialConfig={initialConfig}
        isBasic={isBasic}
        jobId={jobId}
      />
    </div>
  );
}

export default SpecificModelPage;
