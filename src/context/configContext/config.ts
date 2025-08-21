import { MangrovesInterfaceConfig } from '../../pages/mangrovesInterface/types';

/**
 * Default configuration for the EMIT Interface
 * These values will be used if no user configuration is provided
 */
const defaultConfig: MangrovesInterfaceConfig = {
  mapboxToken: process.env.REACT_APP_MAPBOX_TOKEN || '',
  mapboxStyle: process.env.REACT_APP_MAPBOX_STYLE_URL || '',
  basemapStyle: process.env.REACT_APP_BASEMAP_STYLES_MAPBOX_ID || '',
  stacApiUrl: process.env.REACT_APP_STAC_API_URL || '',
  stacSearchApi: `${process.env.REACT_APP_STAC_API_URL}/search` || '',
  rasterApiUrl: process.env.REACT_APP_RASTER_API_URL || '',
};

/**
 * Merges user configuration with default configuration
 * @param {Partial<MangrovesInterfaceConfig>} userConfig - User provided configuration
 * @returns {MangrovesInterfaceConfig} Merged configuration
 */
export const getConfig = (
  userConfig: Partial<MangrovesInterfaceConfig> = {}
): MangrovesInterfaceConfig => {
  return {
    ...defaultConfig,
    ...userConfig,
  };
};

interface ValidationResult {
  result: boolean;
  missingFields: string[];
}

/**
 * Validates the configuration
 * @param {MangrovesInterfaceConfig} config - Configuration to validate
 * @returns {ValidationResult} Validation result with missing fields if any
 */
export const validateConfig = (
  config: MangrovesInterfaceConfig
): ValidationResult => {
  const requiredFields: (keyof MangrovesInterfaceConfig)[] = [
    'stacApiUrl',
    'stacSearchApi',
    'mapboxToken',
    'mapboxStyle',
  ];

  const missingFields = requiredFields.filter(
    (field) =>
      config[field] === undefined ||
      config[field] === null ||
      config[field] === ''
  );
  if (missingFields.length > 0) {
    return { result: false, missingFields };
  }
  return { result: true, missingFields: [] };
};
