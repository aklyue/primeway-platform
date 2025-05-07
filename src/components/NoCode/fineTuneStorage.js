// src/…/fineTuneStorage.js

import { modelsData } from "../../data/modelsData";

const KEY = "fineTunedModels";

export const getFineTuned = () => JSON.parse(localStorage.getItem(KEY) || "[]");

export const addFineTuned = (model) => {
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

export const subscribeFineTuned = (cb) => {
  const h = (e) => e.key === KEY && cb(getFineTuned());
  window.addEventListener("storage", h);
  return () => window.removeEventListener("storage", h);
};
