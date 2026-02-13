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
        { error: "Pokémon name or ID is required" },
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
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch Pokémon data";
    
    // Check if it's a 404 (not found) vs other errors
    if (errorMessage.includes("not found")) {
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
