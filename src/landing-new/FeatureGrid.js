import React from "react";
import './FeatureGrid.css'; // Import styles

import star from './assets/star.png'

// Card Component
const FeatureCard = ({ title, description }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <img src={star} alt={`${title} icon`} />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

// Grid Component
const FeatureGrid = () => {
    const features = [
        { title: "Гибкость GPU", description: "Выбирайте из широкого ассортимента GPU, включая те, которые недоступны на других крупных облачных платформах." },
        { title: "Настроенный MLOps", description: "VisionX берёт на себя все задачи: от выделения ресурсов до удаленной сборки, чтобы вы могли сосредоточиться на коде." },
        { title: "Для ваших задач", description: "Подберите GPU для ваших конкретных задач машинного обучения, оптимизируя производительность для каждого проекта." },
        { title: "Бессерверные вычесления", description: "Запускайте весь проект на удалённых GPU без необходимости управления серверами или инфраструктурой." },
        { title: "Мониторинг в реальном времени", description: "Следите за ходом выполнения задач с помощью логов в реальном времени в ui интерфейсе или в терминале." },
        { title: "Экономическая эффективность", description: "Платите только за использованные ресурсы, без скрытых затрат и управления оборудованием." },
        { title: "Безопасность данных", description: "Все данные шифруются и надежно хранятся, обеспечивая соответствие стандартам конфиденциальности." },
        { title: "Загрузка данных", description: "Легко получайте данные одной командой, созданные во время выполнения задач" },
        { title: "Документация", description: "Понятная документация и качественные обучающие материалы помогут быстро освоить работу с сервисом." }
    ];
    

  return (
    <div className="feature-grid">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>
  );
};

export default FeatureGrid;
