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

  // Функция для получения данных пользователя
  const fetchUserData = async () => {
    setLoading(true); // Начало загрузки
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        const response = await axiosInstance.get("/auth/me");
        // console.log("fetchUserData response", response);
        setUser(response.data);
        setAuthToken(token);
        setIsLoggedIn(true);
      } else {
        // const mockUser = {
        //   id: 1,
        //   username: "DevUser",
        //   avatar_url: "https://via.placeholder.com/150",
        //   email: "dev@example.com",
        //   organizations: [{id: "123"}]
        // };
        // setUser(mockUser);
        // setIsLoggedIn(true);
        // setAuthToken("dev_token");

        setUser(null);
        setAuthToken(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
      // Если ошибка (например, токен недействителен), очищаем данные
      localStorage.removeItem("auth_token");
      setUser(null);
      setAuthToken(null);
      setIsLoggedIn(false);
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
  const login = (token, userData) => {
    setAuthToken(token);
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("auth_token", token);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setAuthToken(null);
    setIsLoggedIn(false);
    setOpenCaptchaModal(false);
    setOpenRegistrationModal(false);
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
        setLoading, // Передаём состояние загрузки
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
