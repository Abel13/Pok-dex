import { NextRequest, NextResponse } from "next/server";
import { generateAnimeDescription, PokemonDescriptionData } from "@/lib/openai";
import { PLAN_LIMITS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      pokemonName,
      types,
      abilities,
      stats,
      height,
      weight,
      isLegendary,
      isMythical,
      plan = "free",
      monthlyDescriptions = 0,
    } = body;

    // Plan limit verification (FREE)
    if (plan !== "pro") {
      const limits = PLAN_LIMITS.FREE;
      if (monthlyDescriptions >= limits.MONTHLY_DESCRIPTIONS) {
        return NextResponse.json(
          {
            error: "Limite mensal de descrições atingido. Upgrade para PRO para continuar.",
            code: "MONTHLY_LIMIT",
            upgrade: true,
          },
          { status: 429 }
        );
      }
    }

    // Validate required fields
    if (!pokemonName || !types || !abilities || !stats || height === undefined || weight === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const descriptionData: PokemonDescriptionData = {
      pokemonName,
      types: Array.isArray(types) ? types : [types],
      abilities: Array.isArray(abilities) ? abilities : [abilities],
      stats: Array.isArray(stats) ? stats : [],
      height: typeof height === "number" ? height : parseFloat(height) || 0,
      weight: typeof weight === "number" ? weight : parseFloat(weight) || 0,
      isLegendary: Boolean(isLegendary),
      isMythical: Boolean(isMythical),
    };

    // Generate description with timeout
    const descriptionPromise = generateAnimeDescription(descriptionData);
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 10000)
    );

    const description = await Promise.race([
      descriptionPromise,
      timeoutPromise,
    ]);

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Error generating Pokémon description:", error);

    if (error instanceof Error && error.message === "Timeout") {
      return NextResponse.json(
        { error: "Timeout ao gerar descrição" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Falha ao gerar descrição do Pokémon" },
      { status: 500 }
    );
  }
}
