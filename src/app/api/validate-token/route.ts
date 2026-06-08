import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token mancante" }, { status: 400 });
    }

    // 1. Cerca token in access_tokens
    const { data: tokenData, error } = await supabase
      .from('access_tokens')
      .select('id, response_id')
      .eq('token', token)
      .single();

    if (error || !tokenData) {
      return NextResponse.json({ error: "invalid" }, { status: 404 });
    }

    // 2. Se ha response_id, verifica se è stato completato
    if (tokenData.response_id) {
      const { data: responseData } = await supabase
        .from('fai_responses')
        .select('completed_at')
        .eq('id', tokenData.response_id)
        .single();

      if (responseData && responseData.completed_at) {
        return NextResponse.json({ error: "used" }, { status: 400 });
      }
    }

    // Trovato e valido, non ancora completato
    return NextResponse.json({ ok: true, tokenId: tokenData.id });

  } catch (err) {
    console.error("Token validation error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
