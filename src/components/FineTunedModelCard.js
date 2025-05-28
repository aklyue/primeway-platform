import React from "react";
import ModelCard from "./ModelCard";
import { modelsData } from "../data/modelsData";

export default function FineTunedModelCard({ ft, isLast }) {
  /* -------- 1 — Pick a base model or fall back gracefully ---------- */
  const base =
    modelsData.find((m) => m.name === ft.base_model)    // exact match
    || modelsData[0]                                    // first entry
    || {};                                              // nothing at all

  /* -------- 2 — Guarantee we have some kind of defaultConfig -------- */
  const fallbackDefaultConfig = {
    modelName: ft.base_model,
    args: [],
    flags: [],
    finetuned_job_id: ft.job_id,
    modelConfig: {
      job_name: `${ft.artifact_name}-deploy`,
      gpu_types: [{ type: "A100", count: 1 }],
    },
  };

  const defaultConfig = {
    // copy whatever the base model already knows …
    ...(base.defaultConfig || {}),
    // …but make sure we add / overwrite the bits required for LoRA
    finetuned_job_id: ft.job_id,
    modelName: base?.defaultConfig?.modelName ?? ft.base_model,
    modelConfig: {
      ...(base.defaultConfig?.modelConfig || {}),
      job_name: `${ft.artifact_name}-deploy`,
    },
  };

  // if base.defaultConfig is missing, use our fallback
  const safeConfig =
    Object.keys(base.defaultConfig || {}).length ? defaultConfig : fallbackDefaultConfig;

  /* -------- 3 — Produce the pseudo-basic model for <ModelCard /> ---- */
  const model = {
    id: ft.job_id,
    name: ft.artifact_name,
    type: `LoRA → ${ft.base_model}`,
    defaultConfig: safeConfig,
  };

  return <ModelCard model={model} isBasic={true} isLast={isLast} />;
}
