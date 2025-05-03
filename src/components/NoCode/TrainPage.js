// TrainPage.js
import { useState, useEffect } from "react";
import { api } from "./mockApi";
import { Box, Button, TextField, MenuItem, Typography } from "@mui/material";
import { modelsData } from "../../data/modelsData";
import FineTuneTasksList from "./FineTuneTasksList";
import FineTuneFormModal from "./FineTuneFormModal";

export default function TrainPage() {
  const [datasets, setDatasets] = useState([]);
  const [base, setBase] = useState(modelsData[0]?.name || "");
  const [ds, setDs] = useState("");
  const [params, setParams] = useState('{"lr":1e-5,"epochs":3}');

  const [openRetrain, setOpenRetrain] = useState(false);
  const [rowForRetrain, setRowForRetrain] = useState(null);

  useEffect(() => {
    api.getDatasets().then(setDatasets);
  }, []);

  const handleSubmit = async () => {
    await api.startFineTune({
      baseModel: base,
      datasetId: ds,
      params,
    });
    alert("Fine-tune started (mock). Перейдите во вкладку Deploy.");
  };

  const handleRetrainOpen = (row) => {
    setRowForRetrain(row);
    setOpenRetrain(true);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Train
      </Typography>
      <Box sx={{ maxWidth: "400px" }}>
        <TextField
          select
          fullWidth
          label="Base model"
          sx={{ mb: 2 }}
          value={base}
          onChange={(e) => setBase(e.target.value)}
        >
          {modelsData.map((m) => (
            <MenuItem key={m.name} value={m.name}>
              {m.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Dataset"
          sx={{ mb: 2 }}
          value={ds}
          onChange={(e) => setDs(e.target.value)}
        >
          {datasets.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Params (JSON)"
          sx={{ mb: 2 }}
          value={params}
          onChange={(e) => setParams(e.target.value)}
        />

        <Button
          variant="contained"
          sx={{ color: "white" }}
          disabled={!ds}
          onClick={handleSubmit}
        >
          Start fine-tune
        </Button>
      </Box>

      <FineTuneTasksList mode="train" onRetrain={handleRetrainOpen} />

      <FineTuneFormModal
        open={openRetrain}
        onClose={() => setOpenRetrain(false)}
        datasets={datasets}
        baseModel={rowForRetrain?.name || ""}
        onSuccess={() => {}}
      />
    </Box>
  );
}
