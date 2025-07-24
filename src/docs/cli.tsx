// src/docs/CLI.js

import React from "react";
import { Box } from "@mui/material";
import Scrollspy from "react-scrollspy";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CodeBlock from "../UI/CodeBlock";
import "./docs.css";

const CLI = () => {
  // Определение секций для навигации
  const sections = [
    { id: "overview", label: "Обзор" },
    { id: "installation-and-setup", label: "Установка и настройка" },
    { id: "authentication", label: "Аутентификация" },
    { id: "command-structure", label: "Структура команд" },
    { id: "command-reference", label: "Справочник команд" },
    { id: "job-commands", label: "Команды задач" },
    { id: "pipeline-commands", label: "Команды конвейеров" },
    {
      id: "using-the-cli-interactively",
      label: "Интерактивное использование CLI",
    },
  ];

  const isMobile = useMediaQuery("(max-width:1200px)");

  return (
    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      <Box sx={{ flexGrow: 1, paddingRight: isMobile ? "0" : "20px" }}>
        <h1
          style={{
            paddingBottom: "25px",
            borderBottom: "1px solid lightgray",
            fontSize: isMobile ? "1.7rem" : "2rem",
            lineHeight: 1.2,
          }}
        >
          CLI
        </h1>

        {/* Обзор */}
        <section id="overview">
          <h2>Обзор</h2>
          <p>
            CLI PrimeWay предоставляет полный набор команд для управления
            задачами и конвейерами, позволяя вам взаимодействовать с платформой
            прямо из вашего терминала.
          </p>
        </section>

        {/* Установка и настройка */}
        <section id="installation-and-setup">
          <h2>Установка и настройка</h2>
          <p>Установите CLI PrimeWay:</p>
          <CodeBlock code={`pip install primeway`} language="bash" />
          <p>Проверьте установку:</p>
          <CodeBlock code={`primeway --version`} language="bash" />
        </section>

        {/* Аутентификация */}
        <section id="authentication">
          <h2>Аутентификация</h2>
          <p>
            Установите ваш API-токен PrimeWay в качестве переменной окружения:
          </p>
          <CodeBlock
            code={`export PRIMEWAY_API_TOKEN=your_api_token_here`}
            language="bash"
          />
          <p>Альтернативно, вы можете передать токен в конфигурации:</p>
          <CodeBlock
            code={`primeway_api_token: primeway-nlOm2e3vwv_rjakw286mzg`}
            language="yaml"
          />
        </section>

        {/* Структура команд */}
        <section id="command-structure">
          <h2>Структура команд</h2>
          <p>Команды CLI организованы в группы на основе функциональности:</p>
          <ul>
            <li>
              <code>primeway create</code>: Создание новых задач или конвейеров.
            </li>
            <li>
              <code>primeway run</code>: Выполнение задач или конвейеров.
            </li>
            <li>
              <code>primeway job</code>: Управление отдельными задачами.
            </li>
            <li>
              <code>primeway stop</code>: Остановка выполняющихся задач.
            </li>
          </ul>
        </section>

        {/* Справочник команд */}
        <section id="command-reference">
          <h2>Справочник команд</h2>

          {/* Команды задач */}
          <section id="job-commands">
            <h3>Команды задач</h3>
            <p>
              <strong>Создать задачу:</strong>
            </p>
            <CodeBlock
              code={`primeway create job --config job_config.yaml`}
              language="bash"
            />
            <p>
              <strong>Запустить задачу:</strong>
            </p>
            <CodeBlock code={`primeway run job JOB_ID`} language="bash" />
            <p>
              <strong>Список задач:</strong>
            </p>
            <CodeBlock code={`primeway job list`} language="bash" />
            <p>
              <strong>Получить детали задачи:</strong>
            </p>
            <CodeBlock code={`primeway job info JOB_ID`} language="bash" />
            <p>
              <strong>Получить логи задачи:</strong>
            </p>
            <CodeBlock code={`primeway job logs JOB_ID`} language="bash" />
            <p>
              <strong>Получить артефакты задачи:</strong>
            </p>
            <CodeBlock
              code={`primeway job artifacts JOB_ID --output-dir ./artifacts`}
              language="bash"
            />
            <p>
              <strong>Остановить задачу:</strong>
            </p>
            <CodeBlock
              code={`primeway stop job --job-id JOB_ID`}
              language="bash"
            />
          </section>
        </section>

        {/* Интерактивное использование CLI */}
        <section id="using-the-cli-interactively">
          <h2>Интерактивное использование CLI</h2>
          <p>
            Некоторые команды могут запрашивать дополнительный ввод, если
            информации недостаточно. Используйте флаг <code>--help</code> с
            любой командой, чтобы получить подробную информацию о использовании.
          </p>
          <p>
            <strong>Пример:</strong>
          </p>
          <CodeBlock code={`primeway run job --help`} language="bash" />
        </section>
      </Box>

      {/* Правая колонка - навигация Scrollspy */}
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

export default CLI;
