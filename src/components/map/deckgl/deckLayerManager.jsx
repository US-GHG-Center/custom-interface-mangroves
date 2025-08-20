import React, { useEffect, useCallback, useState } from 'react';
import { useDeckRasterLayer } from './rasterLayer';
import { useDeckGL, useMapbox } from '../../../context/mapContext';
import { useAreaBasedCircle } from './areaBasedCircle';


const ZOOM_LEVEL_MARGIN = 4;

const countryMapping = {
  Fiji: "Fiji - Eastern Hemisphere",
  Fiji2: "Fiji - Western Hemisphere",
  Somalia2: "Somalia",
  Somalia: "Somalia - Southern Coast"
}

function camelCaseToSpaces(camelCaseString) {
  let withSpaces = camelCaseString.replace(/([A-Z])/g, ' $1');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
}

export function DeckLayers({
  collectionId,
  stacData,
  selectedAsset,
  setZoomLocation,
  setZoomLevel,
}) {
  const { deckOverlay } = useDeckGL();
  const { map } = useMapbox();
  const [showCircle, setShowCircle] = useState(true)

  const handleZoomOutEvent = (zoom) => {
    setZoomLevel(zoom);
    setZoomLocation([]);
  };

  useEffect(() => {
    if (!map) return;
    const handleViewportChange = () => {
      const zoom = map.getZoom();
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
    const fitbox = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]]
    map.fitBounds(fitbox, {
      offset: [60, 20],//offset in pixels to compensate for the dialog in the top left corner
      padding: 20, // Add 20 pixels of padding around the bounding box
      duration: 2000 // Animate the transition over 2 seconds
    });
  };

  const handleClickOnCircle = useCallback((bbox) => {
    setShowCircle(false)
    flyToBbox(bbox);
  }, []);

  const handleOnHoverOnCircle = useCallback((v) => {
    if (v?.itemId) {
      const idSplits = v?.itemId?.split('-');
      const spacedCountryName = camelCaseToSpaces(idSplits.pop()).trim();
      const countryName = countryMapping[spacedCountryName] ? countryMapping[spacedCountryName] : spacedCountryName;
      deckOverlay.setProps({
        getCursor: () => {
          return 'pointer';
        }
      })
      deckOverlay.setProps({
        getTooltip: () => ({
          html: countryName,
          style: {
            backgroundColor: 'white',
            color: 'black',
            fontWeight: 500,
            fontSize: '14px',
            padding: '4px 14px',
            borderRadius: '5px'
          }
        })
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
    handleClickOnCircle,
    handleOnHover: handleOnHoverOnCircle,
    showCircle,
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
