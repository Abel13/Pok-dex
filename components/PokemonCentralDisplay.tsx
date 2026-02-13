"use client";

import { PokemonData } from "@/lib/types";
import Image from "next/image";
import { TYPE_NAMES_PT } from "@/lib/translations";

interface PokemonCentralDisplayProps {
  data: PokemonData | null;
  onOpenCamera?: () => void;
  isLoading?: boolean;
  canGenerateDescription?: boolean;
  isPro?: boolean;
  descriptionsRemaining?: number;
  onOpenUpgrade?: () => void;
}

function getPokemonRegion(id: number): string {
  if (id >= 1 && id <= 151) return "KANTO_REGION";
  if (id >= 152 && id <= 251) return "JOHTO_REGION";
  if (id >= 252 && id <= 386) return "HOENN_REGION";
  if (id >= 387 && id <= 493) return "SINNOH_REGION";
  if (id >= 494 && id <= 649) return "UNOVA_REGION";
  if (id >= 650 && id <= 721) return "KALOS_REGION";
  if (id >= 722 && id <= 809) return "ALOLA_REGION";
  if (id >= 810 && id <= 905) return "GALAR_REGION";
  if (id >= 906 && id <= 1025) return "PALDEA_REGION";
  return "UNKNOWN_REGION";
}

