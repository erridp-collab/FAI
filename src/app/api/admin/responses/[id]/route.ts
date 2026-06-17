import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireAdmin } from "@/utils/admin-auth";

export type ResultsData = {
  id: string;
  email: string | null;
  nome_attivita: string | null;
  area_scores: Record<string, number> | null;
  composite_indicators: Record<string, number> | null;
};

function getResponseIdFromRequest(request: Request): string | null {
  const pathname = new URL(request.url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  return segments.at(-1) ?? null;
}

export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const responseId = getResponseIdFromRequest(request);
    if (!responseId) {
      return NextResponse.json({ error: "responseId mancante" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("fai_responses")
      .select("id, email, nome_attivita, area_scores, composite_indicators")
      .eq("id", responseId)
      .not("completed_at", "is", null)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: "Risultati non trovati" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Admin responses GET error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
