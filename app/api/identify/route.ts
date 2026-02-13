import { NextRequest, NextResponse } from "next/server";
import { identifyPokemon } from "@/lib/openai";
import { PLAN_LIMITS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const { image, plan = "free", dailyScans = 0, totalScanned = 0 } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    // Validate base64 image format
    if (typeof image !== "string" || image.length < 100) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    // Plan limit verification (FREE)
    if (plan !== "pro") {
      const limits = PLAN_LIMITS.FREE;
      if (dailyScans >= limits.DAILY_SCANS) {
        return NextResponse.json(
          {
            error: "Limite diário de identificações atingido. Upgrade para PRO para continuar.",
            code: "DAILY_LIMIT",
            upgrade: true,
          },
          { status: 429 }
        );
      }
      if (totalScanned >= limits.TOTAL_SCANNED) {
        return NextResponse.json(
          {
            error: "Limite de Pokémon escaneados atingido. Upgrade para PRO para continuar.",
            code: "TOTAL_LIMIT",
            upgrade: true,
          },
          { status: 429 }
        );
      }
    }
    
    const pokemonName = await identifyPokemon(image);

    return NextResponse.json({ pokemonName });
  } catch (error) {
    console.error("Error identifying Pokémon:", error);
    
    // Check if it's an OpenAI API error
    if (error instanceof Error && error.message.includes("API")) {
      return NextResponse.json(
        { error: "Erro na API de identificação. Verifique sua chave da OpenAI." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Falha ao identificar Pokémon. Tente novamente." },
      { status: 500 }
    );
  }
}
