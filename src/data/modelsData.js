// src/data/modelsData.js

export const modelsData = [
  {
    id: "T-lite-it-1.0",
    name: "t-tech/T-lite-it-1.0",
    type: "LLM",
    description:
      "T-lite-it-1.0 — это модель, созданная на базе семейства моделей Qwen 2.5. Предварительный этап обучения 1: 100 млрд токенов. Предварительный этап обучения 2: 40 млрд токенов",
    defaultConfig: {
      modelName: "t-tech/T-lite-it-1.0",
      args: [
        { key: "served-model-name", value: "T-lite-it-1.0" },
        { key: "max-model-len", value: "16000" },
        { key: "max-num-batched-tokens", value: "16000" },
      ],
      flags: [{ key: "enforce-eager", value: "True" }],
      modelConfig: {
        job_name: "t-tech/T-lite-it-1.0-deploy",
        gpu_types: [{ type: "A40", count: 1 }],
        health_check_timeout: 3500,
        disk_space: 40,
        port: 8000,
        autoscaler_timeout: 600,
        env: [
          {
            name: "HUGGING_FACE_HUB_TOKEN",
            value: "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",
          },
        ],
        schedule: {
          workdays: [],
          weekends: [],
          specific_days: [],
        },
      },
    },
  },
  {
    id: "gemma-3-12b-it",
    name: "google/gemma-3-12b-it",
    type: "LLM",
    description:
      "Модели Gemma 3 являются многомодальными, обрабатывают ввод текста и изображений и генерируют текстовый вывод, с открытыми весами как для предварительно обученных вариантов, так и для вариантов, настроенных на основе инструкций.",
    defaultConfig: {
      modelName: "google/gemma-3-12b-it",
      args: [
        { key: "served-model-name", value: "T-lite-it-1.0" },
        { key: "gpu-memory-utilization", value: "0.97" },
        { key: "tensor-parallel-size", value: "1" },
        { key: "dtype", value: "auto" },
        { key: "max-model-len", value: "16000" },
        { key: "max-num-batched-tokens", value: "16000" },
      ],
      flags: [{ key: "enforce-eager", value: "True" }],
      modelConfig: {
        job_name: "google/gemma-3-12b-it-deploy",
        gpu_types: [{ type: "A40", count: 1 }],
        health_check_timeout: 3500,
        disk_space: 60,
        port: 8000,
        autoscaler_timeout: 600,
        env: [
          {
            name: "HUGGING_FACE_HUB_TOKEN",
            value: "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",
          },
        ],
        schedule: {
          workdays: [],
          weekends: [],
          specific_days: [],
        },
      },
    },
  },
  {
    id: "DeepSeek-R1-Distill-Qwen-14B",
    name: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
    type: "LLM",
    description:
      "Модели DeepSeek-R1-Distill дообученны на основе моделей с открытым исходным кодом с использованием примеров, созданных DeepSeek-R1.",
    defaultConfig: {
      modelName: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
      args: [
        { key: "served-model-name", value: "DeepSeek-R1-Distill-Qwen-14B" },
        { key: "gpu-memory-utilization", value: "0.97" },
        { key: "tensor-parallel-size", value: "1" },
        { key: "dtype", value: "auto" },
        { key: "max-model-len", value: "16384" },
        { key: "max-num-batched-tokens", value: "16384" },
      ],
      flags: [{ key: "enforce-eager", value: "True" }],
      modelConfig: {
        job_name: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
        gpu_types: [{ type: "A40", count: 1 }],
        health_check_timeout: 3500,
        disk_space: 60,
        port: 8000,
        autoscaler_timeout: 600,
        env: [
          {
            name: "HUGGING_FACE_HUB_TOKEN",
            value: "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",
          },
        ],
        schedule: {
          workdays: [],
          weekends: [],
          specific_days: [],
        },
      },
    },
  },
];
