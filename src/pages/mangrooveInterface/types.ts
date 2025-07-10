export interface MangrooveInterfaceConfig {
  metadataEndpoint: string;
  stacApiUrl: string;
  coverageUrl: string;
  mapboxToken: string;
  mapboxStyle: string;
  basemapStyle: string;
  rasterApiUrl: string;
  geoApifyKey: string;
  latlonEndpoint: string;
}

export interface MangrooveInterfacePropss {
  config?: Partial<MangrooveInterfaceConfig>;
  defaultCollectionId: string;
  defaultZoomLocation: string;
  defaultZoomLevel: string;
  defaultStartDate: string;
}
