"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "pokedex_scanned_pokemon";

export function useScannedPokemon() {
  const [scannedIds, setScannedIds] = useState<Set<number>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const ids = JSON.parse(stored) as number[];
          setScannedIds(new Set(ids));
        }
      } catch (error) {
        console.error("Error loading scanned Pokémon from localStorage:", error);
      }
    }
  }, []);

  const addScannedPokemon = (id: number) => {
    setScannedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      
      // Persist to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...newSet]));
        } catch (error) {
          console.error("Error saving scanned Pokémon to localStorage:", error);
        }
      }
      
      return newSet;
    });
  };

  const isScanned = (id: number) => scannedIds.has(id);

  return { scannedIds, addScannedPokemon, isScanned };
}
