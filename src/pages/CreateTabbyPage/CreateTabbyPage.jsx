import React from "react";
import CreateTabbyForm from "../../UI/CreateTabbyForm";
import useTabby from "../../hooks/NoCode/useTabby";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import { Box } from "@mui/material";
import BackArrow from "../../UI/BackArrow"

function CreateTabbyPage() {
  const currentOrganization = useSelector(selectCurrentOrganization);
  const authToken = useSelector((state) => state.auth.authToken);

  const tabbyProps = useTabby({ currentOrganization, authToken });
  return (
    <Box sx={{height: "100%"}}>
      <Box>
        <BackArrow path={"/marketplace"} name={"AI Маркетплейс"}/>
      </Box>
      <CreateTabbyForm {...tabbyProps} />
    </Box>
  );
}

export default CreateTabbyPage;
