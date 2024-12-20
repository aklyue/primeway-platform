// OrganizationContext.js
import React, { createContext, useState } from 'react';

export const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);

  // Используем моковые данные
  const useMockData = true;

  // Функция для загрузки организаций
  const fetchOrganizations = async () => {
    if (useMockData) {
      // Моковые данные организаций
      const mockOrganizations = [
        { id: 'org-1', name: 'Organization One' },
        { id: 'org-2', name: 'Organization Two' },
      ];
      setOrganizations(mockOrganizations);
      // Устанавливаем первую организацию как текущую по умолчанию
      setCurrentOrganization(mockOrganizations[0]);
    } else {
      // Реальный запрос к бэкенду
      // TODO: Реализуйте реальный запрос к API для получения списка организаций
      // const response = await axios.get('/api/organizations');
      // setOrganizations(response.data);
      // setCurrentOrganization(response.data[0]);
    }
  };

  const createOrganization = async (name) => {
    if (useMockData) {
      // Эмуляция создания организации
      const newOrg = { id: `org-${Date.now()}`, name };
      setOrganizations((prev) => [...prev, newOrg]);
      setCurrentOrganization(newOrg);
    } else {
      // Реальный запрос к бэкенду для создания организации
      // TODO: Реализуйте реальный запрос к API для создания организации
      // const response = await axios.post('/api/organizations', { name });
      // setOrganizations((prev) => [...prev, response.data]);
      // setCurrentOrganization(response.data);
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        setCurrentOrganization,
        fetchOrganizations,
        createOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};