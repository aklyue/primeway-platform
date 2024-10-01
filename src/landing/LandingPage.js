import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Header Section */}
      <header className="hero-section">
        <h1 className="main-title">VisionX</h1>
        <p className="subtitle">Run your entire ML project on powerful GPUs with a single CLI command.</p>
        <a href="#signup" className="cta-button">Get Started</a>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why VisionX?</h2>
        <div className="features">
          <div className="feature-card">
            <img src="path-to-docker-icon" alt="Docker" className="feature-icon" />
            <h3>Simple Deployment</h3>
            <p>Package and deploy your entire project remotely on powerful GPUs with one CLI call.</p>
          </div>
          <div className="feature-card">
            <img src="path-to-log-icon" alt="Logs" className="feature-icon" />
            <h3>Real-Time Logs</h3>
            <p>Monitor logs in real-time as your code builds and runs remotely.</p>
          </div>
          <div className="feature-card">
            <img src="path-to-data-download-icon" alt="Download" className="feature-icon" />
            <h3>Download Results</h3>
            <p>Download generated data after your job finishes, all managed serverlessly.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <p>Configure your project with a single config file and CLI call.</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <p>Your code is packaged into a Docker image and builds remotely.</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <p>Run the project on powerful GPUs without managing infrastructure.</p>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <p>Download output data upon job completion and view logs in real-time.</p>
          </div>
        </div>
      </section>

      {/* Unique GPU Options Section */}
      <section className="gpu-options-section">
        <h2>Unmatched GPU Options</h2>
        <p>VisionX offers a wide variety of GPUs that big cloud providers don't, including options perfect for specialized ML jobs.</p>
        <div className="gpu-grid">
          <div className="gpu-card">
            <h3>GPU Type A</h3>
            <p>High memory and excellent for large-scale AI training.</p>
          </div>
          <div className="gpu-card">
            <h3>GPU Type B</h3>
            <p>Cost-effective for smaller workloads with moderate performance.</p>
          </div>
          <div className="gpu-card">
            <h3>GPU Type C</h3>
            <p>Ultra-fast GPUs for intensive machine learning tasks.</p>
          </div>
          {/* Add more GPUs as needed */}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section" id="signup">
        <h2>Start Running Your ML Jobs Effortlessly</h2>
        <p>No more worrying about infrastructure or GPU limitations. Focus on your project, and let VisionX handle the rest.</p>
        <a href="#signup-form" className="cta-button">Sign Up Now</a>
      </section>
    </div>
  );
};

export default LandingPage;
