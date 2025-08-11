import { Fragment } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { MangrovesInterface } from './pages/mangrovesInterface';

import './App.css';
import { HOME_ZOOM_LOCATION, HOME_ZOOM_VALUE } from './utils/constants';

const BASE_PATH = process.env.PUBLIC_URL;
const defaultCollectionId = 'cms-mangrove-agb-canopyheight-grid-v1.3';
const defaultZoomLocation = HOME_ZOOM_LOCATION;
const defaultZoomLevel = HOME_ZOOM_VALUE;

function App() {
  return (
    <Fragment>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <BrowserRouter basename={BASE_PATH}>
          <Routes>
            <Route
              path='/'
              element={
                <MangrovesInterface
                  defaultCollectionId={defaultCollectionId}
                  defaultZoomLocation={defaultZoomLocation}
                  defaultZoomLevel={defaultZoomLevel}
                />
              }
            />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </Fragment>
  );
}

export default App;
