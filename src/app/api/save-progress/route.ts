import { NextResponse } from "next/server";

import { calculateResults, type CompositeIndicators } from "@/utils/scoring";
import { getServerSupabase } from "@/utils/supabase/server";

type FinalData = {
  nome_attivita: string;
  settore: string;
  citta: string;
  email: string;
};

type SaveProgressRequest = {
  tokenId?: string;
  answers_percezione?: Record<string, number>;
  answers_obiettivi?: string[];
  answers_main?: Record<number, number>;
  isFinal?: boolean;
  finalData?: FinalData;
};

type SaveProgressPayload = {
  token_id: string;
  answers_percezione: Record<string, number>;
  answers_obiettivi: string[];
  answers_main: Record<number, number>;
  nome_attivita?: string;
  settore?: string;
  citta?: string;
  email?: string;
  area_scores?: Record<string, number>;
  composite_indicators?: CompositeIndicators;
  completed_at?: string | null;
};

export async function POST(request: Request) {
  try {
    const supabase = getServerSupabase();
    const body = (await request.json()) as SaveProgressRequest;
    const {
      tokenId,
      answers_percezione,
      answers_obiettivi,
      answers_main,
      isFinal,
      finalData,
    } = body;

    if (!tokenId) {
      return NextResponse.json({ error: "tokenId mancante" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("fai_responses")
      .select("id")
      .eq("token_id", tokenId)
      .single();

    let responseId = existing?.id;
    let areaScores: Record<string, number> | undefined;
    let compositeIndicators: CompositeIndicators | undefined;
    let completedAt: string | null = null;

    if (isFinal) {
      const results = calculateResults(answers_main || {});
      areaScores = results.areaScores;
      compositeIndicators = results.compositeIndicators;
      completedAt = new Date().toISOString();
    }

    const payload: SaveProgressPayload = {
      token_id: tokenId,
      answers_percezione: answers_percezione || {},
      answers_obiettivi: answers_obiettivi || [],
      answers_main: answers_main || {},
    };

    if (isFinal) {
      payload.nome_attivita = finalData?.nome_attivita;
      payload.settore = finalData?.settore;
      payload.citta = finalData?.citta;
      payload.email = finalData?.email;
      payload.area_scores = areaScores;
      payload.composite_indicators = compositeIndicators;
      payload.completed_at = completedAt;
    }

    if (responseId) {
      const { error: updateError } = await supabase
        .from("fai_responses")
        .update(payload)
        .eq("id", responseId);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from("fai_responses")
        .insert([payload])
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      responseId = insertData.id;
    }

    if (isFinal) {
      await supabase
        .from("access_tokens")
        .update({ used_at: completedAt, response_id: responseId })
        .eq("id", tokenId);
    }

    return NextResponse.json({ ok: true, responseId });
  } catch (err) {
    console.error("Save progress error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get("tokenId");

    if (!tokenId) {
      return NextResponse.json({ error: "tokenId mancante" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("fai_responses")
      .select("*")
      .eq("token_id", tokenId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Errore interno" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || null });
  } catch {
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
