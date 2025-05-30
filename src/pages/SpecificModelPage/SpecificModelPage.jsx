import React from "react";
import { useLocation } from "react-router-dom";
import BackArrow from "../../UI/BackArrow";
import SpecificModel from "../../components/SpecificModel";

function SpecificModelPage() {
  const location = useLocation();
  const { model, initialConfig, isBasic } = location.state || {};
  return (
    <div>
      <BackArrow path={"/models"} name={"Models"} />
      <SpecificModel
        model={model}
        initialConfig={initialConfig}
        isBasic={isBasic}
      />
    </div>
  );
}

export default SpecificModelPage;
