import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function identifyPokemon(imageBase64: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a Pokémon expert. Look at this image and identify which Pokémon it shows.
It could be a toy, card, drawing, or real object.
Reply with ONLY the exact English name (e.g., Pikachu, Bulbasaur, Charizard).
If uncertain or no Pokémon visible, reply: UNKNOWN`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 50,
  });

  const pokemonName =
    response.choices[0]?.message?.content?.trim() || "UNKNOWN";

  // Clean up the response - remove quotes, periods, etc.
  return pokemonName
    .replace(/^["']|["']$/g, "")
    .replace(/\.$/, "")
    .trim();
}

export interface PokemonDescriptionData {
  pokemonName: string;
  types: string[];
  abilities: string[];
  stats: { name: string; value: number }[];
  height: number;
  weight: number;
  isLegendary?: boolean;
  isMythical?: boolean;
}

export async function generateAnimeDescription(
  data: PokemonDescriptionData,
): Promise<string> {
  const statsText = data.stats
    .map((stat) => `${stat.name}: ${stat.value}`)
    .join(", ");

  const prompt = `Você é a Pokédex do anime Pokémon. Gere uma descrição estilo anime em português brasileiro para o Pokémon ${data.pokemonName}.

Informações do Pokémon:
- Tipos: ${data.types.join(", ")}
- Stats principais: ${statsText}
${data.isLegendary ? "- É um Pokémon Lendário" : ""}
${data.isMythical ? "- É um Pokémon Mítico" : ""}

Formato: Comece com "${data.pokemonName}, o Pokémon ${data.types[0]}." seguido de uma descrição narrativa e envolvente no estilo da Pokédex do anime, mencionando comportamento, habitat e curiosidades. Seja entusiasmado e descritivo, como a Pokédex do anime. A descrição deve ter entre 50 e 100 palavras, ser natural para leitura em voz alta e capturar a essência do Pokémon como na série animada.

Traduza todo o texto para português`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Você é uma Pokédex do anime Pokémon. Suas descrições são entusiasmadas, descritivas, e no estilo do Professor Carvalho. Traduza todo o texto para português",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 300,
    temperature: 0.8,
  });

  const description =
    response.choices[0]?.message?.content?.trim() ||
    `${data.pokemonName}, o Pokémon ${data.types[0]}.`;

  return description;
}
