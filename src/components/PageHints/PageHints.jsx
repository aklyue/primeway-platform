import Joyride from "react-joyride";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

const stepsMap = {
  "/marketplace": [
    {
      target: '[data-tour-id="marketplace-header"]',
      content: "Здесь вы выбираете между Jupyter и Tabby",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="project-card"]',
      content: "Нажмите, чтобы открыть проект",
      disableBeacon: true,
    },
  ],
  "/models": [
    {
      target: '[data-tour-id="model-create"]',
      content: "Вы можете создать модель просто нажав на эту кнопку.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="my-models"]',
      content:
        "После создания здесь отобразятся модели, которые вы когда-либо запускали.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="basic-models"]',
      content:
        "Также вы можете воспользоваться базовыми моделями, которые уже готовы к запуску напрямую или перейти на страницу модели для дополнительной конфигурации.",
      disableBeacon: true,
    },
  ],
  "/datasets": [
    {
      target: '[data-tour-id="load-dataset"]',
      content: "Здесь можно загрузить набор данных.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="datasets-list"]',
      content:
        "После загрузки все ваши наборы данных будут показаны в этой секции.",
      disableBeacon: true,
    },
  ],
  "/fine-tuning": [
    {
      target: '[data-tour-id="create-job"]',
      content:
        "Здесь можно создать задачу дообучения, настроив конфигурацию для неё.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="jobs-list"]',
      content:
        "Все созданные задачи отображаются здесь. Вы можете нажать на любую задачу и посмотреть детали конфигурации.",
      disableBeacon: true,
    },
  ],
  "/tasks": [
    {
      target: '[data-tour-id="tasks-header"]',
      content:
        "Этот раздел предназначен для быстрого доступа к просмотру и взаимодействию с созданными вами задачами.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="buttons-header"]',
      content:
        "Задачи делятся на два типа: Deploy и Run. Переключаясь между вкладками, вы можете просматривать их.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="tasks-list"]',
      content:
        "Каждая задача будет отображена здесь. Вы можете нажать на неё и просмотреть все детали задачи.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="buttons-list"]',
      content:
        "Помимо всего прочего, вы в любой момент можете отсортировать список ваших задач по статусу их выполнения.",
      disableBeacon: true,
    },
  ],
  "/tabby-create": [
    {
      target: '[data-tour-id="tabby-form"]',
      content:
        "Перед вами открылась форма конфигурации TabbyML. Давайте пройдемся по основным моментам.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="tabby-name"]',
      content: "В первую очередь, вам необходимо задать название задачи.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="inference-model"]',
      content:
        "Далее вам предстоит определить конфигурационные данные Code Generation Модели.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="embedding-model"]',
      content: "Точно также нужно заполнить информацию и об Embedding Модели.",
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="required-fields"]',
      content: "Здесь будут показаны поля, требуемые для заполнения.",
      disableBeacon: true,
    },
  ],
};

export default function PageHints() {
  const location = useLocation();
  const path = location.pathname;
  const restartAt = useSelector((state) => state.hints.restartAt);
  const prevRestartAt = useRef(null);

  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  const checkTargetsExist = (steps) =>
    steps.every((step) => document.querySelector(step.target));

  const initTour = () => {
    const hints = stepsMap[path];
    if (!hints) return;

    const waitForTargets = setInterval(() => {
      if (checkTargetsExist(hints)) {
        clearInterval(waitForTargets);
        setSteps(hints);
        setStepIndex(0);
        setRun(true);
      }
    }, 300);
  };

  useEffect(() => {
    const hints = stepsMap[path];
    const shown = localStorage.getItem(`hints_shown_${path}`);
    if (!hints || shown) return;

    const waitForTargets = setInterval(() => {
      if (checkTargetsExist(hints)) {
        clearInterval(waitForTargets);
        setSteps(hints);
        setStepIndex(0);
        setRun(true);
      }
    }, 300);

    return () => clearInterval(waitForTargets);
  }, [path]);

  useEffect(() => {
    const hints = stepsMap[path];
    if (!hints || !restartAt || restartAt === prevRestartAt.current) return;

    localStorage.removeItem(`hints_shown_${path}`);
    prevRestartAt.current = restartAt;

    const waitForTargets = setInterval(() => {
      if (checkTargetsExist(hints)) {
        clearInterval(waitForTargets);
        setSteps(hints);
        setStepIndex(0);
        setRun(true);
      }
    }, 300);

    return () => clearInterval(waitForTargets);
  }, [restartAt, path]);

  const handleCallback = (data) => {
    const { status, action, index } = data;
    if (["finished", "skipped", "closed"].includes(status)) {
      localStorage.setItem(`hints_shown_${path}`, "true");
      setRun(false);
      setSteps([]);
      return;
    }
    if (action === "next" || action === "prev") {
      setRun(false);
      setTimeout(() => {
        setStepIndex(action === "next" ? index + 1 : index - 1);
        setRun(true);
      }, 150);
    }

    if (action === "close") {
      setRun(false);
      setSteps([]);
    }
  };

  return (
    <Joyride
      run={run}
      steps={steps}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      callback={handleCallback}
      scrollToFirstStep={false}
      disableScrolling={true}
      floaterProps={{ disableScroll: true }}
      styles={{
        options: {
          zIndex: 14000,
          primaryColor: "#597ad3",
          backgroundColor: "#fff",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          textColor: "#333",
          arrowColor: "#fff",
        },
      }}
      locale={{
        back: "Назад",
        close: "Закрыть",
        last: "Понятно",
        next: "Далее",
        skip: "Пропустить",
      }}
    />
  );
}
