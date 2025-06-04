import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { api } from "../../api/mockApi";
import FineTuneTasksList from "../../components/FineTuneTasksList";
import TrainForm from "../../components/TrainForm";
import CloseIcon from "@mui/icons-material/Close";
import FineTuneFormModal from "../../components/FineTuneFormModal";
import { modelsData } from "../../../../data/modelsData";
import BackArrow from "../../../../UI/BackArrow";

export default function TrainPage({ isMobile }) {
  const [datasets, setDatasets] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);

  useEffect(() => {
    api.getDatasets().then(setDatasets);
    refreshCustomTasks();
  }, []);

  const refreshCustomTasks = () => {
    api.getCustomFineTunes().then(setCustomTasks);
  };

  const [openTrainModal, setOpenTrainModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [baseModel, setBaseModel] = useState("unsloth/gemma-3-4b-it");
  const [datasetName, setDatasetName] = useState("mlabonne/FineTome-100k");
  const [maxSeqLen, setMaxSeqLen] = useState("2048");
  const [batchSize, setBatchSize] = useState("2");
  const [gradAccum, setGradAccum] = useState("4");
  const [epochs, setEpochs] = useState("1");
  const [learningRate, setLearningRate] = useState("0.0002");
  const [weightDecay, setWeightDecay] = useState("0.01");
  const [seed, setSeed] = useState("42");
  const [loraR, setLoraR] = useState("16");
  const [loraAlpha, setLoraAlpha] = useState("16");
  const [loraDropout, setLoraDropout] = useState("0");
  const [hfToken, setHfToken] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const envVars = [
        { name: "MAX_SEQ_LEN", value: maxSeqLen },
        { name: "BATCH_SIZE", value: batchSize },
        { name: "GRADIENT_ACCUMULATION", value: gradAccum },
        { name: "NUM_EPOCHS", value: epochs },
        { name: "LEARNING_RATE", value: learningRate },
        { name: "WEIGHT_DECAY", value: weightDecay },
        { name: "SEED", value: seed },
        { name: "LORA_R", value: loraR },
        { name: "LORA_ALPHA", value: loraAlpha },
        { name: "LORA_DROPOUT", value: loraDropout },
        { name: "HF_TOKEN", value: hfToken },
        { name: "BASE_MODEL", value: baseModel },
        { name: "DATASET_NAME", value: datasetName },
      ];

      const finetuneConfig = {
        job_name: "finetune-" + Date.now(),
        gpu_types: ["A100"],
        base_model: baseModel,
        dataset_name: datasetName,
        disk_space: 10,
        creation_timeout: 600,
        schedule: null,
        env: envVars,
      };

      await api.startFineTune(finetuneConfig);
      await api.startCustomFineTune(finetuneConfig);
      refreshCustomTasks();

      alert("Fine-tune started. Проверьте список задач ниже.");
    } catch (error) {
      console.error("Error starting fine-tune:", error);
    } finally {
      setIsLoading(false);
      setOpenTrainModal(false);
    }
  };

  return (
    <Box sx={{ p: isMobile ? 0 : 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <BackArrow path={"/tasks"} name={"Tasks"} />
        <Box sx={{width: isMobile ? "200px" : "auto", textAlign: "end"}}>
          <Typography variant="h4" sx={{ mb: 1, textAlign: "end" }}>
            {" "}
            Дообучение{" "}
          </Typography>
          <Typography variant="p" sx={{ mb: 4, textAlign: "end", fontSize: isMobile ? "10px !important" : "auto" }}>
            {" "}
            Здесь мы можете отслеживать и создавать задачи дообучения{" "}
          </Typography>
        </Box>
      </Box>

      <Modal open={openTrainModal} onClose={() => setOpenTrainModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 480,
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => setOpenTrainModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TrainForm
            baseModel={baseModel}
            datasetName={datasetName}
            maxSeqLen={maxSeqLen}
            batchSize={batchSize}
            gradAccum={gradAccum}
            epochs={epochs}
            learningRate={learningRate}
            weightDecay={weightDecay}
            seed={seed}
            loraR={loraR}
            loraAlpha={loraAlpha}
            loraDropout={loraDropout}
            hfToken={hfToken}
            isLoading={isLoading}
            setBaseModel={setBaseModel}
            setDatasetName={setDatasetName}
            setMaxSeqLen={setMaxSeqLen}
            setBatchSize={setBatchSize}
            setGradAccum={setGradAccum}
            setEpochs={setEpochs}
            setLearningRate={setLearningRate}
            setWeightDecay={setWeightDecay}
            setSeed={setSeed}
            setLoraR={setLoraR}
            setLoraAlpha={setLoraAlpha}
            setLoraDropout={setLoraDropout}
            setHfToken={setHfToken}
            handleSubmit={handleSubmit}
          />
        </Box>
      </Modal>

      {/* Добавьте список задач ниже */}
      <FineTuneTasksList isMobile={isMobile} />
    </Box>
  );
}
