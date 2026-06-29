import { NextResponse } from "next/server";

import { calculateResults, type CompositeIndicators } from "@/utils/scoring";
import { getServerSupabase } from "@/utils/supabase/server";
import { getResponsesTable, isTestModeValue } from "@/utils/test-mode";

type FinalData = {
  nome_attivita: string;
  settore: string;
  citta: string;
  email: string;
  commento_finale: string;
};

type SaveProgressRequest = {
  tokenId?: string;
  responseId?: string;
  isTestMode?: boolean;
  answers_percezione?: Record<string, number>;
  answers_obiettivi?: string[];
  answers_main?: Record<number, number>;
  isFinal?: boolean;
  finalData?: FinalData;
  comments_percezione?: Record<string, string>;
  comments_main?: Record<number, string>;
  objectives_comments?: Record<string, string>;
  preoccupazione?: string | null;
  preoccupazione_comment?: string;
};

type SaveProgressPayload = {
  token_id: string;
  answers_percezione: Record<string, number>;
  answers_obiettivi: string[];
  answers_main: Record<number, number>;
  comments_percezione?: Record<string, string>;
  comments_main?: Record<number, string>;
  objectives_comments?: Record<string, string>;
  preoccupazione?: string | null;
  preoccupazione_comment?: string;
  nome_attivita?: string;
  settore?: string;
  citta?: string;
  email?: string;
  commento_finale?: string;
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
      responseId: requestedResponseId,
      isTestMode,
      answers_percezione,
      answers_obiettivi,
      answers_main,
      isFinal,
      finalData,
      comments_percezione,
      comments_main,
      objectives_comments,
      preoccupazione,
      preoccupazione_comment,
    } = body;
    const useTestMode = isTestModeValue(isTestMode);
    const responsesTable = getResponsesTable(useTestMode);

    if (!tokenId) {
      return NextResponse.json({ error: "tokenId mancante" }, { status: 400 });
    }

    let responseId = requestedResponseId ?? null;
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
      comments_percezione,
      comments_main,
      objectives_comments,
      preoccupazione,
      preoccupazione_comment,
    };

    if (isFinal) {
      payload.nome_attivita = finalData?.nome_attivita;
      payload.settore = finalData?.settore;
      payload.citta = finalData?.citta;
      payload.email = finalData?.email;
      payload.commento_finale = finalData?.commento_finale ?? "";
      payload.area_scores = areaScores;
      payload.composite_indicators = compositeIndicators;
      payload.completed_at = completedAt;
    }

    if (useTestMode) {
      if (responseId) {
        const { error: updateError } = await supabase
          .from(responsesTable)
          .update(payload)
          .eq("id", responseId)
          .eq("token_id", tokenId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from(responsesTable)
          .insert([payload])
          .select("id")
          .single();

        if (insertError) {
          throw insertError;
        }

        responseId = insertData.id;
      }

      return NextResponse.json({ ok: true, responseId });
    }

    const { data: existing } = await supabase
      .from(responsesTable)
      .select("id")
      .eq("token_id", tokenId)
      .single();

    responseId = existing?.id ?? responseId;

    if (responseId) {
      const { error: updateError } = await supabase
        .from(responsesTable)
        .update(payload)
        .eq("id", responseId);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from(responsesTable)
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
    const responseId = searchParams.get("responseId");
    const isTestMode = isTestModeValue(searchParams.get("test"));
    const responsesTable = getResponsesTable(isTestMode);

    if (!tokenId) {
      return NextResponse.json({ error: "tokenId mancante" }, { status: 400 });
    }

    if (isTestMode && !responseId) {
      return NextResponse.json({ ok: true, data: null });
    }

    const supabase = getServerSupabase();
    const query = supabase.from(responsesTable).select("*").eq("token_id", tokenId);
    const { data, error } = isTestMode
      ? await query.eq("id", responseId as string).maybeSingle()
      : await query.maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Errore interno" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || null });
  } catch {
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
