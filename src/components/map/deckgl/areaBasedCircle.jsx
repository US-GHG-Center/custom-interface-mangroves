import React, { useMemo } from 'react';
import { ScatterplotLayer } from '@deck.gl/layers';

const BBOX_AREA_THRESHOLD = 0;

function bboxArea(bbox) {
  if (!bbox || bbox.length !== 4) return 0;
  const [west, south, east, north] = bbox;
  return Math.abs(east - west) * Math.abs(north - south);
}

function filterByBboxArea(data, threshold, op = 'lt') {
  if (!data) return [];
  return data.filter((item) => {
    const area = bboxArea(item.bbox);
    return op === 'lt' ? area < threshold : area > threshold;
  });
}
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
  handleClickOnCircle,
  showCircle,
}) {
  const circleLayer = useMemo(() => {
    if (!stacData) {
      return null;
    }

    const filteredData = filterByBboxArea(stacData, BBOX_AREA_THRESHOLD, 'gt');
    const weights = filteredData.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    return new ScatterplotLayer({
      id: 'circle-layer',
      data: filteredData,
      pickable: true,
      visible: showCircle,
      onClick: info => {
        if (info.object?.bbox) {
          handleClickOnCircle && handleClickOnCircle(info.object.bbox);
        }
      },
      stroked: true,
      getPosition: d => d.position,
      getFillColor: [255, 140, 0],
      getLineColor: [0, 0, 0],
      getLineWidth: 2,
      radiusScale: 50,
      getRadius: d => {
        // return d.weight
        return getRadiusOfCircle(d.weight, minWeight, maxWeight)
      },
      radiusMinPixels: 4,
      radiusMaxPixels: 100,
    });
  }, [stacData, showCircle, handleClickOnCircle]);

  return { circleLayer };
}
