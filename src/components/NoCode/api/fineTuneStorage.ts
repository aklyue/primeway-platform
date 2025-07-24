// src/…/fineTuneStorage.ts

import { modelsData } from "../../../data/modelsData";
import { BasicModel } from "../../../types";

const KEY = "fineTunedModels";

export const getFineTuned = (): BasicModel[] =>
  JSON.parse(localStorage.getItem(KEY) || "[]");

export const addFineTuned = (model: BasicModel) => {
  const list = getFineTuned();

  if (
    list.some((m) => m.name === model.name) ||
    modelsData.some((b) => b.name === model.name)
  ) {
    throw new Error("Имя занято базовой или дообученной моделью");
  }

  list.push(model);
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const subscribeFineTuned = (cb: (models: BasicModel[]) => void) => {
  const h = (e: StorageEvent) => e.key === KEY && cb(getFineTuned());
  window.addEventListener("storage", h);
  return () => window.removeEventListener("storage", h);
};
