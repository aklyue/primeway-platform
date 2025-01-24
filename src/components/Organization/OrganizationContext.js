// src/components/Organization/OrganizationContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../AuthContext';
import axiosInstance from "../../api"; // Импортируем axiosInstance для выполнения запросов

export const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);

  // Новые состояния для баланса кошелька и состояния загрузки
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState(null);

  // Update organizations whenever user data changes
  useEffect(() => {
    if (user && user.organizations) {
      setOrganizations(user.organizations);
      // Set current organization to the first one if none is selected
      if (!currentOrganization && user.organizations.length > 0) {
        setCurrentOrganization(user.organizations[0]);
      }
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
    }
  }, [user]);

  // Функция для загрузки баланса кошелька
  const fetchWalletBalance = () => {
    if (user && user.billing_account_id) {
      setWalletLoading(true);
      setWalletError(null);

      axiosInstance
        .get(`/billing/${user.billing_account_id}/balance`)
        .then((response) => {
          setWalletBalance(response.data.balance);
        })
        .catch((error) => {
          console.error("Ошибка при получении баланса кошелька:", error);
          setWalletError("Ошибка при загрузке баланса.");
          setWalletBalance(null);
        })
        .finally(() => {
          setWalletLoading(false);
        });
    }
  };

  // Загружаем баланс кошелька при изменении текущей организации
  useEffect(() => {
    fetchWalletBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization]);

  const switchOrganization = async (organizationId) => {
    const org = organizations.find(org => org.id === organizationId);
    if (org) {
      setCurrentOrganization(org);
      // Вызываем обновление баланса кошелька при смене организации
      fetchWalletBalance();
      // You might want to update some API headers or perform other actions here
      return org;
    }
    return null;
  };

  // Get user's role in current organization
  const getCurrentUserRole = () => {
    return currentOrganization?.role || null;
  };

  // Check if user is owner of current organization
  const isCurrentOrgOwner = () => {
    return currentOrganization?.role === 'owner';
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        setCurrentOrganization,
        switchOrganization,
        getCurrentUserRole,
        isCurrentOrgOwner,
        walletBalance,       
        walletLoading,       
        walletError,        
        fetchWalletBalance,  
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

// Custom hook for using organization context
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};