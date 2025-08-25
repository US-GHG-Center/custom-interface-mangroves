// context/DeckGLContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { useMapbox } from './mapbox';

const DeckGLContext = createContext();

export const DeckGLProvider = ({ children }) => {
  const { map, isMapboxReady } = useMapbox();
  const deckOverlay = useRef(null);
  const [deckReady, setDeckReady] = useState(false);

  useEffect(() => {
    if (!map || !isMapboxReady || deckOverlay.current) return;

    deckOverlay.current = new MapboxOverlay({
      interleaved: true,
      layers: [],
      getCursor: () => {
        return 'grab';
      },
      getTooltip: () => null,
    });

    map.addControl(deckOverlay.current);
    window.deckOverlay = deckOverlay.current; // For debugging
    setDeckReady(true);

    return () => {
      if (deckOverlay.current) {
        map.removeControl(deckOverlay.current);
        deckOverlay.current = null;
      }
    };
  }, [map]);

  return (
    <DeckGLContext.Provider
      value={{
        deckOverlay: deckOverlay.current,
      }}
    >
      {deckReady && children}
    </DeckGLContext.Provider>
  );
};

export const useDeckGL = () => useContext(DeckGLContext);
