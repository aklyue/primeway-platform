import { ReactNode, useEffect, useRef, useState } from "react";
import axiosInstance from "../../../api";
import {
  getDatasets,
  uploadDataset,
} from "../../../components/NoCode/api/datasetsApi";
import { Organization } from "../../../store/slices/authSlice";
import axios from "axios";
import { Dataset } from "../../../types";
import { SelectChangeEvent } from "@mui/material";

interface useFineTuneFormModalProps {
  open: boolean;
  onClose: () => void;
  currentOrganization: Organization | null;
}

export const useFineTuneFormModal = ({
  open,
  onClose,
  currentOrganization,
}: useFineTuneFormModalProps) => {
  const organizationId = currentOrganization?.id ?? "";

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loadingDS, setLoadingDS] = useState<boolean>(false);

  const [datasetOption, setDatasetOption] = useState<"hf" | string>("");
  const [hfDatasetId, setHfDatasetId] = useState<string>("");

  const [selectedGpu, setSelectedGpu] = useState<string>("A100 PCIe");
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const hfMode = datasetOption === "hf";
  /* file input ref (for reliable click) */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* load datasets each open */
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingDS(true);
        const list = await getDatasets(organizationId);
        setDatasets(list);
        if (!hfMode && !datasetOption && list.length) {
          setDatasetOption(list[0].dataset_id); // 🡐 use dataset_id
        }
      } finally {
        setLoadingDS(false);
      }
    })();
  }, [open, organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* upload dataset */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadDataset(file, organizationId);
      const list = await getDatasets(organizationId);
      setDatasets(list);
      setDatasetOption(list[0].dataset_id); // 🡐 use dataset_id
      alert("Dataset uploaded");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  /* handlers */
  const handleDatasetChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatasetOption(e.target.value);
  const handleGpuChange = (e: SelectChangeEvent<string>, child: ReactNode) =>
    setSelectedGpu(e.target.value);

  const handleSubmit = async () => {
    if (!baseModel.trim()) return alert("Базовая модель не указана");
    if (!artifactName.trim())
      return alert("Укажите название артефакта / адаптера");
    if (hfMode && !hfDatasetId.trim())
      return alert("Укажите HF dataset ID или выберите локальный датасет");

    const config = {
      job_name: baseModel,
      gpu_types: [{ type: selectedGpu, count: 1 }],
      base_model: baseModel,
      artifact_name: artifactName.trim(),
      custom_dataset: !hfMode,
      dataset_id: hfMode ? hfDatasetId.trim() : datasetOption.trim(), // ✔
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
    };

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("finetuning_config_str", JSON.stringify(config));
      formData.append("organization_id", organizationId);

      await axiosInstance.post("/finetuning/run", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Задача дообучения успешно запущена");
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        console.error(err);
        alert("Ошибка запуска: " + (err.response?.data?.detail || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };
  return {
    selectedGpu,
    handleGpuChange,
    datasetOption,
    handleDatasetChange,
    loadingDS,
    fileInputRef,
    handleUpload,
    datasets,
    hfMode,
    hfDatasetId,
    setHfDatasetId,
    baseModel,
    setBaseModel,
    artifactName,
    setArtifactName,
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
    handleSubmit,
    isLoading,
  };
};
