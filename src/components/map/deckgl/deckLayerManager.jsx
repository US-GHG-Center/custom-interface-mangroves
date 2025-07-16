import React, { useEffect, useCallback, useState } from 'react';
import { useDeckRasterLayer } from './rasterLayer';
import { useDeckGL, useMapbox } from '../../../context/mapContext';
import { useMarkerLayer } from './markerComponents';

export function DeckLayers({
  collectionId,
  stacData,
  selectedAsset,
  setZoomLocation,
  setZoomLevel,
}) {
  const { deckOverlay } = useDeckGL();

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

  const { rasterLayer } = useDeckRasterLayer({ collectionId, selectedAsset });
  const { markerLayer } = useMarkerLayer({
    stacData,
    handleClickOnMarker,
  });

  useEffect(() => {
    const layers = [rasterLayer, markerLayer];
    deckOverlay.setProps({ layers: layers });
  }, [rasterLayer, deckOverlay]);

  return null;
}
