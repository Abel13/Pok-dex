"use client";

import { PokemonData } from "@/lib/types";
import Image from "next/image";
import EvolutionChain from "./EvolutionChain";

interface PokemonDisplayProps {
  data: PokemonData;
}

export default function PokemonDisplay({ data }: PokemonDisplayProps) {
  const { pokemon, species } = data;
  const spriteUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;
  
  const flavorText =
    species.flavor_text_entries.find((entry) => entry.language.name === "en")
      ?.flavor_text || "No description available.";

  const typeColors: Record<string, string> = {
    normal: "bg-gray-500",
    fire: "bg-red-500",
    water: "bg-blue-500",
    electric: "bg-yellow-400",
    grass: "bg-green-500",
    ice: "bg-cyan-300",
    fighting: "bg-red-700",
    poison: "bg-purple-500",
    ground: "bg-yellow-600",
    flying: "bg-indigo-400",
    psychic: "bg-pink-500",
    bug: "bg-green-400",
    rock: "bg-yellow-700",
    ghost: "bg-purple-700",
    dragon: "bg-indigo-700",
    dark: "bg-gray-800",
    steel: "bg-gray-400",
    fairy: "bg-pink-300",
  };

  return (
    <div className="flex-1 p-3 md:p-4 lg:p-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Sprite */}
        <div className="flex-shrink-0 flex justify-center">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
            <Image
              src={spriteUrl}
              alt={pokemon.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold capitalize mb-2 text-pokedex-neon text-glow">
            {pokemon.name}
          </h2>
          <p className="text-gray-400 mb-4">#{String(pokemon.id).padStart(3, "0")}</p>

          {/* Types */}
          <div className="flex gap-2 mb-4">
            {pokemon.types.map((type) => (
              <span
                key={type.slot}
                className={`px-4 py-2 rounded-full text-white font-semibold ${
                  typeColors[type.type.name] || "bg-gray-500"
                }`}
              >
                {type.type.name.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            {flavorText.replace(/\f/g, " ")}
          </p>

          {/* Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 text-pokedex-neon">Estatísticas</h3>
            <div className="space-y-2">
              {pokemon.stats.map((stat) => (
                <div key={stat.stat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm capitalize">{stat.stat.name.replace("-", " ")}</span>
                    <span className="text-sm font-bold">{stat.base_stat}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-pokedex-neon h-2 rounded-full glow-neon"
                      style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Attributes */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/30 p-3 rounded border border-pokedex-red/30">
              <p className="text-xs text-gray-400 mb-1">Altura</p>
              <p className="text-lg font-bold">{pokemon.height / 10}m</p>
            </div>
            <div className="bg-black/30 p-3 rounded border border-pokedex-red/30">
              <p className="text-xs text-gray-400 mb-1">Peso</p>
              <p className="text-lg font-bold">{pokemon.weight / 10}kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Chain */}
      <EvolutionChain chain={data.evolutionChain} />
    </div>
  );
}
