"use client";

import { useState, useEffect } from "react";

const OLD_STORAGE_KEY = "pokedex_scanned_pokemon";
const STORAGE_KEY = "pokedex_captures";

export interface Capture {
  pokemonId: number;
  lat?: number;
  lng?: number;
}

export function useScannedPokemon() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [scannedIds, setScannedIds] = useState<Set<number>>(new Set());

  // Load from localStorage on mount and migrate old data
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Try to load new format first
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const capturesData = JSON.parse(stored) as Capture[];
          setCaptures(capturesData);
          setScannedIds(new Set(capturesData.map((c) => c.pokemonId)));
        } else {
          // Migrate from old format
          const oldStored = localStorage.getItem(OLD_STORAGE_KEY);
          if (oldStored) {
            const ids = JSON.parse(oldStored) as number[];
            const migratedCaptures: Capture[] = ids.map((id) => ({
              pokemonId: id,
            }));
            setCaptures(migratedCaptures);
            setScannedIds(new Set(ids));
            // Save in new format
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedCaptures));
            // Remove old key
            localStorage.removeItem(OLD_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Error loading scanned Pokémon from localStorage:", error);
      }
    }
  }, []);

  const addScannedPokemon = (
    id: number,
    location?: { lat: number; lng: number },
  ) => {
    setCaptures((prev) => {
      const newCapture: Capture = {
        pokemonId: id,
        ...(location && { lat: location.lat, lng: location.lng }),
      };
      const newCaptures = [...prev, newCapture];

      // Persist to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newCaptures));
        } catch (error) {
          console.error("Error saving scanned Pokémon to localStorage:", error);
        }
      }

      return newCaptures;
    });

    setScannedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const isScanned = (id: number) => scannedIds.has(id);

  return { scannedIds, captures, addScannedPokemon, isScanned };
}
