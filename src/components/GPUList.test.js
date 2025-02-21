// GPUList.test.js
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import GPUList from "./GPUList";
import axiosInstance from "../api";

// Мокаем axiosInstance
jest.mock("../api");

// Мокаем компонент NvidiaIcon
jest.mock("./NvidiaIcon", () => () => <div data-testid="nvidia-icon"></div>);

describe("GPUList Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Отображает индикатор загрузки во время загрузки данных", () => {
    render(<GPUList />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("Отображает сообщение об ошибке при неудачной загрузке данных", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: {
        data: { detail: "Ошибка сервера" },
      },
    });

    render(<GPUList />);

    await waitFor(() => {
      expect(screen.getByText("Ошибка сервера")).toBeInTheDocument();
    });
  });

  test("Отображает список GPU после успешной загрузки данных", async () => {
    const gpuData = [
      {
        name: "NVIDIA Tesla V100",
        memoryInGb: 16,
        costPerHour: 100,
      },
      {
        name: "NVIDIA RTX 3090",
        memoryInGb: 24,
        costPerHour: 150,
      },
    ];

    axiosInstance.get.mockResolvedValueOnce({ data: gpuData });

    render(<GPUList />);

    // Ожидаем окончания загрузки данных
    await waitFor(() => {
      expect(screen.getByText("Доступные GPU")).toBeInTheDocument();
    });

    // Проверяем, что карточки GPU отображаются
    gpuData.forEach((gpu) => {
      expect(screen.getByText(gpu.name)).toBeInTheDocument();
      expect(
        screen.getByText(`Память: ${gpu.memoryInGb} GB`)
      ).toBeInTheDocument();
      expect(screen.getByText(`${gpu.costPerHour} ₽/час`)).toBeInTheDocument();
    });

    // Проверяем, что компонент NvidiaIcon отображается
    expect(screen.getAllByTestId("nvidia-icon")).toHaveLength(gpuData.length);
  });

  test("Копирует имя GPU при клике на карточку и отображает Snackbar", async () => {
    const gpuData = [
      {
        name: "NVIDIA Tesla V100",
        memoryInGb: 16,
        costPerHour: 100,
      },
    ];

    axiosInstance.get.mockResolvedValueOnce({ data: gpuData });

    // Мокаем clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValueOnce(),
      },
    });

    render(<GPUList />);

    await waitFor(() => {
      expect(screen.getByText("NVIDIA Tesla V100")).toBeInTheDocument();
    });

    // Кликаем на карточку GPU
    fireEvent.click(screen.getByText("NVIDIA Tesla V100"));

    // Проверяем, что имя скопировано
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "NVIDIA Tesla V100"
    );

    // Проверяем, что Snackbar отображается
    await waitFor(() => {
      expect(
        screen.getByText(
          'Имя GPU "NVIDIA Tesla V100" скопировано в буфер обмена!'
        )
      ).toBeInTheDocument();
    });
  });
});
