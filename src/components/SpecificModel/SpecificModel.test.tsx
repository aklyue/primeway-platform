import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SpecificModel from "./SpecificModel";
import * as hooks from "../../hooks/useModels";
import * as buttonLogicHook from "../../hooks/useModelButtonLogic";
import * as actionsHook from "../../hooks/useModelActions";
import { Provider } from "react-redux";
import store from "../../store";
import { BrowserRouter } from "react-router-dom";

// Мокаем хуки
jest.mock("../../hooks/useModels");
jest.mock("../../hooks/useModelButtonLogic");
jest.mock("../../hooks/useModelActions");

describe("SpecificModel", () => {
  const defaultConfig = {
    modelName: "deepseek",
    modelConfig: {
      job_name: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
    },
  };

  const mockModel = {
    id: "test-id",
    type: "llm",
    description: "Test Model",
    defaultConfig,
    isBasic: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (hooks.default as jest.Mock).mockReturnValue({
      model: mockModel,
      renderData: mockModel,
      launchedModel: null,
      fineTunedModel: null,
      isLaunchedModel: false,
      isFineTuned: false,
      modelStatus: "idle",
      setModelStatus: jest.fn(),
    });

    (buttonLogicHook.default as jest.Mock).mockReturnValue({
      actionButtonText: "Запустить",
      actionButtonHandler: jest.fn(),
      isActionButtonDisabled: false,
    });

    (actionsHook.default as jest.Mock).mockReturnValue({
      handleRun: jest.fn(),
      handleStart: jest.fn(),
      handleStop: jest.fn(),
      loading: false,
    });
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SpecificModel
            initialConfig={mockModel as any}
            isBasic={true}
            isMobile={false}
            onLaunchedModelChange={jest.fn()}
          />
        </BrowserRouter>
      </Provider>
    );

  it("рендерит данные модели", async () => {
    renderComponent();
    expect(screen.getByText("ПАРАМЕТР")).toBeInTheDocument();
    expect(screen.getByText("ЗНАЧЕНИЕ")).toBeInTheDocument();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("test-id")).toBeInTheDocument();
    expect(screen.getByText("Настроить")).toBeInTheDocument();
  });

  it("открывает форму конфигурации", async () => {
    renderComponent();
    const button = screen.getByText("Настроить");
    fireEvent.click(button);
    expect(await screen.findByText(/Имя модели/)).toBeInTheDocument();
  });

  it("открывает диалог подтверждения запуска", async () => {
    renderComponent();
    const startButton = screen.getByText("Запустить");
    fireEvent.click(startButton);
    expect(
      await screen.findByText(/Подтвердите запуск модели/)
    ).toBeInTheDocument();
  });
});
