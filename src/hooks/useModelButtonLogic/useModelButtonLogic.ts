import useModelActions from "../useModelActions";
import {
  AdditionalFields,
  BasicModel,
  FinetunedModel,
  ModelConfig,
} from "../../types";
import { Organization } from "../../store/slices/authSlice";

interface useModelButtonLogicProps {
  isBasic: boolean;
  isFineTuned: boolean;
  model: BasicModel | FinetunedModel | null;
  modelStatus?: string | null;
  setModelStatus: (status: string) => void;
  jobId?: string | null;
  currentOrganization: Organization | null;
  authToken: string | null;
  handleConfirmLaunchClose: () => void;
  args: AdditionalFields[];
  flags: AdditionalFields[];
  modelConfig: ModelConfig;
}

export const useModelButtonLogic = ({
  isBasic,
  isFineTuned,
  model,
  modelStatus,
  setModelStatus,
  jobId,
  currentOrganization,
  authToken,
  handleConfirmLaunchClose,
  args,
  flags,
  modelConfig,
}: useModelButtonLogicProps) => {
  const {
    handleStart,
    handleStop,
    handleRun,
    loading: actionLoading,
  } = useModelActions({
    isBasic,
    isFineTuned,
    model,
    jobId,
    setModelStatus,
    currentOrganization,
    authToken,
    args,
    flags,
    modelConfig,
  });

  let actionButtonText = "";
  let actionButtonHandler: (
    e: React.MouseEvent<HTMLButtonElement>
  ) => void = () => {};
  let isActionButtonDisabled = false;
  if (isBasic || isFineTuned) {
    actionButtonText = "Запустить";
    actionButtonHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      handleRun();
      if (handleConfirmLaunchClose) {
        handleConfirmLaunchClose();
      }
    };
    isActionButtonDisabled = actionLoading;
  } else {
    if (modelStatus === "running") {
      actionButtonText = "Остановить";
      actionButtonHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        handleStop();
      };
      isActionButtonDisabled = actionLoading;
    } else if (
      modelStatus === "failed" ||
      modelStatus === "stopped" ||
      modelStatus === "completed" ||
      modelStatus === undefined
    ) {
      actionButtonText = "Запустить";
      actionButtonHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        handleStart();
      };
      isActionButtonDisabled = actionLoading;
    } else {
      actionButtonText = "Остановить";
      actionButtonHandler = () => {};
      isActionButtonDisabled = true;
    }
  }

  return {
    actionButtonText,
    actionButtonHandler,
    isActionButtonDisabled,
  };
};
