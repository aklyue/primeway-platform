// src/docs/Jobs.js

import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Scrollspy from "react-scrollspy";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkCold } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import "./docs.css";

const Jobs = () => {
  // Компонент для отображения блока кода с подсветкой синтаксиса и кнопкой копирования
  const CodeBlock = ({ code, language }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(code);
    };

    return (
      <div className="code-block-container" style={{ position: 'relative', marginBottom: '20px' }}>
        <SyntaxHighlighter
          language={language}
          style={coldarkCold}
          customStyle={{ margin: 0, padding: '8px', borderRadius: '7px' }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
        <Tooltip title="Копировать">
          <IconButton
            size="small"
            onClick={handleCopy}
            className="copy-button"
            style={{ position: 'absolute', top: '5px', right: '5px' }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    );
  };

  // Определение секций для навигации
  const sections = [
    { id: "introduction", label: "Введение" },
    { id: "job-types", label: "Типы задач" },
    { id: "job-configuration", label: "Конфигурация задач" },
    { id: "validation-rules", label: "Правила валидации" },
    { id: "example-configuration", label: "Пример конфигурации" },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:1200px)');

  return (
    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      {/* Левая колонка - основной контент */}
      <Box sx={{ flexGrow: 1, paddingRight: isMobile ? "0" : "20px" }}>
        {/* Заголовок */}
        <h1 style={{ marginBottom: "25px", fontSize: isMobile ? "1.7rem" : "2rem", lineHeight: 1.2 }}>
          Задачи
        </h1>

        {/* Введение */}
        <section id="introduction">
          <h2>Введение</h2>
          <p>
            Задача в PrimeWay представляет собой задание, которое вы хотите выполнить в облаке. Задачи могут использоваться для различных целей, таких как обработка данных, обучение моделей, развертывание веб-сервисов и т.д.
          </p>
          <p>
            Задачи могут быть настроены для независимого выполнения или как часть конвейера, и они могут выполняться с использованием подготовленного Docker-образа или быть собраны из вашего кода проекта.
          </p>
        </section>

        {/* Типы задач */}
        <section id="job-types">
          <h2>Типы задач</h2>
          <p>В PrimeWay существуют два типа задач:</p>
          <ul>
            <li>
              <strong>Run-задачи</strong>: Выполняются один раз и завершаются после завершения. Идеально подходят для задач, таких как обработка данных, пакетные задания или обучение моделей.
            </li>
            <li>
              <strong>Deploy-задачи</strong>: Развёртываются как постоянные сервисы, доступные по сети. Подходят для API, веб-приложений или любых сервисов, требующих непрерывной работы.
            </li>
          </ul>
        </section>

        {/* Конфигурация задач */}
        <section id="job-configuration">
          <h2>Конфигурация задач</h2>
          <p>
            Задачи определяются с помощью конфигурационных файлов (обычно YAML). Конфигурация указывает, как должна выполняться задача, какие ресурсы ей необходимы и какие зависимости или входные данные требуются.
          </p>

          {/* Общие поля */}
          <h3>Общие поля</h3>
          <ul>
            <li><code>docker_image</code> (строка): Базовый Docker-образ для использования в задаче.</li>
            <li><code>job_name</code> (строка): Уникальное имя вашей задачи.</li>
            <li><code>job_type</code> (строка): Либо <code>run</code>, либо <code>deploy</code>.</li>
            <li><code>primeway_api_token</code> (строка): Ваш API-токен PrimeWay.</li>
            <li><code>entry_script</code> (строка): Скрипт для выполнения внутри каталога вашего проекта.</li>
            <li><code>project_dir</code> (строка): Каталог, содержащий файлы вашего проекта.</li>
            <li><code>args</code> (строка): Аргументы для передачи вашему скрипту.</li>
            <li><code>command</code> (строка): Пользовательская команда для выполнения (переопределяет <code>entry_script</code> и <code>args</code>).</li>
            <li><code>memory</code> (целое число): Выделение памяти в ГБ.</li>
            <li><code>disk_space</code> (целое число): Выделение дискового пространства в ГБ.</li>
            <li><code>gpu_types</code> (список): Список требуемых GPU-ресурсов.</li>
            <li><code>cpu_count</code> (целое число): Количество требуемых ядер CPU.</li>
            <li><code>timeout</code> (целое число): Максимальное время выполнения в секундах.</li>
            <li><code>env</code> (список): Переменные окружения для установки.</li>
            <li><code>requirements</code> (список): Python-пакеты для установки.</li>
            <li><code>apt_packages</code> (список): Системные пакеты для установки.</li>
            <li><code>port</code> (целое число): (для deploy-задач) Порт, на котором будет работать ваш сервис.</li>
            <li><code>health_endpoint</code> (строка): (для deploy-задач) Endpoint для проверки здоровья сервиса.</li>
            <li><code>schedule_start</code> (строка): Расписание для запуска задачи.</li>
            <li><code>schedule_end</code> (строка): Расписание для остановки задачи.</li>
            <li><code>idle_timeout</code> (целое число): (для deploy-задач) Время в секундах, после которого deploy-задача должна быть остановлена после последнего запроса.</li>
          </ul>
        </section>

        {/* Правила валидации */}
        <section id="validation-rules">
          <h2>Правила валидации</h2>
          <p>
            При определении конфигурации задачи применяются определённые правила валидации для обеспечения корректности:
          </p>
          <ul>
            <li>
              <strong>Тип задачи</strong>: Параметр <code>job_type</code> должен быть либо <code>run</code>, либо <code>deploy</code>.
            </li>
            <li>
              <strong>Выполнение скрипта</strong>: Если указан <code>project_dir</code>, вы должны указать хотя бы один из <code>entry_script</code>, <code>args</code> или <code>command</code>.
            </li>
            <li>
              <strong>Deploy-задачи</strong>: Для deploy-задач параметры <code>port</code> и <code>health_endpoint</code> являются обязательными.
            </li>
            <li>
              <strong>Конфигурация GPU</strong>: Убедитесь, что указаны правильное название и количество GPU.
            </li>
            <li>
              <strong>Предупреждение о конфликтах</strong>: Если указаны и <code>entry_script</code>, и <code>args</code>, система будет использовать <code>args</code> при выполнении скрипта и выдаст предупреждение.
            </li>
            <li>
              <strong>Требования без проекта</strong>: Если <code>project_dir</code> не указан, но указаны <code>requirements</code>, будет выдано предупреждение, так как требования могут конфликтовать с теми, что уже есть в Docker-образе.
            </li>
          </ul>
        </section>

        {/* Пример конфигурационного файла */}
        <section id="example-configuration" style={{ marginTop: '50px' }}>
          <h2>Пример конфигурации</h2>
          <p>Вот пример файла конфигурации задачи:</p>
          <CodeBlock
            code={`job_name: my-data-processing-job
job_type: run
docker_image: python:3.8-slim
primeway_api_token: YOUR_API_TOKEN
entry_script: main.py
project_dir: ./my_project
requirements:
  - pandas
  - numpy
memory: 4
cpu_count: 2`}
            language="yaml"
          />
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
            marginLeft: '25px',
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

export default Jobs;