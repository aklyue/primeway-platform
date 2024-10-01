import React, { useEffect, useState } from 'react';
import './Cursor.css';

const Cursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mouseMoveHandler = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    const mouseEnterHandler = () => {
      setVisible(true);
    };

    const mouseLeaveHandler = () => {
      setVisible(false);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseenter', mouseEnterHandler);
    document.addEventListener('mouseleave', mouseLeaveHandler);

    return () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseenter', mouseEnterHandler);
      document.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }, []);

  return (
    <div
      className="custom-cursor"
      style={{
        transform: `translate3d(${position.x - 15}px, ${position.y - 15}px, 0)`,
        opacity: visible ? 1 : 0
      }}
    />
  );
};

export default Cursor;