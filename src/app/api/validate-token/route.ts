import { NextResponse } from "next/server";

import { getServerSupabase } from "@/utils/supabase/server";
import { getTokensTable } from "@/utils/test-mode";

export async function POST(request: Request) {
  try {
    const { token } = (await request.json()) as { token?: string };
    const normalizedToken = token?.trim().toUpperCase();

    if (!normalizedToken) {
      return NextResponse.json({ error: "Token mancante" }, { status: 400 });
    }

    const supabase = getServerSupabase();

    const { data: testTokenData, error: testTokenError } = await supabase
      .from(getTokensTable(true))
      .select("id, is_active")
      .eq("token", normalizedToken)
      .single();

    if (!testTokenError && testTokenData && testTokenData.is_active !== false) {
      return NextResponse.json({ ok: true, tokenId: testTokenData.id, mode: "test" });
    }

    const { data: tokenData, error } = await supabase
      .from(getTokensTable(false))
      .select("id, response_id")
      .eq("token", normalizedToken)
      .single();

    if (error || !tokenData) {
      return NextResponse.json({ error: "invalid" }, { status: 404 });
    }

    // 2. Se ha response_id, verifica se è stato completato
    if (tokenData.response_id) {
      const { data: responseData } = await supabase
        .from("fai_responses")
        .select("completed_at")
        .eq("id", tokenData.response_id)
        .single();

      if (responseData && responseData.completed_at) {
        return NextResponse.json({ error: "used" }, { status: 400 });
      }
    }

    // Trovato e valido, non ancora completato
    return NextResponse.json({ ok: true, tokenId: tokenData.id, mode: "prod" });

  } catch (err) {
    console.error("Token validation error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
