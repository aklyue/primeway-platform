// src/docs/welcome.js
import React from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";

// Импортируем компоненты для подсветки синтаксиса
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkCold } from "react-syntax-highlighter/dist/esm/styles/prism";

const Welcome = () => {
  const jsonCode = `docker_image: vllm/vllm-openai:latest
job_name: deploy_sklearn_model-v
job_type: deploy
command: ["/bin/sh", "-c"]
args: vllm serve t-bank-ai/T-lite-instruct-0.1 --served-model-name T-lite-instruct-0.1 --max_num_batched_tokens 24000
disk_space: 40
port: 8000
volume: /root/.cache/huggingface
autoscaler_timeout: 960
gpu_types:
  - type: A40
    count: 1
env:
  - name: HUGGING_FACE_HUB_TOKEN
    value: hf_UbrilqcpTxfBFamc*********sOIhoiTREbnv
health_endpoint: /health
health_check_timeout: 1500
schedule:
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
          end: "23:59:59"`;

  return (
    <div>
      {/* Заголовок */}
      <h1 style={{ marginBottom: "25px" }}>Добро пожаловать в PrimeWay!</h1>

      {/* Основной блок */}
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        {/* Вступление */}
        <p>
          Добро пожаловать в <strong>PrimeWay</strong> — вашу бессерверную платформу для вычислений на GPU, которая делает запуск кода на удалённых GPU таким простым, как одна команда в CLI и файл конфигурации. Мы предоставляем разработчикам, дата-сайентистам и инженерам машинного обучения доступ к мощным ресурсам GPU без сложности управления инфраструктурой.
        </p>

        {/* Что такое PrimeWay */}
        <h2>Что такое PrimeWay?</h2>
        <p>
          PrimeWay — это облачная платформа, разработанная для упрощения ваших вычислительных рабочих процессов. Независимо от того, обучаете ли вы модели глубокого обучения, обрабатываете большие наборы данных или запускаете сложные симуляции, PrimeWay предоставляет масштабируемые и эффективные GPU-ресурсы в ваше распоряжение.
        </p>

        {/* Ключевые особенности */}
        <h2>Ключевые особенности</h2>
        <ul>
          <li>
            <strong>Простота</strong>: Запускайте ваш код на удалённых GPU с помощью одной команды в CLI и простого конфигурационного файла.
          </li>
          <li>
            <strong>Масштабируемость</strong>: Легко масштабируйте ваши рабочие нагрузки с помощью функции автоматического масштабирования — настраивается через один параметр в вашей конфигурации.
          </li>
          <li>
            <strong>Планирование</strong>: Планируйте задания для запуска в оптимальное время, улучшая использование ресурсов и эффективность рабочего процесса.
          </li>
          <li>
            <strong>Гибкое управление</strong>: Управляйте вашими заданиями через нашу интуитивно понятную веб-платформу или интерфейс командной строки.
          </li>
          <li>
            <strong>Экономичность</strong>: Платите только за то, что используете, с нашей системой на основе кредитов, и оптимизируйте затраты с помощью автоматического масштабирования.
          </li>
          <li>
            <strong>Удобство для разработчиков</strong>: Бесшовная интеграция с вашими существующими инструментами и рабочими процессами.
          </li>
        </ul>

        {/* Изучите документацию */}
        <h2>Изучите документацию</h2>
        <p>Наша подробная документация проведет вас через все аспекты PrimeWay:</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {/* Раздел 1: Быстрый старт */}
          <Link
            to="/docs/quickstart"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box
              sx={{
                padding: "15px",
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
                Начните работать с PrimeWay: узнайте, как развернуть ваше первое приложение и ознакомиться с основными возможностями платформы.
              </p>
            </Box>
          </Link>

          {/* Раздел 2: Задания */}
          <Link
            to="/docs/jobs"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box
              sx={{
                padding: "15px",
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
              <h3>Задания</h3>
              <p>
                Узнайте, как отправлять, мониторить и управлять вашими вычислительными заданиями в PrimeWay.
              </p>
            </Box>
          </Link>

          {/* Раздел 3: CLI */}
          <Link
            to="/docs/cli"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box
              sx={{
                padding: "15px",
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
                Используйте интерфейс командной строки PrimeWay для взаимодействия с платформой прямо из вашего терминала, автоматизируя процессы и интегрируя их в ваш рабочий процесс.
              </p>
            </Box>
          </Link>
        </div>

        {/* Присоединяйтесь к сообществу */}
        <h2 style={{ marginTop: "60px" }}>Присоединяйтесь к сообществу</h2>
        <p>
          Мы больше, чем просто платформа; мы — сообщество новаторов и решателей проблем. Свяжитесь с другими пользователями PrimeWay, чтобы поделиться идеями, задать вопросы и сотрудничать над проектами.
        </p>
        <ul>
          <li>
            <strong>Форумы поддержки</strong>: Посетите наши <a href="https://primeway.example.com/community">сообщества</a>, чтобы общаться с другими пользователями и нашей командой поддержки.
          </li>
          <li>
            <strong>Документация</strong>: Доступ к подробным руководствам и справочникам API в нашей <a href="https://primeway.example.com/docs">документации</a>.
          </li>
          <li>
            <strong>Поддержка клиентов</strong>: Свяжитесь с нами по адресу <a href="mailto:support@primeway.ru">support@primeway.ru</a> для персональной помощи.
          </li>
        </ul>

        {/* Заключение */}
        <h2>Начните использовать мощь GPU уже сегодня!</h2>
        <p>
          С PrimeWay будущее масштабируемых и доступных вычислений на GPU уже здесь. Мы не можем дождаться, чтобы увидеть, что вы создадите.
        </p>

        {/* Приветствие */}
        <p>
          <em>Добро пожаловать на борт!</em>
        </p>
      </div>
    </div>
  );
};

export default Welcome;