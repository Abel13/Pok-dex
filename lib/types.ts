export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  abilities?: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];
}

export interface PokemonSpecies {
  id: number;
  name: string;
  names?: { name: string; language: { name: string } }[];
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version: {
      name: string;
      url: string;
    };
  }[];
  evolution_chain: {
    url: string;
  };
  genera?: {
    genus: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  is_legendary?: boolean;
  is_mythical?: boolean;
}

export interface EvolutionChain {
  id: number;
  chain: ChainLink;
}

export interface ChainLink {
  species: {
    name: string;
    url: string;
  };
  evolves_to: ChainLink[];
  evolution_details?: EvolutionDetail[];
}

export interface EvolutionDetail {
  min_level: number | null;
  trigger: {
    name: string;
  };
  item: {
    name: string;
  } | null;
}

export interface PokemonData {
  pokemon: Pokemon;
  species: PokemonSpecies;
  evolutionChain: EvolutionChain;
  localized?: {
    displayName: string;
    genus: string;
    flavorText: string;
  };
}

export interface UserPlan {
  plan: "free" | "pro";
  activatedAt: string;
  dailyScans: number;
  monthlyDescriptions: number;
  lastResetDate: string;
  totalScanned: number;
}
