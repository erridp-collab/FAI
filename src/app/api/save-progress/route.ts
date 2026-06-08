import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';
import { calculateResults } from '@/utils/scoring';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenId, answers_percezione, answers_obiettivi, answers_main, isFinal, finalData } = body;

    if (!tokenId) {
      return NextResponse.json({ error: "tokenId mancante" }, { status: 400 });
    }

    // Controlla se esiste già una risposta per questo token
    const { data: existing } = await supabase
      .from('fai_responses')
      .select('id')
      .eq('token_id', tokenId)
      .single();

    let responseId = existing?.id;
    let area_scores = {};
    let composite_indicators = {};
    let completed_at = null;

    // Se è il submit finale, calcola i risultati
    if (isFinal) {
      const results = calculateResults(answers_main || {});
      area_scores = results.areaScores;
      composite_indicators = results.compositeIndicators;
      completed_at = new Date().toISOString();
    }

    const payload: any = {
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
      payload.area_scores = area_scores;
      payload.composite_indicators = composite_indicators;
      payload.completed_at = completed_at;
    }

    if (responseId) {
      // Aggiorna
      const { error: updateError } = await supabase
        .from('fai_responses')
        .update(payload)
        .eq('id', responseId);

      if (updateError) throw updateError;
    } else {
      // Inserisce
      const { data: insertData, error: insertError } = await supabase
        .from('fai_responses')
        .insert([payload])
        .select('id')
        .single();

      if (insertError) throw insertError;
      responseId = insertData.id;
    }

    // Se è finale, aggiorna anche access_tokens
    if (isFinal) {
      await supabase
        .from('access_tokens')
        .update({ used_at: completed_at, response_id: responseId })
        .eq('id', tokenId);
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
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
      return NextResponse.json({ error: "tokenId mancante" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('fai_responses')
      .select('*')
      .eq('token_id', tokenId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Errore interno" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data: data || null });
  } catch (err) {
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
