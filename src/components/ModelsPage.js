import React from 'react';
import { Box, Typography } from '@mui/material';
import ModelCard from './ModelCard';
import { modelsData } from '../data/modelsData';

function ModelsPage() {
  // Include an extra item for the suggestion card
  const cards = [...modelsData, { isNewModelCard: true }];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Доступные Модели
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {cards.map((model, index) => (
          <ModelCard key={model.id || index} model={model} />
        ))}
      </Box>
    </Box>
  );
}

export default ModelsPage;