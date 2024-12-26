// SubscriptionToCaptcha.jsx

import React, { useCallback } from 'react';
import { SmartCaptcha } from '@yandex/smart-captcha';
import { Modal, Box, Typography } from '@mui/material';

export const SubscriptionToCaptcha = ({ onSuccess, open, onClose }) => {

  const handleChallengeVisible = useCallback(() => {
    // Опционально: можно добавить логику при отображении капчи
  }, []);

  const handleChallengeHidden = useCallback(() => {
    // Опционально: можно добавить логику при скрытии капчи
  }, []);

  const handleSuccess = useCallback(
    (token) => {
      // if (onSuccess) {
      //   onSuccess();
      // }
  
      // Убираем вызов onClose(), чтобы модальное окно не закрывалось
      // if (onClose) {
      //   onClose();
      // }
    },
    [onSuccess]
  );

  const handleTokenExpired = useCallback(() => {
    // Обработка истечения времени токена
  }, []);

  const handleNetworkError = useCallback(() => {
    // Обработка сетевой ошибки
  }, []);

  const handleJavaScriptError = useCallback((error) => {
    // Обработка ошибки JavaScript
    console.error(error);
  }, []);

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        // Предотвращаем закрытие модалки при клике вне окна или нажатии Escape
        if (reason && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
          return;
        }
        // Разрешаем закрытие в остальных случаях
        if (onClose) {
          onClose();
        }
      }}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      BackdropProps={{
        style: { backgroundColor: '#202123' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: '#1e1e1e',
          color: '#fff',
          outline:'none',
          borderRadius: '10px',
          backgroundColor: '#202123',
          p: 4,
        }}
      >
        <Typography
          id="modal-title"
          variant="h5"
          component="h2"
          sx={{ textAlign: 'center', color:'white' }}
        >
          Подтвердите, что вы не робот
        </Typography>
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <SmartCaptcha
          test
            sitekey="ysc1_gqgKVnVKv2a4UJDjpKdVoIEJ7A13CfJRYEJsBwma03ab7254" // Замените на ваш реальный sitekey
            onChallengeVisible={handleChallengeVisible}
            onChallengeHidden={handleChallengeHidden}
            onNetworkError={handleNetworkError}
            onJavascriptError={handleJavaScriptError}
            onSuccess={handleSuccess}
            onTokenExpired={handleTokenExpired}
          />
        </Box>
      </Box>
    </Modal>
  );
};