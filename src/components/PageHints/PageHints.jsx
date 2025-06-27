import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTour } from "@reactour/tour";
import { stepsMap } from "../../constants/stepsMap";

export default function PageHints() {
  const location = useLocation();
  const path = location.pathname;
  const { setIsOpen, setSteps, setCurrentStep, isOpen } = useTour();
  const triedOnce = useRef({});
  const intervalRef = useRef(null);

  const checkTargetsExist = (steps) =>
    steps.every((step) => document.querySelector(step.selector));

  useEffect(() => {
    const steps = stepsMap[path];
    const shown = localStorage.getItem(`hints_shown_${path}`);
    if (!steps || shown || isOpen || triedOnce.current[path]) return;

    triedOnce.current[path] = true;

    let attempts = 0;

    intervalRef.current = setInterval(() => {
      if (checkTargetsExist(steps)) {
        clearInterval(intervalRef.current);
        localStorage.setItem(`hints_shown_${path}`, "true");
        setSteps(steps);
        setCurrentStep(0);
        setIsOpen(true);
      }

      attempts++;
      if (attempts > 30) {
        clearInterval(intervalRef.current);
      }
    }, 300);

    return () => clearInterval(intervalRef.current);
  }, [path, isOpen, setSteps, setIsOpen, setCurrentStep]);

  return null;
}
