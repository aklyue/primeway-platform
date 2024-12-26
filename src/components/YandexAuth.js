import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const YandexAuth = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const isInitialized = useRef(false);

  const authToken = localStorage.getItem('auth_token');

  useEffect(() => {
    if (authToken) {
      // Если пользователь уже авторизован, перенаправляем его
      navigate('/running-jobs');
    } else {
      if (isInitialized.current) {
        return;
      }

      const container = document.getElementById('yandex-auth-container');
      if (!container) {
        console.error('Yandex Auth container element not found');
        return;
      }


      if (!window.YaAuthSuggest) {
        console.error('YaAuthSuggest is not loaded');
        return;
      }

      isInitialized.current = true;

      window.YaAuthSuggest.init(
        {
          client_id: '12b9a3c475d8488987bd2efadd1181c6',
          response_type: 'token',
          redirect_uri: 'https://primeway.io/auth/callback',
        },
        'https://primeway.io',
        {
          view: 'button',
          parentId: 'yandex-auth-container',
          buttonView: 'main',
          buttonTheme: 'dark',
          buttonSize: 'm',
          buttonBorderRadius: '20',
          buttonIcon: 'yaEng',
        }
      )
        .then(({ handler }) => handler())
        .then((data) => {
          console.log('Auth data:', data);
          if (data.access_token) {
            fetch('https://api.primeway.io/auth/yandex', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: data.access_token }),
            })
              .then((response) => response.json())
              .then((userData) => {
                const token = userData.jwt_token;
                const user = userData.user;
                login(token, user);
                navigate('/running-jobs');
              })
              .catch((error) => {
                console.error('Error fetching user data:', error);
              });
          }
        })
        .catch((error) => {
          if (error.code === 'in_progress') {
            console.warn('Initialization is already in progress.');
          } else {
            console.error('Auth error:', error);
          }
        });
    }
  }, [authToken, login, navigate]);

  return (
    <div
      id="yandex-auth-container"
      style={{
        margin: '20px',
        minWidth: '450px',
        minHeight: '36px',
      }}
    />
  );
};

export default YandexAuth;