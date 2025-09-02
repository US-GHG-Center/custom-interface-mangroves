import React, { useEffect, useCallback, useState } from 'react';
import { useDeckRasterLayer } from './rasterLayer';
import { useDeckGL, useMapbox } from '../../../context/mapContext';
import { useAreaBasedCircle } from './areaBasedCircle';
import { useCountryBoundaries } from './countryBoundaries';
import { countryMapping } from '../../../pages/dashboard';

import countryWiseBoundaries from '../../../../static/World_Countries_Boundaries.json';

const ZOOM_LEVEL_MARGIN = 5;
//this is to map the countries from the stac to the boundary geojson

const AREA_THRESHOLD = 500000;

const BBOX_AREA_THRESHOLD = 70;

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

function filterCountriesByArea(data, threshold, op = 'gt') {
  if (!data) if (!data.length) return {};
  const filteredCountries = data?.filter((item) => {
    const area = item?.boundary?.properties?.AREA;
    return op === 'gt' ? area >= threshold : area < threshold;
  });
  return filteredCountries;
}

function bboxArea(bbox) {
  if (!bbox || bbox.length !== 4) return 0;
  const [west, south, east, north] = bbox;
  return Math.abs(east - west) * Math.abs(north - south);
}

function filterCountriesByBboxArea(data, threshold, op = 'gt') {
  if (!data) if (!data.length) return {};
  const filteredCountries = data?.filter((item) => {
    const area = bboxArea(item?.bbox)
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
        setShowBoundaries(false)
      } else {
        setShowBoundaries(true)
        setShowCircle(true);
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



  const handleOnClick = useCallback((bbox) => {
    setShowCircle(false);
    setShowBoundaries(false)
    flyToBbox(bbox);
  }, []);

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
      else if (object && layer.id === 'country-boundaries-layer') {
        const name = object?.properties?.VISUALIZATION_NAME
        handleOnHover(name)
        setHoveredCountry(object);
      }
      else {
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
      if (object && layer.id === 'country-boundaries-layer') {
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
    console.log({ data })

    const circleOnlyCountries = filterCountriesByArea(data, AREA_THRESHOLD, 'lt')
    console.log({ circleOnlyCountries })

    //compare by BBOX area of the mangroves
    // const filteredCountries = filterCountriesByBboxArea(
    //   data,
    //   BBOX_AREA_THRESHOLD,
    //   'gt'
    // );
    // console.log({ data })

    // const circleOnlyCountries = filterCountriesByBboxArea(data, BBOX_AREA_THRESHOLD, 'lt')
    // console.log({ circleOnlyCountries })



    setCountriesWithNoBoundaries(circleOnlyCountries)
    const allBoundaries = filteredCountries?.map((item) => { return { ...item?.boundary, bbox: item?.bbox, name: item?.name } });

    console.log({ allBoundaries })
    //for demo purpose only
    // these are the countries without boundary data
    const allBoundariesNamesOnly = filteredCountries?.map((item) => item?.name);

    const countriesWithNoBoundaries = data?.filter((item) => !item?.boundary)?.map((item) => item?.name)
    console.log({ countriesWithNoBoundaries })

    const circleOnlyName = circleOnlyCountries.map((item) => item?.name)
    const countriesInCirclewithNoBoundaries = circleOnlyName?.filter((item) => countriesWithNoBoundaries?.includes(item))
    console.log({ countriesInCirclewithNoBoundaries })

    setCountriesWithBoundaries({
      ...countryWiseBoundaries,
      features: allBoundaries
    });
  }, [data]);

  const { rasterLayer } = useDeckRasterLayer({ collectionId, selectedAsset });
  const { circleLayer } = useAreaBasedCircle({
    stacData: countryWithNoBoundaries,
    showCircle,
  });
  const { boundariesLayer } = useCountryBoundaries({
    countryWiseBoundaries: countryWithBoundaries,
    hoveredCountry,
    showBoundries,
  });

  useEffect(() => {
    const layers = [boundariesLayer, rasterLayer, circleLayer];
    deckOverlay.setProps({ layers: layers, onHover: onHover, onClick: onClick });
  }, [deckOverlay, circleLayer, rasterLayer, boundariesLayer]);

  return <></>;
}
