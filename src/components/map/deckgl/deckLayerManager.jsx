import React, { useEffect, useCallback, useState } from 'react';
import { useDeckRasterLayer } from './rasterLayer';
import { useDeckGL, useMapbox } from '../../../context/mapContext';
import { useMarkerLayer } from './markerComponents';


const ZOOM_LEVEL_MARGIN = 5
export function DeckLayers({
  collectionId,
  stacData,
  selectedAsset,
  setZoomLocation,
  setZoomLevel,
}) {
  const { deckOverlay } = useDeckGL();
  const { map } = useMapbox();
  const [showMarkers, setShowMarkers] = useState(true)

  const handleZoomOutEvent = (zoom) => {
    setZoomLevel(zoom);
    setZoomLocation([]);
  };

  useEffect(() => {
    if (!map) return;
    const handleViewportChange = () => {
      const zoom = map.getZoom();

      if (zoom >= ZOOM_LEVEL_MARGIN) {
        setShowMarkers(false)
      } else {
        setShowMarkers(true)
        handleZoomOutEvent(zoom);
      }
    };

    map.on('zoomend', handleViewportChange);
    map.on('dragend', handleViewportChange);
    // map.on('moveend', handleViewportChange);

    return () => {

      map.off('zoomend', handleViewportChange);
      map.off('dragend', handleViewportChange);
      // map.on('moveend', handleViewportChange);
    };
  }, [map]);

  const flyToBbox = (bbox) => {
    if (!deckOverlay || !map) return;
    const zoomLat = (bbox[0] + bbox[2]) / 2;
    const zoomLon = (bbox[1] + bbox[3]) / 2;
    setZoomLocation([zoomLat, zoomLon]);
    setZoomLevel(9);
  };

  const handleClickOnMarker = useCallback((bbox) => {
    flyToBbox(bbox);
  }, []);

  const handleOnHoverOnMarkers = useCallback((v) => {
    if (v) {
      deckOverlay.setProps({
        getCursor: () => {
          return 'pointer';
        }
      })
    } else {
      deckOverlay.setProps({
        getCursor: () => {
          return 'grab';
        }
      })
    }

  }, [])

  const { rasterLayer } = useDeckRasterLayer({ collectionId, selectedAsset });
  const { markerLayer } = useMarkerLayer({
    stacData,
    handleClickOnMarker,
    handleOnHover:handleOnHoverOnMarkers,
    showMarkers
  });

  useEffect(() => {

    if (markerLayer) {
      const layers = [rasterLayer, markerLayer];
      deckOverlay.setProps({ layers: layers });
    }
  }, [deckOverlay, markerLayer, rasterLayer]);

  return <></>;
}
