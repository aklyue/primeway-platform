/* eslint-disable no-console */

// ──────────────────────────
// МОК-хранилища
// ──────────────────────────
let _datasets = [
  { id: "ds1", name: "wiki.csv", size: "12 MB", created: "01.05.25" },
  { id: "ds2", name: "code.json", size: "3 MB", created: "02.05.25" },
];

let _fineTunes = [
  {
    id: "ft1",
    name: "gemma-wiki",
    created: "01.05.25",
    status: "ready", // queued | running | ready | stopped
    artifact: "gemma-wiki:latest",
    logs: "epoch 1/3 …\nepoch 2/3 …\n",
  },
];

// ──────────────────────────
// DATASETS
// ──────────────────────────
const getDatasets = () => Promise.resolve([..._datasets]);

const uploadDataset = (fileObj) => {
  const ds = {
    id: Date.now().toString(),
    name: fileObj.name,
    size: `${(fileObj.size / 1e6).toFixed(1)} MB`,
    created: new Date().toLocaleDateString(),
  };
  _datasets.push(ds);
  return Promise.resolve(ds);
};

const deleteDataset = (id) => {
  _datasets = _datasets.filter((d) => d.id !== id);
  return Promise.resolve();
};

// ──────────────────────────
// СОЗДАТЬ fine-tune (из формы Train)
// ──────────────────────────
const startFineTune = ({ baseModel, datasetId, params }) => {
  const ft = {
    id: `ft${Date.now()}`,
    name: `${baseModel}-${datasetId}`.replace(/-$/, ""),
    created: new Date().toLocaleDateString(),
    status: "queued",
    artifact: "-",
    // просто сохраняем YAML/JSON как строку
    logs: `job queued with params:\n${params}\n`,
  };
  _fineTunes.push(ft);
  return Promise.resolve(ft);
};

// ──────────────────────────
// МОНИТОР fine-tune-задач
// ──────────────────────────
const getFineTunes = () => Promise.resolve([..._fineTunes]);
const getFineTuneLogs = (id) => {
  const j = _fineTunes.find((x) => x.id === id);
  return Promise.resolve(j ? j.logs : "-");
};

const stopFineTune = (id) => {
  _fineTunes = _fineTunes.map((j) =>
    j.id === id ? { ...j, status: "stopped", logs: j.logs + "STOP\n" } : j
  );
  return Promise.resolve();
};

const restartFineTune = (id) => {
  _fineTunes = _fineTunes.map((j) =>
    j.id === id ? { ...j, status: "queued", logs: j.logs + "RESTART\n" } : j
  );
  return Promise.resolve();
};

// ──────────────────────────
// DEPLOY модели (когда ready)
// ──────────────────────────
const deployModel = (modelId) =>
  Promise.resolve({ jobId: `deploy-${modelId}` });

// ──────────────────────────
// ИМИТАЦИЯ ПРОГРЕССА queued→running→ready
// ──────────────────────────
setInterval(() => {
  _fineTunes = _fineTunes.map((j) => {
    if (j.status === "queued") {
      return { ...j, status: "running", logs: j.logs + "start running…\n" };
    }
    if (j.status === "running" && Math.random() < 0.3) {
      return {
        ...j,
        status: "ready",
        artifact: `${j.name}:latest`,
        logs: j.logs + "job finished\n",
      };
    }
    return j;
  });
}, 4000);

// ──────────────────────────
// ЭКСПОРТ «API»
// ──────────────────────────
export const api = {
  // datasets
  getDatasets,
  uploadDataset,
  deleteDataset,

  // train
  startFineTune,

  // fine-tune tasks
  getFineTunes,
  getFineTuneLogs,
  stopFineTune,
  restartFineTune,

  // deploy
  deployModel,
};
