import React, { useEffect, useState, useRef, useCallback } from 'react';

import Paper from '@mui/material/Paper';

import {
  MainMap,
  LoadingSpinner,
  Title,
  MapControls,
  MapZoom,
  SwitchLayer,
} from '../../components';

import styled from 'styled-components';

import './index.css';

import { useConfig } from '../../context/configContext';
import { DeckLayers } from '../../components/map/deckgl/deckLayerManager';

const TITLE = 'Global Mangroves';
const DESCRIPTION =
  'Mangrove wetlands are among the most productive ecosystems in the world, \
   capturing and storing significant amounts of carbon dioxide (CO2) in the aboveground \
   biomass and soil.Understanding their structural attributes is vital for determining regional\
   and global carbon stock estimates and supporting coastal management.';
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
  stacData,
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
  const layers = [
    {
      id: 'mangrove-agb',
      name: 'Aboveground Biomass',
      description:
        'Estimated mass of living plant material above the soil of global mangrove-forested wetlands, measured in megagrams per hectare (Mg/ha)',
      colormap: 'magma_r',
      rescale: renders && renders['mangrove-agb']?.rescale[0],
      unit: ' Aboveground Biomass (Mg/ha)',
    },
    {
      id: 'mangrove-hba',
      name: 'Maximum Canopy Height',
      description:
        'Estimated maximum canopy height (height of the tallest tree), measured in meters (m)',
      rescale: renders && renders['mangrove-hba']?.rescale[0],
      colormap: 'greens',
      unit: 'Maximum Canopy Height (m)',
    },
    {
      id: 'mangrove-hmax95',
      name: 'Basal-Area Weighted Height',
      description:
        'Estimated tree heights weighted in proportion to their basal area, measured in meters (m)',
      rescale: renders && renders['mangrove-hmax95']?.rescale[0],
      colormap: 'greens',
      unit: 'Basal-Area Weighted Height (m)',
    },
  ];
  const [selectedAssetLayer, setSelectedAssetLayer] = useState(layers[0]);

  const handleResetHome = () => {
    setFromSearch(false);
    setVisualizationLayers([]);
    setOpenDrawer(false);
    setZoomLevel(4);
    setZoomLocation([-98.771556, 32.967243]);
  };

  const handleHideLayers = () => {
    console.log('Hide all the layers');
  };


  return (
    <div className='fullSize'>
      <div id='dashboard-map-container'>
        <MainMap>
          <Paper className='title-container'>
            <Title title={TITLE} description={DESCRIPTION} />
            <div className='title-content'>
              <HorizontalLayout>
                {layers.length ? (
                  <SwitchLayer
                    layers={layers}
                    setSelectedAssetLayer={setSelectedAssetLayer}
                    selectedAssetLayer={selectedAssetLayer}
                  />
                ) : (
                  <></>
                )}
              </HorizontalLayout>
            </div>
          </Paper>
          <MapZoom zoomLocation={zoomLocation} zoomLevel={zoomLevel} />
          <DeckLayers
            collectionId={collectionId}
            stacData={stacData}
            selectedAsset={selectedAssetLayer?.id}
            setZoomLocation={setZoomLocation}
            setZoomLevel={setZoomLevel}
            zoomLevel={zoomLevel}
          />
          <MapControls
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            handleResetHome={handleResetHome}
            handleHideLayers={handleHideLayers}
          />
        </MainMap>
      </div>

      {loadingData && <LoadingSpinner />}
    </div>
  );
}
