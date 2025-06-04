import { useEffect, useState } from "react";

export const useApiKeysActions = ({
  currentOrganization,
  listTokens,
  generateToken,
  deleteToken,
}) => {
  const [apiKeys, setApiKeys] = useState([]); // Хранение API ключей
  const [open, setOpen] = useState(false); // Состояние модального окна
  const [newApiKey, setNewApiKey] = useState(null); // Новый созданный API ключ
  const [isCopied, setIsCopied] = useState(false); // Статус копирования
  const [loading, setLoading] = useState(true); // Состояние загрузки при получении токенов
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

  return {
    handleOpen,
    handleClose,
    fetchTokens,
    handleCreateApiKey,
    handleDeleteApiKey,
    handleCopy,
    handleMenuClick,
    handleMenuClose,
    handleCopyToken,
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
    open
  };
};
