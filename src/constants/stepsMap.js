export const stepsMap = {
  "/marketplace": [
    {
      selector: '[data-tour-id="marketplace-header"]',
      content: "Здесь вы выбираете между Jupyter и Tabby",
    },
    {
      selector: '[data-tour-id="project-card"]',
      content: "Нажмите, чтобы открыть проект",
    },
  ],
  "/models": [
    {
      selector: '[data-tour-id="model-page"]',
      content: "Этот раздел полностью посвящен работе с LLM моделями.",
    },
    {
      selector: '[data-tour-id="model-create"]',
      content: "Вы можете создать модель просто нажав на эту кнопку.",
    },
    {
      selector: '[data-tour-id="my-models"]',
      content:
        "После создания здесь отобразятся модели, которые вы когда-либо запускали.",
    },
    {
      selector: '[data-tour-id="basic-models"]',
      content:
        "Также вы можете воспользоваться базовыми моделями, которые уже готовы к запуску напрямую или перейти на страницу модели для дополнительной конфигурации.",
    },
  ],
  "/datasets": [
    {
      selector: '[data-tour-id="load-dataset"]',
      content:
        "Здесь можно загрузить набор данных в формате JSONL, CSV, HuggingFace.",
    },
    {
      selector: '[data-tour-id="datasets-list"]',
      content:
        "После загрузки все ваши наборы данных будут показаны в этой секции.",
    },
  ],
  "/fine-tuning": [
    {
      selector: '[data-tour-id="create-job"]',
      content:
        "Здесь можно создать задачу дообучения, настроив конфигурацию для неё.",
    },
    {
      selector: '[data-tour-id="jobs-list"]',
      content:
        "Все созданные задачи отображаются здесь. Вы можете нажать на любую задачу и посмотреть детали конфигурации.",
    },
  ],
  "/tasks": [
    {
      selector: '[data-tour-id="tasks-header"]',
      content:
        "Этот раздел предназначен для быстрого доступа к просмотру и взаимодействию с созданными вами задачами.",
    },
    {
      selector: '[data-tour-id="buttons-header"]',
      content:
        "Задачи делятся на два типа: Deploy и Run. Переключаясь между вкладками, вы можете просматривать их.",
    },
    {
      selector: '[data-tour-id="tasks-list"]',
      content:
        "Каждая задача будет отображена здесь. Вы можете нажать на неё и просмотреть все детали задачи.",
    },
    {
      selector: '[data-tour-id="buttons-list"]',
      content:
        "Помимо всего прочего, вы в любой момент можете отсортировать список ваших задач по статусу их выполнения.",
    },
  ],
  "/tabby-create": [
    {
      selector: '[data-tour-id="tabby-form"]',
      content:
        "Перед вами открылась форма конфигурации TabbyML. Сейчас в ней установлены значения по умолчанию, но давайте пройдемся по основным моментам.",
    },
    {
      selector: '[data-tour-id="tabby-name"]',
      content: "В первую очередь, вам необходимо задать название задачи.",
    },
    {
      selector: '[data-tour-id="inference-model"]',
      content:
        "Далее вам предстоит определить конфигурационные данные Code Generation Модели.",
    },
    {
      selector: '[data-tour-id="embedding-model"]',
      content: "Точно также нужно заполнить информацию и об Embedding Модели.",
    },
    {
      selector: '[data-tour-id="required-fields"]',
      content: "Здесь будут показаны поля, требуемые для заполнения.",
    },
  ],
  "/model-create": [
    {
      selector: '[data-tour-id="model-name"]',
      content:
        "Укажите имя модели Hugging Face, которое будет использоваться при запуске. Скопировать его вы можете с официального сайта HuggingFace (например, https://huggingface.co/t-tech/T-lite-it-1.0), или же ввести вручную.",
    },
    {
      selector: '[data-tour-id="args"]',
      content:
        "Добавьте аргументы запуска — это пары ключ/значение, которые настраивают поведение модели.",
    },
    {
      selector: '[data-tour-id="flags"]',
      content:
        "Флаги — булевые параметры (включены/отключены), определяющие поведение модели.",
    },
    {
      selector: '[data-tour-id="unique-name"]',
      content:
        "Придумайте уникальное имя развертывания. Оно потребуется для запуска модели.",
    },
    {
      selector: '[data-tour-id="gpu-type"]',
      content:
        "Выберите тип GPU с нужным объёмом памяти. Обратите внимание на стоимость в руб./час.",
    },
    {
      selector: '[data-tour-id="health-check"]',
      content:
        "Введите таймаут для Health Check — это время ожидания отклика модели (в миллисекундах).",
    },
    {
      selector: '[data-tour-id="port"]',
      content: "Укажите порт, на котором будет работать модельный сервис.",
    },
    {
      selector: '[data-tour-id="free-space"]',
      content:
        "Укажите объём свободного места на диске (в гигабайтах), необходимый для запуска.",
    },
    {
      selector: '[data-tour-id="pending-time"]',
      content:
        "Задайте максимальное время ожидания масштабирования (в секундах).",
    },
    {
      selector: '[data-tour-id="max-reqs"]',
      content: "Ограничьте максимальное число одновременных запросов к модели.",
    },
    {
      selector: '[data-tour-id="max-min-gpu-count"]',
      content: "Укажите максимальное и минимальное количество GPU.",
    },
    {
      selector: '[data-tour-id="schedule"]',
      content:
        "Настройте график запуска — например, только по будням или в определённые дни.",
    },
    {
      selector: '[data-tour-id="env-vars"]',
      content:
        "Добавьте переменные окружения, например HUGGING_FACE_HUB_TOKEN и его значение.",
    },
  ],
};
