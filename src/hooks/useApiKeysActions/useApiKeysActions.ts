import { useEffect, useState } from "react";
import { Organization } from "../../store/slices/authSlice";
import { ApiKey, ListTokensResponse } from "../../types";

interface useApiKeysActionsProps {
  currentOrganization: Organization | null;
  listTokens: (id: string) => Promise<ListTokensResponse["tokens"]>;
  generateToken: (orgId: string, tokenName: string) => Promise<ApiKey>;
  deleteToken: (id: string) => Promise<void>;
}

export const useApiKeysActions = ({
  currentOrganization,
  listTokens,
  generateToken,
  deleteToken,
}: useApiKeysActionsProps) => {
  const [apiKeys, setApiKeys] = useState<ListTokensResponse["tokens"]>([]); // Хранение API ключей
  const [open, setOpen] = useState<boolean>(false); // Состояние модального окна
  const [newApiKey, setNewApiKey] = useState<string | null>(null); // Новый созданный API ключ
  const [isCopied, setIsCopied] = useState<boolean>(false); // Статус копирования
  const [loading, setLoading] = useState<boolean>(true); // Состояние загрузки при получении токенов
  const [creating, setCreating] = useState<boolean>(false); // Состояние загрузки при создании токена
  const [error, setError] = useState<string | null>(null); // Состояние ошибки
  const [tokenName, setTokenName] = useState<string>(""); // Имя для нового токена

  // Состояния для меню действий
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);

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
      if (currentOrganization) {
        const tokens = await listTokens(currentOrganization.id);
        setApiKeys(tokens);
      }
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
      if (currentOrganization) {
        const tokenData = await generateToken(
          currentOrganization.id,
          tokenName.trim()
        );
        setApiKeys((prevKeys) => [...prevKeys, tokenData]);
        setNewApiKey(tokenData.token);
        setTokenName(""); // Сбрасываем имя токена
        // Форма создания ключа скрывается благодаря условному рендерингу
      }
    } catch (err) {
      setError("Не удалось создать API ключ.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApiKey = async (tokenId: string) => {
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
  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    itemId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  const handleCopyToken = (token: string) => {
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
    open,
  };
};
