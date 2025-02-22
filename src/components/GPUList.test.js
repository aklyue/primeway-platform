// GPUList.test.js

import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import GPUList from "./GPUList";
import axiosInstance from "../api";

// Мокаем axiosInstance
jest.mock("../api");

// Мокаем компонент NvidiaIcon
jest.mock("./NvidiaIcon", () => () => <div data-testid="nvidia-icon" />);

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
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Проверяем, что карточки GPU отображаются
    gpuData.forEach((gpu) => {
      // Находим элемент с названием GPU
      const gpuNameElement = screen.getByText(gpu.name);
      expect(gpuNameElement).toBeInTheDocument();

      // Поднимаемся к родительскому элементу карточки
      const cardElement = gpuNameElement.closest(".MuiCard-root");
      expect(cardElement).toBeInTheDocument();

      // Ограничиваем область поиска текущей карточкой
      const withinCard = within(cardElement);

      // Проверяем, что внутри карточки есть элемент с нужным объемом памяти
      const memoryElement = withinCard.getByText((_, element) => {
        const text = element.textContent.replace(/\s+/g, " ").trim();
        return (
          text === `Память: ${gpu.memoryInGb} GB` &&
          element.tagName.toLowerCase() === "p"
        );
      });
      expect(memoryElement).toBeInTheDocument();

      // Проверяем, что внутри карточки есть элемент с нужной стоимостью
      const costElement = withinCard.getByText((_, element) => {
        const text = element.textContent.replace(/\s+/g, " ").trim();
        return (
          text === `${gpu.costPerHour} ₽/час` &&
          element.tagName.toLowerCase() === "span"
        );
      });
      expect(costElement).toBeInTheDocument();

      // Проверяем, что компонент NvidiaIcon отображается на каждой карточке
      expect(withinCard.getByTestId("nvidia-icon")).toBeInTheDocument();
    });
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

    // Находим элемент с названием GPU
    const gpuNameElement = screen.getByText("NVIDIA Tesla V100");

    // Поднимаемся к родительскому элементу карточки
    const cardElement = gpuNameElement.closest(".MuiCard-root");
    expect(cardElement).toBeInTheDocument();

    // Кликаем на карточку GPU
    fireEvent.click(cardElement);

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
