"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { PokemonListItem } from "@/lib/pokeapi";
import { POKEMON_NAMES_PT_BY_ID } from "@/lib/translations";

interface RosterIndexProps {
  searchQuery: string;
  selectedPokemonId: number | null;
  onSelectPokemon: (id: number) => void;
  onClose?: () => void;
  scannedIds: Set<number>;
  isScanned: (id: number) => boolean;
  canAccessPokemon?: (id: number) => boolean;
  isPro?: boolean;
  totalScannedLimit?: number;
  onOpenUpgrade?: () => void;
}

export default function RosterIndex({
  searchQuery,
  selectedPokemonId,
  onSelectPokemon,
  onClose,
  scannedIds,
  isScanned,
  canAccessPokemon = () => true,
  isPro = false,
  totalScannedLimit = Infinity,
  onOpenUpgrade,
}: RosterIndexProps) {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listFilter, setListFilter] = useState<"all" | "scanned">("all");

  // Calcular limite dinâmico: FREE = 151 (Kanto), PRO = todos
  const dynamicLimit = useMemo(() => {
    if (isPro) {
      if (scannedIds.size === 0) return 151;
      const maxId = Math.max(...Array.from(scannedIds));
      return Math.max(151, maxId);
    }
    return 151; // FREE: apenas Kanto
  }, [scannedIds, isPro]);

  useEffect(() => {
    setLoading(true);
    async function fetchPokemonList() {
      try {
        const response = await fetch(`/api/pokemon/list?limit=${dynamicLimit}`);
        if (response.ok) {
          const data = await response.json();
          setPokemonList(data.results);
        }
      } catch (error) {
        console.error("Error fetching Pokémon list:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemonList();
  }, [dynamicLimit]);

  const filteredList = useMemo(() => {
    let list = pokemonList;

    // Filtro de busca (PT e EN)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((pokemon) => {
        const displayName = POKEMON_NAMES_PT_BY_ID[pokemon.id] ?? pokemon.name;
        const nameMatch =
          displayName.toLowerCase().includes(query) ||
          pokemon.name.toLowerCase().includes(query);
        const idMatch = pokemon.id.toString().includes(query);
        return nameMatch || idMatch;
      });
    }

    // Filtro por escaneados
    if (listFilter === "scanned") {
      list = list.filter((pokemon) => isScanned(pokemon.id));
    }

    return list;
  }, [pokemonList, searchQuery, listFilter, isScanned]);

  const getTypeIcon = (types: string[]) => {
    // Simplified - in real implementation, would fetch actual types
    return "⚡";
  };

  // Scroll to selected Pokémon when selection changes
  useEffect(() => {
    if (selectedPokemonId) {
      const element = document.getElementById(`pokemon-${selectedPokemonId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }
  }, [selectedPokemonId]);

  if (loading) {
    return (
      <div className="w-full h-full bg-pokedex-gray/30 border-r border-pokedex-blue-light/30 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-pokedex-cyan text-sm">LOADING DATABASE...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-pokedex-gray/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-pokedex-blue-light/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-tech text-glow-blue">
            ROSTER INDEX
          </h2>
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-pokedex-gray/50 border border-pokedex-blue-light/30 text-pokedex-blue-light hover:glow-blue transition-all"
                aria-label="Close Menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Filtro TODOS / ESCANEADOS */}
        <div className="flex gap-0 mt-2 rounded-lg overflow-hidden border border-pokedex-blue-light/30 bg-pokedex-gray/30">
          <button
            onClick={() => setListFilter("all")}
            className={`flex-1 px-3 py-1.5 text-xs font-mono font-bold transition-all ${
              listFilter === "all"
                ? "bg-pokedex-blue-light/30 text-pokedex-cyan border-r border-pokedex-blue-light/30"
                : "text-gray-400 hover:text-pokedex-cyan hover:bg-pokedex-gray/50"
            }`}
            aria-pressed={listFilter === "all"}
            aria-label="Mostrar todos os Pokémon"
          >
            TODOS
          </button>
          <button
            onClick={() => setListFilter("scanned")}
            className={`flex-1 px-3 py-1.5 text-xs font-mono font-bold transition-all ${
              listFilter === "scanned"
                ? "bg-pokedex-blue-light/30 text-pokedex-cyan"
                : "text-gray-400 hover:text-pokedex-cyan hover:bg-pokedex-gray/50"
            }`}
            aria-pressed={listFilter === "scanned"}
            aria-label="Mostrar apenas Pokémon escaneados"
          >
            ESCANEADOS
          </button>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-400">
            #{filteredList.length > 0 ? "001" : "000"} - #
            {filteredList.length > 0
              ? String(filteredList[filteredList.length - 1].id).padStart(3, "0")
              : "000"}
          </p>
          <div className="mt-2">
            <p className="text-xs text-pokedex-cyan mb-1">
              SCANNED: {scannedIds.size}/{totalScannedLimit < Infinity ? totalScannedLimit : pokemonList.length}
            </p>
            <div className="w-full bg-pokedex-gray rounded-full h-1.5">
              <div
                className="bg-pokedex-cyan h-1.5 rounded-full transition-all glow-cyan"
                style={{ width: `${totalScannedLimit < Infinity ? (scannedIds.size / totalScannedLimit) * 100 : (pokemonList.length > 0 ? (scannedIds.size / pokemonList.length) * 100 : 0)}%` }}
              />
            </div>
          </div>
          {!isPro && scannedIds.size >= totalScannedLimit && onOpenUpgrade && (
            <button
              onClick={onOpenUpgrade}
              className="mt-2 w-full py-1.5 px-2 bg-pokedex-purple/50 hover:bg-pokedex-purple text-pokedex-neon text-xs font-bold rounded transition-all"
            >
              UPGRADE TO PRO
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {filteredList.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No Pokémon found
          </div>
        ) : (
          <div className="divide-y divide-pokedex-blue-light/10">
            {filteredList.map((pokemon) => {
              const scanned = isScanned(pokemon.id);
              const canAccess = canAccessPokemon(pokemon.id);
              const selectable = scanned && canAccess;
              const displayName = POKEMON_NAMES_PT_BY_ID[pokemon.id] ?? pokemon.name;
              return (
                <button
                  key={pokemon.id}
                  id={`pokemon-${pokemon.id}`}
                  onClick={() => {
                    if (selectable) {
                      onSelectPokemon(pokemon.id);
                    } else if (scanned && !canAccess && onOpenUpgrade) {
                      onOpenUpgrade();
                    }
                  }}
                  disabled={!selectable}
                  title={!scanned ? "Escaneie este Pokémon primeiro" : !canAccess ? "Upgrade para PRO" : undefined}
                  className={`w-full p-3 flex items-center gap-3 transition-all ${
                    selectable
                      ? "hover:bg-pokedex-blue-light/10 cursor-pointer"
                      : "opacity-50 cursor-not-allowed grayscale"
                  } ${
                    selectedPokemonId === pokemon.id && selectable
                      ? "bg-pokedex-blue-light/20 border-l-2 border-pokedex-blue-light glow-blue"
                      : ""
                  }`}
                >
                  <div className={`relative w-12 h-12 flex-shrink-0 ${!selectable ? "opacity-50" : ""}`}>
                    <Image
                      src={pokemon.sprite}
                      alt={displayName}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-xs ${selectable ? "text-gray-400" : "text-gray-600"}`}>
                      #{String(pokemon.id).padStart(3, "0")}
                    </p>
                    <p className={`text-sm font-bold truncate ${selectable ? "text-white" : "text-gray-500"}`}>
                      {displayName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {scanned && !canAccess && (
                      <span className="text-[10px] font-bold text-pokedex-purple bg-pokedex-purple/20 px-1 rounded">
                        PRO
                      </span>
                    )}
                    <span className="text-lg">{selectable ? "⚡" : "🔒"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-pokedex-blue-light/30 flex-shrink-0">
        <div className="text-xs text-gray-400 mb-2">DB_SYNC</div>
        <div className="w-full bg-pokedex-gray rounded-full h-2">
          <div
            className="bg-pokedex-blue-light h-2 rounded-full glow-blue transition-all"
            style={{ width: "100%" }}
          />
        </div>
        <p className="text-xs text-pokedex-cyan mt-1 text-right">100%</p>
      </div>
    </div>
  );
}
