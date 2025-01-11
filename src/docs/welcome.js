// src/docs/welcome.js
import React from "react";
import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div>
      {/* Заголовок */}
      <h1 style={{ marginBottom: "25px" }}>PrimeWay developer platform</h1>

      {/* Основной блок */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "20px",
          marginBottom: "20px",
          backgroundColor: "#f5f5f5",
          padding: "15px",
        }}
      >
        {/* Левая панель */}
        <div style={{ width: "200px", padding: "10px" }}>
          <strong>Developer quickstart</strong>
          <p>
            PrimeWay is designed to simplify the deployment and execution of tasks
            and applications on the cloud.
          </p>
        </div>

        {/* Основной контент */}
        <div style={{ padding: "10px", flex: 1 }}>
          <pre style={{ margin: "0" }}>
            {`
        JSON:
        {
          "id": "quickstart",
          "title": "Quickstart",
          "path": "/docs/quickstart",
        },
        {
          "id": "jobs",
          "title": "Jobs",
          "path": "/docs/jobs",
        },
    `}
          </pre>
        </div>
      </div>

      {/* Заголовок секции */}
      <h2 style={{marginTop:'60px'}}>Meet the sections</h2>

      {/* Блоки с описанием разделов */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", // Три равных столбца
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Блок 1: Quickstart */}
        <Link
          to="/docs/quickstart"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              padding: "15px",
              backgroundColor: "#e9ecef",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              height: "100%", // Заполнение всей высоты сетки
              boxSizing: "border-box",
              
            }}
          >
            <h3>Quickstart</h3>
            <p>
              Быстрый старт с PrimeWay: узнайте, как развернуть ваше первое приложение и
              ознакомиться с основными возможностями платформы.
            </p>
          </div>
        </Link>

        {/* Блок 2: Jobs */}
        <Link
          to="/docs/jobs"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              padding: "15px",
              backgroundColor: "#e9ecef",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <h3>Jobs</h3>
            <p>
              Управляйте и мониторьте задания в PrimeWay, включая планирование,
              выполнение и отслеживание логов ваших задач.
            </p>
          </div>
        </Link>

        {/* Блок 3: CLI */}
        <Link
          to="/docs/cli"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              padding: "15px",
              backgroundColor: "#e9ecef",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <h3>CLI</h3>
            <p>
              Используйте командную строку PrimeWay для взаимодействия с платформой прямо
              из вашего терминала, автоматизируя процессы и интегрируя их в ваш рабочий
              процесс.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;