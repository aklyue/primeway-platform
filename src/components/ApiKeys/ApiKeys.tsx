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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import moment from "moment";
import useApiKeysActions from "../../hooks/useApiKeysActions";
import { Key } from "@mui/icons-material";
import useTokenActions from "../../hooks/useTokenActions";
import { useAppSelector } from "../../store/hooks";

function ApiKeys() {
  const currentOrganization = useAppSelector(
    (state) => state.organization.currentOrganization
  );

  const { generateToken, listTokens, deleteToken } = useTokenActions();

  const {
    handleOpen,
    handleClose,
    handleCopy,
    handleCopyToken,
    handleCreateApiKey,
    handleDeleteApiKey,
    handleMenuClick,
    handleMenuClose,
    loading,
    error,
    newApiKey,
    isCopied,
    tokenName,
    setTokenName,
    creating,
    apiKeys,
    menuItemId,
    anchorEl,
    open,
  } = useApiKeysActions({
    currentOrganization,
    listTokens,
    generateToken,
    deleteToken,
  });

  // Если данные загружаются, отображаем плейсхолдер загрузки на всю страницу
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "calc(100vh - 64px)", // Вы можете скорректировать высоту в зависимости от вашего Layout
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Key />
        <Typography fontSize={"1.25rem"} fontWeight={500} sx={{ ml: 1 }}>
          API-Ключи
        </Typography>
      </Box>

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
        sx={{
          marginTop: "16px",
          color: "white",
          bgcolor: "#597ad3",
          "&:hover": {
            bgcolor: "#7c97de",
          },
        }}
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
        role="dialog"
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
                  gap: "15px",
                  alignItems: "flex-end",
                  marginTop: "16px",
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{ marginTop: "8px" }}
                >
                  {isCopied ? "Скопировано!" : "Скопировать ключ"}
                </Button>

                <Button
                  onClick={handleClose}
                  variant="outlined"
                  color="primary"
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
        {apiKeys.length === 0 ? (
          <Typography>Еще не создано ни одного API ключа</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
            <Table aria-label="api keys table">
              <TableHead
                sx={{
                  "& .MuiTableCell-root": {
                    color: "black",
                    textAlign: "center",
                  },
                }}
              >
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
                        aria-label="Открыть меню действий"
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
                          <ListItemText
                            primaryTypographyProps={{ sx: { color: "red" } }}
                          >
                            Удалить
                          </ListItemText>
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
