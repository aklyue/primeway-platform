import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery, // Импортируем Divider
} from "@mui/material";
import { getOrgMembers, addOrgMember, removeOrgMember } from "../../api.js";
import OrganizationEvents from "./OrganizationEvents.js";
import { useSelector } from "react-redux";
import {
  selectCurrentOrganization,
  selectIsCurrentOrgOwner,
} from "../../store/selectors/organizationsSelectors.js";

const OrganizationSettings = () => {
  const currentOrganization = useSelector(selectCurrentOrganization);
  const isCurrentOrgOwner = useSelector(selectIsCurrentOrgOwner);
  const user = useSelector((state) => state.auth.user);

  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Состояния
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [error, setError] = useState(null); // Объединенное состояние ошибок

  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Объединенное состояние загрузки
  const isLoading = isLoadingMembers || isAddingMember || isRemovingMember;

  // Загрузка участников при изменении текущей организации
  useEffect(() => {
    if (currentOrganization) {
      fetchMembers();
    }
  }, [currentOrganization]);

  // Функция для получения участников
  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    setError(null);
    try {
      const response = await getOrgMembers(currentOrganization.id);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
      setError("Ошибка при получении членов организации.");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Функция для добавления нового участника
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    if (!isCurrentOrgOwner) {
      alert("Только владельцы могут добавлять членов.");
      return;
    }
    setIsAddingMember(true);
    setError(null);
    try {
      await addOrgMember(currentOrganization.id, newMemberEmail.trim());
      setNewMemberEmail("");
      fetchMembers(); // Обновляем список участников
    } catch (error) {
      console.error("Error adding member:", error);
      setError("Ошибка при добавлении члена организации.");
    } finally {
      setIsAddingMember(false);
    }
  };

  // Функция для удаления участника
  const handleRemoveMember = async (email) => {
    if (!isCurrentOrgOwner) {
      alert("Только владельцы могут удалять членов.");
      return;
    }
    const confirmed = window.confirm(
      "Вы уверены, что хотите удалить этого члена из организации?"
    );
    if (!confirmed) return;
    setIsRemovingMember(true);
    setError(null);
    try {
      await removeOrgMember(currentOrganization.id, email);
      fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      setError("Ошибка при удалении члена организации.");
    } finally {
      setIsRemovingMember(false);
    }
  };

  if (!currentOrganization) {
    return (
      <Typography variant="h6">
        Пожалуйста, выберите организацию для настройки.
      </Typography>
    );
  }

  // Отображение плейсхолдера загрузки на всю страницу
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "calc(100vh - 64px)", // Скорректируйте, если у вас есть AppBar
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        gap: "35px",
      }}
    >
      {/* Левая сторона - Участники */}
      <Box sx={{ flex: 1, pr: 2, mb: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Участники
        </Typography>

        {/* Сообщение об ошибке */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Форма добавления участника только для владельца организации */}
        {isCurrentOrgOwner && (
          <Box sx={{ display: "flex", mb: 2, alignItems: "center" }}>
            <TextField
              label="Email нового участника"
              variant="outlined"
              size="small"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              sx={{ mr: 2 }}
              disabled={isLoading}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddMember}
              disabled={isLoading}
              sx={{ maxHeight: "40px" }}
            >
              Добавить участника
            </Button>
          </Box>
        )}

        {/* Таблица участников */}
        {members.length === 0 ? (
          <Typography>В организации нет участников.</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ maxWidth: 650, boxShadow: "none" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Аватар</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Роль</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell>
                      <Avatar alt={member.email} src={member.avatar_url} />
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {member.role === "owner" ? "Владелец" : "Участник"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Разделительная черта */}
      <Divider orientation="horizontal" flexItem />

      {/* Правая сторона - События */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          События
        </Typography>

        <OrganizationEvents organizationId={currentOrganization.id} />
      </Box>
    </Box>
  );
};

export default OrganizationSettings;
