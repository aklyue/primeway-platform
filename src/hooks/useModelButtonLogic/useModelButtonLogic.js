import { useCallback } from "react";
import useModelActions from "../useModelActions";

export const useModelButtonLogic = ({
  isBasic,
  model,
  modelStatus,
  setModelStatus,
  setLoading,
  loading,
  jobId,
  currentOrganization,
  authToken,
}) => {
  const {
    handleStart,
    handleStop,
    handleRun,
    loading: actionLoading,
  } = useModelActions({
    isBasic,
    model,
    jobId,
    setModelStatus,
    setLoading,
    currentOrganization,
    authToken,
  });

  let actionButtonText = "";
  let actionButtonHandler = null;
  let isActionButtonDisabled = false;

  if (isBasic) {
    actionButtonText = "Запустить";
    actionButtonHandler = (e) => {
      e.stopPropagation();
      handleRun();
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
