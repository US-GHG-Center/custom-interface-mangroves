import { useMemo } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';

const DEFAULT_COLOR = [0, 0, 0, 0];
const DEFAULT_LINE_COLOR = [40, 150, 225, 80];
const HIGHLIGHT_LINE_COLOR = [30, 144, 255, 255];

export function useCountryBoundaries({
  countryWiseBoundaries,
  hoveredCountry,
}) {
  const boundariesLayer = useMemo(() => {
    if (!countryWiseBoundaries) {
      return null;
    }

    return new GeoJsonLayer({
      id: 'country-boundaries-layer',
      data: countryWiseBoundaries,

      // Style Properties
      stroked: true,
      filled: true,
      getLineColor: (feature) => {
        if (
          hoveredCountry &&
          hoveredCountry.properties.NAME === feature.properties.NAME
        ) {
          return HIGHLIGHT_LINE_COLOR;
        }
        return DEFAULT_LINE_COLOR;
      },

      getFillColor: DEFAULT_COLOR,
      getLineWidth: (feature) => {
        if (
          hoveredCountry &&
          hoveredCountry.properties.NAME === feature.properties.NAME
        ) {
          return 4; // Highlighted width
        }
        return 2; // Default width
      },
      lineWidthUnits: 'pixels',
      pickable: true,
      updateTriggers: {
        getLineWidth: [hoveredCountry],
        getLineColor: [hoveredCountry],
      },
    });
  }, [countryWiseBoundaries, hoveredCountry]);

  return { boundariesLayer };
}
