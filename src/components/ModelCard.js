import React, { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Modal,
  Box,
} from '@mui/material';
import ConfigureModelForm from './ConfigureModelForm';
import { AuthContext } from '../AuthContext';
import axiosInstance from '../api';
import { OrganizationContext } from './Organization/OrganizationContext';

function ModelCard({ model }) {
  const { authToken } = useContext(AuthContext);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentOrganization } = useContext(OrganizationContext);

  const handleConfigureOpen = () => {
    setIsConfigureOpen(true);
  };

  const handleConfigureClose = () => {
    setIsConfigureOpen(false);
  };

  // Function to handle running a model
  const handleRun = async () => {
    setLoading(true);
    try {
      const { defaultConfig } = model;
      const formData = new FormData();
      formData.append('organization_id', currentOrganization?.id || '');
      formData.append(
        'vllm_config_str',
        JSON.stringify({
          model: defaultConfig.modelName,
          args: defaultConfig.args.reduce(
            (acc, arg) => ({ ...acc, [arg.key]: arg.value }),
            {}
          ),
          flags: defaultConfig.flags.reduce(
            (acc, flag) => ({ ...acc, [flag.key]: flag.value }),
            {}
          ),
        })
      );
      formData.append('config_str', JSON.stringify(defaultConfig.modelConfig));

      await axiosInstance.post('/models/run', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${authToken}`,
        },
      });

      alert(
        'Модель успешно запущена! Вы можете просмотреть ее в разделе "Задачи".'
      );
    } catch (error) {
      console.error(error);
      alert('Произошла ошибка при запуске модели.');
    } finally {
      setLoading(false);
    }
  };

  // If this is the suggestion card, render it accordingly
  if (model.isNewModelCard) {
    return (
      <Box
        sx={{
          flex: '1 1 calc(33.333% - 16px)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 275,
          maxWidth: 400,
        }}
      >
        <Card
          sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h5">Добавить новую модель</Typography>
            <Typography variant="body2">
              Создайте свою собственную модель
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              onClick={handleConfigureOpen}
              variant="contained"
              color="primary"
              sx={{ color: 'white' }}
            >
              Добавить модель
            </Button>
          </CardActions>
        </Card>

        {/* Configure Modal for New Model */}
        <Modal open={isConfigureOpen} onClose={handleConfigureClose}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <ConfigureModelForm
              // No initialConfig for new model
              onClose={handleConfigureClose}
            />
          </Box>
        </Modal>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: '1 1 calc(33.333% - 16px)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 275,
        maxWidth: 400,
      }}
    >
      <Card sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h5">{model.name}</Typography>
          <Typography variant="subtitle1">{model.type}</Typography>
          <Typography variant="body2">{model.description}</Typography>
        </CardContent>
        <CardActions>
          <Button
            onClick={handleRun}
            disabled={loading}
            variant="contained"
            color="primary"
            sx={{ color: 'white' }}
          >
            Запустить
          </Button>
          <Button
            onClick={handleConfigureOpen}
            variant="outlined"
            color="secondary"
          >
            Настроить
          </Button>
        </CardActions>
      </Card>

      {/* Configure Modal for Existing Model */}
      <Modal open={isConfigureOpen} onClose={handleConfigureClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <ConfigureModelForm
            initialConfig={model.defaultConfig}
            onClose={handleConfigureClose}
          />
        </Box>
      </Modal>
    </Box>
  );
}

export default ModelCard;