/* eslint-disable no-console */

// ──────────────────────────
// МОК-хранилища
// ──────────────────────────
let _datasets = [
  { id: "ds1", name: "wiki.csv", size: "12 MB", created: "01.05.25" },
  { id: "ds2", name: "code.json", size: "3 MB", created: "02.05.25" },
];

let _jupyterSessions = [
  {
    id: "jupyter-1",
    gpuType: "gpu-t4",
    diskSpace: 20,
    status: "running",
    createdAt: new Date().toLocaleString(),
    url: "https://jupyter.example.com/session-1",
  },
  {
    id: "jupyter-2",
    gpuType: "gpu-a10g",
    diskSpace: 50,
    status: "stopped",
    createdAt: new Date(Date.now() - 86400000).toLocaleString(),
    url: "https://jupyter.example.com/session-2",
  },
];

// ──────────────────────────
// JUPYTERLAB SESSIONS
// ──────────────────────────
const getJupyterSessions = () => Promise.resolve([..._jupyterSessions]);

const createJupyterSession = ({ gpuType, diskSpace }) => {
  const newSession = {
    id: `jupyter-${Date.now()}`,
    gpuType,
    diskSpace: parseInt(diskSpace),
    status: "starting",
    createdAt: new Date().toLocaleString(),
    url: `https://jupyter.example.com/session-${_jupyterSessions.length + 1}`,
  };
  _jupyterSessions.push(newSession);
  return Promise.resolve(newSession);
};

const startJupyterSession = (sessionId) => {
  _jupyterSessions = _jupyterSessions.map((session) =>
    session.id === sessionId ? { ...session, status: "starting" } : session
  );
  return Promise.resolve();
};

const stopJupyterSession = (sessionId) => {
  _jupyterSessions = _jupyterSessions.map((session) =>
    session.id === sessionId ? { ...session, status: "stopped" } : session
  );
  return Promise.resolve();
};

// ──────────────────────────
// ИМИТАЦИЯ ПРОГРЕССА starting→running
// ──────────────────────────
setInterval(() => {
  _jupyterSessions = _jupyterSessions.map((session) => {
    if (session.status === "starting" && Math.random() < 0.4) {
      return { ...session, status: "running" };
    }
    return session;
  });
}, 3000);

let _fineTunes = [
  {
    id: "ft1",
    name: "gemma-wiki",
    url: "ghg.ss.com",
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

let _customFineTunes = [];

// Добавьте новые методы API
const startCustomFineTune = ({ baseModel, datasetId, params }) => {
  const task = {
    id: `custom-${Date.now()}`,
    baseModel,
    datasetId,
    params: JSON.stringify(params),
    status: "queued",
    createdAt: new Date().toLocaleString(),
  };
  _customFineTunes.push(task);
  return Promise.resolve(task);
};

const getCustomFineTunes = () => Promise.resolve([..._customFineTunes]);

const stopCustomFineTune = (taskId) => {
  _customFineTunes = _customFineTunes.map((task) =>
    task.id === taskId ? { ...task, status: "stopped" } : task
  );
  return Promise.resolve();
};

const restartCustomFineTune = (taskId) => {
  _customFineTunes = _customFineTunes.map((task) =>
    task.id === taskId ? { ...task, status: "queued" } : task
  );
  return Promise.resolve();
};

// Имитация прогресса для кастомных задач
setInterval(() => {
  _customFineTunes = _customFineTunes.map((task) => {
    if (task.status === "queued" && Math.random() < 0.3) {
      return { ...task, status: "running" };
    }
    if (task.status === "running" && Math.random() < 0.3) {
      return { ...task, status: "ready" };
    }
    return task;
  });
}, 3000);

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

  startCustomFineTune,
  getCustomFineTunes,
  stopCustomFineTune,
  restartCustomFineTune,

  // fine-tune tasks
  getFineTunes,
  getFineTuneLogs,
  stopFineTune,
  restartFineTune,

  // deploy
  deployModel,

  // jupyterlab sessions
  getJupyterSessions,
  createJupyterSession,
  startJupyterSession,
  stopJupyterSession,
};
