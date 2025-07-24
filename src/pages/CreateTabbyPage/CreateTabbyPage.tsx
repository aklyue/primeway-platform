import CreateTabbyForm from "../../UI/CreateTabbyForm";
import useTabby from "../../hooks/NoCode/useTabby";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import { Box } from "@mui/material";
import BackArrow from "../../UI/BackArrow";
import { useAppSelector } from "../../store/hooks";

function CreateTabbyPage() {
  const currentOrganization = useAppSelector(selectCurrentOrganization);
  const authToken = useAppSelector((state) => state.auth.authToken);

  const {
    inferenceModel,
    setInferenceModel,
    inferenceModelName,
    inferenceArgs,
    inferenceFlags,
    embeddingModel,
    setEmbeddingModel,
    embeddingModelName,
    embeddingArgs,
    embeddingFlags,
    ...tabbyProps
  } = useTabby({
    currentOrganization,
    authToken,
  });
  return (
    <Box sx={{ height: "100%" }}>
      <Box>
        <BackArrow path={"/marketplace"} name={"AI Маркетплейс"} />
      </Box>
      <CreateTabbyForm
        inferenceModel={inferenceModel}
        setInferenceModel={setInferenceModel}
        embeddingModel={embeddingModel}
        setEmbeddingModel={setEmbeddingModel}
        inferenceModelName={inferenceModelName}
        embeddingModelName={embeddingModelName}
        inferenceArgs={inferenceArgs}
        inferenceFlags={inferenceFlags}
        embeddingArgs={embeddingArgs}
        embeddingFlags={embeddingFlags}
        {...tabbyProps}
      />
    </Box>
  );
}

export default CreateTabbyPage;
