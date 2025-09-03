import React from 'react';
import { DashboardContainer } from '../dashboardContainer';
import { ConfigProvider } from '../../context/configContext';
import { ThemeProvider } from '@mui/material';
import theme from '../../../theme'

export function MangrovesInterface({
  config = {},
  defaultCollectionId,
  defaultZoomLocation,
  defaultZoomLevel,
}) {
  return (
    <ThemeProvider theme={theme}>
      <ConfigProvider userConfig={config}>
        <DashboardContainer
          collectionId={defaultCollectionId}
          defaultZoomLocation={defaultZoomLocation}
          defaultZoomLevel={defaultZoomLevel}
        />
      </ConfigProvider>
    </ThemeProvider>
  );
}
