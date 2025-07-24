import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../../../api";
import {
  getDatasets,
  uploadDataset,
} from "../../../components/NoCode/api/datasetsApi";
import { useNavigate } from "react-router-dom";
import { Organization } from "../../../store/slices/authSlice";
import { Dataset } from "../../../types";
import { isAxiosError } from "axios";
import { SelectChangeEvent } from "@mui/material";

interface useFineTuningJobCreatePageProps {
  currentOrganization: Organization | null;
}

export const useFineTuningJobCreatePage = ({
  currentOrganization,
}: useFineTuningJobCreatePageProps) => {
  const organizationId = currentOrganization?.id;

  /* ───── dataset state ───── */
  const [datasets, setDatasets] = useState<Dataset[]>([]); // список с бэка
  const [loadingDS, setLoadingDS] = useState<boolean>(false);
  const [datasetOption, setDatasetOption] = useState<string>(""); // 'hf' | dataset_id
  const [hfDatasetId, setHfDatasetId] = useState<string>("");
  const hfMode = datasetOption === "hf";

  /* ───── form state ───── */
  const [selectedGpu, setSelectedGpu] = useState<string>("A100 PCIe");
  const [gpuCount, setGpuCount] = useState<number | string>(1);
  const [baseModel, setBaseModel] = useState<string>("");
  const [artifactName, setArtifactName] = useState<string>("");
  const [maxSeqLen, setMaxSeqLen] = useState<number | string>(8192);
  const [batchSize, setBatchSize] = useState<number | string>(1);
  const [gradAccum, setGradAccum] = useState<number | string>(1);
  const [epochs, setEpochs] = useState<number | string>(5);
  const [learningRate, setLearningRate] = useState<number | string>(2e-4);
  const [weightDecay, setWeightDecay] = useState<number | string>(0);
  const [seed, setSeed] = useState<number | string>(42);
  const [loraR, setLoraR] = useState<number | string>(64);
  const [loraAlpha, setLoraAlpha] = useState<number | string>(64);
  const [loraDropout, setLoraDropout] = useState<number | string>(0.05);
  const [hfToken, setHfToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /* confirm dialog */
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  /* file input ref (для триггера upload) */
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  /* ───── LOAD DATASETS ───── */
  useEffect(() => {
    const fetchDS = async () => {
      try {
        setLoadingDS(true);
        if (currentOrganization && organizationId) {
          const list = await getDatasets(organizationId);
          setDatasets(list);
          if (!datasetOption && list.length)
            setDatasetOption(list[0].dataset_id); // первый по умолчанию
        }
      } finally {
        setLoadingDS(false);
      }
    };
    if (organizationId) fetchDS();
  }, [organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGpuCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(1, Number(e.target.value)); // never below 1
    setGpuCount(v);
  };

  /* ───── UPLOAD DATASET ───── */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (organizationId) {
        await uploadDataset(file, organizationId);
        const list = await getDatasets(organizationId);
        setDatasets(list);
        setDatasetOption(list[0].dataset_id);
        alert("Dataset uploaded");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  /* ───── HANDLERS ───── */
  const handleDatasetChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatasetOption(e.target.value);
  const handleGpuChange = (e: SelectChangeEvent<string>, child: ReactNode) =>
    setSelectedGpu(e.target.value);

  const assembledConfig = useMemo(
    () => ({
      job_name: baseModel,
      gpu_types: [{ type: selectedGpu, count: gpuCount }],
      base_model: baseModel,
      artifact_name: artifactName.trim(),
      custom_dataset: !hfMode,
      dataset_id: hfMode ? hfDatasetId.trim() : datasetOption.trim(),
      disk_space: 30,
      creation_timeout: 600,
      env: [
        { name: "EPOCHS", value: String(epochs) },
        { name: "LR", value: String(learningRate) },
        { name: "MAX_SEQ_LEN", value: String(maxSeqLen) },
        { name: "BATCH_SIZE", value: String(batchSize) },
        { name: "GRADIENT_ACCUMULATION", value: String(gradAccum) },
        { name: "WEIGHT_DECAY", value: String(weightDecay) },
        { name: "SEED", value: String(seed) },
        { name: "LORA_R", value: String(loraR) },
        { name: "LORA_ALPHA", value: String(loraAlpha) },
        { name: "LORA_DROPOUT", value: String(loraDropout) },
        { name: "HF_TOKEN", value: hfToken },
      ],
    }),
    [
      baseModel,
      selectedGpu,
      gpuCount,
      artifactName,
      hfMode,
      hfDatasetId,
      datasetOption,
      epochs,
      learningRate,
      maxSeqLen,
      batchSize,
      gradAccum,
      weightDecay,
      seed,
      loraR,
      loraAlpha,
      loraDropout,
      hfToken,
    ]
  );

  const handleCreate = () => {
    if (!baseModel.trim()) return alert("Укажите базовую модель");
    if (hfMode && !hfDatasetId.trim()) return alert("Укажите HF dataset ID");
    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    setConfirmOpen(false);
    setIsSubmitting(true);
    try {
      if (organizationId) {
        const formData = new FormData();
        formData.append(
          "finetuning_config_str",
          JSON.stringify(assembledConfig)
        );
        formData.append("organization_id", organizationId);
        await axiosInstance.post("/finetuning/run", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Задача дообучения успешно запущена");
        navigate("/fine-tuning");
        // здесь можно сделать редирект, если нужно
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        console.error(err);
        alert("Ошибка запуска: " + (err.response?.data?.detail || err.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    baseModel,
    setBaseModel,
    artifactName,
    setArtifactName,
    datasetOption,
    handleDatasetChange,
    loadingDS,
    fileInputRef,
    handleUpload,
    datasets,
    hfMode,
    hfDatasetId,
    setHfDatasetId,
    selectedGpu,
    handleGpuChange,
    gpuCount,
    handleGpuCountChange,
    maxSeqLen,
    setMaxSeqLen,
    batchSize,
    setBatchSize,
    gradAccum,
    setGradAccum,
    epochs,
    setEpochs,
    learningRate,
    setLearningRate,
    weightDecay,
    setWeightDecay,
    seed,
    setSeed,
    loraR,
    setLoraR,
    loraAlpha,
    setLoraAlpha,
    loraDropout,
    setLoraDropout,
    hfToken,
    setHfToken,
    isSubmitting,
    handleCreate,
    confirmOpen,
    setConfirmOpen,
    assembledConfig,
    handleSubmit,
  };
};
