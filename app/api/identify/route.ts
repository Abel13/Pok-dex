import { NextRequest, NextResponse } from "next/server";
import { identifyPokemon } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";
import { getAndValidateUsage, incrementUsage } from "@/lib/usage";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    if (typeof image !== "string" || image.length < 100) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    const validation = await getAndValidateUsage(request, userId, "scan");
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error, code: validation.code, upgrade: true },
        { status: 429 }
      );
    }

    const pokemonName = await identifyPokemon(image);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const usage = await incrementUsage(userId, ip, "scan");

    return NextResponse.json({
      pokemonName,
      usage: {
        dailyScans: usage.dailyScans,
        totalScanned: usage.totalScanned,
      },
    });
  } catch (error) {
    console.error("Error identifying Pokémon:", error);

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
