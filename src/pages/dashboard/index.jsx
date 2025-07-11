import React, { useEffect, useState, useRef, useCallback } from 'react';

import Paper from '@mui/material/Paper';

import {
  MainMap,
  LoadingSpinner,
  Title,
  MapControls,
  MapZoom,
} from '../../components';

import styled from 'styled-components';

import './index.css';

import { useConfig } from '../../context/configContext';
import { RasterLayer } from '../../components/map/deckgl/rasterLayer';

const TITLE = 'Mangrooves';
const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed\
 do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
const HorizontalLayout = styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 12px;
`;

/**
 * Dashboard Component
 *
 * This is the main container for the EMIT Methane Plume Viewer.
 * It integrates map rendering, plume data visualization, filtering, and UI controls.
 *
 * @component
 * @param {Object} props
 * @param {Record<string, Plume>} props.plumes - All available plume items (ID-indexed and sorted).
 * @param {Object} props.collectionMeta - STAC collection metadata, used for colormap and rescale config.
 * @param {CoverageGeoJsonData} props.coverage - GeoJSON coverage data.
 * @param {Array<number>} props.zoomLocation - [lon, lat] to zoom to.
 * @param {Function} props.setZoomLocation - Setter to update zoom location.
 * @param {number|null} props.zoomLevel - Optional zoom level to apply.
 * @param {Function} props.setZoomLevel - Setter to update zoom level.
 * @param {string} props.collectionId - Collection ID from STAC.
 * @param {boolean} props.loadingData - Whether the dashboard is still loading its data.
 */
export function Dashboard({
  zoomLocation,

  setZoomLocation,
  zoomLevel,
  setZoomLevel,
  collectionId,
  loadingData,
}) {
  // states for components/controls
  const [openDrawer, setOpenDrawer] = useState(false);

  const { config } = useConfig();
  const selectedAsset = 'mangrove-agb';

  const handleResetHome = () => {
    setFromSearch(false);
    setVisualizationLayers([]);
    setOpenDrawer(false);
    setZoomLevel(4);
    setZoomLocation([-98.771556, 32.967243]);
  };
  const handleHideLayers = () => {
    console.log("Hide all the layers")
  }

  return (
    <div className='fullSize'>
      <div id='dashboard-map-container'>
        <MainMap>
          <Paper className='title-container'>
            <Title title={TITLE} description={DESCRIPTION} />
            <div className='title-content'>
              <HorizontalLayout>
              </HorizontalLayout>
            </div>
          </Paper>
          <MapZoom zoomLocation={zoomLocation} zoomLevel={zoomLevel} />
          <MapControls
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            handleResetHome={handleResetHome}
            handleHideLayers={handleHideLayers}
          />
          <RasterLayer
            collectionId={collectionId}
            config={config}
            selectedAsset={selectedAsset}
          />
        </MainMap>
      </div>

      {loadingData && <LoadingSpinner />}
    </div>
  );
}
