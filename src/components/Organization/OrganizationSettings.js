import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress, // Добавлено для индикатора загрузки
  Alert, // Добавлено для отображения ошибок
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useOrganization } from "./OrganizationContext";
import { AuthContext } from "../../AuthContext"; // или откуда ваш AuthContext
import { getOrgMembers, addOrgMember, removeOrgMember } from "../../api.js";

const OrganizationSettings = () => {
  const { currentOrganization, isCurrentOrgOwner } = useOrganization();
  const { user } = useContext(AuthContext);

  // Состояния для членов организации, загрузки и ошибок
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [errorMembers, setErrorMembers] = useState(null);

  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [errorAddMember, setErrorAddMember] = useState(null);

  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [errorRemoveMember, setErrorRemoveMember] = useState(null);

  // Загружаем членов каждый раз при изменении currentOrganization
  useEffect(() => {
    if (currentOrganization) {
      fetchMembers();
    }
  }, [currentOrganization]);

  // Функция для получения членов организации
  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    setErrorMembers(null);
    try {
      const response = await getOrgMembers(currentOrganization.id);
      setMembers(response.data); // Убедитесь, что ваш API возвращает список членов
      
    } catch (error) {
      console.error("Error fetching members:", error);
      setErrorMembers("Ошибка при получении членов организации");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Добавляем нового члена по email
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    if (!isCurrentOrgOwner()) {
      alert("Только владельцы могут добавлять членов.");
      return;
    }
    setIsAddingMember(true);
    setErrorAddMember(null);
    try {
      await addOrgMember(currentOrganization.id, newMemberEmail.trim());
      setNewMemberEmail("");
      fetchMembers(); // Обновляем список членов
    } catch (error) {
      console.error("Error adding member:", error);
      setErrorAddMember("Ошибка при добавлении члена организации");
    } finally {
      setIsAddingMember(false);
    }
  };

  // Удаляем члена по email
  const handleRemoveMember = async (email) => {
    if (!isCurrentOrgOwner()) {
      alert("Только владельцы могут удалять членов.");
      return;
    }
    setIsRemovingMember(true);
    setErrorRemoveMember(null);
    try {
      await removeOrgMember(currentOrganization.id, email);
      fetchMembers(); // Обновляем список членов
    } catch (error) {
      console.error("Error removing member:", error);
      setErrorRemoveMember("Ошибка при удалении члена организации");
    } finally {
      setIsRemovingMember(false);
    }
  };

  if (!currentOrganization) {
    return <Typography>Организация не выбрана.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Настройки Организации
      </Typography>

      {/* Показываем форму добавления члена только если пользователь является владельцем организации */}
      {isCurrentOrgOwner() && (
        <Box sx={{ display: "flex", mb: 2, alignItems: "center" }}>
          <TextField
            label="Email нового участника"
            variant="outlined"
            size="small"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddMember}
            disabled={isAddingMember}
            sx={{maxHeight:'40px'}}
          >
            {isAddingMember ? "Добавление..." : "Добавить участника"}
          </Button>
        </Box>
      )}

      {/* Отображение ошибок при добавлении члена */}
      {errorAddMember && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorAddMember}
        </Alert>
      )}

      {/* Индикатор загрузки при получении списка членов */}
      {isLoadingMembers ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : errorMembers ? (
        <Alert severity="error">{errorMembers}</Alert>
      ) : (
        <List sx={{ maxWidth: 400 }}>
          {members.map((member) => (
            <ListItem key={member.user_id}>
              <ListItemText primary={member.email} />
              {/* Показываем иконку удаления только если:
                   1) Текущий пользователь является владельцем
                   2) Член НЕ является текущим пользователем
                   3) Член НЕ является владельцем
               */}
              {isCurrentOrgOwner() &&
                member.user_id !== user.id &&
                member.role !== "owner" && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveMember(member.email)}
                    disabled={isRemovingMember}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
            </ListItem>
          ))}
        </List>
      )}

      {/* Отображение ошибок при удалении члена */}
      {errorRemoveMember && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorRemoveMember}
        </Alert>
      )}
    </Box>
  );
};

export default OrganizationSettings;
