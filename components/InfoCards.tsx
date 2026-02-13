"use client";

import { PokemonData } from "@/lib/types";
import EvolutionChain from "./EvolutionChain";
import { STAT_NAMES_PT } from "@/lib/translations";
import { getLocalizedFlavorText } from "@/lib/i18n";
import { POKEAPI_LANG } from "@/lib/i18n";

interface InfoCardsProps {
  data: PokemonData | null;
  onClose?: () => void;
}

function getPokemonRegion(id: number): string {
  if (id >= 1 && id <= 151) return "Kanto";
  if (id >= 152 && id <= 251) return "Johto";
  if (id >= 252 && id <= 386) return "Hoenn";
  if (id >= 387 && id <= 493) return "Sinnoh";
  if (id >= 494 && id <= 649) return "Unova";
  if (id >= 650 && id <= 721) return "Kalos";
  if (id >= 722 && id <= 809) return "Alola";
  if (id >= 810 && id <= 905) return "Galar";
  if (id >= 906 && id <= 1025) return "Paldea";
  return "Unknown";
}

export default function InfoCards({ data, onClose }: InfoCardsProps) {
  if (!data) {
    return (
      <div className="w-full h-full bg-pokedex-gray/30 border-l border-pokedex-blue-light/30 p-4">
        <div className="text-center text-gray-400 text-sm mt-8">
          Select a Pokémon to view details
        </div>
      </div>
    );
  }

  const { pokemon, species } = data;

  const flavorText =
    data.localized?.flavorText ||
    getLocalizedFlavorText(species.flavor_text_entries, POKEAPI_LANG) ||
    "Nenhuma descrição disponível.";

  const statColors: Record<string, string> = {
    attack: "bg-blue-500",
    defense: "bg-blue-500",
    "special-attack": "bg-pink-500",
    "special-defense": "bg-blue-500",
    speed: "bg-purple-500",
    hp: "bg-green-500",
  };

  // Filter and order stats
  const displayStats = pokemon.stats
    .filter((stat) => stat.stat.name !== "hp")
    .slice(0, 4);

  // Get evolution info for Recent Activity
  const hasEvolutions = data.evolutionChain.chain.evolves_to.length > 0;
  const evolutionText = hasEvolutions
    ? `Evolution Path Detected: ${data.evolutionChain.chain.species.name} → ${data.evolutionChain.chain.evolves_to[0].species.name}`
    : "No evolution path detected";

  return (
    <div className="w-full h-full bg-pokedex-gray/30 overflow-y-auto flex flex-col">
      {/* Header with close button for mobile */}
      {onClose && (
        <div className="lg:hidden p-4 border-b border-pokedex-blue-light/30 flex-shrink-0 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-tech text-glow-blue">
            POKÉMON INFO
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-pokedex-gray/50 border border-pokedex-blue-light/30 text-pokedex-blue-light hover:glow-blue transition-all"
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
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Card 1: TECHNICAL SPECS */}
        <div className="bg-pokedex-gray/50 border border-pokedex-blue-light/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-pokedex-blue-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-sm font-bold text-white font-tech text-glow-blue">
              TECHNICAL SPECS
            </h3>
          </div>

          {/* Species Profile */}
          <div className="mb-4">
            <h4 className="text-xs text-gray-400 mb-2 font-mono">
              SPECIES PROFILE
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {flavorText.replace(/\f/g, " ")}
            </p>
          </div>

          {/* Height and Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-pokedex-dark/50 border border-pokedex-blue-light/20 rounded p-3">
              <p className="text-xs text-gray-400 mb-1 font-mono">HEIGHT</p>
              <p className="text-lg font-bold text-white">
                {pokemon.height / 10}m
              </p>
            </div>
            <div className="bg-pokedex-dark/50 border border-pokedex-blue-light/20 rounded p-3">
              <p className="text-xs text-gray-400 mb-1 font-mono">WEIGHT</p>
              <p className="text-lg font-bold text-white">
                {pokemon.weight / 10}kg
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: COMBAT EFFECTIVENESS */}
        <div className="bg-pokedex-gray/50 border border-pokedex-blue-light/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-pokedex-purple"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-sm font-bold text-white font-tech text-glow-purple">
              COMBAT EFFECTIVENESS
            </h3>
          </div>

          <div className="space-y-3">
            {displayStats.map((stat) => {
              const statName = STAT_NAMES_PT[stat.stat.name] || stat.stat.name.toUpperCase();
              const statColor = statColors[stat.stat.name] || "bg-blue-500";
              return (
                <div key={stat.stat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-300 font-mono">
                      {statName}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {stat.base_stat}
                    </span>
                  </div>
                  <div className="w-full bg-pokedex-dark rounded-full h-2">
                    <div
                      className={`${statColor} h-2 rounded-full`}
                      style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: RECENT ACTIVITY */}
        <div className="bg-pokedex-gray/50 border border-pokedex-blue-light/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-pokedex-cyan"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <h3 className="text-sm font-bold text-white font-tech text-glow-cyan">
              RECENT ACTIVITY
            </h3>
          </div>

          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-pokedex-purple mt-1">●</span>
              <p className="text-xs text-gray-300">
                {evolutionText}
              </p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pokedex-blue-light mt-1">●</span>
              <p className="text-xs text-gray-300">
                Database Entry Updated - {getPokemonRegion(pokemon.id)} Region
              </p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pokedex-cyan mt-1">●</span>
              <p className="text-xs text-gray-300">
                Species Data Synchronized
              </p>
            </li>
          </ul>
        </div>

        {/* Evolution Chain */}
        <div className="bg-pokedex-gray/50 border border-pokedex-blue-light/30 rounded-lg p-4">
          <EvolutionChain chain={data.evolutionChain} />
        </div>
      </div>
    </div>
  );
}
