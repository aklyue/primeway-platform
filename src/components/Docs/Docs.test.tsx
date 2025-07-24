import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Docs from "./Docs";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as reactRouter from "react-router-dom";
import * as mui from "@mui/material";

// Мокаем useParams
jest.spyOn(reactRouter, "useParams").mockReturnValue({ docName: "welcome" });

// Мокаем useMediaQuery
jest.spyOn(mui, "useMediaQuery").mockReturnValue(false);

// Мокаем динамический импорт документа
jest.mock("../../docs/welcome.tsx", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-doc">Welcome content</div>,
}));

describe("Docs", () => {
  it("отображает лоадер при загрузке", async () => {
    render(
      <MemoryRouter initialEntries={["/docs/welcome"]}>
        <Routes>
          <Route path="/docs/:docName" element={<Docs />} />
        </Routes>
      </MemoryRouter>
    );

    // Пока контент грузится — видим лоадер
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // После загрузки — появляется сам контент
    expect(await screen.findByTestId("mock-doc")).toBeInTheDocument();
  });

  it("отображает кнопки prev/next", async () => {
    // prev: none (первый элемент), next: quickstart
    render(
      <MemoryRouter initialEntries={["/docs/welcome"]}>
        <Routes>
          <Route path="/docs/:docName" element={<Docs />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("AI Маркетплейс")).not.toBeInTheDocument();
    expect(screen.getByText("Начало Работы")).toBeInTheDocument(); // next doc
  });

  it("показывает ошибку, если документация не найдена", async () => {
    (reactRouter.useParams as jest.Mock).mockReturnValue({
      docName: "missing",
    });

    render(
      <MemoryRouter initialEntries={["/docs/missing"]}>
        <Routes>
          <Route path="/docs/:docName" element={<Docs />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/документ не найден/i)).toBeInTheDocument()
    );
  });
});
