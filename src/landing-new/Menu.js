import React from 'react';
import logoImage from './assets/cloud.png'; // Make sure to replace with the correct path to your logo image.
import './Menu.css';

const Menu = () => (
  <nav className="menu"> 
    <div className="menu-left">
      <span className="text-logo">VisionX</span>
    </div>
    <div className="menu-center">
      <img src={logoImage} alt="Logo" className="image-logo" />
    </div>
    <div className="menu-right">
      <button className="menu-button">Войти</button>
      {/* <button className="menu-button">Регистрация</button> */}
    </div>
  </nav>
);

export default Menu;