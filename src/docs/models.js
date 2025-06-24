import React from "react";
import { Box } from "@mui/material";
import Scrollspy from "react-scrollspy";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import "./docs.css";
import LaunchFromMain from "./images/launch-from-main.png";
import LaunchFromDetails from "./images/launch-from-details.png";
import EnvVars from "./images/env-vars.png"
import MyModels from "./images/my-models.png"

const Models = () => {
  const sections = [
    { id: "overview", label: "Описание" },
    { id: "model-types", label: "Типы моделей" },
    { id: "launching-models", label: "Запуск моделей" },
    { id: "model-parameters", label: "Параметры модели" },
    { id: "env-vars", label: "Переменные среды" },
    { id: "my-models", label: "Мои модели" },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:1200px)");

  return (
    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      <Box sx={{ flexGrow: 1, paddingRight: isMobile ? 0 : "20px" }}>
        <h1
          style={{
            paddingBottom: "25px",
            borderBottom: "1px solid lightgray",
            fontSize: isMobile ? "1.7rem" : "2rem",
            lineHeight: 1.2,
          }}
        >
          Модели
        </h1>

        {/* Обзор */}
        <section id="overview">
          <h2>Описание</h2>
          <p>
            На платформе доступны два типа моделей: базовые и дообученные. Вы
            можете запускать их прямо из интерфейса, настраивать параметры
            запуска, выбирать конфигурацию оборудования и управлять своими
            моделями через интерфейс "Мои модели".
          </p>
        </section>

        {/* Типы моделей */}
        <section id="model-types">
          <h2>Типы моделей</h2>
          <ul>
            <li>
              <strong>Базовые модели</strong> — доступны сразу. Можно запустить
              без дообучения.
            </li>
            <li>
              <strong>Дообученные модели</strong> — создаются на основе ваших
              данных и запускаются отдельно (см. раздел "Дообучение").
            </li>
          </ul>
        </section>

        {/* Запуск моделей */}
        <section id="launching-models">
          <h2>Запуск моделей</h2>
          <p>Запустить базовую модель можно двумя способами:</p>
          <ul>
            <li>С главной страницы, нажав кнопку запуска у нужной модели.</li>
            <img
              src={LaunchFromMain}
              alt="Запуск с главной"
              style={{ maxWidth: "100%", marginTop: 10 }}
            />
            <li>
              С детальной страницы модели, где можно дополнительно настроить
              параметры.
            </li>
            <img
              src={LaunchFromDetails}
              alt="Запуск из деталей"
              style={{ maxWidth: "100%", marginTop: 10 }}
            />
          </ul>
          <p>
            После запуска модель появится в разделе{" "}
            <strong>“Мои модели”</strong>, где будет отображаться её статус и
            информация о запуске.
          </p>
        </section>

        {/* Параметры модели */}
        <section id="model-parameters">
          <h2>Параметры модели</h2>
          <ul>
            <li>
              <strong>Имя модели (Hugging Face)*</strong> — указывается при
              запуске.
            </li>
            <li>
              <strong>Аргументы</strong> — настраиваемые параметры запуска (ключ
              + значение).
            </li>
            <li>
              <strong>Флаги</strong> — булевые переключатели (true/false)
            </li>
            <li>
              <strong>Уникальное имя развертывания</strong>, необходимое для
              запуска модели
            </li>
            <li>
              <strong>Тип GPU</strong> с указанием памяти и общей стоимости
              рублей в час
            </li>
            <li>
              <strong>Количество GPU</strong>, которое вам необходимо
            </li>
            <li>
              <strong>Health Check Timeout</strong> — время ожидания отклика (в
              мс)
            </li>
            <li>
              <strong>Порт</strong>, на котором работает модель
            </li>
            <li>
              <strong>Свободное место</strong> на диске (в GB)
            </li>
            <li>
              <strong>Время ожидания масштабирования</strong> — в секундах
            </li>
            <li>
              <strong>График запуска</strong> — будни, выходные или конкретные
              даты
            </li>
          </ul>
        </section>

        {/* Переменные среды */}
        <section id="env-vars">
          <h2>Переменные среды</h2>
          <ul>
            <li>
              <strong>Имя переменной</strong> — например,{" "}
              <code>HUGGING_FACE_HUB_TOKEN</code>
            </li>
            <li>
              <strong>Значение</strong> — ваш токен доступа к Hugging Face
            </li>
          </ul>
          <img
            src={EnvVars}
            alt="Переменные среды"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>

        {/* Мои модели */}
        <section id="my-models">
          <h2>Мои модели</h2>
          <p>
            Все запущенные модели отображаются в разделе{" "}
            <strong>“Мои модели”</strong>. Здесь можно:
          </p>
          <ul>
            <li>Посмотреть конфигурацию модели</li>
            <li>Проверить статус запуска</li>
            <li>Перейти к логам и результатам</li>
          </ul>
          <img
            src={MyModels}
            alt="Список моделей"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>
      </Box>

      {/* Навигация справа */}
      {!isMobile && (
        <Box
          sx={{
            width: "200px",
            flexShrink: 0,
            position: "sticky",
            top: "40px",
            alignSelf: "flex-start",
            marginLeft: "25px",
          }}
        >
          <Scrollspy
            items={sections.map((section) => section.id)}
            currentClassName="is-current"
            componentTag="div"
            offset={-30}
            rootEl="#main-content"
            className="nav-scrollspy"
          >
            {sections.map((section) => (
              <li
                key={section.id}
                className="nav-item"
                style={{ marginBottom: "15px" }}
              >
                <a
                  href={`#${section.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </Scrollspy>
        </Box>
      )}
    </Box>
  );
};

export default Models;
