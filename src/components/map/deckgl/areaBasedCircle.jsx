import React, { useMemo } from 'react';
import { ScatterplotLayer } from '@deck.gl/layers';


const getRadiusOfCircle = (weight, minWeight, maxWeight) => {
  const MIN_RADIUS_METERS = 1500;
  const MAX_RADIUS_METERS = 3000;

  // If all values are the same, return the minimum radius.
  if (minWeight === maxWeight) {
    return MIN_RADIUS_METERS;
  }
  const logWeight = Math.log(Math.max(weight, 1));
  const logMin = Math.log(Math.max(minWeight, 1));
  const logMax = Math.log(Math.max(maxWeight, 1));
  const scale = (logWeight - logMin) / (logMax - logMin);
  const radius_value = MIN_RADIUS_METERS + scale * (MAX_RADIUS_METERS - MIN_RADIUS_METERS);
  return radius_value
};

export function useAreaBasedCircle({
  stacData,
  showCircle,
}) {
  const circleLayer = useMemo(() => {
    if (!stacData || !stacData?.length > 0) {
      return null;
    }
    const weights = stacData?.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    return new ScatterplotLayer({
      id: 'circle-layer',
      data: stacData,
      pickable: true,
      visible: showCircle,
      stroked: true,
      getPosition: d => d.position,
      getFillColor: [255, 140, 0],
      getLineColor: [0, 0, 0],
      getLineWidth: 2,
      radiusScale: 50,
      getRadius: d =>
        getRadiusOfCircle(d.weight, minWeight, maxWeight),
      radiusMinPixels: 4,
      radiusMaxPixels: 100,
    });
  }, [stacData, showCircle]);

  return { circleLayer };
}
