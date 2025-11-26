import React, { useEffect, useCallback, useState } from 'react';
import { useDeckRasterLayer } from './rasterLayer';
import { useDeckGL, useMapbox } from '../../../context/mapContext';
import { useAreaBasedCircle } from './areaBasedCircle';
import { useCountryBoundaries } from './countryBoundaries';
import { useAllCountryBoundaries } from './allCountryBoundaries';
import { countryMapping } from '../../../pages/dashboard';
import countryWiseBoundaries from '../../../../static/countries.json';

const ZOOM_LEVEL_MARGIN = 5;
//this is to map the countries from the stac to the boundary geojson

const AREA_THRESHOLD = 1200; //in square miles



function filterCountriesByArea(data, threshold, op = 'gt') {
  if (!data) if (!data.length) return {};
  const filteredCountries = data?.filter((item) => {
    const area = item?.boundary?.properties?.AREA_SQMI || 0;
    return op === 'gt' ? area >= threshold : area < threshold;
  });
  return filteredCountries;
}

function camelCaseToSpaces(camelCaseString) {
  let withSpaces = camelCaseString.replace(/([A-Z])/g, ' $1');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
}

export function DeckLayers({
  collectionId,
  data,
  selectedAsset,
  setZoomLocation,
  setZoomLevel,
}) {
  const { deckOverlay } = useDeckGL();
  const { map } = useMapbox();
  const [showCircle, setShowCircle] = useState(true);
  const [showBoundries, setShowBoundaries] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [countryWithBoundaries, setCountriesWithBoundaries] = useState(null)
  const [countryWithNoBoundaries, setCountriesWithNoBoundaries] = useState(null)

  const handleZoomOutEvent = (zoom) => {
    setZoomLevel(zoom);
    setZoomLocation([]);
  };

  useEffect(() => {
    if (!map) return;
    const handleViewportChange = () => {
      const zoom = map.getZoom();
      if (zoom >= ZOOM_LEVEL_MARGIN) {
        setShowCircle(false);
        setShowBoundaries(false);
      } else {
        setShowBoundaries(true);
        setShowCircle(true);
        handleZoomOutEvent(zoom);
      }
      setZoomLevel(zoom);
    };

    map.on('zoomend', handleViewportChange);
    map.on('dragend', handleViewportChange);

    return () => {
      map.off('zoomend', handleViewportChange);
      map.off('dragend', handleViewportChange);
    };
  }, [map]);

  const flyToBbox = (bbox) => {
    if (!bbox || !map) return;
    const fitbox = [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]],
    ];
    map.fitBounds(fitbox, {
      offset: [60, 20], //offset in pixels to compensate for the dialog in the top left corner
      padding: 20, // Add 20 pixels of padding around the bounding box
      duration: 2000, // Animate the transition over 2 seconds
    });
  };

  const handleOnClick = useCallback((bbox) => {
    setZoomLocation([]); // Clear locked location to prevent MapZoom from snapping back
    setShowCircle(false);
    setShowBoundaries(false);
    flyToBbox(bbox);
  }, [map, setZoomLocation]);

  const handleOnHover = (name) => {
    const countryName = countryMapping[name]
      ? countryMapping[name]
      : name;
    deckOverlay.setProps({
      getCursor: () => {
        return 'pointer';
      },
      getTooltip: () => ({
        html: countryName,
        style: {
          backgroundColor: 'white',
          color: 'black',
          fontWeight: 500,
          fontSize: '14px',
          padding: '4px 14px',
          borderRadius: '5px',
        },
      }),
    });
    return;
  };

  const onHover = useCallback(
    (info) => {
      const { layer, object } = info;
      if (object && layer.id === 'circle-layer') {
        const idSplits = object?.itemId?.split('-');
        const spacedCountryName = camelCaseToSpaces(idSplits.pop()).trim();
        handleOnHover(spacedCountryName);
      }
      else if (object && (layer.id === 'country-boundaries-layer')) {
        const name = object?.properties?.NAME
        handleOnHover(name)
        setHoveredCountry(object);
      }
      else {
        setHoveredCountry(null)
        deckOverlay.setProps({
          getCursor: () => {
            return 'grab';
          },
          getTooltip: () => null,
        });
      }
    },
    [deckOverlay]
  );
  const onClick = useCallback(
    (info) => {
      const { layer, object } = info;
      if (object && layer.id === 'circle-layer') {
        const bbox = object?.bbox
        handleOnClick(bbox);
      }
      if (object && (layer.id === 'country-boundaries-layer')) {
        const bbox = object?.bbox
        handleOnClick(bbox);
      }
    },
    [deckOverlay]
  );


  useEffect(() => {
    //for undefined data
    if (!data || !data.length) {
      return;
    }

    //compare by country area

    const filteredCountries = filterCountriesByArea(
      data,
      AREA_THRESHOLD,
      'gt'
    );

    const circleOnlyCountries = filterCountriesByArea(data, AREA_THRESHOLD, 'lt')

    setCountriesWithNoBoundaries(circleOnlyCountries)
    const allBoundaries = filteredCountries?.map((item) => { return { ...item?.boundary, bbox: item?.bbox, name: item?.name } });

    setCountriesWithBoundaries({
      ...countryWiseBoundaries,
      features: allBoundaries
    });
  }, [data]);

  const { rasterLayer } = useDeckRasterLayer({ collectionId, selectedAsset, showRaster: !showCircle });
  const { circleLayer } = useAreaBasedCircle({
    stacData: countryWithNoBoundaries,
    showCircle,
  });
  const { boundariesLayer } = useCountryBoundaries({
    countryWiseBoundaries: countryWithBoundaries,
    hoveredCountry,
    showBoundries,
  });
  const { allBoundariesLayer } = useAllCountryBoundaries({
    allCountriesGeojson: countryWiseBoundaries,
  });

  useEffect(() => {
    const layers = [allBoundariesLayer, boundariesLayer, rasterLayer, circleLayer];
    deckOverlay.setProps({ layers: layers, onHover: onHover, onClick: onClick });
  }, [deckOverlay, circleLayer, rasterLayer, boundariesLayer, allBoundariesLayer]);

  return <></>;
}
