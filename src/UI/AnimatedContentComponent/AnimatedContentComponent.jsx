import { AnimatePresence, motion } from "framer-motion";
import { IconButton, Stack, Tooltip, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function AnimatedContentComponent(props) {
  const { currentStep, setCurrentStep, steps, setIsOpen } = props;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const content =
    typeof steps[currentStep].content === "function"
      ? steps[currentStep].content(props)
      : steps[currentStep].content;

  return (
      <Box
        key={currentStep}
        style={{
          background: "#fff",
          color: "#333",
          borderRadius: "12px",
          maxWidth: 400,
          position: "relative",
        }}
      >
        {/* Close button in the top-right */}
        <IconButton
          size="small"
          onClick={() => setIsOpen(false)}
          sx={{
            position: "absolute",
            top: -18,
            right: -24,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Content */}
        <div>{content}</div>

        {/* Navigation buttons with clickable dots */}
        <Stack
          direction="row"
          spacing={1}
          mt={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <span>
            <IconButton
              disabled={isFirstStep}
              onClick={() => setCurrentStep((s) => s - 1)}
              size="small"
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </span>

          {/* Clickable Dots */}
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
