import { useMemo } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';

const DEFAULT_COLOR = [0, 0, 0, 0];
const FIXED_LINE_COLOR = [128, 128, 128, 100]; // Fixed grey color for all countries

export function useAllCountryBoundaries({
  allCountriesGeojson
}) {
  const allBoundariesLayer = useMemo(() => {
    if (!allCountriesGeojson ) {
      return null;
    }

    return new GeoJsonLayer({
      id: 'all-country-boundaries-layer',
      data: allCountriesGeojson,
      // Style Properties
      stroked: true,
      filled: true,
      visible: true,
      getLineColor: FIXED_LINE_COLOR,
      getFillColor: DEFAULT_COLOR,
      getLineWidth: 1, // Fixed 1 pixel width
      lineWidthUnits: 'pixels',
      pickable: false, // Disable picking to remove hover effects
    });
  }, [allCountriesGeojson]);

  return { allBoundariesLayer };
}