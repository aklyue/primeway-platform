import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "./api.js";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // Состояния
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [openCaptchaModal, setOpenCaptchaModal] = useState(false);
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);
  const [loading, setLoading] = useState(true); // Добавлено состояние загрузки

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/auth/me");
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response && error.response.status === 401) {
        logout();
      } else {
        // Handle other errors differently if needed
      }
    } finally {
      setTimeout(() => {
          setLoading(false);
        }, 500);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Функции входа и выхода
  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    axiosInstance.post("/auth/logout")
      .then(() => {
        setUser(null);
        setIsLoggedIn(false);
        setOpenCaptchaModal(false);
        setOpenRegistrationModal(false);
      })
      .catch(error => {
        console.error("Error logging out:", error);
        // Even if logout fails, we still clear the local state
        setUser(null);
        setIsLoggedIn(false);
        setOpenCaptchaModal(false);
        setOpenRegistrationModal(false);
      });
  };
  
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        authToken,
        openCaptchaModal,
        setOpenCaptchaModal,
        openRegistrationModal,
        setOpenRegistrationModal,
        loading,
        setLoading // Передаём состояние загрузки
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
