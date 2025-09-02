import React from 'react'
import { useMapbox } from '../../../components'
import { Search } from '../../../components'

export function SearchComponentWrapper({ items }) {
  const { map } = useMapbox()

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
  const handleClickedOnSearch = (clickedValue) => {
    const item = items?.find((v) => v?.itemId === clickedValue)
    flyToBbox(item?.bbox)
  }
  return (
    <>
      <Search items={items} onChange={handleClickedOnSearch} />
    </>
  )
}