export default function PokemonCentralDisplay({
  data,
  onOpenCamera,
  isLoading = false,
  canGenerateDescription = true,
  isPro = false,
  descriptionsRemaining = 20,
  onOpenUpgrade,
}: PokemonCentralDisplayProps) {
  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-pokedex-dark/50 relative overflow-hidden">
        {/* Grid Pattern Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          {/* Ícone Câmera Animado */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="relative">
              {/* Círculo pulsante externo */}
              <div className="absolute inset-0 rounded-full border-4 border-pokedex-cyan/30 animate-pulse-ring"></div>
              {/* Círculo pulsante interno */}
              <div className="absolute inset-2 rounded-full border-2 border-pokedex-cyan/50 animate-pulse-scan"></div>
              {/* Ícone de câmera */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-pokedex-gray/50 rounded-full flex items-center justify-center border-2 border-pokedex-cyan/50 glow-cyan">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-pokedex-cyan"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Texto Principal */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 font-tech text-glow-cyan">
            USE A CÂMERA PARA ESCANEAR POKÉMON
          </h2>

          {/* Texto Secundário */}
          <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 font-mono px-4">
            Aponte a câmera para um Pokémon e capture para identificá-lo
            automaticamente
          </p>

          {/* Botão de Ação */}
          {onOpenCamera && (
            <button
              onClick={onOpenCamera}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-pokedex-cyan hover:bg-cyan-500 text-black font-bold text-sm sm:text-base md:text-lg rounded-lg transition-all glow-cyan hover:glow-cyan font-tech w-full sm:w-auto min-w-[200px]"
              aria-label="Abrir câmera para escanear Pokémon"
            >
              ABRIR CÂMERA
            </button>
          )}

          {/* Indicador visual adicional */}
          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-xs text-gray-500 font-mono">
            <div className="w-2 h-2 bg-pokedex-cyan rounded-full animate-pulse-scan"></div>
            <span>SISTEMA DE IDENTIFICAÇÃO ATIVO</span>
            <div className="w-2 h-2 bg-pokedex-cyan rounded-full animate-pulse-scan"></div>
          </div>
        </div>
      </div>
    );
  }

  const { pokemon, species } = data;
  const spriteUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;

  const speedStat = pokemon.stats.find((stat) => stat.stat.name === "speed");
  const speedValue = speedStat?.base_stat || 0;

  const typeColors: Record<string, string> = {
    normal: "bg-gray-500",
    fire: "bg-orange-500",
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

  const isLegendary = species.is_legendary || false;
  const isMythical = species.is_mythical || false;

  return (
    <div className="w-full h-full bg-pokedex-dark/50 flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 md:p-6 relative overflow-y-auto">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-pokedex-blue-light/10 via-transparent to-transparent opacity-50" />

      {/* Loading Overlay - Thinking Animation */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pokedex-dark/80 backdrop-blur-sm">
          {/* Grid Pattern Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Thinking Content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Pulsing Circle com Scan Lines no centro */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              {/* Scan Lines Rotativas - dentro do círculo */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 animate-rotate-scan rounded-full"
                  style={{
                    background: `conic-gradient(
                      transparent 0deg,
                      transparent 60deg,
                      rgba(6, 182, 212, 0.3) 90deg,
                      rgba(6, 182, 212, 0.5) 120deg,
                      transparent 150deg
                    )`,
                  }}
                />
              </div>
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-pokedex-cyan/30 animate-pulse-ring"></div>
              {/* Inner pulsing circle */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 border-4 border-pokedex-cyan rounded-full animate-thinking glow-cyan flex items-center justify-center">
                <div className="w-3 h-3 bg-pokedex-cyan rounded-full animate-pulse-scan"></div>
              </div>
            </div>

            {/* Thinking Dots */}
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-pokedex-cyan rounded-full animate-thinking-dots"></div>
              <div className="w-2 h-2 bg-pokedex-cyan rounded-full animate-thinking-dots"></div>
              <div className="w-2 h-2 bg-pokedex-cyan rounded-full animate-thinking-dots"></div>
            </div>

            {/* Text */}
            <div className="text-center">
              <p className="text-pokedex-cyan text-sm sm:text-base font-mono text-glow-cyan">
                ANALYZING...
              </p>
              <p className="text-gray-400 text-xs mt-2 font-mono">
                PROCESSING DATA
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Selection Path - Oculto em mobile muito pequeno */}
      <div className="hidden sm:block absolute top-2 sm:top-4 left-2 sm:left-4 text-xs text-gray-400 font-mono">
        CURRENT SELECTION {getPokemonRegion(pokemon.id)} / POKEDEX / #
        {String(pokemon.id).padStart(3, "0")}
      </div>

      {/* Type Tags - Top Right - Ajustado para mobile */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2 flex-wrap justify-end items-center">
        {isPro && (
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs font-bold text-pokedex-neon bg-pokedex-purple/50">
            PRO
          </span>
        )}
        {!canGenerateDescription &&
          descriptionsRemaining < Infinity &&
          onOpenUpgrade && (
            <button
              onClick={onOpenUpgrade}
              className="px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs font-bold text-amber-400 bg-amber-900/50 hover:bg-amber-900/70 border border-amber-500/50 transition-all"
              title="Limite mensal de descrições atingido"
            >
              UPGRADE PRO
            </button>
          )}
        {pokemon.types.map((type) => (
          <span
            key={type.slot}
            className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs font-bold text-white ${
              typeColors[type.type.name] || "bg-gray-500"
            }`}
          >
            {(TYPE_NAMES_PT[type.type.name] || type.type.name).toUpperCase()}
          </span>
        ))}
        {isLegendary && (
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs font-bold text-white bg-pokedex-purple">
            LEGENDARY
          </span>
        )}
        {isMythical && (
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs font-bold text-white bg-pokedex-purple">
            MYTHICAL
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center w-full pt-8 sm:pt-0">
        {/* Magnification Box - Oculto em mobile muito pequeno */}
        <div className="hidden sm:block absolute -top-1 sm:-top-2 -left-1 sm:-left-2 bg-pokedex-gray/80 border border-pokedex-blue-light/30 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs text-pokedex-cyan">
          MAGNIFICATION x10.42
        </div>

        {/* Pokémon Image - Menor em mobile */}
        <div className="relative w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 mb-3 sm:mb-4 md:mb-6">
          <Image
            src={spriteUrl}
            alt={pokemon.name}
            fill
            className="object-contain drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))",
            }}
            unoptimized
          />
        </div>

        {/* Name and Genus */}
        <div className="text-center mb-3 sm:mb-4 md:mb-6 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold capitalize mb-1 sm:mb-2 text-white font-tech text-glow-blue">
            {data.localized?.displayName || pokemon.name}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-mono">
            GÊNERO:{" "}
            {data.localized?.genus ||
              species.genera?.find((g) => g.language.name === "pt-br")?.genus ||
              species.genera?.find((g) => g.language.name === "en")?.genus ||
              "DESCONHECIDO"}
          </p>
        </div>

        {/* SPD CORE Indicator - Compacto em mobile */}
        <div className="mb-3 sm:mb-4 md:mb-6 w-full px-2 sm:w-auto">
          <div className="bg-pokedex-purple/20 border border-pokedex-purple/30 rounded-lg p-2 sm:p-3 md:p-4 min-w-[160px] sm:min-w-[200px] mx-auto sm:mx-0">
            <div className="text-xs text-pokedex-purple mb-1 sm:mb-2 font-mono">
              SPD CORE
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {speedValue}
              </span>
              <span className="text-xs sm:text-sm text-gray-400">MPH</span>
            </div>
            <div className="mt-2 w-full bg-pokedex-gray rounded-full h-2">
              <div
                className="bg-pokedex-purple h-2 rounded-full glow-purple"
                style={{ width: `${(speedValue / 255) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Type Analysis and Ability - Stack em mobile */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 md:gap-6 justify-center w-full px-2">
          {/* Type Analysis */}
          <div className="text-center sm:text-left w-full sm:w-auto">
            <h3 className="text-xs text-gray-400 mb-1 sm:mb-2 font-mono">
              TYPE ANALYSIS
            </h3>
            <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
              {pokemon.types.map((type) => (
                <span
                  key={type.slot}
                  className={`px-2 sm:px-3 py-1 rounded text-xs font-bold text-white ${
                    typeColors[type.type.name] || "bg-gray-500"
                  }`}
                >
                  {(
                    TYPE_NAMES_PT[type.type.name] || type.type.name
                  ).toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Ability */}
          <div className="text-center sm:text-left w-full sm:w-auto">
            <h3 className="text-xs text-gray-400 mb-1 sm:mb-2 font-mono">
              ABILITY
            </h3>
            <p className="text-xs sm:text-sm text-white font-mono">
              {pokemon.abilities && pokemon.abilities.length > 0
                ? pokemon.abilities[0].ability.name
                    .toUpperCase()
                    .replace(/-/g, " // ")
                : "UNKNOWN"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
