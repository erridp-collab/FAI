import { NextResponse } from "next/server";

import { getServerSupabase } from "@/utils/supabase/server";
import { getResponsesTable, isTestModeValue, TEST_MODE_HEADER } from "@/utils/test-mode";

function getResponseIdFromRequest(request: Request): string | null {
  const pathname = new URL(request.url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  return segments.at(-1) || null;
}

export async function GET(request: Request) {
  try {
    const supabase = getServerSupabase();
    const responseId = getResponseIdFromRequest(request);
    const tokenId = request.headers.get("x-fai-token-id");
    const isTestMode = isTestModeValue(request.headers.get(TEST_MODE_HEADER));

    if (!responseId) {
      return NextResponse.json({ error: "responseId mancante" }, { status: 400 });
    }

    if (!tokenId) {
      return NextResponse.json({ error: "tokenId mancante" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(getResponsesTable(isTestMode))
      .select("id, email, nome_attivita, area_scores, composite_indicators, completed_at, token_id")
      .eq("id", responseId)
      .eq("token_id", tokenId)
      .not("completed_at", "is", null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "Risultati non trovati" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: data.id,
        email: data.email,
        nome_attivita: data.nome_attivita,
        area_scores: data.area_scores,
        composite_indicators: data.composite_indicators,
      },
    });
  } catch (error) {
    console.error("Results fetch error:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
