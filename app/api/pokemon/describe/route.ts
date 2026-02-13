import { NextRequest, NextResponse } from "next/server";
import { generateAnimeDescription, PokemonDescriptionData } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";
import { getAndValidateUsage, incrementUsage } from "@/lib/usage";

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
    } = body;

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    const validation = await getAndValidateUsage(request, userId, "description");
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error, code: validation.code, upgrade: true },
        { status: 429 }
      );
    }

    if (
      !pokemonName ||
      !types ||
      !abilities ||
      !stats ||
      height === undefined ||
      weight === undefined
    ) {
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

    const descriptionPromise = generateAnimeDescription(descriptionData);
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 10000)
    );

    const description = await Promise.race([
      descriptionPromise,
      timeoutPromise,
    ]);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const usage = await incrementUsage(userId, ip, "description");

    return NextResponse.json({
      description,
      usage: {
        monthlyDescriptions: usage.monthlyDescriptions,
      },
    });
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
