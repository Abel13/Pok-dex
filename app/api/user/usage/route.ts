import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({
        dailyScans: 0,
        totalScanned: 0,
        monthlyDescriptions: 0,
      });
    }

    const admin = createAdminClient();
    const identifier = `user:${session.user.id}`;
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: row } = await admin
      .from("usage")
      .select("last_date, daily_scans, total_scanned, last_month, monthly_descriptions")
      .eq("identifier", identifier)
      .single();

    let dailyScans = row?.daily_scans ?? 0;
    let totalScanned = row?.total_scanned ?? 0;
    let monthlyDescriptions = row?.monthly_descriptions ?? 0;

    if (row?.last_date !== today) dailyScans = 0;
    if (row?.last_month !== currentMonth) monthlyDescriptions = 0;

    return NextResponse.json({
      dailyScans,
      totalScanned,
      monthlyDescriptions,
    });
  } catch (error) {
    console.error("Get usage error:", error);
    return NextResponse.json(
      { error: "Erro ao obter uso" },
      { status: 500 }
    );
  }
}
