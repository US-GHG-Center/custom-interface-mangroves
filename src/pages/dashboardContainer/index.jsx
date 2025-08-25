import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dashboard } from '../dashboard/index.jsx';
import { processSTACItems, getCollectionInfo } from '../../services/api.js'
import { CACHE_TTL, getCache, setCache } from '../../components/map/utils/index.js'

import { useConfig } from '../../context/configContext/index.jsx';

/**
 * DashboardContainer Component
 *
 * A reusable component that provides the Global Mangrove  interface.
 * This component handles data fetching, state management, and rendering of the dashboard.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.collectionId] - The STAC collection ID to fetch data from
 * @param {Array<number>} [props.zoomLocation] - Initial zoom location [lon, lat]
 * @param {number} [props.zoomLevel] - Initial zoom level
 * @returns {JSX.Element} The rendered EMIT interface
 */
export const DashboardContainer = ({
  collectionId,
  defaultZoomLocation,
  defaultZoomLevel,
}) => {
  const { config } = useConfig();
  const [searchParams] = useSearchParams();
  const [zoomLocation, setZoomLocation] = useState(
    searchParams.get('zoom-location') || defaultZoomLocation
  );
  const [zoomLevel, setZoomLevel] = useState(
    searchParams.get('zoom-level') || defaultZoomLevel
  );
  const [stacData, setStacData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [collectionInfo, setCollectionInfo] = useState(null)


  // Fetch collection metadata and plumes data
  useEffect(() => {
    setLoadingData(true);
    const init = async () => {
      try {
        const stacKey = `stacData-${collectionId}`;
        let data = getCache(stacKey);
        if (!data || !data.length) {
          data = await processSTACItems(config, collectionId);
          setCache(stacKey, data, CACHE_TTL);
        }
        const collectonKey = `collectionInfo-${collectionId}`
        let collectionInfo = getCache(collectonKey)
        if (!collectionInfo || !collectionInfo?.id) {
          collectionInfo = await getCollectionInfo(config, collectionId);
          setCache(collectonKey, collectionInfo, CACHE_TTL);
        }
        setCollectionInfo(collectionInfo)
        setStacData(data)
        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    init();
  }, [collectionId, defaultZoomLocation, defaultZoomLevel]);



  return (
    <Dashboard
      stacData={stacData}
      zoomLocation={zoomLocation}
      zoomLevel={zoomLevel}
      setZoomLocation={setZoomLocation}
      setZoomLevel={setZoomLevel}
      collectionId={collectionId}
      loadingData={loadingData}
      collectionInfo={collectionInfo}
    />
  );
};
