import { RESPONSE_LIMIT } from '../utils/constants.ts';

const calculateWeight = (bbox) => {
  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  return width * height;
};

// Process STAC items to extract centroids and metadata
export const processSTACItems = async (config, collectionId) => {
  try {
    const cqlFilter = {
      'filter-lang': 'cql2-json',
      filter: {
        op: 'and',
        args: [{ op: 'eq', args: [{ property: 'collection' }, collectionId] }],
      },
      limit: RESPONSE_LIMIT,
      fields: {
        include: ['bbox'],
        exclude: ['collection', 'links'],
      },
    };
    const response = await fetch(config.stacSearchApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cqlFilter),
    });
    const data = await response.json();

    return data.features.map((item) => {
      const bbox = item.bbox;
      const centroid = [
        (bbox[0] + bbox[2]) / 2, // longitude
        (bbox[1] + bbox[3]) / 2, // latitude
      ];

      return {
        position: centroid,
        weight: calculateWeight(bbox),
        itemId: item.id,
        bbox: bbox,
      };
    });
  } catch (error) {
    console.error('Error fetching STAC data:', error);
    return [];
  }
};

export const getCollectionInfo = async (config, collectionId) => {
  try {
    const url = `${config.stacApiUrl}/collections/${collectionId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching STAC collection info', error);
    return [];
  }
};
