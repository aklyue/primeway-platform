import React, { useEffect, useRef, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const YandexAuth = ({ setAuthenticating }) => {
  const navigate = useNavigate();
  const { login, authToken, loading } = useContext(AuthContext);
  const isInitialized = useRef(false);
  const [loadingButton, setLoadingButton] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (loading) {
      // Если продолжается загрузка, отображаем индикатор загрузки
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh", // Устанавливаем высоту, чтобы центрировать по вертикали
          }}
        >
          <CircularProgress />
        </div>
      );
    }
    if (authToken) {
      // Если пользователь уже авторизован, перенаправляем его
      navigate("/");
    } else {
      if (isInitialized.current) {
        // Если уже инициализировано, ничего не делаем
        return;
      }
      isInitialized.current = true;

      const container = document.getElementById("yandex-auth-container");
      if (!container) {
        console.error("Yandex Auth container element not found");
        return;
      }

      // Загружаем скрипт YaAuthSuggest, если он не загружен
      const loadYaAuthSuggestScript = () => {
        return new Promise((resolve, reject) => {
          if (window.YaAuthSuggest) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.src =
            "https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js";
          script.async = true;
          script.onload = () => {
            resolve();
          };
          script.onerror = () => {
            reject(new Error("Не удалось загрузить скрипт YaAuthSuggest"));
          };
          document.body.appendChild(script);
        });
      };

      loadYaAuthSuggestScript()
        .then(() => {
          if (!window.YaAuthSuggest) {
            console.error("YaAuthSuggest не доступен после загрузки скрипта");
            return;
          }

          // Инициализируем YaAuthSuggest и скрываем индикатор загрузки после инициализации
          window.YaAuthSuggest.init(
            {
              client_id: "3094a8cdff0241eeac709ffdd7585aad",
              response_type: "token",
              redirect_uri: "https://dev.platform.primeway.io/auth/callback",
            },
            "https://dev.platform.primeway.io",
            {
              view: "button",
              parentId: "yandex-auth-container",
              buttonView: "main",
              buttonTheme: "light",
              buttonSize: "m",
              buttonBorderRadius: "20",
              buttonIcon: "yaEng",
            }
          )
            .then(({ handler }) => {
              // Кнопка готова, скрываем индикатор загрузки
              setLoadingButton(false);

              // Вызываем handler
              return handler();
            })
            .then((data) => {
              console.log("Auth data:", data);
              if (data.access_token) {
                setAuthenticating(true);
                fetch("https://dev.api.primeway.io/auth/yandex", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ token: data.access_token }),
                })
                  .then((response) => response.json())
                  .then((userData) => {
                    console.log("Полученные данные пользователя:", userData);
                    const token = userData.jwt_token;
                    const user = userData.user;
                    login(token, user);
                    navigate("/tasks");
                  })
                  .catch((error) => {
                    console.error(
                      "Ошибка получения данных пользователя:",
                      error
                    );
                    setAuthenticating(false);
                  });
              } else {
                console.error("Не удалось получить access_token");
              }
            })
            .catch((error) => {
              if (error.code === "in_progress") {
                console.warn("Инициализация уже выполняется.");
              } else {
                console.error("Ошибка аутентификации:", error);
              }
            });
        })
        .catch((error) => {
          console.error("Не удалось загрузить скрипт YaAuthSuggest:", error);
        });
    }
  }, [authToken]);

  return (
    <div
      style={{
        position: "relative",
        margin: "20px",
        minWidth: isMobile ? "280px" : "430px",
        minHeight: "36px",
        borderRadius: "20px",
      }}
    >
      {/* Контейнер для кнопки YaAuthSuggest */}
      <div id="yandex-auth-container" style={{ width: "100%" }} />

      {/* Индикатор загрузки поверх контейнера */}
      {loadingButton && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default YandexAuth;
