import React from "react";
import { useLocation, useParams } from "react-router-dom";

import SpecificModel from "../../components/SpecificModel";

function SpecificModelPage() {
  const location = useLocation();
  const { model, initialConfig, isBasic } = location.state || {};
  console.log(model);
  return (
    <div>
      <SpecificModel
        model={model}
        initialConfig={initialConfig}
        isBasic={isBasic}
      />
    </div>
  );
}

export default SpecificModelPage;
