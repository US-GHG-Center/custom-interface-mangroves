import React from 'react';
import './index.css';


const Legend = ({ legendItem }) => {
  return (
    <div className="legend-container">
      <span
        className="legend-line"
        style={{ backgroundColor: legendItem.color }}
      ></span>
      <span
        className="legend-circle"
        style={{ backgroundColor: legendItem.color }}
      ></span>
      <span className="legend-label">{legendItem.label}</span>
    </div>
  );
};

export default Legend;