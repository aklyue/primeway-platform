// src/docs/Datasets.js

import React from "react";
import { Box } from "@mui/material";
import Scrollspy from "react-scrollspy";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CodeBlock from "../UI/CodeBlock";
import "./docs.css";

const Datasets = () => {
  const sections = [
    { id: "formats", label: "Поддерживаемые форматы" },
    { id: "sharegpt", label: "Формат ShareGPT" },
    { id: "chatml", label: "Формат ChatML" },
    { id: "alpaca", label: "Формат Alpaca" },
    { id: "unsupported", label: "Неподдерживаемые форматы" },
  ];

  const isMobile = useMediaQuery("(max-width:1200px)");

  return (
    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      <Box
        sx={{
          flexGrow: 1,
          paddingRight: isMobile ? "0" : "20px",
          width: isMobile ? "100%" : "80%",
        }}
      >
        <h1
          style={{
            paddingBottom: "25px",
            borderBottom: "1px solid lightgray",
            fontSize: isMobile ? "1.7rem" : "2rem",
            lineHeight: 1.2,
          }}
        >
          Наборы данных
        </h1>

        <section id="formats">
          <h2>Поддерживаемые форматы</h2>
          <p>
            Скрипт поддерживает три основных формата, которые автоматически
            преобразуются в единую схему с полями <code>role</code> и{" "}
            <code>content</code> внутри списка <code>conversations</code>. Это
            необходимо для стандартизации представления диалогов при обучении
            моделей.
          </p>
        </section>

        <section id="sharegpt">
          <h2>Формат ShareGPT</h2>
          <p>Поддерживает загрузку из JSONL / CSV / HuggingFace.</p>
          <CodeBlock
            language="json"
            code={`{
  "conversations": [
    { "from": "human", "value": "Привет!" },
    { "from": "gpt",   "value": "Здравствуйте, чем могу помочь?" },
    { "from": "human", "value": "Сколько будет 2+2?" }
  ]
}`}
          />
          <p>
            Это оригинальный формат, используемый в ShareGPT. Он отличается тем,
            что использует поля <code>from</code> и <code>value</code>, вместо
            стандартных <code>role</code> и <code>content</code>. Скрипт
            автоматически преобразует его в нужный вид через{" "}
            <code>standardize_sharegpt()</code>.
          </p>
        </section>

        <section id="chatml">
          <h2>Формат ChatML</h2>
          <p>Поддерживает загрузку из JSONL / CSV / HuggingFace.</p>
          <CodeBlock
            language="json"
            code={`{
  "conversations": [
    { "role": "user", "content": "Привет!" },
    { "role": "assistant", "content": "Здравствуйте!" }
  ]
}`}
          />
          <p>
            Этот формат совместим по умолчанию и не требует преобразования
            структуры. Он уже использует стандартные поля <code>role</code> и{" "}
            <code>content</code>, что делает его предпочтительным при подготовке
            кастомных датасетов.
          </p>
        </section>

        <section id="alpaca">
          <h2>Формат инструкций Alpaca</h2>
          <p>Поддерживает загрузку из JSONL / CSV / HuggingFace.</p>
          <CodeBlock
            language="json"
            code={`{
  "instruction": "Переведи с английского на итальянский",
  "input": "Hello",
  "output": "Ciao"
}`}
          />
          <p>
            Используется в одноходовой fine-tuning (SFT). Этот формат содержит
            отдельные поля <code>instruction</code>, <code>input</code> и{" "}
            <code>output</code>. При помощи <code>to_sharegpt()</code>{" "}
            преобразуется в стандартный диалоговый вид:
          </p>
          <CodeBlock
            language="json"
            code={`{
  "conversations": [
    { "role": "user", "content": "Переведи с английского на итальянский\nHello" },
    { "role": "assistant", "content": "Ciao" }
  ]
}`}
          />
          <p>
            Преобразование объединяет поля <code>instruction</code> и{" "}
            <code>input</code> в единый prompt для пользователя. Поле{" "}
            <code>input</code> считается необязательным.
          </p>
        </section>

        <section id="unsupported">
          <h2>Неподдерживаемые форматы</h2>
          <p>
            Некоторые форматы не могут быть автоматически интерпретированы как
            диалоговые и требуют предварительной трансформации.
          </p>
          <ul>
            <li>
              <strong>Табличные данные с множеством полей</strong> (например,
              Titanic):
              <CodeBlock
                language="json"
                code={`{"age": 22, "class": 3, "sex": "male"}`}
              />
              <p>
                Такой формат представляет собой отдельные атрибуты и не содержит
                диалоговой структуры. Чтобы использовать эти данные, необходимо
                вручную объединить поля в текстовый prompt, например:
              </p>
              <CodeBlock
                language="json"
                code={`{"conversations": [
  { "role": "user", "content": "Возраст: 22, Класс: 3, Пол: мужчина. Какова вероятность выживания?" },
  { "role": "assistant", "content": "Примерно 38%." }
]}`}
              />
              <p>
                Либо воспользоваться функцией <code>to_sharegpt()</code>,
                указав, какие поля включить в prompt.
              </p>
            </li>
            <li>
              <strong>Датасеты с изображениями</strong> или поле{" "}
              <code>messages</code>:
              <p>
                Пример — мультимодальные датасеты, где текст сопровождается
                ссылками на изображения или используется вложенная структура с
                полем <code>messages</code>:
              </p>
              <CodeBlock
                language="json"
                code={`{"messages": [
  {"role": "user", "content": "<image> Какой это объект?"}
]}`}
              />
              <p>
                Такой формат требует специализированной логики обработки
                изображений и не поддерживается стандартным скриптом.
              </p>
            </li>
          </ul>
          <p>
            Рекомендуется привести все неподдерживаемые форматы к одному из
            совместимых вариантов (ShareGPT, ChatML или Alpaca), используя
            собственную логику преобразования.
          </p>
        </section>
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

export default Datasets;
