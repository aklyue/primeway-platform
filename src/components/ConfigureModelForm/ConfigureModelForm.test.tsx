import { render, screen, fireEvent } from "@testing-library/react";
import ConfigureModelForm from "./ConfigureModelForm";
import { AVAILABLE_GPUS } from "../../constants/AVAILABLE_GPUS";
import { Model } from "../../types";

const mockOnArgsChange = jest.fn();
const mockOnFlagsChange = jest.fn();
const mockOnModelConfigChange = jest.fn();
const mockOnModelNameChange = jest.fn();
const mockOnClose = jest.fn();

const initialConfig: Model = {
  args: [{ key: "arg1", value: "val1" }],
  flags: [{ key: "flag1", value: "True" }],
  modelName: "test-model",
  modelConfig: {
    job_name: "test-deploy",
    gpu_types: [{ type: "A100 PCIe" as const, count: 1 }],
    port: 8080,
    disk_space: 40,
    health_check_timeout: 5000,
    autoscaler_timeout: 600,
    max_requests: 10,
    min_gpu_count: 1,
    max_gpu_count: 1,
    env: [{ name: "ENV_VAR", value: "123" }],
    schedule: {
      workdays: [],
      weekends: [],
      specific_days: [],
    },
  },
};

describe("ConfigureModelForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("отрисовывает форму с аргументами и флагами", () => {
    render(
      <ConfigureModelForm
        initialConfig={initialConfig}
        onClose={mockOnClose}
        onArgsChange={mockOnArgsChange}
        onFlagsChange={mockOnFlagsChange}
        onModelConfigChange={mockOnModelConfigChange}
        onModelNameChange={mockOnModelNameChange}
        isCreate
      />
    );

    expect(screen.getByLabelText(/имя модели/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/значение аргумента/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/значение \(true\/false\)/i)
    ).toBeInTheDocument();
  });

  test("добавляет аргумент", () => {
    render(
      <ConfigureModelForm
        initialConfig={initialConfig}
        onClose={mockOnClose}
        onArgsChange={mockOnArgsChange}
        onFlagsChange={mockOnFlagsChange}
        onModelConfigChange={mockOnModelConfigChange}
        onModelNameChange={mockOnModelNameChange}
        isCreate
      />
    );

    const addArgBtn = screen.getByText(/добавить аргумент/i);
    fireEvent.click(addArgBtn);

    expect(mockOnArgsChange).toHaveBeenCalled();
  });

  test("добавляет флаг", () => {
    render(
      <ConfigureModelForm
        initialConfig={initialConfig}
        onClose={mockOnClose}
        onArgsChange={mockOnArgsChange}
        onFlagsChange={mockOnFlagsChange}
        onModelConfigChange={mockOnModelConfigChange}
        onModelNameChange={mockOnModelNameChange}
        isCreate
      />
    );

    const addFlagBtn = screen.getByText(/добавить флаг/i);
    fireEvent.click(addFlagBtn);

    expect(mockOnFlagsChange).toHaveBeenCalled();
  });

  test("вызывает onModelConfigChange при изменении GPU типа", () => {
    render(
      <ConfigureModelForm
        initialConfig={initialConfig}
        onClose={mockOnClose}
        onArgsChange={mockOnArgsChange}
        onFlagsChange={mockOnFlagsChange}
        onModelConfigChange={mockOnModelConfigChange}
        onModelNameChange={mockOnModelNameChange}
        isCreate
      />
    );

    const countInput = screen.getByLabelText(/количество gpu/i);
    fireEvent.change(countInput, { target: { value: "2" } });

    expect(mockOnModelConfigChange).toHaveBeenCalled();
  });
});
