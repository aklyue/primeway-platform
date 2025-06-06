import React from "react";
import { useLocation } from "react-router-dom";
import BackArrow from "../../UI/BackArrow";
import SpecificModel from "../../components/SpecificModel";
import { Box } from "@mui/material";

function SpecificModelPage() {
  const location = useLocation();
  const { model, initialConfig, isBasic, isMobile } = location.state || {};

  console.log(initialConfig)
  return (
    <div>
      <Box sx={{mx: 4}}>
        <BackArrow path={"/models"} name={"Models"} model={model} />
      </Box>
      <SpecificModel
        isMobile={isMobile}
        model={model}
        initialConfig={initialConfig}
        isBasic={isBasic}
      />
    </div>
  );
}

export default SpecificModelPage;
