import React, { useEffect, useMemo } from 'react';
import { IconLayer } from '@deck.gl/layers';


/**
 * MarkerComponent: Adds mangrove markers to the map.
 * @param {Array} stacData - STAC item array with .position
 */

const ICON_MAPPING = {
  marker: {
    x: 0,
    y: 0,
    width: 128,
    height: 128,
    anchorY: 128,
    mask: true,
  },
  'marker-warning': {
    x: 128,
    y: 0,
    width: 128,
    height: 128,
    anchorY: 128,
    mask: false,
  },
};
// Configurable threshold for bbox area (in degrees^2)
const BBOX_AREA_THRESHOLD = 10;

/**
 * Calculate the area of a bounding box.
 * @param {number[]} bbox - [west, south, east, north]
 * @returns {number} Area in degrees^2
 */
function bboxArea(bbox) {
  if (!bbox || bbox.length !== 4) return 0;
  const [west, south, east, north] = bbox;
  return Math.abs(east - west) * Math.abs(north - south);
}

/**
 * Filter STAC items by bbox area.
 * @param {Array} data - Array of STAC items with bbox property.
 * @param {number} threshold - Area threshold.
 * @param {string} op - 'gt' for greater than, 'lt' for less than.
 * @returns {Array} Filtered array.
 */
function filterByBboxArea(data, threshold, op = 'lt') {
  return data.filter((item) => {
    const area = bboxArea(item.bbox);
    return op === 'lt' ? area < threshold : area > threshold;
  });
}

export function useMarkerLayer({
  stacData,
  handleClickOnMarker,
  showMarkers,
}) {
  const markerLayer = useMemo(() => {
    if (!stacData) {
      return null;
    }

    const filtered = filterByBboxArea(stacData, BBOX_AREA_THRESHOLD);

    return new IconLayer({
      id: 'mangrove-markers',
      data: filtered,
      pickable: true,
      visible: showMarkers,
      iconAtlas:
        'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
      iconMapping: ICON_MAPPING,
      getIcon: () => 'marker',
      sizeScale: 8,
      getPosition: (d) => d.position,
      getSize: 4,
      getColor: [34, 139, 34, 255],
      getAnchor: () => 'bottom',
      onClick: (info) => {

        if (handleClickOnMarker && info.object?.bbox) {
          handleClickOnMarker(info.object.bbox);
        }
      },
    });
  }, [stacData, showMarkers, handleClickOnMarker]);
  return { markerLayer };
}