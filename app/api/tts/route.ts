import { NextRequest, NextResponse } from "next/server";
import { isTtsVoice, synthesizeSpeech, type TtsVoice } from "@/lib/openai";

const DEFAULT_VOICE: TtsVoice = "coral";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const requestedVoice =
      typeof body?.voice === "string" ? body.voice.trim() : DEFAULT_VOICE;

    if (!text) {
      return NextResponse.json(
        { error: "Missing or empty text" },
        { status: 400 },
      );
    }

    if (!isTtsVoice(requestedVoice)) {
      return NextResponse.json(
        { error: "Invalid voice" },
        { status: 400 },
      );
    }

    const audio = await synthesizeSpeech(text, requestedVoice);

    return new NextResponse(new Uint8Array(audio), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    return NextResponse.json(
      { error: "Failed to synthesize speech" },
      { status: 502 },
    );
  }
}
