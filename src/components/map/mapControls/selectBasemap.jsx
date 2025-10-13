import ReactDOM from 'react-dom/client';
import { IconButton, Menu, MenuItem, ListItemText } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';

const BasemapSelector = ({ setBaseMap }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Available basemap options
  const basemapOptions = [
    {
      label: 'Satellite',
      style: 'teamimpact',
      id: 'cmfmyih22000601s2hz1d044a',
    },
    {
      label: 'Light',
      style: 'teamimpact',
      id: 'cmfmwwbl5005201rz9z3j8ezy'
    },
    {
      label: 'Dark',
      style: 'teamimpact',
      id: 'cmfl9u8cg00bz01qwg0cr9mv3'
    },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleBasemapSelect = (basemapStyleName, basemapStyleId) => {
    setBaseMap(basemapStyleName, basemapStyleId);
    handleClose();
  };

  return (
    <>
      <Tooltip title='Select Basemap'>
        <IconButton
          className='menu-open-icon'
          onClick={handleClick}
          aria-controls={open ? 'basemap-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
        >
          <MapIcon className='map-control-icon' />
        </IconButton>
      </Tooltip>
      <Menu
        id='basemap-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basemap-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {basemapOptions.map((option) => (
          <MenuItem
            key={option.label}
            onClick={() => handleBasemapSelect(option.style, option.id)}
            dense
          >
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export class BasemapControl {
  constructor(setBaseMap) {
    this.root = null;
    this._map = null;
    this._setBaseMap = setBaseMap;
  }

  onAdd = (map) => {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    const root = ReactDOM.createRoot(this._container);
    root.render(<BasemapSelector setBaseMap={this._setBaseMap} />);
    this.root = root;
    return this._container;
  };

  onRemove = () => {
    setTimeout(() => {
      try {
        this.root.unmount();
        this._container.parentNode.removeChild(this._container);
        this._map = null;
      } catch (err) {
        console.warn('Error during cleanup:', err);
      }
    }, 0);
  };
}
