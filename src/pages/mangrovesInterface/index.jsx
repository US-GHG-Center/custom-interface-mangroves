import React from 'react';
import { DashboardContainer } from '../dashboardContainer';
import { ConfigProvider } from '../../context/configContext';

export function MangrovesInterface({
  config = {},
  defaultCollectionId,
  defaultZoomLocation,
  defaultZoomLevel,
}) {
  return (
    <ConfigProvider userConfig={config}>
      <DashboardContainer
        collectionId={defaultCollectionId}
        defaultZoomLocation={defaultZoomLocation}
        defaultZoomLevel={defaultZoomLevel}
      />
    </ConfigProvider>
  );
}
