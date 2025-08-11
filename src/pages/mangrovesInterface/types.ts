export interface MangrovesInterfaceConfig {
  stacApiUrl: string;
  stacSearchApi: string;
  mapboxToken: string;
  mapboxStyle: string;
  basemapStyle: string;
  rasterApiUrl: string;
}

export interface MangrovesInterfacePropss {
  config?: Partial<MangrovesInterfaceConfig>;
  defaultCollectionId: string;
  defaultZoomLocation: string;
  defaultZoomLevel: string;
  defaultStartDate: string;
}
