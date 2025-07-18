import React, { useEffect, useState } from 'react';
import { ColorBar } from '../colorBar';
import './index.css';

const BAR_WIDTH = 300;

export function SwitchLayer({
  layers,
  selectedAssetLayer,
  setSelectedAssetLayer,
}) {
  const [selected, setSelected] = useState(selectedAssetLayer?.id);
  useEffect(() => {
    const selectedlayer = layers.find((item) => item?.id == selected);
    setSelectedAssetLayer(selectedlayer);
  }, [selected]);
  return (
    <div className='layer-panel'>
      <div className='layer-title'>Layers</div>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={`layer-item ${selected === layer.id ? 'selected' : ''}`}
        >
          <label className='layer-label'>
            <input
              type='radio'
              name='layer'
              value={layer.id}
              checked={selected === layer.id}
              onChange={() => setSelected(layer?.id)}
            />
            {layer.name}
          </label>
          {selected === layer.id && (
            <div className='layer-details'>
              <p className='layer-description'>{layer.description}</p>
              <div className='layer-legend'>
                <ColorBar
                  label={layer.unit}
                  VMAX={layer.rescale[1]}
                  VMIN={layer.rescale[0]}
                  colormap={layer.colormap}
                  BAR_WIDTH={BAR_WIDTH}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
