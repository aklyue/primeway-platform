// src/docs/Tabby.js

import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Scrollspy from "react-scrollspy";
import useMediaQuery from "@mui/material/useMediaQuery";
import "./docs.css";

import AIMarketplace from "./images/ai-marketplace.png";
import TabbyForm from "./images/tabby-form.png";
import StatusCheck from "./images/status-check.png";
import TabbyLaunchOne from "./images/tabby-launch-1.png";
import AdminAccount from "./images/admin-account.png";
import TabbyLaunchTwo from "./images/tabby-launch-2.png";
import TabbyExtension from "./images/tabby-extension.png";
import TabbyConnect from "./images/tabby-connect.png";
import EnterToken from "./images/enter-token.png";
import TabbyNotification from "./images/tabby-notification.png";
import TabbyCommandPalette from "./images/tabby-command-palette.png";
import TabbyCode from "./images/tabby-code.png";

const Tabby = () => {
  const sections = [
    { id: "why-tabby-primeway", label: "Почему Tabby и PrimeWay" },
    { id: "requirements", label: "Что понадобится" },
    { id: "deploy-tabby", label: "Деплой Tabby" },
    { id: "first-launch", label: "Первый запуск" },
    { id: "connect-ide", label: "Подключение IDE" },
    { id: "pricing", label: "Сколько это стоит" },
    { id: "summary", label: "Итоги" },
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
          Tabby
        </h1>

        <section id="why-tabby-primeway">
          <h2>Почему Tabby и PrimeWay</h2>
          <p>
            Tabby — self-hosted-ИИ для автодополнения кода с открытым исходным
            кодом.
          </p>
          <p>PrimeWay закрывает боли самостоятельного хостинга:</p>
          <ul>
            <li>Serverless-GPU: контейнер с моделью запускается по запросу.</li>
            <li>
              Поминутный биллинг: оплата только за фактическое время работы.
            </li>
            <li>Бесплатный Tabby: платите только за inference модели.</li>
          </ul>
          <p>
            Каждому новому пользователю PrimeWay даёт 500 ₽ на тесты для Tabby
            без риска.
          </p>
        </section>

        <section id="requirements">
          <h2>Что понадобится</h2>
          <ul>
            <li>Аккаунт PrimeWay (грант 500 ₽ для новых пользователей).</li>
            <li>
              Любая IDE с поддержкой Tabby (VS Code, JetBrains, Neovim и др.).
            </li>
            <li>5 минут времени.</li>
          </ul>
        </section>

        <section id="deploy-tabby">
          <h2>Деплой Tabby</h2>
          <ol>
            <li>Заходим в AI Маркетплейс PrimeWay.</li>
            <img
              src={AIMarketplace}
              alt="AI Marketplace"
              style={{ maxWidth: "100%", marginTop: 10 }}
            />
            <li>Выбираем карточку «Copilot Альтернатива».</li>
            <strong>Заполняем форму</strong>
          </ol>

          <TableContainer component={Paper} elevation={0} sx={{ my: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Поле</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Что вводим</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Название задачи</TableCell>
                  <TableCell>qwen-coder (или своё)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Code Gen модель</TableCell>
                  <TableCell>
                    уже предзаполнено Qwen/Qwen2.5-Coder-7B-Instruct
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Embedding модель</TableCell>
                  <TableCell>
                    уже предзаполнено Qwen/Qwen3-Embedding-0.6B
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Остальные поля</TableCell>
                  <TableCell>оставьте по умолчанию или измените</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <img
            src={TabbyForm}
            alt="Tabby Form"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
          <ol start={3}>
            <li>
              Нажмите «Создать» и дождитесь, пока модели перейдут в статус
              running.
            </li>
            <strong>Следим за статусом моделей</strong>
            <p>
              Перейдите во вкладку «Модели» — здесь видно, как контейнеры
              переходят из <code>pending</code> → <code>running</code>.
            </p>
          </ol>
          <img
            src={StatusCheck}
            alt="Status Check"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>

        <section id="first-launch">
          <h2>Первый вход в Tabby</h2>
          <p>
            В таблице проектов найдите свой qwen-coder и кликните на URL вида
            <span style={{ textDecoration: "underline", margin: "0 0 0 10px" }}>
              http://6vjiit3x.proxy.primeway.io
            </span>{" "}
            — откроется админ-панель Tabby.
          </p>
          <ol>
            <li>Создаём локальный admin-аккаунт (логин/пароль).</li>
            <li>Перейдите в Settings → Token и скопируйте токен доступа.</li>
          </ol>
          <img
            src={TabbyLaunchOne}
            alt="Tabby Launch"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
          <img
            src={AdminAccount}
            alt="Admin Account"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
          <img
            src={TabbyLaunchTwo}
            alt="Tabby Launch"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>

        <section id="connect-ide">
          <h2>Подключение IDE</h2>
          <p>На примере VS Code:</p>
          <ol>
            <li>Установите расширение Tabby.</li>
            <li>⇧ ⌘ P → Tabby: Connect to server.</li>
            <li>
              Введите URL своего сервера ( http://6vjiit3x.proxy.primeway.io ).
            </li>
            <li>Скопируйте токен из админки и вставьте в поле Token.</li>
          </ol>
          <p>После подключения автодополнение Tabby заработает мгновенно.</p>
          <img
            src={TabbyExtension}
            alt="Tabby Extension"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
          <img
            src={TabbyConnect}
            alt="Tabby Launch"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
          <img
            src={EnterToken}
            alt="Tabby Launch"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
          <img
            src={TabbyNotification}
            alt="Tabby Launch"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
          <img
            src={TabbyCommandPalette}
            alt="Tabby Launch"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
          <img
            src={TabbyCode}
            alt="Tabby Launch"
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        </section>

        <section id="pricing">
          <h2>Сколько это стоит</h2>

          <TableContainer component={Paper} elevation={0} sx={{ my: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Компонент</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Стоимость</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Tabby-сервер</TableCell>
                  <TableCell>0 ₽ — open-source, хостинг бесплатен</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>GPU-модели</TableCell>
                  <TableCell>
                    поминутный тариф PrimeWay (например, A40 — 90 ₽/ч)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Idle-время</TableCell>
                  <TableCell>
                    Не оплачивается — контейнеры можно автоматически скейлить до
                    0
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <p>Грант 500 ₽ покрывает первые эксперименты с Tabby.</p>
        </section>

        <section id="summary">
          <h2>Итоги</h2>
          <ul>
            <li>5 кликов до приватного Copilot-like помощника.</li>
            <li>Конфиденциальность: код остаётся у вас.</li>
            <li>
              Гибкость: смена моделей и масштабирование GPU в любой момент.
            </li>
          </ul>
          <p>Попробуйте и напишите, какие лайфхаки с Tabby зашли именно вам!</p>
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

export default Tabby;
