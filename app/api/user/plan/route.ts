import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({
        plan: "free",
        source: "anonymous",
      });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, plan")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const plan = subscription && subscription.status === "active" ? "pro" : "free";

    return NextResponse.json({
      plan,
      source: "supabase",
    });
  } catch (error) {
    console.error("Get user plan error:", error);
    return NextResponse.json(
      { error: "Erro ao obter plano" },
      { status: 500 }
    );
  }
}
