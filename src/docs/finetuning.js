import React from "react";
import { Box } from "@mui/material";
import Scrollspy from "react-scrollspy";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CodeBlock from "../UI/CodeBlock";
import "./docs.css";
import FinetuneFormOne from "./images/finetune-form1.png";
import FinetuneFormTwo from "./images/finetune-form2.png";
import FinetuneList from "./images/finetune-list.png";
import FinetuneDetails from "./images/finetune-details.png"

const Finetuning = () => {
  const sections = [
    { id: "creating-task", label: "Создание задачи дообучения" },
    { id: "training-parameters", label: "Параметры обучения" },
    { id: "task-list", label: "Список задач" },
    { id: "task-details", label: "Детали задачи" },
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
          Дообучение
        </h1>
        <p>
          Система позволяет создавать задачи дообучения моделей на
          пользовательских датасетах с указанием всех необходимых параметров
          обучения.
        </p>

        {/* Создание задачи */}
        <section id="creating-task">
          <h2>Создание задачи дообучения</h2>
          <p>
            На странице дообучения можно создать новую задачу. При создании
            указываются:
          </p>
          <ul>
            <li>
              <strong>Базовая модель</strong>
            </li>
            <li>
              <strong>Суффикс адаптера</strong>
            </li>
            <li>
              <strong>Набор данных</strong>
            </li>
          </ul>
          <p>Интерфейс выбора модели и датасета представлен на форме:</p>
          <img
            src={FinetuneFormOne}
            alt="Форма создания задачи"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>

        {/* Параметры обучения */}
        <section id="training-parameters">
          <h2>Параметры обучения</h2>
          <p>
            По умолчанию параметры выставляются системой, но могут быть изменены
            пользователем:
          </p>
          <ul>
            <li>
              <strong>GPU:</strong> Тип видеокарты.
            </li>
            <li>
              <strong>GPU count:</strong> Количество используемых GPU.
            </li>
            <li>
              <strong>MAX_SEQ_LEN:</strong> Макс. длина входной
              последовательности.
            </li>
            <li>
              <strong>BATCH_SIZE:</strong> Размер батча — сколько примеров
              обрабатывается одновременно.
            </li>
            <li>
              <strong>GRAD_ACCUM:</strong> Кол-во шагов аккумуляции градиентов
              до обновления весов.
            </li>
            <li>
              <strong>EPOCHS:</strong> Количество полных проходов по датасету.
            </li>
            <li>
              <strong>LR:</strong> Learning Rate — скорость обучения модели.
            </li>
            <li>
              <strong>WEIGHT_DECAY:</strong> Регуляризация весов для
              предотвращения переобучения.
            </li>
            <li>
              <strong>SEED:</strong> Значение для инициализации генераторов
              случайных чисел (воспроизводимость).
            </li>
            <li>
              <strong>LORA_R:</strong> Размер low-rank матрицы в LoRA-адаптере.
            </li>
            <li>
              <strong>LORA_ALPHA:</strong> Масштабирующий коэффициент LoRA.
            </li>
            <li>
              <strong>LORA_DROPOUT:</strong> Dropout в LoRA-слоях
              (регуляризация).
            </li>
            <li>
              <strong>HF_TOKEN:</strong> Токен авторизации HuggingFace для
              доступа к моделям и датасетам.
            </li>
          </ul>

          <img
            src={FinetuneFormTwo}
            alt="Параметры обучения"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>

        {/* Список задач */}
        <section id="task-list">
          <h2>Список задач</h2>
          <p>
            После создания задача отображается в списке задач дообучения.
            Изначально список пуст.
          </p>
          <img
            src={FinetuneList}
            alt="Список задач"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>

        {/* Детали задачи */}
        <section id="task-details">
          <h2>Детали задачи</h2>
          <p>
            При клике по задаче открывается страница с детальной информацией:
          </p>
          <ul>
            <li>Параметры задачи</li>
            <li>Параметры обучения</li>
            <li>Логи задачи</li>
          </ul>
          <p>Пример отображения:</p>
          <img
            src={FinetuneDetails}
            alt="Детали задачи"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>
      </Box>

      {/* Навигация */}
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

export default Finetuning;
