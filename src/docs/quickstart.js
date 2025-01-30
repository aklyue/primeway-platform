// src/docs/quickstart.js
import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkCold } from "react-syntax-highlighter/dist/esm/styles/prism";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// Импорт Scrollspy и стилей
import Scrollspy from "react-scrollspy";
import "./docs.css"; // Убедитесь, что у вас есть соответствующие стили

// Импортируем useTheme и useMediaQuery для адаптивности
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const Quickstart = () => {
  // Компонент для отображения блока кода с кнопкой копирования
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
        <Tooltip title="Скопировать">
          <IconButton
            size="small"
            onClick={handleCopy}
            className="copy-button"
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              fontSize: "1.1rem",
              color: "#333333",
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    );
  };

  // Определение секций для навигации
  const sections = [
    { id: "key-concepts", label: "Ключевые концепции" },
    { id: "step-1", label: "Шаг 1: Посетите дашборд платформы" },
    { id: "step-2", label: "Шаг 2: Сгенерируйте Секретный-ключ" },
    { id: "step-3", label: "Шаг 3: Приобретите кредиты" },
    { id: "step-4", label: "Шаг 4: Установите CLI PrimeWay" },
    { id: "step-5", label: "Шаг 5: Настройте ваш API-токен" },
    { id: "step-6", label: "Шаг 6: Подготовьте ваше приложение" },
    { id: "step-7", label: "Шаг 7: Создайте файл конфигурации" },
    { id: "step-8", label: "Шаг 8: Создайте задачу в PrimeWay" },
    { id: "step-9", label: "Шаг 9: Запустите вашу задачу" },
    { id: "step-10", label: "Шаг 10: Мониторинг вашей задачи" },
    { id: "step-11", label: "Шаг 11: Получение результатов задачи" },
    {
      id: "step-12",
      label: "Шаг 12: Повторный запуск задачи с новыми данными",
    },
    { id: "step-13", label: "Шаг 13: Изучите дополнительные возможности" },
    { id: "tips", label: "Советы и лучшие практики" },
    { id: "troubleshooting", label: "Устранение проблем" },
    { id: "support", label: "Поддержка и сообщество" },
    { id: "additional-notes", label: "Дополнительные примечания" },
  ];

  // Используем тему и медиазапрос для адаптивности
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:1200px)");

  return (
    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      {/* Левая колонка - основной контент */}
      <Box sx={{ flexGrow: 1, paddingRight: isMobile ? "0" : "10px" }}>
        {/* Заголовок */}
        <h1
          style={{
            marginBottom: "25px",
            fontSize: isMobile ? "1.7rem" : "2rem",
            lineHeight: 1.2,
          }}
        >
          Руководство по началу работы
        </h1>

        {/* Ключевые концепции */}
        <h2 id="key-concepts">Ключевые концепции</h2>
        <p>
          <strong>Задача (Job)</strong> — единица работы, которая выполняет
          определённую функцию. Задачи могут быть двух типов:
        </p>
        <ul>
          <li>
            <strong>Run</strong>: Задачи, которые выполняются один раз и
            завершаются после выполнения. Идеально подходят для дообучения
            моделей, анализа данных или любых вычислительных задач. Эти задачи
            можно запускать множество раз, например, когда вы получаете новый
            набор данных, и запускаете дообучение модели на нем.
          </li>
          <li>
            <strong>Deploy</strong>: Задачи, которые разворачиваются как
            постоянные API сервисы. Они продолжают работать и могут обслуживать
            запросы в реальном времени, как например, деплой LLM модели с
            помощью vllm.
          </li>
        </ul>

        {/* Шаг 1 */}
        <h2 id="step-1">Шаг 1: Посетите дашборд платформы</h2>
        <p>
          <strong>Стартовый грант:</strong> Вы получите стартовые кредиты на
          балансе для первых тестов, чтобы помочь вам начать работу.
        </p>

        {/* Шаг 2 */}
        <h2 id="step-2">Шаг 2: Сгенерируйте Секретный-ключ</h2>
        <p>
          <strong>Доступ к секретным-ключам:</strong> Перейдите в раздел
          Секретные ключи.
        </p>
        <p>
          <strong>Сгенерируйте Секретный-ключ:</strong> Нажмите на создать новый
          Секретный Ключ.
        </p>
        <p
          style={{
            padding: "15px 5px",
            borderRadius: "10px",
            backgroundColor: "rgba(249, 115, 22, .08)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <ErrorOutlineIcon />
          <em>Примечание:</em> Держите ваш Секретный-ключ в безопасности; он
          используется для аутентификации команд CLI.
        </p>

        {/* Шаг 3 */}
        <h2 id="step-3">Шаг 3: Приобретите кредиты</h2>
        <div
          style={{
            padding: "15px 5px",
            borderRadius: "10px",
            backgroundColor: "rgba(249, 115, 22, .08)",
            display: "flex",
            alignItems: "center",
            fontSize: "16px",
            gap: "5px",
          }}
        >
          <ErrorOutlineIcon />
          <strong>Примечание</strong>: если вы только начинаете работу, у вас
          есть грантовые кредиты
        </div>
        <p>
          <strong>Перейдите в раздел платежей:</strong> Зайдите в свой кошелек.
        </p>
        <p>
          <strong>Добавьте кредиты:</strong> Введите нужное количество средств
          для пополнения исходя из ваших нужд.
        </p>
        <p>
          <strong>Оплата:</strong> Завершите процесс оплаты с помощью TBank.
        </p>
        <p>
          <strong>Баланс кредитов:</strong> Обновленный баланс будет
          отображаться на вашей панели управления.
        </p>

        {/* Шаг 4 */}
        <h2 id="step-4">Шаг 4: Установите CLI PrimeWay</h2>
        <p>
          Установите CLI PrimeWay через <code>pip</code>, чтобы
          взаимодействовать с платформой непосредственно из терминала.
        </p>
        <CodeBlock code={`pip install primeway`} language="bash" />

        {/* Шаг 5 */}
        <h2 id="step-5">Шаг 5: Настройте ваш API-токен</h2>
        <p>
          Для аутентификации CLI-команд необходимо предоставить ваш API-токен.
          Есть несколько способов это сделать:
        </p>
        <h3>Вариант 1: Используйте файл .env</h3>
        <p>
          <strong>Создайте файл .env:</strong> В вашем проекте создайте файл с
          именем <code>.env</code>.
        </p>
        <p>
          <strong>Добавьте ваш API-токен:</strong>
        </p>
        <CodeBlock code={`PRIMEWAY_API_TOKEN=ВАШ_API_КЛЮЧ`} language="bash" />
        <p>
          Замените <code>ВАШ_API_КЛЮЧ</code> на сгенерированный вами ранее
          API-ключ.
        </p>
        <h3>Вариант 2: Установите переменную окружения в терминале</h3>
        <p>
          Установите переменную окружения в вашей терминальной сессии перед
          запуском команд PrimeWay.
        </p>
        <p>
          <strong>Для macOS/Linux:</strong>
        </p>
        <CodeBlock
          code={`export PRIMEWAY_API_TOKEN=ВАШ_API_КЛЮЧ`}
          language="bash"
        />
        <p>
          <strong>Для Windows Command Prompt:</strong>
        </p>
        <CodeBlock
          code={`set PRIMEWAY_API_TOKEN=ВАШ_API_КЛЮЧ`}
          language="bash"
        />
        <p>
          <strong>Для Windows PowerShell:</strong>
        </p>
        <CodeBlock
          code={`$env:PRIMEWAY_API_TOKEN="ВАШ_API_КЛЮЧ"`}
          language="powershell"
        />
        <h3>Вариант 3: Укажите в файле конфигурации</h3>
        <p>
          Добавьте API-токен непосредственно в ваш файл конфигурации под ключом{" "}
          <code>primeway_api_token</code>:
        </p>
        <CodeBlock code={`primeway_api_token: ВАШ_API_КЛЮЧ`} language="yaml" />
        <p
          style={{
            padding: "15px 5px",
            borderRadius: "10px",
            backgroundColor: "rgba(249, 115, 22, .08)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <ErrorOutlineIcon />
          <div>
            <em>Примечание по безопасности:</em> Включение API-токена в файле
            конфигурации может быть небезопасным, если вы делитесь файлом.
            Используйте этот способ с осторожностью.
          </div>
        </p>

        {/* Шаг 6 */}
        <h2 id="step-6">Шаг 6: Подготовьте ваше приложение</h2>
        <p>
          Убедитесь, что код вашего приложения находится в вашей рабочей
          директории.
        </p>
        <ul>
          <li>
            <strong>Код приложения:</strong> Ваши файлы кода (например,{" "}
            <code>train.py</code>).
          </li>
        </ul>
        <p>
          Вам не нужно предоставлять <code>Dockerfile</code>; PrimeWay
          позаботится о контейнеризации на стороне сервера.
        </p>

        {/* Шаг 7 */}
        <h2 id="step-7">Шаг 7: Создайте файл конфигурации</h2>
        <p>
          Создайте YAML-файл конфигурации (например,{" "}
          <code>job_config.yaml</code>), в котором определите параметры вашей
          задачи, ресурсы и опции.
        </p>
        <h3>Пример файла конфигурации для обучающей задачи</h3>
        <CodeBlock
          code={`primeway_api_token: ВАШ_API_КЛЮЧ  # Включите эту строку, если не используете \`.env\` файл или переменную окружения

docker_image: python:3.10-slim
job_name: train_sklearn_model
job_type: run
context: .  # Директория с вашим кодом
command: ["python", "train.py"]
request_input_dir: /custom-data
disk_space: 25
gpu_types:
  - type: RTX 2000 Ada
    count: 1
requirements:
  - numpy
  - joblib
  - scikit-learn
  - pandas
ignore_patterns:
  - '*.pyc'
  - __pycache__
  - venv
  - build
  - primeway
  - '*.egg-info'`}
          language="yaml"
        />
        <p>
          <strong>Объяснение ключевых параметров:</strong>
        </p>
        <ul>
          <li>
            <code>primeway_api_token</code>: Ваш API-ключ (включайте только,
            если не используете <code>.env</code> или переменную окружения).
          </li>
          <li>
            <code>docker_image</code>: Базовый образ Docker; PrimeWay
            позаботится об остальном.
          </li>
          <li>
            <code>job_name</code>: Уникальное имя для вашей задачи.
          </li>
          <li>
            <code>job_type</code>: Используйте <code>run</code> для одноразовых
            задач или <code>deploy</code> для постоянных сервисов.
          </li>
          <li>
            <code>context</code>: Путь к вашему коду (например, <code>.</code>{" "}
            для текущей директории - относительно файла конфигурации).
          </li>
          <li>
            <code>command</code>: Команда, которую необходимо выполнить внутри
            контейнера.
          </li>
          <li>
            <code>request_input_dir</code>: Директория внутри контейнера, куда
            будут помещены входные данные.
          </li>
          <li>
            <code>disk_space</code>: Объём дискового пространства (в ГБ).
          </li>
          <li>
            <code>gpu_types</code>: Список типов GPU и их количество.
          </li>
          <li>
            <code>requirements</code>: Список Python-пакетов, необходимых вашему
            приложению.
          </li>
          <li>
            <code>ignore_patterns</code>: Шаблоны файлов, которые нужно
            исключить при загрузке.
          </li>
        </ul>

        {/* Шаг 8 */}
        <h2 id="step-8">Шаг 8: Создайте задачу в PrimeWay</h2>
        <p>
          Используйте CLI PrimeWay для создания задачи на основе вашего файла
          конфигурации.
        </p>
        <CodeBlock
          code={`primeway create job --config job_config.yaml`}
          language="bash"
        />
        <p
          style={{
            padding: "15px 5px",
            borderRadius: "10px",
            backgroundColor: "rgba(249, 115, 22, .08)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <ErrorOutlineIcon />
          <em>Примечание:</em> Замените <code>job_config.yaml</code> на путь к
          вашему файлу конфигурации, если он находится в другом месте.
        </p>
        <p>
          <strong>Вывод:</strong> Команда выдаст <code>JOB_ID</code>, который вы
          будете использовать для запуска задачи.
        </p>

        {/* Шаг 9 */}
        <h2 id="step-9">Шаг 9: Запустите вашу задачу</h2>
        <p>
          После создания задачи вы можете запускать её всякий раз, когда
          потребуется, возможно, с новыми данными.
        </p>
        <h3>Запуск задачи</h3>
        <CodeBlock
          code={`primeway run job JOB_ID --data-file путь/к/вашим/данным.csv`}
          language="bash"
        />
        <p>
          <code>JOB_ID</code>: ID созданной вами задачи на предыдущем шаге.
        </p>
        <p>
          Вы можете найти <code>JOB_ID</code> в выводе команды{" "}
          <code>create job</code> или, перечислив ваши задачи с помощью:
        </p>
        <CodeBlock code={`primeway list jobs`} language="bash" />
        <p>
          <code>--data-file</code>: Путь к файлу входных данных, который вы
          хотите использовать в обучающей задаче.
        </p>
        <h3>Пример:</h3>
        <CodeBlock
          code={`primeway run job 4543df97-2051-493e-ba0a-bd25f23d2b83 --data-file work-files/synthetic_dataset.csv`}
          language="bash"
        />
        <p>
          Эта команда запустит задачу с указанным файлом данных. Вы можете
          выполнять эту команду каждый раз, когда нужно переобучить модель с
          новыми данными.
        </p>

        {/* Шаг 10 */}
        <h2 id="step-10">Шаг 10: Мониторинг вашей задачи</h2>
        <p>
          <strong>Используя CLI:</strong>
        </p>
        <p>Просмотрите логи:</p>
        <CodeBlock
          code={`primeway job logs --job-exectution-id JOB_EXECUTION_ID`}
          language="bash"
        />
        <p>
          <code>JOB_EXECUTION_ID</code>: ID конкретного запуска задачи, который
          вы получите при выполнении <code>primeway run job</code>.
        </p>
        <p>
          <strong>Используя веб-платформу:</strong>
        </p>
        <ul>
          <li>
            <strong>Войдите в аккаунт:</strong> Авторизуйтесь в своем аккаунте
            PrimeWay.
          </li>
          <li>
            <strong>Перейдите в раздел задач:</strong> Зайдите в раздел Jobs,
            чтобы увидеть все ваши задачи.
          </li>
          <li>
            <strong>Детали:</strong> Нажмите на задачу, чтобы просмотреть
            детали, логи и статус.
          </li>
        </ul>

        {/* Шаг 11 */}
        <h2 id="step-11">Шаг 11: Получение результатов задачи</h2>
        <p>
          После завершения задачи вы можете получить выходные файлы (например,
          обученные модели).
        </p>
        <p>Используйте следующую команду для загрузки результатов:</p>
        <CodeBlock
          code={`primeway jobs artifacts JOB_RUN_ID --output-dir output_directory`}
          language="bash"
        />
        <p>
          <code>JOB_RUN_ID</code>: ID конкретного запуска задачи.
        </p>
        <p>
          <code>--output-dir output_directory/</code>: Директория, куда вы
          хотите сохранить выходные файлы.
        </p>
        <h3>Пример:</h3>
        <CodeBlock
          code={`primeway jobs artifacts 0dfbd793-7614-4710-b774-ce5a6e0feda3 --output-dir ./outputs/`}
          language="bash"
        />

        {/* Шаг 12 */}
        <h2 id="step-12">Шаг 12: Повторный запуск задачи с новыми данными</h2>
        <p>
          Чтобы переобучить модель с новыми данными, просто запустите задачу
          снова с новым файлом данных:
        </p>
        <CodeBlock
          code={`primeway run job JOB_ID --data-file путь/к/новым_данным.csv`}
          language="bash"
        />

        {/* Шаг 13 */}
        <h2 id="step-13">Шаг 13: Изучите дополнительные возможности</h2>
        <p>
          Теперь, когда вы создали и запустили свою первую задачу, исследуйте
          дополнительные возможности:
        </p>
        <ul>
          <li>
            <strong>Управление задачами:</strong> Узнайте о продвинутом
            управлении задачами в руководстве по задачам.
          </li>
          <li>
            <strong>Планирование:</strong> Оптимизируйте рабочие процессы с
            помощью руководства по планированию.
          </li>
          <li>
            <strong>Автомасштабирование:</strong> Подробно настройте
            автомасштабирование в руководстве по автомасштабированию.
          </li>
          <li>
            <strong>Конфигурация:</strong> Более подробно изучьте варианты
            конфигурации в руководстве по конфигурации.
          </li>
          <li>
            <strong>Команды CLI:</strong> Ознакомьтесь со всеми доступными
            командами в справочнике по CLI.
          </li>
        </ul>

        {/* Советы и лучшие практики */}
        <h2 id="tips">Советы и лучшие практики</h2>
        <ul>
          <li>
            <strong>Используйте описательные имена задач:</strong> Это поможет
            легче управлять и идентифицировать задачи.
          </li>
          <li>
            <strong>Защищайте конфиденциальную информацию:</strong> Избегайте
            жёсткого кодирования чувствительных данных; используйте{" "}
            <code>env</code> параметр.
          </li>
          <li>
            <strong>Следите за использованием ресурсов:</strong> Обращайте
            внимание на баланс кредитов и потребление ресурсов.
          </li>
          <li>
            <strong>Повторное использование задач:</strong> Создайте задачу один
            раз и запускайте её несколько раз с разными данными по мере
            необходимости.
          </li>
        </ul>

        {/* Устранение проблем */}
        <h2 id="troubleshooting">Устранение проблем</h2>
        <ul>
          <li>
            <strong>Ошибки аутентификации:</strong> Убедитесь, что ваш API-ключ
            правильно настроен через <code>.env</code> файл, переменную
            окружения или в файле конфигурации.
          </li>
          <li>
            <strong>Проблемы при создании задачи:</strong> Проверьте ваш файл
            конфигурации на наличие ошибок.
          </li>
          <li>
            <strong>Сбои задачи:</strong> Проверьте логи на наличие сообщений об
            ошибках и скорректируйте код приложения или конфигурацию.
          </li>
          <li>
            <strong>Проблемы с выделением ресурсов:</strong> Убедитесь, что
            запрошенные типы и количество GPU доступны.
          </li>
        </ul>

        {/* Поддержка и сообщество */}
        <h2 id="support">Поддержка и сообщество</h2>
        <ul>
          <li>
            <strong>Форумы поддержки:</strong> Присоединяйтесь к обсуждениям на
            сообществе PrimeWay.
          </li>
          <li>
            <strong>Документация:</strong> Доступ к подробным руководствам и
            API-референсам в нашей документации.
          </li>
          <li>
            <strong>Поддержка клиентов:</strong> Напишите нам на
            support@primeway.ru для персональной помощи.
          </li>
        </ul>
        <p>
          Следуя этому руководству по быстрому старту, вы сможете использовать
          мощные ресурсы GPU без необходимости управления инфраструктурой.
          Успешных вычислений!
        </p>

        {/* Дополнительные примечания */}
        <h2 id="additional-notes">Дополнительные примечания</h2>
        <ul>
          <li>
            <strong>Dockerfile не требуется:</strong> PrimeWay обрабатывает
            контейнеризацию на стороне сервера. Вам нужно только указать базовый
            образ Docker и зависимости вашего приложения.
          </li>
          <li>
            <strong>Повторный запуск задач с новыми данными:</strong> Вы можете
            запускать задачу несколько раз с разными наборами данных, указывая
            опцию <code>--data-file</code>.
          </li>
        </ul>
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
            maxHeight: "calc(100vh - 40px)", // Ограничиваем максимальную высоту
            overflowY: "auto", // Добавляем вертикальную прокрутку при необходимости
            // Скрываем полосу прокрутки
            "&::-webkit-scrollbar": {
              display: "none", // Скрываем скроллбар в Chrome, Safari и Opera
            },
            "-ms-overflow-style": "none", // Скрываем скроллбар в Internet Explorer и Edge
            "scrollbar-width": "none", // Скрываем скроллбар в Firefox
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

export default Quickstart;
