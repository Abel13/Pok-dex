import { NextRequest, NextResponse } from "next/server";
import { getPokemonList } from "@/lib/pokeapi";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "151");
    const offset = parseInt(searchParams.get("offset") || "0");

    const data = await getPokemonList(limit, offset);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Pokémon list:", error);
    return NextResponse.json(
      { error: "Failed to fetch Pokémon list" },
      { status: 500 }
    );
  }
}
