// src/constants/VllmArgs.js

export const VLLM_ARGS = [
  // Named Arguments
  {
    key: "host",
    description: "Host name.",
    category: "Named Arguments",
  },
  {
    key: "port",
    description: "Port number.",
    category: "Named Arguments",
    default: "8000",
  },
  {
    key: "uvicorn-log-level",
    description: "Log level for uvicorn.",
    category: "Named Arguments",
    choices: ["debug", "info", "warning", "error", "critical", "trace"],
    default: "info",
  },
  {
    key: "allowed-origins",
    description: "Allowed origins.",
    category: "Named Arguments",
    default: ["*"],
  },
  {
    key: "allowed-methods",
    description: "Allowed methods.",
    category: "Named Arguments",
    default: ["*"],
  },
  {
    key: "allowed-headers",
    description: "Allowed headers.",
    category: "Named Arguments",
    default: ["*"],
  },
  {
    key: "api-key",
    description: "If provided, the server will require this key to be presented in the header.",
    category: "Named Arguments",
  },
  {
    key: "lora-modules",
    description:
      "LoRA module configurations in either ‘name=path’ format or JSON format.",
    category: "Named Arguments",
  },
  {
    key: "prompt-adapters",
    description:
      "Prompt adapter configurations in the format name=path. Multiple adapters can be specified.",
    category: "Named Arguments",
  },
  {
    key: "chat-template",
    description:
      "The file path to the chat template, or the template in single-line form for the specified model.",
    category: "Named Arguments",
  },
  {
    key: "chat-template-content-format",
    description:
      "The format to render message content within a chat template.",
    category: "Named Arguments",
    choices: ["auto", "string", "openai"],
    default: "auto",
  },
  {
    key: "response-role",
    description:
      "The role name to return if request.add_generation_prompt=true.",
    category: "Named Arguments",
    default: "assistant",
  },
  {
    key: "ssl-keyfile",
    description: "The file path to the SSL key file.",
    category: "Named Arguments",
  },
  {
    key: "ssl-certfile",
    description: "The file path to the SSL cert file.",
    category: "Named Arguments",
  },
  {
    key: "ssl-ca-certs",
    description: "The CA certificates file.",
    category: "Named Arguments",
  },
  {
    key: "ssl-cert-reqs",
    description:
      "Whether client certificate is required (see stdlib ssl module’s).",
    category: "Named Arguments",
    default: 0,
  },
  {
    key: "root-path",
    description:
      "FastAPI root_path when app is behind a path based routing proxy.",
    category: "Named Arguments",
  },
  {
    key: "middleware",
    description:
      "Additional ASGI middleware to apply to the app. We accept multiple --middleware arguments.",
    category: "Named Arguments",
    default: [],
  },
  {
    key: "tool-call-parser",
    description:
      "Select the tool call parser depending on the model that you’re using.",
    category: "Named Arguments",
  },
  {
    key: "tool-parser-plugin",
    description:
      "Special tool parser plugin to parse the model-generated tool into OpenAI API format.",
    category: "Named Arguments",
    default: "",
  },
  {
    key: "model",
    description: "Name or path of the huggingface model to use.",
    category: "Named Arguments",
    default: "facebook/opt-125m",
  },
  {
    key: "task",
    description:
      "The task to use the model for. Each vLLM instance only supports one task.",
    category: "Named Arguments",
    choices: [
      "auto",
      "generate",
      "embedding",
      "embed",
      "classify",
      "score",
      "reward",
      "transcription",
    ],
    default: "auto",
  },
  {
    key: "tokenizer",
    description:
      "Name or path of the huggingface tokenizer to use. If unspecified, model name or path will be used.",
    category: "Named Arguments",
  },
  {
    key: "hf-config-path",
    description:
      "Name or path of the huggingface config to use. If unspecified, model name or path will be used.",
    category: "Named Arguments",
  },
  {
    key: "revision",
    description:
      "The specific model version to use. It can be a branch name, a tag name, or a commit id.",
    category: "Named Arguments",
  },
  {
    key: "code-revision",
    description:
      "The specific revision to use for the model code on Hugging Face Hub.",
    category: "Named Arguments",
  },
  {
    key: "tokenizer-revision",
    description:
      "Revision of the huggingface tokenizer to use. It can be a branch name, a tag name, or a commit id.",
    category: "Named Arguments",
  },
  {
    key: "tokenizer-mode",
    description: "The tokenizer mode.",
    category: "Named Arguments",
    choices: ["auto", "slow", "mistral", "custom"],
    default: "auto",
  },
  {
    key: "max-model-len",
    description:
      "Model context length. If unspecified, will be automatically derived from the model config.",
    category: "Named Arguments",
  },
  {
    key: "guided-decoding-backend",
    description:
      "Which engine will be used for guided decoding (JSON schema / regex etc) by default.",
    category: "Named Arguments",
    choices: ["xgrammar", "guidance", "auto"],
    default: "xgrammar",
  },
  {
    key: "logits-processor-pattern",
    description:
      "Optional regex pattern specifying valid logits processor qualified names.",
    category: "Named Arguments",
  },
  {
    key: "model-impl",
    description: "Which implementation of the model to use.",
    category: "Named Arguments",
    choices: ["auto", "vllm", "transformers"],
    default: "auto",
  },
  {
    key: "distributed-executor-backend",
    description:
      "Backend to use for distributed model workers, either “ray” or “mp” (multiprocessing).",
    category: "Named Arguments",
    choices: ["ray", "mp", "uni", "external_launcher"],
  },
  {
    key: "pipeline-parallel-size",
    description: "Number of pipeline stages.",
    category: "Named Arguments",
    default: 1,
  },
  {
    key: "tensor-parallel-size",
    description: "Number of tensor parallel replicas.",
    category: "Named Arguments",
    default: 1,
  },
  {
    key: "data-parallel-size",
    description:
      "Number of data parallel replicas. MoE layers will be sharded according to the product of the tensor-parallel-size and data-parallel-size.",
    category: "Named Arguments",
    default: 1,
  },
  {
    key: "max-parallel-loading-workers",
    description:
      "Load model sequentially in multiple batches, to avoid RAM OOM when using tensor parallel and large models.",
    category: "Named Arguments",
  },
  {
    key: "block-size",
    description:
      "Token block size for contiguous chunks of tokens. This is ignored on neuron devices and set to --max-model-len.",
    category: "Named Arguments",
    choices: [8, 16, 32, 64, 128],
  },
  {
    key: "num-lookahead-slots",
    description:
      "Experimental scheduling config necessary for speculative decoding.",
    category: "Named Arguments",
    default: 0,
  },
  {
    key: "seed",
    description: "Random seed for operations.",
    category: "Named Arguments",
  },
  {
    key: "swap-space",
    description: "CPU swap space size (GiB) per GPU.",
    category: "Named Arguments",
    default: 4,
  },
  {
    key: "cpu-offload-gb",
    description:
      "The space in GiB to offload to CPU, per GPU. Default is 0, which means no offloading.",
    category: "Named Arguments",
    default: 0,
  },
  {
    key: "gpu-memory-utilization",
    description:
      "The fraction of GPU memory to be used for the model executor, which can range from 0 to 1.",
    category: "Named Arguments",
    default: 0.9,
  },
  {
    key: "num-gpu-blocks-override",
    description:
      "If specified, ignore GPU profiling result and use this number of GPU blocks.",
    category: "Named Arguments",
  },
  {
    key: "max-num-batched-tokens",
    description: "Maximum number of batched tokens per iteration.",
    category: "Named Arguments",
  },
  {
    key: "max-num-partial-prefills",
    description:
      "For chunked prefill, the max number of concurrent partial prefills.",
    category: "Named Arguments",
    default: 1,
  },
  {
    key: "max-long-partial-prefills",
    description:
      "For chunked prefill, the maximum number of prompts longer than --long-prefill-token-threshold.",
    category: "Named Arguments",
    default: 1,
  },
  {
    key: "long-prefill-token-threshold",
    description:
      "For chunked prefill, a request is considered long if the prompt is longer than this number of tokens.",
    category: "Named Arguments",
    default: 0,
  },
  {
    key: "max-num-seqs",
    description: "Maximum number of sequences per iteration.",
    category: "Named Arguments",
  },
  {
    key: "max-logprobs",
    description:
      "Max number of log probs to return logprobs is specified in SamplingParams.",
    category: "Named Arguments",
    default: 20,
  },
  {
    key: "download-dir",
    description: "Directory to download and load the weights.",
    category: "Named Arguments",
  },
  {
    key: "load-format",
    description: "The format of the model weights to load.",
    category: "Named Arguments",
    choices: [
      "auto",
      "pt",
      "safetensors",
      "npcache",
      "dummy",
      "tensorizer",
      "sharded_state",
      "gguf",
      "bitsandbytes",
      "mistral",
      "runai_streamer",
      "fastsafetensors",
    ],
    default: "auto",
  },
  {
    key: "config-format",
    description: "The format of the model config to load.",
    category: "Named Arguments",
    choices: ["auto", "hf", "mistral"],
    default: "auto",
  },
  {
    key: "dtype",
    description: "Data type for model weights and activations.",
    category: "Named Arguments",
    choices: ["auto", "half", "float16", "bfloat16", "float", "float32"],
    default: "auto",
  },
  {
    key: "kv-cache-dtype",
    description: "Data type for kv cache storage.",
    category: "Named Arguments",
    choices: ["auto", "fp8", "fp8_e5m2", "fp8_e4m3"],
    default: "auto",
  },
  {
    key: "rope-scaling",
    description:
      "RoPE scaling configuration in JSON format. For example, {\"rope_type\":\"dynamic\",\"factor\":2.0}",
    category: "Named Arguments",
  },
  {
    key: "rope-theta",
    description:
      "RoPE theta. Use with rope_scaling. In some cases, changing the RoPE theta improves the performance of the scaled model.",
    category: "Named Arguments",
  },
  {
    key: "hf-overrides",
    description:
      "Extra arguments for the HuggingFace config. This should be a JSON string.",
    category: "Named Arguments",
  },
  {
    key: "max-seq-len-to-capture",
    description:
      "Maximum sequence length covered by CUDA graphs. When a sequence has context length larger than this, we fall back to eager mode.",
    category: "Named Arguments",
    default: 8192,
  },
  {
    key: "tokenizer-pool-size",
    description:
      "Size of tokenizer pool to use for asynchronous tokenization. If 0, will use synchronous tokenization.",
    category: "Named Arguments",
    default: 0,
  },
  {
    key: "tokenizer-pool-type",
    description:
      "Type of tokenizer pool to use for asynchronous tokenization. Ignored if tokenizer_pool_size is 0.",
    category: "Named Arguments",
    default: "ray",
  },
  {
    key: "tokenizer-pool-extra-config",
    description:
      "Extra config for tokenizer pool. This should be a JSON string that will be parsed into a dictionary.",
    category: "Named Arguments",
  },
  {
    key: "limit-mm-per-prompt",
    description:
      "For each multimodal plugin, limit how many input instances to allow for each prompt.",
    category: "Named Arguments",
  },
  {
    key: "mm-processor-kwargs",
    description:
      "Overrides for the multimodal input mapping/processing, e.g., image processor.",
    category: "Named Arguments",
  },
  {
    key: "max-loras",
    description: "Max number of LoRAs in a single batch.",
    category: "Named Arguments",
    default: 1,
  },
  {
    key: "max-lora-rank",
    description: "Max LoRA rank.",
    category: "Named Arguments",
    default: 16,
  },
  {
    key: "lora-extra-vocab-size",
    description:
      "Maximum size of extra vocabulary that can be present in a LoRA adapter (added to the base model vocabulary).",
    category: "Named Arguments",
    default: 256,
  },
  {
    key: "lora-dtype",
    description: "Data type for LoRA.",
    category: "Named Arguments",
    choices: ["auto", "float16", "bfloat16"],
    default: "auto",
  },
  {
    key: "long-lora-scaling-factors",
    description:
      "Specify multiple scaling factors to allow for multiple LoRA adapters trained with those scaling factors.",
    category: "Named Arguments",
  },
  {
    key: "max-cpu-loras",
    description:
      "Maximum number of LoRAs to store in CPU memory. Must be >= than max_loras.",
    category: "Named Arguments",
  },
  {
    key: "max-prompt-adapters",
    description: "Max number of PromptAdapters in a batch.",
    category: "Named Arguments",
    default: 1,
  },
  {
    key: "max-prompt-adapter-token",
    description: "Max number of PromptAdapters tokens.",
    category: "Named Arguments",
    default: 0,
  },
  {
    key: "device",
    description: "Device type for vLLM execution.",
    category: "Named Arguments",
    choices: ["auto", "cuda", "neuron", "cpu", "tpu", "xpu", "hpu"],
    default: "auto",
  },
  {
    key: "num-scheduler-steps",
    description: "Maximum number of forward steps per scheduler call.",
    category: "Named Arguments",
    default: 1,
  },
  {
    key: "scheduler-delay-factor",
    description:
      "Apply a delay (of delay factor multiplied by previous prompt latency) before scheduling next prompt.",
    category: "Named Arguments",
    default: 0.0,
  },
  {
    key: "speculative-config",
    description:
      "The configurations for speculative decoding. Should be a JSON string.",
    category: "Named Arguments",
  },
  {
    key: "model-loader-extra-config",
    description:
      "Extra config for model loader. This will be passed to the model loader corresponding to the chosen load_format.",
    category: "Named Arguments",
  },
  {
    key: "ignore-patterns",
    description:
      "The pattern(s) to ignore when loading the model. Default to original/**/* to avoid repeated loading of llama’s checkpoints.",
    category: "Named Arguments",
    default: [],
  },
  {
    key: "preemption-mode",
    description:
      "If 'recompute', the engine performs preemption by recomputing; If 'swap', the engine performs preemption by block swapping.",
    category: "Named Arguments",
  },
  {
    key: "served-model-name",
    description:
      "The model name(s) used in the API. If multiple names are provided, the server will respond to any of the provided names.",
    category: "Named Arguments",
  },
  {
    key: "qlora-adapter-name-or-path",
    description: "Name or path of the QLoRA adapter.",
    category: "Named Arguments",
  },
  {
    key: "show-hidden-metrics-for-version",
    description:
      "Enable deprecated Prometheus metrics that have been hidden since the specified version.",
    category: "Named Arguments",
  },
  {
    key: "otlp-traces-endpoint",
    description: "Target URL to which OpenTelemetry traces will be sent.",
    category: "Named Arguments",
  },
  {
    key: "collect-detailed-traces",
    description:
      "Valid choices are model, worker, all. It makes sense to set this only if --otlp-traces-endpoint is set.",
    category: "Named Arguments",
  },
  {
    key: "scheduling-policy",
    description:
      'The scheduling policy to use. "fcfs" (first come first served, i.e. requests are handled in order of arrival; default) or "priority" (requests are handled based on given priority).',
    category: "Named Arguments",
    choices: ["fcfs", "priority"],
    default: "fcfs",
  },
  {
    key: "scheduler-cls",
    description:
      'The scheduler class to use. "vllm.core.scheduler.Scheduler" is the default scheduler.',
    category: "Named Arguments",
    default: "vllm.core.scheduler.Scheduler",
  },
  {
    key: "override-neuron-config",
    description:
      'Override or set neuron device configuration. e.g. {"cast_logits_dtype": "bloat16"}.',
    category: "Named Arguments",
  },
  {
    key: "override-pooler-config",
    description:
      'Override or set the pooling method for pooling models. e.g. {"pooling_type": "mean", "normalize": false}.',
    category: "Named Arguments",
  },
  {
    key: "compilation-config",
    description:
      "torch.compile configuration for the model. When it is a number (0, 1, 2, 3), it will be interpreted as the optimization level.",
    category: "Named Arguments",
  },
  {
    key: "kv-transfer-config",
    description:
      "The configurations for distributed KV cache transfer. Should be a JSON string.",
    category: "Named Arguments",
  },
  {
    key: "worker-cls",
    description:
      'The worker class to use for distributed execution. "auto" is default.',
    category: "Named Arguments",
    default: "auto",
  },
  {
    key: "worker-extension-cls",
    description:
      "The worker extension class on top of the worker cls, it is useful if you just want to add new functions to the worker class without changing the existing functions.",
    category: "Named Arguments",
    default: "",
  },
  {
    key: "generation-config",
    description:
      "The folder path to the generation config. Defaults to 'auto', the generation config will be loaded from model path.",
    category: "Named Arguments",
    default: "auto",
  },
  {
    key: "override-generation-config",
    description:
      "Overrides or sets generation config in JSON format. e.g. {\"temperature\": 0.5}.",
    category: "Named Arguments",
  },
  {
    key: "additional-config",
    description:
      "Additional config for specified platform in JSON format. Different platforms may support different configs.",
    category: "Named Arguments",
  },
  {
    key: "reasoning-parser",
    description:
      "Select the reasoning parser depending on the model that you’re using. This is used to parse the reasoning content into OpenAI API format.",
    category: "Named Arguments",
    choices: ["deepseek_r1", "granite"],
  },
  {
    key: "max-log-len",
    description:
      "Max number of prompt characters or prompt ID numbers being printed in log. The default of None means unlimited.",
    category: "Named Arguments",
  },
];

