import React, { useEffect, useCallback, useState } from 'react';
import { useDeckRasterLayer } from './rasterLayer';
import { useDeckGL, useMapbox } from '../../../context/mapContext';
import { useMarkerLayer } from './markerComponents';
import { useAreaBasedCircle } from './areaBasedCircle';


const ZOOM_LEVEL_MARGIN = 4
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
  const [showCircle, setShowCircle] = useState(true)

  const handleZoomOutEvent = (zoom) => {
    setZoomLevel(zoom);
    setZoomLocation([]);
  };

  useEffect(() => {
    if (!map) return;
    const handleViewportChange = () => {
      const zoom = map.getZoom();
      // console.log({ zoom })
      if (zoom >= ZOOM_LEVEL_MARGIN) {

        setShowCircle(false)
      } else {

        setShowCircle(true)
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

  const handleClickOnCircle = useCallback((bbox) => {
    setShowCircle(false)
    flyToBbox(bbox);
  }, []);

  const handleOnHoverOnCircle = useCallback((v) => {
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
  const { circleLayer } = useAreaBasedCircle({
    stacData,
    handleClickOnMarker: handleClickOnCircle,
    handleOnHover: handleOnHoverOnCircle,
    showMarkers: showCircle,
    setShowMarkers: setShowCircle
  });

  useEffect(() => {
    if (rasterLayer && circleLayer) {
      const layers = [rasterLayer, circleLayer];
      deckOverlay.setProps({ layers: layers });
    }
  }, [deckOverlay, circleLayer, rasterLayer]);

  return <></>;
}
