import React from 'react';
import './HowWeWork.css'; // Import the CSS file for custom styles

const HowWeWork = () => {
  const steps = [
    {
      id: 1,
      title: 'Создайте конфиг файл',
      description: 'Выбирите модель gpu и их количество, а также память, место на диске и т.д.',
    },
    {
      id: 2,
      title: 'Используйте CLI',
      description: 'Запустите код используя CLI, указав конфиг и входной файл в параметрах',
    },
    {
      id: 3,
      title: 'Ожидайте запуска',
      description: 'Следите за сборкой и запуском нашем облаке, без каких-либо вычислений на вашей стороне',
    },
    {
      id: 4,
      title: 'Мониторьте логи и результат',
      description: 'Смотрите логи в реальном времени и по завершению скачивайте данные, которые были созданы',
    },
  ];

  return (
    <div className="how-we-work-container">
      <h2 className="title">Ваш Воркфлоу с VisionX</h2>
      <div className="steps-container">
        {steps.map((step) => (
          <div key={step.id} className="step">
            <div className="number">{step.id}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowWeWork;