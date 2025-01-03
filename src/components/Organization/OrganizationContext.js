import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../AuthContext';

export const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);

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

  const switchOrganization = async (organizationId) => {
    const org = organizations.find(org => org.id === organizationId);
    if (org) {
      setCurrentOrganization(org);
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