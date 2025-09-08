import React from 'react';
import './index.css';

const Legend = ({ legendItem }) => {
  return (
    <div className='legend-container'>
      <div style={{ display: 'flex' }}>
        <span>
          <svg
            width='18'
            height='18'
            style={{ marginRight: '8px' }}
            viewBox='0 0 100 100'
          >
            <polygon
              points='20,0 65,5 90,15 100,40 85,70 70,100 40,95 15,80 0,50 5,20'
              fill='transparent'
              stroke={legendItem.color}
              strokeWidth='10'
              strokeLinejoin='round'
            />
          </svg>
        </span>
        <span
          className='legend-circle'
          style={{ backgroundColor: legendItem.color }}
        ></span>
        <span className='legend-label'>{legendItem.label}</span>
      </div>
      <div className='legend-text'>{legendItem.text}</div>
    </div>
  );
};

export default Legend;
