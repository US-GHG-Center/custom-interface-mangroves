import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../../context/mapContext';
import { HomeControl } from './home';

/**
 * DefaultMapControls Component
 *
 * Renders and manages custom and built-in Mapbox controls including:
 * - Hamburger menu
 * - Home/reset view
 * - Zoom In/Out
 * - Layer visibility toggler
 * - Measurement tool
 * - Unit switching (km/mi)
 *
 * Uses custom control classes (React + Mapbox hybrid controls),
 * and appends them to a single floating container over the map.
 *
 * @param {Object} props
 * @param {Function} props.handleResetHome - Callback to reset the map view.
 *
 * @returns {JSX.Element}
 */

const DefaultMapControls = ({
  handleResetHome,
}) => {
  const { map } = useMapbox();
  const customControlContainer = useRef();

  /**
   * Setup static controls (hamburger, home, nav, visibility).
   */
  useEffect(() => {
    if (!map) return;

    const mapboxNavigation = new mapboxgl.NavigationControl({
      showCompass: false,
    });
    const homeControl = new HomeControl(handleResetHome);
    const homeControlElem = homeControl.onAdd(map);
    const mapboxNavigationElem = mapboxNavigation.onAdd(map);
    const mapboxCustomControlContainer = customControlContainer.current;
    mapboxCustomControlContainer.append(homeControlElem);
    mapboxCustomControlContainer.append(mapboxNavigationElem);

    return () => {
      if (mapboxNavigation) mapboxNavigation.onRemove();
      if (homeControl) homeControl.onRemove();
    };
  }, [map]);


  return (
    <div
      id='mapbox-custom-controls'
      ref={customControlContainer}

    ></div>
  );
};

/**
 * MapControls Component
 *
 * Combines all interactive map controls and the measurement layer logic.
 * Wraps `DefaultMapControls` for UI and `MeasurementLayer`.
 *
 * @param {Object} props
 * @param {Function} props.handleResetHome - Callback to reset the map view.
 *
 * @returns {JSX.Element}
 */

export const MapControls = ({

  handleResetHome,

}) => {
  return (
    <>
      <DefaultMapControls
        handleResetHome={handleResetHome}
      />
    </>
  );
};
