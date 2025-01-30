// src/docs/Configuration.js

import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Scrollspy from "react-scrollspy";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import "./docs.css";

const Configuration = () => {
  // Компонент для отображения блока кода с подсветкой синтаксиса и кнопкой копирования
  const CodeBlock = ({ code, language }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(code);
    };

    return (
      <div className="code-block-container" style={{ position: "relative", marginBottom: "20px" }}>
        <SyntaxHighlighter
          language={language}
          style={coldarkCold}
          customStyle={{
            margin: 0,
            padding: '8px',
            borderRadius: "7px",
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
        <Tooltip title="Копировать">
          <IconButton
            size="small"
            onClick={handleCopy}
            className="copy-button"
            style={{ position: "absolute", top: "5px", right: "5px" }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    );
  };

  // Секции для навигации
  const sections = [
    { id: "creating-a-job", label: "Создание задачи" },
    { id: "running-a-job", label: "Запуск задачи" },
    {
      id: "example-deploy-job-configuration",
      label: "Пример конфигурации Deploy-задачи",
    },
    {
      id: "using-args-vs-entry_script-vs-command",
      label: "Использование args, entry_script и command",
    },
    { id: "environment-variables", label: "Переменные окружения" },
    { id: "managing-dependencies", label: "Управление зависимостями" },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:1200px)');

  return (
    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      {/* Левая колонка - Основной контент */}
      <Box sx={{ flexGrow: 1, paddingRight: isMobile ? "0" : "20px" }}>
        {/* Заголовок */}
        <h1 style={{ marginBottom: "25px", fontSize: isMobile ? "1.7rem" : "2rem", lineHeight: 1.2 }}>
          Конфигурация
        </h1>

        {/* Секция: Создание задачи */}
        <section id="creating-a-job">
          <h2>Создание задачи</h2>
          <h3>Написание конфигурации</h3>
          <p>
            <strong>Создайте конфигурационный файл:</strong> Напишите YAML-файл (например, <code>job_config.yaml</code>) с необходимыми полями.
          </p>
          <CodeBlock
            code={`docker_image: python:3.9-slim

job_name: data-processing-job

job_type: run

primeway_api_token: YOUR_PRIMEWAY_API_TOKEN

entry_script: main.py

project_dir: ./app

request_input_dir: /custom-data

args: "--input /custom-data/data.csv"

memory: 2

disk_space: 10

cpu_count: 2

gpu_types:

  - type: NVIDIA A40

    count: 1

env:

  - name: ENVIRONMENT

    value: production

requirements:

  - pandas

  - numpy

apt_packages:

  - libpq-dev

timeout: 3600  # 1 час`}
            language="yaml"
          />

          <p>
            <strong>Подготовьте ваш проект:</strong> Убедитесь, что ваш <code>project_dir</code> содержит все необходимые скрипты.
          </p>
        </section>

        {/* Секция: Запуск задачи */}
        <section id="running-a-job">
          <h2>Запуск задачи</h2>
          <h3>Использование CLI</h3>
          <p>
            Чтобы запустить задачу с помощью CLI <code>primeway</code>, используйте следующую команду:
          </p>
          <CodeBlock
            code={`primeway create job --config job_config.yaml`}
            language="bash"
          />

          <p>Ответ:</p>
          <CodeBlock
            code={`{"job_id": "ewkljngp-weglngg-weklgn-wegnkln"}`}
            language="json"
          />

          <p>Запуск задачи:</p>
          <CodeBlock
            code={`primeway run job ewkljngp-weglngg-weklgn-wegnkln --data-file ./local_dir/data.csv`}
            language="bash"
          />

          <p>Эта команда:</p>
          <ol>
            <li>Валидирует вашу конфигурацию.</li>
            <li>
              Пакует и загружает ваш каталог проекта, если указан <code>project_dir</code>.
            </li>
            <li>Запускает задачу на платформе PrimeWay.</li>
            <li>Предоставляет информацию о статусе выполнения задачи.</li>
          </ol>

          <p>
            Как вы видите, задачу нужно создать только один раз, а затем вы можете использовать разные данные для её выполнения. Процесс сборки требуется только на этапе создания.
          </p>

          <h3>Опции CLI:</h3>
          <ul>
            <li>
              <code>--config</code>: Путь к вашему файлу конфигурации задачи.
            </li>
            <li>
              <code>--data-file</code>: (Опционально) Путь к вашему файлу данных.
            </li>
          </ul>
        </section>

        {/* Секция: Пример конфигурации Deploy-задачи */}
        <section id="example-deploy-job-configuration">
          <h2>Пример конфигурации Deploy-задачи</h2>
          <CodeBlock
            code={`docker_image: pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

job_name: web-api-service

job_type: deploy

primeway_api_token: YOUR_PRIMEWAY_API_TOKEN

project_dir: ./api_service

command: "gunicorn app:app --bind 0.0.0.0:8000"

memory: 2

disk_space: 20

cpu_count: 1

gpu_types:

  - type: NVIDIA L40

    count: 1

env:

  - name: ENV

    value: production

requirements:

  - flask

  - gunicorn

apt_packages: []

port: 8000

health_endpoint: "/health"

idle_timeout: 300  # 5 минут`}
            language="yaml"
          />

          <h3>Примечания:</h3>

          <h4>Особенности Deploy-задач:</h4>
          <ul>
            <li>
              Параметры <code>port</code> и <code>health_endpoint</code> являются обязательными.
            </li>
            <li>
              Параметр <code>idle_timeout</code> можно использовать для автоматического масштабирования сервиса при отсутствии активности.
            </li>
          </ul>

          <h4>Пользовательская команда:</h4>
          <p>
            Параметр <code>command</code> используется для запуска приложения с помощью Gunicorn.
          </p>
        </section>

        {/* Секция: Использование args, entry_script и command */}
        <section id="using-args-vs-entry_script-vs-command">
          <h3>Использование args, entry_script и command</h3>
          <p>
            <code>entry_script</code>: Укажите скрипт для выполнения внутри каталога вашего проекта.
          </p>
          <p>
            <code>args</code>: Передайте аргументы скрипту, указанному в <code>entry_script</code>.
          </p>
          <p>
            <code>command</code>: Переопределяет <code>entry_script</code> и <code>args</code> для запуска пользовательской команды. Используйте это, когда вам нужен полный контроль над командой выполнения.
          </p>
          <p>
            <strong>Рекомендация:</strong> Используйте <code>args</code> для передачи параметров вашему скрипту для гибкости и повторного использования.
          </p>

          <h4>Пример:</h4>

          <p>Использование <code>entry_script</code> и <code>args</code>:</p>
          <CodeBlock
            code={`entry_script: train.py

args: --epochs 10 --batch_size 32`}
            language="yaml"
          />

          <p>Использование <code>command</code>:</p>
          <CodeBlock
            code={`command: python train.py --epochs 10 --batch_size 32`}
            language="bash"
          />
        </section>

        {/* Секция: Переменные окружения */}
        <section id="environment-variables">
          <h3>Переменные окружения</h3>
          <p>
            <strong>Назначение:</strong> Храните конфигурационные значения или секреты без их жесткого кодирования.
          </p>
          <p>
            <strong>Определение:</strong>
          </p>
          <CodeBlock
            code={`env:

  - name: API_KEY

    value: "your_api_key"

  - name: DEBUG

    value: "false"`}
            language="yaml"
          />
        </section>

        {/* Секция: Управление зависимостями */}
        <section id="managing-dependencies">
          <h3>Управление зависимостями</h3>
          <p>
            <strong>Python-пакеты:</strong> Используйте поле <code>requirements</code> для указания пакетов.
          </p>
          <CodeBlock
            code={`requirements:

  - pandas

  - numpy

  - scikit-learn`}
            language="yaml"
          />

          <p>
            <strong>Системные пакеты:</strong> Используйте <code>apt_packages</code> для системных зависимостей.
          </p>
          <CodeBlock
            code={`apt_packages:

  - libgl1-mesa-glx

  - libglib2.0-0`}
            language="yaml"
          />

          <p>
            <strong>GPU-ресурсы:</strong> Укажите GPU, если они необходимы.
          </p>
          <CodeBlock
            code={`gpu_types:

  - name: NVIDIA H100

    count: 8`}
            language="yaml"
          />
        </section>
      </Box>

      {/* Правая колонка - Навигация Scrollspy */}
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
            style={{ listStyleType: "none", paddingLeft: '15px' }}
          >
            {sections.map((section) => (
              <li key={section.id} className="nav-item" style={{ marginBottom: "15px" }}>
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

export default Configuration;