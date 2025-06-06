export const fineTunedData = [
    {
        id: "unsloth/gemma-3-1b-it-finetuned",
        name: "unsloth/gemma-3-1b-it",
        isBasic: true,
        type: "LLM",
        description:
            "T-lite-it-1.0 — это модель, созданная на базе семейства моделей Qwen 2.5. Предварительный этап обучения 1: 100 млрд токенов. Предварительный этап обучения 2: 40 млрд токенов",
        defaultConfig: {
            modelName: "unsloth/gemma-3-1b-it",
            modelConfig: {
                job_name: "unsloth/gemma-3-1b-it-deploy",
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
];
