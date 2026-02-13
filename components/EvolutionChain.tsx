"use client";

import { EvolutionChain, ChainLink } from "@/lib/types";
import Image from "next/image";

interface EvolutionChainProps {
  chain: EvolutionChain;
}

function EvolutionLink({ link, level = 0 }: { link: ChainLink; level?: number }) {
  const pokemonId = link.species.url.split("/").slice(-2, -1)[0];
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mb-2">
        <Image
          src={spriteUrl}
          alt={link.species.name}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <p className="text-xs md:text-sm font-bold capitalize text-pokedex-neon text-glow">
        {link.species.name}
      </p>
      {link.evolution_details && link.evolution_details[0] && (
        <p className="text-xs text-gray-400 mt-1">
          {link.evolution_details[0].min_level
            ? `Lv. ${link.evolution_details[0].min_level}`
            : link.evolution_details[0].trigger.name}
        </p>
      )}
      {link.evolves_to && link.evolves_to.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center mt-4">
          <div className="text-pokedex-neon text-xl sm:text-2xl mx-2 my-2 sm:my-0">→</div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {link.evolves_to.map((evo, idx) => (
              <EvolutionLink key={idx} link={evo} level={level + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EvolutionChainComponent({ chain }: EvolutionChainProps) {
  return (
    <div className="mt-4 md:mt-6 p-3 md:p-4 bg-black/30 rounded-lg border border-pokedex-red/30">
      <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-pokedex-neon text-glow">
        Cadeia de Evolução
      </h3>
      <div className="flex flex-wrap justify-center items-start gap-3 md:gap-4">
        <EvolutionLink link={chain.chain} />
      </div>
    </div>
  );
}
