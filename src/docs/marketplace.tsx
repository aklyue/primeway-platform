import React from "react";
import { Box } from "@mui/material";
import Scrollspy from "react-scrollspy";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import "./docs.css";
import JupyterSessions from "./images/jupyter-sessions.png";
import JupyterCreate from "./images/jupyter-create.png";
import TabbyCreate from "./images/tabby-create.png"

const Marketplace = () => {
  const sections = [
    { id: "overview", label: "Краткая информация" },
    { id: "jupyterlab", label: "JupyterLab Sessions" },
    { id: "create-jupyter-session", label: "Создание JupyterLab проекта" },
    { id: "copilot-alt", label: "Copilot Альтернатива" },
    { id: "create-copilot-session", label: "Просмотр сессии Tabby" },
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
          AI Маркетплейс
        </h1>

        {/* Обзор */}
        <section id="overview">
          <h2>Краткая информация</h2>
          <p>
            В разделе AI Маркетплейс вы можете запускать окружения для
            разработки и дообучения:
            <ul>
              <li>
                <strong>JupyterLab Sessions</strong> — стандартное окружение для
                работы с кодом и задачами.
              </li>
              <li>
                <strong>Copilot Альтернатива</strong> — среда на базе TabbyML
                для автодополнения кода и эмбеддингов.
              </li>
            </ul>
          </p>
        </section>

        {/* JupyterLab */}
        <section id="jupyterlab">
          <h2>JupyterLab Sessions</h2>
          <p>
            После перехода в раздел JupyterLab отображается список ваших сессий.
            Изначально он пуст. Каждая сессия представляет собой изолированный
            проект.
          </p>
          <img
            src={JupyterSessions}
            alt="Список JupyterLab сессий"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>

        {/* Создание JupyterLab сессии */}
        <section id="create-jupyter-session">
          <h2>Создание JupyterLab проекта</h2>
          <p>При создании указываются следующие параметры:</p>
          <ul>
            <li>
              <strong>Название задачи</strong>
            </li>
            <li>
              <strong>Тип GPU</strong>
            </li>
            <li>
              <strong>Свободное место на диске (GB)</strong>
            </li>
            <li>
              <strong>Кол-во GPU</strong>
            </li>
          </ul>
          <img
            src={JupyterCreate}
            alt="Форма создания JupyterLab проекта"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
          <p>
            После создания, сессия появляется в списке с возможностью перейти по
            URL.
          </p>
        </section>

        {/* Copilot Альтернатива */}
        <section id="copilot-alt">
          <h2>Copilot Альтернатива</h2>
          <p>
            Copilot Альтернатива использует <strong>TabbyML</strong> под
            капотом. При переходе вы попадаете на форму создания новой сессии.
          </p>
          <p>
            Необходимо указать:
            <ul>
              <li>
                <strong>Название задачи</strong>
              </li>
              <li>
                <strong>Code Gen модель</strong>
              </li>
              <li>
                <strong>Embedding модель</strong>
              </li>
            </ul>
            <p>
              Справа отображены параметры этих моделей, необходимые для
              заполнения. Поля аналогичны обычной настройке моделей (см. раздел{" "}
              <a href="/docs/models">Модели</a>). У Embedding модели по
              умолчанию добавлен аргумент <code>task: embed</code>, который
              нельзя удалить.
            </p>
          </p>
          <img
            src={TabbyCreate}
            alt="Создание проекта Tabby"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>

        {/* Сессия Tabby */}
        <section id="create-copilot-session">
          <h2>Просмотр сессии Tabby</h2>
          <p>
            После создания проекта вы будете перенаправлены на страницу сессии.
            Здесь отображаются все параметры выбранных моделей и текущий статус
            проекта.
          </p>
          {/* <img
            src="/images/tabby-session.png"
            alt="Параметры сессии Tabby"
            style={{ maxWidth: "100%", marginTop: 10 }}
          /> */}
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
                  style={{ textDecoration: "none", color: "inherit" }}
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

export default Marketplace;
