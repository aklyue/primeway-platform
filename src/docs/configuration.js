// src/docs/Configuration.js

import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Scrollspy from "react-scrollspy";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkCold } from "react-syntax-highlighter/dist/esm/styles/prism";
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
      <div
        className="code-block-container"
        style={{ position: "relative", marginBottom: "20px" }}
      >
        <SyntaxHighlighter
          language={language}
          style={coldarkCold}
          customStyle={{
            margin: 0,
            padding: "8px",
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
      id: "configuration-options",
      label: "Опции конфигурации",
    },
    {
      id: "example-deploy-job-configuration",
      label: "Пример конфигурации Deploy-задачи",
    },
    { id: "environment-variables", label: "Переменные окружения" },
    { id: "managing-dependencies", label: "Управление зависимостями" },
    { id: "gpu-resources", label: "GPU-ресурсы" },
    { id: "scheduling-and-timeouts", label: "Планирование и таймауты" },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:1200px)");

  return (
    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      {/* Левая колонка - Основной контент */}
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
          Конфигурация
        </h1>

        {/* Секция: Создание задачи */}
        <section id="creating-a-job">
          <h2>Создание задачи</h2>
          <h3>Написание конфигурации</h3>
          <p>
            <strong>Создайте конфигурационный файл:</strong> Напишите YAML-файл
            (например, <code>job_config.yaml</code>) с необходимыми полями.
          </p>
          <CodeBlock
            code={`# Обязательные поля
docker_image: python:3.9-slim

job_name: data-processing-job

job_type: run  # возможные значения: "run" или "deploy"

# Опциональные поля
primeway_api_token: YOUR_PRIMEWAY_API_TOKEN

context: ./app  # путь к вашему проекту

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

          <p>
            <strong>Подготовьте ваш проект:</strong> Убедитесь, что директория,
            указанная в <code>context</code>, содержит все необходимые скрипты и
            файлы.
          </p>
        </section>

        {/* Секция: Запуск задачи */}
        <section id="running-a-job">
          <h2>Запуск задачи</h2>
          <h3>Использование CLI</h3>
          <p>
            Чтобы запустить задачу с помощью CLI <code>primeway</code>,
            используйте следующую команду:
          </p>
          <CodeBlock
            code={`primeway create job --config job_config.yaml`}
            language="bash"
          />

          <p>Ответ при успешном создании:</p>
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
              Пакует и загружает ваш проект, указанный в <code>context</code>,
              если он предоставлен.
            </li>
            <li>Запускает задачу на платформе PrimeWay.</li>
            <li>Предоставляет информацию о статусе выполнения задачи.</li>
          </ol>

          <p>
            Обратите внимание, что задачу нужно создать только один раз. После
            создания вы можете запускать её с разными входными данными. Процесс
            загрузки проекта выполняется только при изменении содержимого
            директории <code>context</code>.
          </p>

          <h3>Опции CLI:</h3>
          <ul>
            <li>
              <code>--config</code>: Путь к вашему файлу конфигурации задачи.
            </li>
            <li>
              <code>--data-file</code>: (Опционально) Путь к вашему файлу
              данных.
            </li>
          </ul>
        </section>

        {/* Секция: Опции конфигурации */}
        <section id="configuration-options">
          <h2>Опции конфигурации</h2>
          <p>
            Ниже перечислены все доступные опции конфигурации с пояснениями:
          </p>
          <ul>
            <li>
              <strong>docker_image</strong> (string, обязательное): Базовый
              Docker-образ для запуска вашей задачи.
            </li>
            <li>
              <strong>job_name</strong> (string, обязательное): Уникальное имя
              для вашей задачи.
            </li>
            <li>
              <strong>job_type</strong> (string, обязательное): Тип задачи.
              Возможные значения: <code>"run"</code> или <code>"deploy"</code>.
            </li>
            <li>
              <strong>primeway_api_token</strong> (string, опционально): Ваш
              API-токен для доступа к платформе PrimeWay.
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
              <strong>port</strong> (int, опционально): Используется для задач
              типа <code>"deploy"</code>. Указывает на порт, который будет
              открыт для внешнего доступа.
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
              <strong>health_endpoint</strong> (string, опционально):
              Используется для задач типа <code>"deploy"</code>. URL-эндпоинт
              для проверки состояния вашего сервиса.
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
        </section>

        {/* Секция: Пример конфигурации Deploy-задачи */}
        <section id="example-deploy-job-configuration">
          <h2>Пример конфигурации Deploy-задачи</h2>
          <CodeBlock
            code={`# Обязательные поля
docker_image: pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

job_name: web-api-service

job_type: deploy

# Опциональные поля
primeway_api_token: YOUR_PRIMEWAY_API_TOKEN

context: ./api_service  # путь к вашему проекту

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

autoscaler_timeout: 300  # Автоматическое масштабирование при бездействии (в секундах)`}
            language="yaml"
          />

          <h3>Примечания:</h3>

          <h4>Особенности Deploy-задач:</h4>
          <ul>
            <li>
              Параметры <code>port</code> и <code>health_endpoint</code>{" "}
              являются обязательными для задач типа <code>"deploy"</code>.
            </li>
            <li>
              Параметр <code>autoscaler_timeout</code> используется для
              автоматического масштабирования сервиса при отсутствии активности.
            </li>
          </ul>

          <h4>Пользовательская команда:</h4>
          <p>
            Параметр <code>command</code> используется для запуска вашего
            веб-приложения. Убедитесь, что ваш сервис слушает на{" "}
            <code>0.0.0.0</code> и порту, указанном в параметре{" "}
            <code>port</code>.
          </p>
        </section>

        {/* Секция: Переменные окружения */}
        <section id="environment-variables">
          <h2>Переменные окружения</h2>
          <p>
            <strong>Назначение:</strong> Храните конфигурационные значения или
            секреты без их жесткого кодирования в вашем приложении.
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
          <p>
            Эти переменные будут доступны внутри вашего контейнера при
            выполнении задачи.
          </p>
        </section>

        {/* Секция: Управление зависимостями */}
        <section id="managing-dependencies">
          <h2>Управление зависимостями</h2>
          <p>
            <strong>Python-пакеты:</strong> Используйте поле{" "}
            <code>requirements</code> для указания пакетов, которые должны быть
            установлены через <code>pip</code>.
          </p>
          <CodeBlock
            code={`requirements:
  - pandas
  - numpy
  - scikit-learn`}
            language="yaml"
          />

          <p>
            <strong>Системные пакеты:</strong> Используйте{" "}
            <code>apt_packages</code> для указания системных зависимостей,
            которые должны быть установлены через <code>apt-get</code>.
          </p>
          <CodeBlock
            code={`apt_packages:
  - libgl1-mesa-glx
  - libglib2.0-0`}
            language="yaml"
          />
        </section>

        {/* Секция: GPU-ресурсы */}
        <section id="gpu-resources">
          <h2>GPU-ресурсы</h2>
          <p>
            Если ваша задача требует использования GPU, укажите необходимые
            ресурсы в поле <code>gpu_types</code>.
          </p>
          <CodeBlock
            code={`gpu_types:
  - type: NVIDIA H100
    count: 8`}
            language="yaml"
          />
          <p>
            Доступные типы GPU могут быть разными. Свяжитесь с поддержкой для
            получения полного списка доступных GPU.
          </p>
        </section>

        {/* Секция: Планирование и таймауты */}
        <section id="scheduling-and-timeouts">
          <h2>Планирование и таймауты</h2>
          <h3>Планирование задач</h3>
          <p>
            Вы можете настроить расписание для периодического запуска задач с
            помощью поля <code>schedule</code>.
          </p>
          <CodeBlock
            code={`schedule:
  workdays:
    - start: "09:00:00"
      end: "17:00:00"
  weekends:
    - start: "10:00:00"
      end: "16:00:00"
  specific_days:
    - day: 5
      windows:
        - start: "00:00:00"
          end: "23:59:59"`}
            language="yaml"
          />
          <p>Формат расписания основан на синтаксисе cron.</p>

          <h3>Таймауты</h3>
          <ul>
            <li>
              <strong>job_timeout</strong>: Максимальное время выполнения задачи
              в секундах.
            </li>
            <li>
              <strong>creation_timeout</strong>: Максимальное время ожидания для
              создания ресурсов.
            </li>
            <li>
              <strong>health_check_timeout</strong>: Время ожидания успешного
              прохождения проверки здоровья для задач типа <code>"deploy"</code>
              .
            </li>
            <li>
              <strong>autoscaler_timeout</strong>: Время бездействия в секундах,
              после которого сервис автоматически масштабируется до нуля.
            </li>
          </ul>
        </section>
      </Box>

      {/* Правая колонка - Навигация Scrollspy */}
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

export default Configuration;
