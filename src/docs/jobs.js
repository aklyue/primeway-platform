// src/docs/Jobs.js

import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
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
      <div
        className="code-block-container"
        style={{ position: "relative", marginBottom: "20px" }}
      >
        <SyntaxHighlighter
          language={language}
          style={coldarkCold}
          customStyle={{ margin: 0, padding: "8px", borderRadius: "7px" }}
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

  // Определение секций для навигации
  const sections = [
    { id: "introduction", label: "Введение" },
    { id: "job-types", label: "Типы задач" },
    { id: "job-configuration", label: "Конфигурация задач" },
    { id: "validation-rules", label: "Правила валидации" },
    { id: "example-run-job", label: "Пример Run-задачи" },
    { id: "example-deploy-job", label: "Пример Deploy-задачи" },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:1200px)");

  return (
    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      {/* Левая колонка - основной контент */}
      <Box sx={{ flexGrow: 1, paddingRight: isMobile ? "0" : "20px" }}>
        {/* Заголовок */}
        <h1
          style={{
            paddingBottom: "25px",
            borderBottom: "1px solid lightgray",
            fontSize: isMobile ? "1.7rem" : "2rem",
            lineHeight: 1.2,
          }}
        >
          Задачи
        </h1>

        {/* Введение */}
        <section id="introduction">
          <h2>Введение</h2>
          <p>
            Задача в PrimeWay представляет собой единицу работы, которую вы
            хотите выполнить в облаке. Задачи могут использоваться для различных
            целей, таких как обработка данных, обучение моделей, развертывание
            веб-сервисов и многое другое.
          </p>
          <p>
            Вы можете настроить задачи для независимого выполнения или как часть
            конвейера. Они могут быть запущены с использованием выбранного вами
            Docker-образа и вашего кода проекта.
          </p>
        </section>

        {/* Типы задач */}
        <section id="job-types">
          <h2>Типы задач</h2>
          <p>В PrimeWay доступны два типа задач:</p>
          <ul>
            <li>
              <strong>Run-задачи</strong>: Выполняются один раз и завершаются
              после завершения. Идеально подходят для задач обработки данных,
              пакетных заданий или обучения моделей.
            </li>
            <li>
              <strong>Deploy-задачи</strong>: Развертываются как постоянные
              сервисы, доступные по сети. Подходят для API, веб-приложений или
              любых сервисов, требующих непрерывной работы.
            </li>
          </ul>
        </section>

        {/* Конфигурация задач */}
        <section id="job-configuration">
          <h2>Конфигурация задач</h2>
          <p>
            Задачи определяются с помощью конфигурационных файлов в формате
            YAML. Конфигурация указывает, как должна выполняться задача, какие
            ресурсы ей необходимы, и какие зависимости или входные данные
            требуются.
          </p>

          {/* Общие поля */}
          <h3>Общие поля конфигурации</h3>
          <p>Ниже перечислены общие поля конфигурации для задач:</p>
          <ul>
            <li>
              <strong>docker_image</strong> (string, обязательное): Базовый
              Docker-образ для запуска вашей задачи.
            </li>
            <li>
              <strong>job_name</strong> (string, обязательное): Уникальное имя
              вашей задачи.
            </li>
            <li>
              <strong>job_type</strong> (string, обязательное): Тип задачи.
              Возможные значения: <code>"run"</code> или <code>"deploy"</code>.
            </li>
            <li>
              <strong>primeway_api_token</strong> (string, опционально): Ваш
              API-токен PrimeWay.
            </li>
            <li>
              <strong>context</strong> (string, опционально): Путь к директории
              с вашим проектом. Если указан, содержимое директории будет
              загружено и использовано при выполнении задачи.
            </li>
            <li>
              <strong>command</strong> (string или list, опционально): Команда
              для запуска внутри контейнера. Если не указана, используется
              команда по умолчанию из Docker-образа.
            </li>
            <li>
              <strong>args</strong> (string или list, опционально): Аргументы
              для команды. Используется вместе с <code>command</code>.
            </li>
            <li>
              <strong>disk_space</strong> (int, опционально): Требуемое дисковое
              пространство в гигабайтах.
            </li>
            <li>
              <strong>gpu_types</strong> (list, опционально): Список GPU,
              необходимых для задачи. Каждый элемент содержит <code>type</code>{" "}
              и <code>count</code>.
            </li>
            <li>
              <strong>job_timeout</strong> (int, опционально): Таймаут
              выполнения задачи в секундах.
            </li>
            <li>
              <strong>request_input_dir</strong> (string, опционально):
              Директория внутри контейнера, куда будут смонтированы ваши входные
              данные.
            </li>
            <li>
              <strong>env</strong> (list, опционально): Список переменных
              окружения для вашей задачи. Каждый элемент имеет <code>name</code>{" "}
              и <code>value</code>.
            </li>
            <li>
              <strong>requirements</strong> (list, опционально): Список
              Python-пакетов для установки через <code>pip</code>.
            </li>
            <li>
              <strong>apt_packages</strong> (list, опционально): Список
              системных пакетов для установки через <code>apt-get</code>.
            </li>
            <li>
              <strong>schedule</strong> (object, опционально): Планировщик для
              периодического запуска задач. Поддерживает параметры cron.
            </li>
            <li>
              <strong>autoscaler_timeout</strong> (int, опционально): Время
              бездействия в секундах, после которого сервис автоматически
              масштабируется до нуля.
            </li>
          </ul>

          {/* Поля для Deploy-задач */}
          <h3>Дополнительные поля для Deploy-задач</h3>
          <ul>
            <li>
              <strong>port</strong> (int, обязательное для deploy): Порт,
              который будет открыт для внешнего доступа.
            </li>
            <li>
              <strong>health_endpoint</strong> (string, обязательное для
              deploy): URL-эндпоинт для проверки состояния вашего сервиса.
            </li>
            <li>
              <strong>health_check_timeout</strong> (int, опционально): Время
              ожидания успешного прохождения проверки здоровья.
            </li>
          </ul>
        </section>

        {/* Правила валидации */}
        <section id="validation-rules">
          <h2>Правила валидации</h2>
          <p>
            При определении конфигурации задачи применяются определённые правила
            валидации для обеспечения корректности:
          </p>
          <ul>
            <li>
              <strong>Тип задачи</strong>: Параметр <code>job_type</code> должен
              быть либо <code>"run"</code>, либо <code>"deploy"</code>. Любое
              другое значение недопустимо.
            </li>
            <li>
              <strong>Команда и аргументы</strong>: Если указан{" "}
              <code>context</code>, вы должны указать хотя бы один из параметров{" "}
              <code>command</code> или <code>args</code>. Если ни один из них не
              указан, будет вызвана ошибка.
            </li>
            <li>
              <strong>Deploy-задачи</strong>: Для deploy-задач параметры{" "}
              <code>port</code> и <code>health_endpoint</code> являются
              обязательными. Если они не указаны, будет вызвана ошибка.
            </li>
            <li>
              <strong>GPU-ресурсы</strong>: Убедитесь, что указаны правильные
              типы и количество GPU в параметре <code>gpu_types</code>.
            </li>
            <li>
              <strong>Переменные окружения</strong>: Если вы используете
              переменные окружения в параметре <code>env</code>, убедитесь, что
              они правильно определены с полями <code>name</code> и{" "}
              <code>value</code>.
            </li>
          </ul>
        </section>

        {/* Пример Run-задачи */}
        <section id="example-run-job">
          <h2>Пример Run-задачи</h2>
          <p>
            Ниже приведен пример конфигурационного файла для задачи типа{" "}
            <code>"run"</code>:
          </p>
          <CodeBlock
            code={`# Обязательные поля
docker_image: python:3.9-slim

job_name: data-processing-job

job_type: run

# Опциональные поля
primeway_api_token: YOUR_PRIMEWAY_API_TOKEN

context: ./app

command: "python main.py"

args: "--input /custom-data/data.csv"

disk_space: 10  # в ГБ

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

request_input_dir: /custom-data

job_timeout: 3600  # Таймаут задачи в секундах`}
            language="yaml"
          />
        </section>

        {/* Пример Deploy-задачи */}
        <section id="example-deploy-job">
          <h2>Пример Deploy-задачи</h2>
          <p>
            Ниже приведен пример конфигурационного файла для задачи типа{" "}
            <code>"deploy"</code>:
          </p>
          <CodeBlock
            code={`# Обязательные поля
docker_image: pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

job_name: web-api-service

job_type: deploy

# Опциональные поля
primeway_api_token: YOUR_PRIMEWAY_API_TOKEN

context: ./api_service

command: "gunicorn app:app --bind 0.0.0.0:8000"

disk_space: 20  # в ГБ

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

autoscaler_timeout: 300  # Автоматическое масштабирование при бездействии`}
            language="yaml"
          />
          <p>
            <strong>Примечания:</strong>
          </p>
          <ul>
            <li>
              Убедитесь, что ваше приложение слушает на <code>0.0.0.0</code> и
              на порту, указанном в параметре <code>port</code>.
            </li>
            <li>
              Параметры <code>port</code> и <code>health_endpoint</code>{" "}
              обязательны для задач типа <code>"deploy"</code>.
            </li>
            <li>
              Параметр <code>autoscaler_timeout</code> позволяет автоматически
              масштабировать сервис при отсутствии активности.
            </li>
          </ul>
        </section>
      </Box>

      {/* Правая колонка - навигация Scrollspy */}
      {!isMobile && (
        <Box
          sx={{
            width: "250px",
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
            style={{ listStyleType: "none", paddingLeft: "15px" }}
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
