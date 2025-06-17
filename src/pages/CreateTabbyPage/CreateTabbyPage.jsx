import React from "react";
import CreateTabbyForm from "../../UI/CreateTabbyForm";
import useTabby from "../../hooks/NoCode/useTabby";
import { useSelector } from "react-redux";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";

function CreateTabbyPage() {
  const currentOrganization = useSelector(selectCurrentOrganization);
  const authToken = useSelector((state) => state.auth.authToken);

  const tabbyProps = useTabby({ currentOrganization, authToken });
  return (
    <div>
      <CreateTabbyForm {...tabbyProps} />
    </div>
  );
}

export default CreateTabbyPage;
