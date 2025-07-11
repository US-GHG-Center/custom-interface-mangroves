import React, { useEffect, useState } from 'react';
import { TileLayer } from '@deck.gl/geo-layers';
import { ZOOM_THRESHOLD } from '../utils/constants';
import { CACHE_TTL, setCache, getCache } from '../utils/index'
import { Tile3DLayer, TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers';
import { useDeckGL } from '../../../context/mapContext';


export function RasterLayer({ config, collectionId, selectedAsset }) {
  const { deckOverlay } = useDeckGL();
  const COLLECTION_NAME = collectionId
  const RASTER_ENDPOINT = config.rasterApiUrl
  async function fetchTileUrl() {
    try {
      // 1. Register search (cache by collection)
      const registerKey = `raster-register-${COLLECTION_NAME}`;
      let registerData = getCache(registerKey);
      if (!registerData) {
        const registerResp = await fetch(`${RASTER_ENDPOINT}/searches/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "filter-lang": "cql2-json",
            "filter": {
              "op": "eq",
              "args": [{ "property": "collection" }, COLLECTION_NAME]
            }
          })
        });
        registerData = await registerResp.json();
        setCache(registerKey, registerData, CACHE_TTL);
      }
      // 2. Find the tilejson link
      const tilejsonLink = registerData.links.find(link => link.rel === 'tilejson');
      if (!tilejsonLink) return;
      // 3. Replace {tileMatrixSetId} with WebMercatorQuad and use selectedAsset
      const tilejsonUrl = tilejsonLink.href.replace('{tileMatrixSetId}', 'WebMercatorQuad') + `?assets=${selectedAsset}&colormap_name=greens&rescale=1%2C45&nodata=0&tile_scale=2`;
      // 4. Fetch tilejson (cache by tilejsonUrl)
      let tilejsonData = getCache(tilejsonUrl);
      if (!tilejsonData) {
        const tilejsonResp = await fetch(tilejsonUrl);
        tilejsonData = await tilejsonResp.json();
        setCache(tilejsonUrl, tilejsonData, CACHE_TTL);
      }
      // 5. Get the first tile URL
      if (tilejsonData.tiles && tilejsonData.tiles.length > 0) {
        return tilejsonData.tiles[0]
      }
    } catch (err) {
      console.log("Error while fetching tileUrl", err)
      return false
    }
  }
  useEffect(() => {
    window.Tile3DLayer = Tile3DLayer;
    window.GeoJsonLayer = GeoJsonLayer;
    window.ArcLayer = ArcLayer;
  }, []);
  useEffect(() => {
    if (!deckOverlay) {
      console.warn('DeckOverlay not initialized yet.');
      return;
    }

    async function init() {
      const tileUrl = await fetchTileUrl();
      const tileLayer = new TileLayer({
        id: 'mangrove-cog-dynamic',
        data: tileUrl,
        minZoom: ZOOM_THRESHOLD - 1,
        maxZoom: 18,
        tileSize: 256,
        opacity: 1,
        pickable: false,
        maxRequests: 8,
        renderSubLayers: (props) => {
          // console.log({ props })
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
        },
      });

      if (deckOverlay) {
        deckOverlay.setProps({ layers: [tileLayer] });
      }
    }
    init()
  }, [deckOverlay])
  return null
}


