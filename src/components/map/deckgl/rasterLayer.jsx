import React, { useEffect, useState } from 'react';
import { ZOOM_THRESHOLD } from '../utils/constants';
import { CACHE_TTL, setCache, getCache, clearCache } from '../utils/index';
import { Tile3DLayer, TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers';
import { useConfig } from '../../../context/configContext';

const RASTER_LAYER_ID = 'mangrove-cog-dynamic';

async function fetchTileUrl(selectedAsset, COLLECTION_NAME, RASTER_ENDPOINT) {
  try {
    // 1. Register search (cache by collection)
    const registerKey = `raster-register-${COLLECTION_NAME}`;
    let registerData = getCache(registerKey);
    if (!registerData) {
      const registerResp = await fetch(`${RASTER_ENDPOINT}/searches/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'filter-lang': 'cql2-json',
          filter: {
            op: 'eq',
            args: [{ property: 'collection' }, COLLECTION_NAME],
          },
        }),
      });
      registerData = await registerResp.json();
      setCache(registerKey, registerData, CACHE_TTL);
    }
    // 2. Find the tilejson link
    const tilejsonLink = registerData.links.find(
      (link) => link.rel === 'tilejson'
    );
    if (!tilejsonLink) return;
    // 3. Replace {tileMatrixSetId} with WebMercatorQuad and use selectedAsset
    const tilejsonUrl =
      tilejsonLink.href.replace('{tileMatrixSetId}', 'WebMercatorQuad') +
      `?assets=${selectedAsset}&colormap_name=greens&rescale=1%2C45&nodata=0&tile_scale=2`;
    // 4. Fetch tilejson (cache by tilejsonUrl)
    let tilejsonData = getCache(tilejsonUrl);
    if (!tilejsonData) {
      const tilejsonResp = await fetch(tilejsonUrl);
      tilejsonData = await tilejsonResp.json();
      setCache(tilejsonUrl, tilejsonData, CACHE_TTL);
    }
    // 5. Get the first tile URL
    if (tilejsonData.tiles && tilejsonData.tiles.length > 0) {
      return tilejsonData.tiles[0];
    }
  } catch (err) {
    console.log('Error while fetching tileUrl', err);
    return false;
  }
}
export function useDeckRasterLayer({ collectionId, selectedAsset }) {
  const { config } = useConfig();

  const COLLECTION_NAME = collectionId;
  const RASTER_ENDPOINT = config.rasterApiUrl;
  const [rasterLayer, setRasterLayer] = useState(null);

  useEffect(() => {
    window.Tile3DLayer = Tile3DLayer;
    window.GeoJsonLayer = GeoJsonLayer;
    window.ArcLayer = ArcLayer;
  }, []);
  useEffect(() => {
    if (!selectedAsset || !collectionId) {
      setRasterLayer(null); // Clear the layer if no asset is selected
      return;
    }
    async function init() {
      try {
        const tileUrl = await fetchTileUrl(
          selectedAsset,
          COLLECTION_NAME,
          RASTER_ENDPOINT
        );

        if (tileUrl) {
          const tileLayer = new TileLayer({
            id: RASTER_LAYER_ID,
            data: tileUrl,
            minZoom: ZOOM_THRESHOLD - 1,
            maxZoom: 18,
            tileSize: 256,
            opacity: 1,
            pickable: false,
            maxRequests: 8,
            onTileError: (error) => {
              console.log('Error occurred', error);
            },
            renderSubLayers: (props) => {
              try {
                const {
                  _bbox: { west, south, east, north },
                } = props.tile;

                return new BitmapLayer(props, {
                  data: null,
                  image: props.data,
                  bounds: [west, south, east, north],
                  colorDomain: [0, 255],
                  colorRange: [
                    [0, 0, 0, 0],
                    [34, 139, 34, 200],
                    [0, 100, 0, 255],
                  ],
                });
              } catch (err) {
                console.log('Error while adding bitmap layer', err);
              }
            },
          });
          setRasterLayer(tileLayer);
        } else {
          setRasterLayer(null);
        }
      } catch (error) {
        console.log('Error while adding layer', error);
      }
    }

    init();
  }, [selectedAsset, collectionId]);

  return { rasterLayer };
}
