// ApiKeys.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { OrganizationContext } from "./Organization/OrganizationContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import moment from "moment";
import axiosInstance from "../api";

// Функции для работы с API (generateToken, listTokens, deleteToken)
export const generateToken = async (organizationId, name) => {
  try {
    const response = await axiosInstance.post("/generate-token", {
      organization_id: organizationId,
      name,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

export const listTokens = async (organizationId) => {
  try {
    const response = await axiosInstance.get("/list-tokens", {
      params: { organization_id: organizationId },
    });
    return response.data.tokens;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    throw error;
  }
};

export const deleteToken = async (tokenId) => {
  try {
    await axiosInstance.delete(`/tokens/${tokenId}`);
  } catch (error) {
    console.error("Error deleting token:", error);
    throw error;
  }
};

function ApiKeys() {
  const { currentOrganization } = useContext(OrganizationContext);
  const [apiKeys, setApiKeys] = useState([]); // Хранение API ключей
  const [open, setOpen] = useState(false); // Состояние модального окна
  const [newApiKey, setNewApiKey] = useState(null); // Новый созданный API ключ
  const [isCopied, setIsCopied] = useState(false); // Статус копирования
  const [loading, setLoading] = useState(false); // Состояние загрузки при получении токенов
  const [creating, setCreating] = useState(false); // Состояние загрузки при создании токена
  const [error, setError] = useState(null); // Состояние ошибки
  const [tokenName, setTokenName] = useState(""); // Имя для нового токена

  // Состояния для меню действий
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewApiKey(null);
    setIsCopied(false);
    setError(null);
    setTokenName("");
  };

  // Получение токенов при монтировании компонента или изменении organizationId
  useEffect(() => {
    if (currentOrganization && currentOrganization.id) {
      fetchTokens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization]);

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const tokens = await listTokens(currentOrganization.id);
      setApiKeys(tokens);
    } catch (err) {
      setError("Не удалось получить API ключи.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    setCreating(true);
    setError(null);
    try {
      const tokenData = await generateToken(
        currentOrganization.id,
        tokenName.trim()
      );
      setApiKeys((prevKeys) => [...prevKeys, tokenData]);
      setNewApiKey(tokenData.token);
      setTokenName(""); // Сбрасываем имя токена
      // Форма создания ключа скрывается благодаря условному рендерингу
    } catch (err) {
      setError("Не удалось создать API ключ.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApiKey = async (tokenId) => {
    const confirmed = window.confirm(
      "Вы уверены, что хотите удалить этот API ключ?"
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      await deleteToken(tokenId);
      setApiKeys((prevKeys) => prevKeys.filter((key) => key.id !== tokenId));
    } catch (err) {
      setError("Не удалось удалить API ключ.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
      setIsCopied(true);
    }
  };

  // Функции для управления меню действий
  const handleMenuClick = (event, itemId) => {
    setAnchorEl(event.currentTarget);
    setMenuItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  const handleCopyToken = (token) => {
    navigator.clipboard.writeText(token);
    setIsCopied(true);
    // Здесь вы можете добавить уведомление о том, что токен скопирован
    handleMenuClose();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        API-Ключи
      </Typography>

      {/* Описание */}
      <Typography variant="body1" gutterBottom>
        API-ключи позволяют вам проверять подлинность запросов к нашему API. Вы
        можете создать новый API-ключ и управлять существующими. Пожалуйста,
        обратите внимание, что секретный ключ будет показан только один раз
        после его создания. Храните его в безопасности!
      </Typography>

      {/* Кнопка "Создать новый API ключ" */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpen}
        sx={{ marginTop: "16px" }}
      >
        Создать новый API-Ключ
      </Button>

      {/* Сообщение об ошибке */}
      {error && (
        <Typography variant="body2" color="error" sx={{ marginTop: "16px" }}>
          {error}
        </Typography>
      )}

      {/* Модальное окно для создания нового API ключа */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="create-api-key-modal-title"
        aria-describedby="create-api-key-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography
            id="create-api-key-modal-title"
            variant="h6"
            component="h2"
          >
            {newApiKey ? "API ключ создан" : "Создать новый API ключ"}
          </Typography>

          {/* Условный рендеринг содержимого модального окна */}
          {newApiKey ? (
            // Если ключ создан, отображаем информацию о нем
            <Box sx={{ marginTop: "16px" }}>
              <Typography variant="body1">Ваш новый API ключ:</Typography>
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: "background.default",
                  padding: "8px",
                  wordBreak: "break-all",
                }}
              >
                {newApiKey}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems:'center',
                  marginTop: "16px",
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{ marginTop: "8px" }}
                >
                  {isCopied ? "Скопировано!" : "Скопировать ключ"}
                </Button>

                <Button
                  onClick={handleClose}
                  variant="contained"
                  color="secondary"
                >
                  Закрыть
                </Button>
              </Box>
            </Box>
          ) : (
            // Если ключ не создан, отображаем форму создания ключа
            <>
              <Box sx={{ marginTop: "16px" }}>
                <Typography variant="body1">
                  Введите имя для вашего API-ключа (необязательно):
                </Typography>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "8px",
                    marginBottom: "16px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "15px",
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCreateApiKey}
                  disabled={creating}
                  sx={{ marginTop: "16px" }}
                >
                  {creating ? <CircularProgress size={24} /> : "Создать ключ"}
                </Button>
                <Button onClick={handleClose} variant="outlined">
                  Отменить
                </Button>
              </Box>
            </>
          )}

          {/* Отображение ошибок при создании ключа */}
          {error && (
            <Typography
              variant="body2"
              color="error"
              sx={{ marginTop: "16px" }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </Modal>

      {/* Таблица API ключей */}
      <Box sx={{ marginTop: "32px" }}>
        <Typography variant="h6" gutterBottom>
          Ваши API ключи
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : apiKeys.length === 0 ? (
          <Typography>Еще не создано ни одного API ключа</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table aria-label="api keys table">
              <TableHead sx={{ "& .MuiTableCell-root": { color: "black" } }}>
                <TableRow>
                  <TableCell>Имя</TableCell>
                  <TableCell>Токен</TableCell>
                  <TableCell>Создан</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  "& .MuiTableCell-root": {
                    color: "#6e6e80",
                    textAlign: "center",
                  },
                }}
              >
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.name || "Безымянный ключ"}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {key.masked_token}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {moment(key.created_at).format("YYYY-MM-DD HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(event) => handleMenuClick(event, key.id)}
                        aria-controls={
                          menuItemId === key.id ? "action-menu" : undefined
                        }
                        aria-haspopup="true"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      {/* Меню действий */}
                      <Menu
                        id="action-menu"
                        anchorEl={anchorEl}
                        open={menuItemId === key.id}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                      >
                        <MenuItem
                          onClick={() => handleCopyToken(key.masked_token)}
                        >
                          <ListItemIcon>
                            <ContentCopyIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Скопировать токен</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleDeleteApiKey(key.id)}>
                          <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Удалить</ListItemText>
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}

// Стили для модального окна
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

export default ApiKeys;
