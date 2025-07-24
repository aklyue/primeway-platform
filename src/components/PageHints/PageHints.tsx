import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { StepType, useTour } from "@reactour/tour";
import { stepsMap } from "../../constants/stepsMap";

export default function PageHints() {
  const location = useLocation();
  const path = location.pathname;
  const { setIsOpen, setSteps, setCurrentStep, isOpen } = useTour();
  const triedOnce = useRef<{ [key: string]: boolean }>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkTargetsExist = (steps: StepType[]) =>
    steps.every((step) => {
      const target = step.selector;
      return typeof target === "string"
        ? !!document.querySelector(target)
        : !!target;
    });

  useEffect(() => {
    const steps = stepsMap[path as keyof typeof stepsMap];
    const shown = localStorage.getItem(`hints_shown_${path}`);
    if (!steps || shown || isOpen || triedOnce.current[path]) return;

    triedOnce.current[path] = true;

    let attempts = 0;

    intervalRef.current = setInterval(() => {
      if (checkTargetsExist(steps)) {
        if (intervalRef.current && setSteps) {
          clearInterval(intervalRef.current);
          localStorage.setItem(`hints_shown_${path}`, "true");
          setSteps(steps);
          setCurrentStep(0);
          setIsOpen(true);
        }
      }

      attempts++;
      if (attempts > 30 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 300);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [path, isOpen, setSteps, setIsOpen, setCurrentStep]);

  return null;
}
