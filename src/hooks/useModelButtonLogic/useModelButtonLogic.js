import { useCallback } from "react";
import useModelActions from "../useModelActions";

export const useModelButtonLogic = ({
  isBasic,
  isFineTuned,
  model,
  modelStatus,
  setModelStatus,
  setLoading,
  loading,
  jobId,
  currentOrganization,
  authToken,
  handleConfirmLaunchClose,
  args,
  flags,
  modelConfig
}) => {
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
    setLoading,
    currentOrganization,
    authToken,
    args,
    flags,
    modelConfig
  });

  let actionButtonText = "";
  let actionButtonHandler = null;
  let isActionButtonDisabled = false;
  if (isBasic || isFineTuned) {
    actionButtonText = "Запустить";
    actionButtonHandler = (e) => {
      e.stopPropagation();
      handleRun();
      handleConfirmLaunchClose()
    };
    isActionButtonDisabled = actionLoading;
  } else {
    if (modelStatus === "running") {
      actionButtonText = "Остановить";
      actionButtonHandler = (e) => {
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
      actionButtonHandler = (e) => {
        e.stopPropagation();
        handleStart();
      };
      isActionButtonDisabled = actionLoading;
    } else {
      actionButtonText = "Остановить";
      actionButtonHandler = null;
      isActionButtonDisabled = true;
    }
  }

  return {
    actionButtonText,
    actionButtonHandler,
    isActionButtonDisabled,
  };
};
