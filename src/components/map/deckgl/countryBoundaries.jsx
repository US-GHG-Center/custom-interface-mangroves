
import { useMemo } from 'react';
import { MVTLayer } from '@deck.gl/geo-layers';
import { useConfig } from '../../../context/configContext';

const DEFAULT_COLOR = [0, 0, 0, 0];
const DEFAULT_LINE_COLOR = [40, 150, 225, 80];
const HIGHLIGHT_LINE_COLOR = [30, 144, 255, 255];

export function useCountryBoundaries({
  countries = ['yemen'], // array of country names
  hoveredCountry,
  showBoundries
}) {
  const { config } = useConfig();
  const mapboxToken = config?.mapboxToken
  const boundariesLayer = useMemo(() => {
    if (!mapboxToken || !Array.isArray(countries) || countries.length === 0) {
      return null;
    }
    return new MVTLayer({
      id: 'country-boundaries-mvt-layer',
      data: `https://api.mapbox.com/v4/mapbox.country-boundaries-v1/{z}/{x}/{y}.vector.pbf?access_token=${mapboxToken}`,
      visible: showBoundries,
      pickable: true,
      stroked: true,
      filled: true,
      getLineColor: (feature) => {
        if (
          hoveredCountry &&
          hoveredCountry.properties?.name === feature.properties?.name
        ) {
          return HIGHLIGHT_LINE_COLOR;
        }
        return DEFAULT_LINE_COLOR;
      },
      getFillColor: DEFAULT_COLOR,
      getLineWidth: (feature) => {
        if (
          hoveredCountry &&
          hoveredCountry.properties?.name === feature.properties?.name
        ) {
          return 4;
        }
        return 2;
      },
      lineWidthUnits: 'pixels',
      updateTriggers: {
        getLineWidth: [hoveredCountry],
        getLineColor: [hoveredCountry],
      },
      filterFeature: (feature) => {
        // Only show boundaries for selected countries
        return countries.includes(feature.properties?.name);
      },
    });
  }, [mapboxToken, countries, showBoundries, hoveredCountry]);

  return { boundariesLayer };
}
