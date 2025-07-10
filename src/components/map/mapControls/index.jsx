import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../../context/mapContext';
import { HamburgerControl } from './hamburger';
import { MeasureDistanceControl } from './measureDistance';
import { ChangeUnitControl } from './changeUnit';
import { LayerVisibilityControl } from './layerVisibility';
import { HomeControl } from './home';

import { MeasurementLayer } from '../measurementLayer';

import './index.css';
const scaleUnits = {
  KM: 'km',
  MILES: 'mi',
};
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
 * @param {boolean} props.measureMode - Whether distance measurement mode is active.
 * @param {Function} props.onClickHamburger - Handler for hamburger toggle.
 * @param {Function} props.onClickMeasureMode - Handler to toggle measurement tool.
 * @param {string} props.mapScaleUnit - Current measurement unit ('km' or 'mi').
 * @param {Function} props.setMapScaleUnit - Function to update measurement unit.
 * @param {Function} props.handleResetHome - Callback to reset the map view.
 * @param {boolean} props.openDrawer - Whether the information drawer  is open.
 * @param {Function} props.handleHideLayers - Callback to toggle layer visibility.
 *
 * @returns {JSX.Element}
 */

const DefaultMapControls = ({
  measureMode,
  onClickHamburger,
  onClickMeasureMode,
  mapScaleUnit,
  setMapScaleUnit,
  handleResetHome,
  openDrawer,
  handleHideLayers,
}) => {
  const { map } = useMapbox();
  const customControlContainer = useRef();

  /**
   * Setup static controls (hamburger, home, nav, visibility).
   */
  useEffect(() => {
    if (!map) return;

    const hamburgerControl = new HamburgerControl(onClickHamburger);
    const mapboxNavigation = new mapboxgl.NavigationControl({
      showCompass: false,
    });
    const layerVisibilityControl = new LayerVisibilityControl(handleHideLayers);
    const homeControl = new HomeControl(handleResetHome);

    const hamburgerControlElem = hamburgerControl.onAdd(map);
    const homeControlElem = homeControl.onAdd(map);

    const mapboxNavigationElem = mapboxNavigation.onAdd(map);
    const layerVisibilityControlElem = layerVisibilityControl.onAdd(map);

    const mapboxCustomControlContainer = customControlContainer.current;
    mapboxCustomControlContainer.append(hamburgerControlElem);
    mapboxCustomControlContainer.append(homeControlElem);

    mapboxCustomControlContainer.append(mapboxNavigationElem);
    mapboxCustomControlContainer.append(layerVisibilityControlElem);

    return () => {
      // clean ups
      if (hamburgerControl) hamburgerControl.onRemove();
      if (mapboxNavigation) mapboxNavigation.onRemove();
      if (layerVisibilityControl) layerVisibilityControl.onRemove();
      if (homeControl) homeControl.onRemove();
    };
  }, [map]);

  /**
   * Add the measurement tool control.
   */
  useEffect(() => {
    if (!map) return;
    const measurementControl = new MeasureDistanceControl(
      measureMode,
      onClickMeasureMode
    );

    if (measurementControl) {
      const mapboxCustomControlContainer = document.querySelector(
        '#mapbox-custom-controls'
      );
      const measurementControlElem = measurementControl.onAdd(map);
      mapboxCustomControlContainer.append(measurementControlElem);
    }

    return () => {
      // clean ups
      if (measurementControl) {
        measurementControl.onRemove();
      }
    };
  }, [map, measureMode]);

  /**
   * Add the km/mi unit toggle control.
   */
  useEffect(() => {
    if (!map) return;

    const changeUnitControl = new ChangeUnitControl(
      mapScaleUnit,
      setMapScaleUnit
    );

    const mapboxCustomControlContainer = document.querySelector(
      '#mapbox-custom-controls'
    );
    const changeUnitControlElem = changeUnitControl.onAdd(map);
    mapboxCustomControlContainer.append(changeUnitControlElem);

    return () => {
      // clean ups
      if (changeUnitControl) {
        changeUnitControl.onRemove();
      }
    };
  }, [map, mapScaleUnit, measureMode]);

  /**
   * Add the Mapbox scale bar.
   * The mapbox scale is in the  bottom left corner and is in sync with the
   * above scale unit control
   */
  useEffect(() => {
    const unit = mapScaleUnit === 'km' ? 'metric' : 'imperial';
    if (!map) return;
    const scaleControl = new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: unit,
    });

    if (scaleControl) {
      map.addControl(scaleControl);
    }

    return () => {
      // clean ups
      if (scaleControl) map.removeControl(scaleControl);
    };
  }, [map, mapScaleUnit, measureMode]);

  return (
    <div
      id='mapbox-custom-controls'
      ref={customControlContainer}
      style={{ right: openDrawer ? '30.7rem' : '0.5rem' }}
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
 * @param {boolean} props.openDrawer - Whether the side drawer is open (affects layout).
 * @param {Function} props.setOpenDrawer - Function to toggle the drawer state.
 * @param {Function} props.handleResetHome - Callback to reset the map view.
 * @param {Function} props.handleHideLayers - Callback to toggle visualization layers.
 *
 * @returns {JSX.Element}
 */

export const MapControls = ({
  openDrawer,
  setOpenDrawer,
  handleResetHome,
  handleHideLayers,
}) => {
  const [measureMode, setMeasureMode] = useState(false);
  const [clearMeasurementIcon, setClearMeasurementIcon] = useState(false);
  const [clearMeasurementLayer, setClearMeasurementLayer] = useState(false);
  const [mapScaleUnit, setMapScaleUnit] = useState(scaleUnits.MILES);
  return (
    <>
      <DefaultMapControls
        openDrawer={openDrawer}
        measureMode={measureMode}
        onClickHamburger={() => {
          setOpenDrawer((openDrawer) => !openDrawer);
        }}
        onClickMeasureMode={() => {
          setMeasureMode((measureMode) => !measureMode);
        }}
        onClickClearIcon={() => {
          setClearMeasurementLayer(true);
        }}
        clearMeasurementIcon={clearMeasurementIcon}
        mapScaleUnit={mapScaleUnit}
        setMapScaleUnit={setMapScaleUnit}
        handleResetHome={handleResetHome}
        handleHideLayers={handleHideLayers}
      />
      <MeasurementLayer
        measureMode={measureMode}
        setMeasureMode={setMeasureMode}
        setClearMeasurementIcon={setClearMeasurementIcon}
        clearMeasurementLayer={clearMeasurementLayer}
        setClearMeasurementLayer={setClearMeasurementLayer}
        mapScaleUnit={mapScaleUnit}
      />
    </>
  );
};
