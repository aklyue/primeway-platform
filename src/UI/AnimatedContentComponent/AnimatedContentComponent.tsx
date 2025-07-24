import { IconButton, Stack, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { PopoverContentProps } from "@reactour/tour";

export default function AnimatedContentComponent({
  steps,
  currentStep,
  setCurrentStep,
  setIsOpen,
}: PopoverContentProps) {
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const currentStepData = steps[currentStep];
  const content =
    typeof currentStepData.content === "function"
      ? (
          currentStepData.content as (
            props: PopoverContentProps
          ) => React.ReactNode
        )({
          steps,
          currentStep,
          setCurrentStep,
          setIsOpen,
        }) ?? null
      : currentStepData.content;

  return (
    <Box
      key={currentStep}
      sx={{
        background: "#fff",
        color: "#333",
        borderRadius: "12px",
        maxWidth: 400,
        position: "relative",
      }}
    >
      <IconButton
        size="small"
        onClick={() => setIsOpen(false)}
        sx={{ position: "absolute", top: -18, right: -24 }}
      >
        <CloseIcon />
      </IconButton>

      <div>{content}</div>

      <Stack
        direction="row"
        spacing={1}
        mt={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <IconButton
          disabled={isFirstStep}
          onClick={() => setCurrentStep((s) => s - 1)}
          size="small"
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        <Box display="flex" alignItems="center" gap={0.5}>
          {steps.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentStep(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: index === currentStep ? "#597ad3" : "#ccc",
                transition: "background-color 0.3s",
                cursor: "pointer",
              }}
            />
          ))}
        </Box>

        <IconButton
          onClick={() => setCurrentStep((s) => s + 1)}
          size="small"
          disabled={isLastStep}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
