import { Pokemon, PokemonSpecies, EvolutionChain, PokemonData } from "./types";
import {
  POKEAPI_LANG,
  getLocalizedName,
  getLocalizedGenus,
  getLocalizedFlavorText,
} from "./i18n";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

export async function getPokemon(nameOrId: string | number): Promise<Pokemon> {
  // If it's a number, use it directly
  if (typeof nameOrId === "number") {
    const response = await fetch(`${POKEAPI_BASE}/pokemon/${nameOrId}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`Pokémon not found: ${nameOrId}`);
    }
    
    return response.json();
  }

  // Normalize Pokémon name for PokeAPI
  // Examples: "Mr. Mime" -> "mr-mime", "Nidoran♀" -> "nidoran-f", etc.
  let normalizedName = nameOrId
    .toLowerCase()
    .trim()
    .replace(/[♀]/g, "-f")
    .replace(/[♂]/g, "-m")
    .replace(/\./g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${normalizedName}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  
  if (!response.ok) {
    throw new Error(`Pokémon not found: ${nameOrId}`);
  }
  
  return response.json();
}

export async function getPokemonSpecies(id: number): Promise<PokemonSpecies> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon-species/${id}`, {
    next: { revalidate: 3600 },
  });
  
  if (!response.ok) {
    throw new Error(`Pokémon species not found: ${id}`);
  }
  
  return response.json();
}

export async function getEvolutionChain(url: string): Promise<EvolutionChain> {
  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });
  
  if (!response.ok) {
    throw new Error(`Evolution chain not found`);
  }
  
  return response.json();
}

export async function getPokemonData(nameOrId: string | number): Promise<PokemonData> {
  const pokemon = await getPokemon(nameOrId);
  const species = await getPokemonSpecies(pokemon.id);
  
  let evolutionChain: EvolutionChain | null = null;
  if (species.evolution_chain?.url) {
    evolutionChain = await getEvolutionChain(species.evolution_chain.url);
  }
  
  if (!evolutionChain) {
    throw new Error("Evolution chain not available");
  }

  const localized = {
    displayName: getLocalizedName(species.names, POKEAPI_LANG) || pokemon.name,
    genus: getLocalizedGenus(species.genera, POKEAPI_LANG),
    flavorText: getLocalizedFlavorText(species.flavor_text_entries, POKEAPI_LANG),
  };

  return {
    pokemon,
    species,
    evolutionChain,
    localized,
  };
}

export function normalizePokemonName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/\s+/g, "-");
}

export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
  primaryType: string;
}

const LIST_DETAIL_BATCH_SIZE = 50;

async function fetchPrimaryType(id: number): Promise<string> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    return "normal";
  }
  const detail: {
    types?: { slot: number; type: { name: string } }[];
  } = await response.json();
  const primary = detail.types?.find((t) => t.slot === 1);
  return (
    primary?.type?.name ??
    detail.types?.[0]?.type?.name ??
    "normal"
  );
}

async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const slice = items.slice(i, i + batchSize);
    const chunk = await Promise.all(slice.map(mapper));
    out.push(...chunk);
  }
  return out;
}

export async function getPokemonList(limit: number = 151, offset: number = 0): Promise<{
  results: PokemonListItem[];
  count: number;
}> {
  const response = await fetch(
    `${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`,
    {
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Pokémon list");
  }

  const data: {
    results: { name: string; url: string }[];
    count: number;
  } = await response.json();

  const entries: { id: number; name: string }[] = data.results.map(
    (pokemon: { name: string; url: string }) => {
      const id = parseInt(pokemon.url.split("/").slice(-2, -1)[0], 10);
      return { id, name: pokemon.name };
    },
  );

  const results: PokemonListItem[] = await mapInBatches(
    entries,
    LIST_DETAIL_BATCH_SIZE,
    async ({ id, name }): Promise<PokemonListItem> => {
      const primaryType = await fetchPrimaryType(id);
      const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
      return {
        id,
        name,
        sprite,
        primaryType,
      };
    },
  );

  return {
    results,
    count: data.count,
  };
}
