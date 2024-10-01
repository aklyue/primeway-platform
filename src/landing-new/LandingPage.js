import React from 'react';
import Section6CallToAction from './CallToAction';
import FeatureGrid from './FeatureGrid';
import HowWeWork from './HowWeWork';
import Section8FAQ from './FAQ';
import Menu from './Menu';
import './LandingPage.css';

import shape_1 from './assets/shape-1.svg';
import shape_2 from './assets/shape-2.svg';
import shape_3 from './assets/shape-3.svg';
import shape_4 from './assets/shape-4.svg';
import shape_5 from './assets/shape-5.svg';
import nvidia from './assets/nvidia.png'


const gpuCardsData = [
  { name: 'A40', vram: '48GB VRAM', price: '90₽/час' },
  { name: 'A100', vram: '80GB VRAM', price: '299₽/час' },
  { name: 'H100', vram: '80GB VRAM', price: '499₽/час' },
  { name: 'RTX 4090', vram: '24GB VRAM', price: '130₽/час' },
  { name: 'RTX 6000 Ada', vram: '48GB VRAM', price: '199₽/час' },
  { name: 'L4', vram: '24GB VRAM', price: '99₽/час' },
  { name: 'L40', vram: '48GB VRAM', price: '199₽/час' },
  { name: 'RTX A5000', vram: '24GB VRAM', price: '79₽/час' },
];

const GpuCard = ({ name, vram, price }) => (
  <div className="gpu-card">
    <div className="gpu-logo">
      <img src={nvidia} alt="Nvidia logo" />
    </div>
    <div className="gpu-info">
      <h3>{name}</h3>
      <p>{vram}</p>
      <p className="price">{price}</p>
    </div>
  </div>
);

const LandingPage = () => (
  <div className="landing-page">
    {/* Menu Section */}
    <Menu />

    {/* Header Section */}
    <header className="header-section full-width-bg">
      <div className="central-container">
        <h1 className="header-title">Запускайте свои ML проекты на бессерверных GPU -
        <span className="highlighted-text"> всего одной CLI командой</span>
        </h1>
        <p>Мощные GPU словно у вас на компьютере. Запуск целого проекта за секунды с real-time логами</p>
        <button className="cta-button">Начать сейчас</button>
      </div>
    </header>

    {/* GPU Cards Section */}
    <section className="gpu-cards-container full-width-bg">
      <div className="central-container">
        <h2>То, что нужно, для ваших задач</h2>

        {/* Floating Shapes inside the section */}
        <div className="floating-shapes">
          <img src={shape_1} alt="Shape 1" className="floating-shape shape-1" />
          <img src={shape_2} alt="Shape 2" className="floating-shape shape-2" />
          <img src={shape_3} alt="Shape 3" className="floating-shape shape-3" />
          <img src={shape_4} alt="Shape 4" className="floating-shape shape-4" />
          <img src={shape_5} alt="Shape 5" className="floating-shape shape-5" />
        </div>

        <div className="gpu-cards-grid">
          {gpuCardsData.map((card, index) => (
            <GpuCard key={index} {...card} />
          ))}
        </div>
      </div>
    </section>

    <div className="full-width-bg">
      <div className="central-container">
        <HowWeWork />
        <FeatureGrid />
        <Section8FAQ />
      </div>
    </div>
  </div>
);

export default LandingPage;