export const VLLM_FLAGS = [
  // Flags
  {
    key: "disable-uvicorn-access-log",
    description: "Disable uvicorn access log.",
    category: "Flags",
    default: false,
  },
  {
    key: "allow-credentials",
    description: "Allow credentials.",
    category: "Flags",
    default: false,
  },
  {
    key: "disable-frontend-multiprocessing",
    description:
      "If specified, will run the OpenAI frontend server in the same process as the model serving engine.",
    category: "Flags",
    default: false,
  },
  {
    key: "enable-request-id-headers",
    description:
      "If specified, API server will add X-Request-Id header to responses. Caution: this hurts performance at high QPS.",
    category: "Flags",
    default: false,
  },
  {
    key: "enable-auto-tool-choice",
    description:
      "Enable auto tool choice for supported models. Use --tool-call-parser to specify which parser to use.",
    category: "Flags",
    default: false,
  },
  {
    key: "trust-remote-code",
    description: "Trust remote code from huggingface.",
    category: "Flags",
    default: false,
  },
  {
    key: "skip-tokenizer-init",
    description:
      "Skip initialization of tokenizer and detokenizer. Expects valid prompt_token_ids and None for prompt from the input.",
    category: "Flags",
    default: false,
  },
  {
    key: "enable-expert-parallel",
    description: "Use expert parallelism instead of tensor parallelism for MoE layers.",
    category: "Flags",
    default: false,
  },
  {
    key: "ray-workers-use-nsight",
    description: "If specified, use nsight to profile Ray workers.",
    category: "Flags",
    default: false,
  },
  {
    key: "enable-prefix-caching",
    description: "Enables automatic prefix caching.",
    category: "Flags",
    default: true,
  },
  {
    key: "disable-sliding-window",
    description:
      "Disables sliding window, capping to sliding window size.",
    category: "Flags",
    default: false,
  },
  {
    key: "disable-custom-all-reduce",
    description: "Disable custom all-reduce.",
    category: "Flags",
    default: false,
  },
  {
    key: "use-tqdm-on-load",
    description: "Whether to enable/disable progress bar when loading model weights.",
    category: "Flags",
    default: true,
  },
  {
    key: "multi-step-stream-outputs",
    description:
      "If False, then multi-step will stream outputs at the end of all steps.",
    category: "Flags",
    default: true,
  },
  {
    key: "enable-chunked-prefill",
    description:
      "If set, the prefill requests can be chunked based on the max_num_batched_tokens.",
    category: "Flags",
    default: false,
  },
  {
    key: "enable-lora",
    description: "If True, enable handling of LoRA adapters.",
    category: "Flags",
    default: false,
  },
  {
    key: "enable-lora-bias",
    description: "If True, enable bias for LoRA adapters.",
    category: "Flags",
    default: false,
  },
  {
    key: "fully-sharded-loras",
    description:
      "By default, only half of the LoRA computation is sharded with tensor parallelism.",
    category: "Flags",
    default: false,
  },
  {
    key: "enable-prompt-adapter",
    description: "If True, enable handling of PromptAdapters.",
    category: "Flags",
    default: false,
  },
  {
    key: "enforce-eager",
    description:
      "Always use eager-mode PyTorch. If False, will use eager mode and CUDA graph in hybrid.",
    category: "Flags",
    default: false,
  },
  {
    key: "disable-mm-preprocessor-cache",
    description:
      "If true, then disables caching of the multi-modal preprocessor/mapper.",
    category: "Flags",
    default: false,
  },
  {
    key: "use-v2-block-manager",
    description:
      "[DEPRECATED] block manager v1 has been removed and SelfAttnBlockSpaceManager (i.e. block manager v2) is now the default.",
    category: "Flags",
    default: true,
  },
  {
    key: "enable-sleep-mode",
    description: "Enable sleep mode for the engine.",
    category: "Flags",
    default: false,
  },
  {
    key: "calculate-kv-scales",
    description:
      "This enables dynamic calculation of k_scale and v_scale when kv-cache-dtype is fp8.",
    category: "Flags",
    default: false,
  },
  {
    key: "enable-reasoning",
    description:
      "Whether to enable reasoning_content for the model. If enabled, the model will be able to generate reasoning content.",
    category: "Flags",
    default: false,
  },
  {
    key: "disable-cascade-attn",
    description:
      "Disable cascade attention for V1. Note that even if this is set to False, cascade attention will be only used when beneficial.",
    category: "Flags",
    default: false,
  },
  {
    key: "disable-log-stats",
    description: "Disable logging statistics.",
    category: "Flags",
    default: false,
  },
  {
    key: "disable-log-requests",
    description: "Disable logging requests.",
    category: "Flags",
    default: false,
  },
  {
    key: "disable-fastapi-docs",
    description: "Disable FastAPI’s OpenAPI schema, Swagger UI, and ReDoc endpoint.",
    category: "Flags",
    default: false,
  },
  {
    key: "enable-prompt-tokens-details",
    description: "If set to True, enable prompt_tokens_details in usage.",
    category: "Flags",
    default: false,
  },
  {
    key: "enable-server-load-tracking",
    description:
      "If set to True, enable tracking server_load_metrics in the app state.",
    category: "Flags",
    default: false,
  },
  {
    key: "disable-async-output-proc",
    description:
      "Disable async output processing. This may result in lower performance.",
    category: "Flags",
    default: false,
  },
];