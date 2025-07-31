// context/MapboxContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useConfig } from '../configContext';

const MapboxContext = createContext();

export const MapboxProvider = ({ children }) => {
  const { config } = useConfig();
  const accessToken = config?.mapboxToken;
  const styleUrl = config?.mapboxStyle;
  const basemapId = config?.basemapStyle;
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapIsReady, setMapIsReady] = useState(false);

  useEffect(() => {
    if (!accessToken || map.current) return;

    mapboxgl.accessToken = accessToken;

    const style =
      styleUrl && basemapId
        ? `${styleUrl}/${basemapId}`
        : styleUrl && !basemapId
        ? styleUrl
        : 'mapbox://styles/mapbox/streets-v12';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style,
      center: [-98.771556, 32.967243],
      zoom: 4,
      minZoom:2,
      projection: 'mercator',
    });

    map.current.once('load', () => {
      map.current.dragRotate.disable();
      map.current.touchZoomRotate.disableRotation();
      setMapIsReady(true);
      window.map = map.current; // For debugging
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, styleUrl, basemapId]);

  return (
    <MapboxContext.Provider
      value={{ map: map.current, mapContainer, isMapboxReady: mapIsReady }}
    >
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {mapIsReady && children}
    </MapboxContext.Provider>
  );
};

export const useMapbox = () => useContext(MapboxContext);
