import React, { useEffect, useState } from 'react';
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
import { DeckLayers } from '../../components/map/deckgl/deckLayerManager';
import { HOME_ZOOM_LOCATION, HOME_ZOOM_VALUE } from '../../utils/constants';

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
 * It integrates map rendering,  data visualization, 
 *
 * @component
 * @param {Object} props
 * @param {Record<string, STACItem>} props.stacData - All the stacData 
 * @param {Record<string,string>} props.collectionInfo - details of the collection 
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
  collectionInfo,
}) {
  // states for components/controls
  const [layers, setLayers] = useState([])
  const [selectedAssetLayer, setSelectedAssetLayer] = useState(null);

  //create layers only after the collection info is available
  useEffect(() => {
    if (collectionInfo?.id) {
      const renders = collectionInfo.renders
      if (renders && renders['mangrove-agb']?.rescale[0]) {
        setLayers([
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
        ])
      }
    }
  }, [collectionInfo])
  //update the layer switch after the layers are changed 
  useEffect(() => {
    if (layers.length && layers[0]) {
      setSelectedAssetLayer(layers[0])
    }
  }, [layers])

  //function to handle the reset home
  const handleResetHome = () => {
    console.log("clicked")
    setZoomLevel(HOME_ZOOM_VALUE);
    setZoomLocation(HOME_ZOOM_LOCATION);
  };

  return (
    <div className='fullSize'>
      <div id='dashboard-map-container'>
        <MainMap>
          <Paper className='title-container'>
            <Title title={TITLE} description={DESCRIPTION} />
            <div className='title-content'>
              <HorizontalLayout>
                {layers && layers.length && selectedAssetLayer?.id ? (
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
          {selectedAssetLayer?.id &&
            <DeckLayers
              collectionId={collectionId}
              stacData={stacData}
              selectedAsset={selectedAssetLayer}
              setZoomLocation={setZoomLocation}
              setZoomLevel={setZoomLevel}
              zoomLevel={zoomLevel}
            />}
          <MapControls
            handleResetHome={handleResetHome}
          />
        </MainMap>
      </div>
      {(loadingData || !selectedAssetLayer?.id || !layers.length) && <LoadingSpinner />}
    </div>
  );
}
