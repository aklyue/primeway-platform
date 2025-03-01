// StartJobDialog.test.js

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import StartJobDialog from "./StartJobDialog";

describe("StartJobDialog", () => {
  const mockJob = {
    job_id: "job-123",
    job_name: "Тестовая задача",
    config: {},
  };

  const mockOnClose = jest.fn();
  const mockStartJob = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (jobProps = {}) => {
    return render(
      <StartJobDialog
        open={true}
        onClose={mockOnClose}
        job={{ ...mockJob, ...jobProps }}
        startJob={mockStartJob}
      />
    );
  };

  test("Компонент отображается корректно без области загрузки файла", () => {
    renderComponent();

    expect(
      screen.getByText(`Запуск задачи: ${mockJob.job_name}`)
    ).toBeInTheDocument();

    expect(
      screen.getByText("Вы можете запустить эту задачу.")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Перетащите файл сюда или нажмите для выбора")
    ).not.toBeInTheDocument();
  });

  test("Компонент отображает область загрузки файла, если request_input_dir истина", () => {
    renderComponent({ config: { request_input_dir: true } });

    expect(
      screen.getByText(
        "Эта задача позволяет загрузить файл. Пожалуйста, выберите файл для загрузки или запустите задачу без него."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Перетащите файл сюда или нажмите для выбора")
    ).toBeInTheDocument();
  });

  test("Файл можно выбрать и он отображается в списке файлов", async () => {
    renderComponent({ config: { request_input_dir: true } });

    const fileInput = screen.getByLabelText("Выберите файл");

    const file = new File(["file content"], "testFile.txt", {
      type: "text/plain",
    });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/testFile\.txt$/)).toBeInTheDocument();
    });
  });

  test("startJob вызывается с правильными аргументами без файлов", async () => {
    mockStartJob.mockResolvedValueOnce();

    renderComponent();

    fireEvent.click(screen.getByText("Запустить"));

    await waitFor(() => {
      expect(mockStartJob).toHaveBeenCalledWith(mockJob, []);
    });
  });

  test("startJob вызывается с правильными аргументами с выбранными файлами", async () => {
    mockStartJob.mockResolvedValueOnce();

    const jobWithConfig = { ...mockJob, config: { request_input_dir: true } };
    render(
      <StartJobDialog
        open={true}
        onClose={mockOnClose}
        job={jobWithConfig}
        startJob={mockStartJob}
      />
    );

    const fileInput = screen.getByLabelText("Выберите файл");

    const file = new File(["file content"], "testFile.txt", {
      type: "text/plain",
    });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/testFile\.txt$/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Запустить"));

    await waitFor(() => {
      expect(mockStartJob).toHaveBeenCalledWith(jobWithConfig, [file]);
    });
  });

  test("Кнопка запуска отображает индикатор загрузки и отключается при запуске задачи", async () => {
    mockStartJob.mockImplementation(() => new Promise(() => {}));

    renderComponent();

    const startButton = screen.getByTestId("start-button");
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(startButton).toBeDisabled();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  test("Диалог закрывается после запуска задачи", async () => {
    mockStartJob.mockResolvedValueOnce();

    renderComponent();

    fireEvent.click(screen.getByText("Запустить"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test("Выводится ошибка, если startJob выбрасывает ошибку", async () => {
    mockStartJob.mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    fireEvent.click(screen.getByText("Запустить"));

    await waitFor(() => {
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
  });
});
