// src/docs/welcome.js
import React from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Импортируем Scrollspy
import Scrollspy from "react-scrollspy";
import "./docs.css";

const Welcome = () => {
  // Определение секций для навигации
  const sections = [
    { id: "introduction", label: "Вступление" },
    { id: "what-is-primeway", label: "Что такое PrimeWay" },
    { id: "key-features", label: "Ключевые особенности" },
    { id: "explore-documentation", label: "Изучите документацию" },
    { id: "join-community", label: "Присоединяйтесь к сообществу" },
    { id: "get-started", label: "Начните использовать мощь GPU уже сегодня!" },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:1200px)");

  return (
    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      <Box sx={{ flexGrow: 1, paddingRight: isMobile ? "0" : "10px" }}>
        <h1
          style={{
            fontSize: isMobile ? "1.7rem" : "2rem",
            lineHeight: 1.2,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            paddingBottom: "25px",
            borderBottom: "1px solid lightgray"
          }}
        >
          {
            <img
              src="../favicon.svg"
              width={32}
              height={32}
              alt="Logo"
              
            />
          }{" "}
          Добро пожаловать в PrimeWay!
        </h1>
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <section id="introduction">
            <p>
              Добро пожаловать в <strong>PrimeWay</strong> — вашу бессерверную
              платформу для вычислений на GPU, которая делает запуск кода на
              удалённых GPU таким простым, как одна команда в CLI и файл
              конфигурации. Мы предоставляем разработчикам, дата-сайентистам и
              инженерам машинного обучения доступ к мощным ресурсам GPU без
              сложности управления инфраструктурой.
            </p>
          </section>

          <h2 id="what-is-primeway">Что такое PrimeWay?</h2>
          <p>
            PrimeWay — это облачная платформа, разработанная для упрощения ваших
            вычислительных рабочих процессов. Независимо от того, обучаете ли вы
            модели глубокого обучения, обрабатываете большие наборы данных или
            запускаете сложные симуляции, PrimeWay предоставляет масштабируемые
            и эффективные GPU-ресурсы в ваше распоряжение.
          </p>

          <h2 id="key-features">Ключевые особенности</h2>
          <ul>
            <li>
              <strong>Простота</strong>: Запускайте ваш код на удалённых GPU с
              помощью одной команды в CLI и простого конфигурационного файла.
            </li>
            <li>
              <strong>Масштабируемость</strong>: Легко масштабируйте ваши
              рабочие нагрузки с помощью функции автоматического масштабирования
              — настраивается через один параметр в вашей конфигурации.
            </li>
            <li>
              <strong>Планирование</strong>: Планируйте задания для запуска в
              оптимальное время, улучшая использование ресурсов и эффективность
              рабочего процесса.
            </li>
            <li>
              <strong>Гибкое управление</strong>: Управляйте вашими заданиями
              через нашу интуитивно понятную веб-платформу или интерфейс
              командной строки.
            </li>
            <li>
              <strong>Экономичность</strong>: Платите только за то, что
              используете, с нашей системой на основе кредитов, и оптимизируйте
              затраты с помощью автоматического масштабирования.
            </li>
            <li>
              <strong>Удобство для разработчиков</strong>: Бесшовная интеграция
              с вашими существующими инструментами и рабочими процессами.
            </li>
          </ul>

          <h2 id="explore-documentation">Изучите документацию</h2>
          <p>
            Наша подробная документация проведет вас через все аспекты PrimeWay:
          </p>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <Link
              to="/docs/quickstart"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Box
                sx={{
                  padding: "10px 15px",
                  backgroundColor: "#e8eaf6",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxSizing: "border-box",
                  transition: "transform 0.16s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-6px)",
                  },
                }}
              >
                <h3>Быстрый старт</h3>
                <p>
                  Начните работать с PrimeWay: узнайте, как развернуть ваше
                  первое приложение и ознакомиться с основными возможностями
                  платформы.
                </p>
              </Box>
            </Link>

            <Link
              to="/docs/jobs"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Box
                sx={{
                  padding: "10px 15px",
                  backgroundColor: "#e8eaf6",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxSizing: "border-box",
                  transition: "transform 0.16s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-6px)",
                  },
                }}
              >
                <h3>Задачи</h3>
                <p>
                  Узнайте, как отправлять, мониторить и управлять вашими
                  вычислительными заданиями в PrimeWay.
                </p>
              </Box>
            </Link>

            <Link
              to="/docs/cli"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Box
                sx={{
                  padding: "10px 15px",
                  backgroundColor: "#e8eaf6",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxSizing: "border-box",
                  transition: "transform 0.16s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-6px)",
                  },
                }}
              >
                <h3>CLI</h3>
                <p>
                  Используйте интерфейс командной строки PrimeWay для
                  взаимодействия с платформой прямо из вашего терминала,
                  автоматизируя процессы и интегрируя их в ваш рабочий процесс.
                </p>
              </Box>
            </Link>
          </Box>

          <h2 id="get-started">Начните использовать мощь GPU уже сегодня!</h2>
          <p>
            С PrimeWay будущее масштабируемых и доступных вычислений на GPU уже
            здесь. Мы не можем дождаться, чтобы увидеть, что вы создадите.
          </p>

          <p>
            <em>Добро пожаловать на борт!</em>
          </p>
        </div>
      </Box>

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

export default Welcome;
