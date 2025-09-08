import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import {
  MainMap,
  LoadingSpinner,
  Title,
  MapControls,
  MapZoom,
  SwitchLayer,
  CustomModal,
} from '../../components';
import styled from 'styled-components';
import './index.css';
import { DeckLayers } from '../../components/map/deckgl/deckLayerManager';
import { HOME_ZOOM_LOCATION, HOME_ZOOM_VALUE } from '../../utils/constants';
import countryWiseBoundaries from '../../../static/World_Countries_Boundaries.json';
import Legend from '../../components/ui/legend';
import { SearchComponentWrapper } from './helper/SearchWrapper';
const ZOOM_LEVEL_MARGIN = 5
export const countryMapping = {
  Fiji: 'Fiji',
  Somalia: 'Somalia',
  CarribeanCaymanIslands: 'Cayman Islands',
  DemocraticRepublicOfCongo: 'Democratic Republic of the Congo',
  EcuadorWithGalapagos: 'Ecuador',
  FrenchGuyana: 'French Guyana',
  GuineaBissau: 'Guinea-Bissau',
  HongKong: 'Hong Kong SAR',
  Newzealand: 'New zealand',
  Philipines: 'Philippines',
  ReunionAndMauritius: 'Reunion & Mauritius (two different)',
  Taiwan: 'Taiwan (Province of China)',
  Tanzania: 'UNITED REPUBLIC OF TANZANIA',
  UnitedStates: 'United States of America',
  Vietnam: 'Viet Nam',
  VirginIslandsUs: 'United States Virgin Islands',
  WallisAndFutuna: 'Wallis and Futuna Islands',
  TimorLeste: 'Timor-Leste',
  Macau: 'Macao SAR',
  CoteDivoire: 'Cote divoire',
  Brunei: 'Brunei Darussalam',
};
const TITLE = 'Global Mangroves';
const modalTitle = 'Information'
const DESCRIPTION =
  'Mangrove wetlands are among the most productive ecosystems in the world, \
   capturing and storing significant amounts of carbon in the aboveground \
   biomass and soil. Understanding their structural attributes is vital for determining regional\
   and global carbon stock estimates and supporting coastal management.';
const HorizontalLayout = styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 12px;
`;

const legendItem = {
  label: 'Countries with Mangroves',
  color: '#228ef9',
  text: "Click inside a country boundary to see the mangrove data. Locations of smaller countries are indicated with a dot."
};
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
  const [layers, setLayers] = useState([]);
  const [selectedAssetLayer, setSelectedAssetLayer] = useState(null);
  const [data, setData] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
  const [openModal, setOpenModal] = useState(true)
  const [showModalAgain, setShowModalAgain] = useState(false)

  //create layers only after the collection info is available
  useEffect(() => {
    if (collectionInfo?.id) {
      const renders = collectionInfo.renders;
      if (renders && renders['agb']?.rescale[0]) {
        setLayers([
          {
            id: 'agb',
            name: 'Aboveground Biomass',
            description:
              'Estimated mass of living plant material above the soil of global mangrove-forested wetlands, measured in megagrams per hectare (Mg/ha)',
            colormap: 'magma_r',
            rescale: renders && renders['agb']?.rescale[0],
            unit: ' Aboveground Biomass (Mg/ha)',
          },
          {
            id: 'hba',
            name: 'Maximum Canopy Height',
            description:
              'Estimated maximum canopy height (height of the tallest tree), measured in meters (m)',
            rescale: renders && renders['hba']?.rescale[0],
            colormap: 'greens',
            unit: 'Maximum Canopy Height (m)',
          },
          {
            id: 'hmax95',
            name: 'Basal-Area Weighted Height',
            description:
              'Estimated tree heights weighted in proportion to their basal area, measured in meters (m)',
            rescale: renders && renders['hmax95']?.rescale[0],
            colormap: 'greens',
            unit: 'Basal-Area Weighted Height (m)',
          },
        ]);
      }
    }
  }, [collectionInfo]);

  useEffect(() => {
    if (zoomLevel > ZOOM_LEVEL_MARGIN) {
      setShowLegend(false);
    } else {
      setShowLegend(true)
    }
  }, [zoomLevel]);

  useEffect(() => {
    if (!stacData || !countryWiseBoundaries?.features) {
      return;
    }
    console.log({ stacData });
    // Helper function for consistent name normalization (lowercase, no spaces)
    const normalize = (name) => name.toLowerCase().replace(/\s/g, '');
    const combinedData = stacData?.map((item) => {
      const idSplits = item?.itemId?.split('-');
      const _key = normalize(idSplits.pop().trim());
      const _mappedKey = Object.keys(countryMapping).find(
        (key) => key.toLowerCase() === _key
      );
      const name = countryMapping[_mappedKey]
        ? normalize(countryMapping[_mappedKey])
        : _key;
      const boundaryForCountry = countryWiseBoundaries.features.find(
        (feature) => {
          const featureName = feature.properties['VISUALIZATION_NAME'];
          const normalizedFeatureName = normalize(featureName);
          return name === normalizedFeatureName;
        }
      );
      return {
        ...item,
        boundary: boundaryForCountry,
        name: name,
      };
    });
    setData(combinedData);
  }, [stacData, countryWiseBoundaries]);
  //update the layer switch after the layers are changed
  useEffect(() => {
    if (layers.length && layers[0]) {
      setSelectedAssetLayer(layers[0]);
    }
  }, [layers]);

  //function to handle the reset home
  const handleResetHome = () => {
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
                <SearchComponentWrapper items={data} />
              </HorizontalLayout>{' '}

              {showLegend ? (
                <HorizontalLayout>
                  {legendItem && legendItem?.label ? (
                    <Legend legendItem={legendItem} />
                  ) : (
                    <></>
                  )}
                </HorizontalLayout>
              ) : (
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
              )}
            </div>
          </Paper>
          <MapZoom zoomLocation={zoomLocation} zoomLevel={zoomLevel} />
          {selectedAssetLayer?.id && (
            <DeckLayers
              collectionId={collectionId}
              data={data}
              selectedAsset={selectedAssetLayer}
              setZoomLocation={setZoomLocation}
              setZoomLevel={setZoomLevel}
              zoomLevel={zoomLevel}
            />
          )}
          <MapControls handleResetHome={handleResetHome} />
        </MainMap>
      </div>
      {(loadingData || !selectedAssetLayer?.id || !layers.length) && (
        <LoadingSpinner />
      )}
      <CustomModal setOpen={setOpenModal} open={openModal} showAgain={showModalAgain} setShowAgain={setShowModalAgain} title={modalTitle} >
        <Legend legendItem={legendItem} />
      </CustomModal >
    </div>
  );
}
