export interface MangrooveInterfaceConfig {
  stacApiUrl: string;
  stacSearchApi: string;
  mapboxToken: string;
  mapboxStyle: string;
  basemapStyle: string;
  rasterApiUrl: string;
}

export interface MangrooveInterfacePropss {
  config?: Partial<MangrooveInterfaceConfig>;
  defaultCollectionId: string;
  defaultZoomLocation: string;
  defaultZoomLevel: string;
  defaultStartDate: string;
}
