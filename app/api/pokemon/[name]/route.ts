import { NextRequest, NextResponse } from "next/server";
import { getPokemonData } from "@/lib/pokeapi";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name) {
      return NextResponse.json(
        { error: "O nome ou número do Pokémon é obrigatório" },
        { status: 400 }
      );
    }

    // Check if it's a numeric ID
    const pokemonId = parseInt(name);
    const identifier = isNaN(pokemonId) ? name : pokemonId.toString();

    const data = await getPokemonData(identifier);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    const errorMessage = error instanceof Error ? error.message : "Falha ao buscar os dados do Pokémon";
    
    // Diferencia recursos não encontrados dos demais erros.
    if (errorMessage.includes("não encontrad")) {
      return NextResponse.json(
        { error: `Pokémon "${name}" não encontrado. Verifique o nome e tente novamente.` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
