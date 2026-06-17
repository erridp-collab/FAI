import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireAdmin } from "@/utils/admin-auth";

export type AdminToken = {
  id: string;
  token: string;
  notes: string | null;
  email: string | null;
  created_at: string;
  used_at: string | null;
  response_id: string | null;
  status: "unused" | "in_progress" | "completed";
};

export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const supabase = getServerSupabase();

    const { data: tokens, error: tokensError } = await supabase
      .from("access_tokens")
      .select("id, token, notes, email, created_at, used_at, response_id")
      .order("created_at", { ascending: false });

    if (tokensError) throw tokensError;

    const tokenIds = (tokens ?? []).map((t) => t.id);
    let responseMap = new Map<string, { completed_at: string | null }>();

    if (tokenIds.length > 0) {
      const { data: responses } = await supabase
        .from("fai_responses")
        .select("token_id, completed_at")
        .in("token_id", tokenIds);

      responseMap = new Map(
        (responses ?? []).map((r) => [r.token_id as string, r])
      );
    }

    const result: AdminToken[] = (tokens ?? []).map((t) => {
      const response = responseMap.get(t.id);
      let status: AdminToken["status"];
      if (!response) {
        status = "unused";
      } else if (response.completed_at) {
        status = "completed";
      } else {
        status = "in_progress";
      }
      return { ...t, status };
    });

    return NextResponse.json({ tokens: result });
  } catch (err) {
    console.error("Admin tokens GET error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}

function generateTokenValue(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return "ALVA-" + Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { notes, email } = (await request.json()) as {
      notes?: string;
      email?: string;
    };

    if (!notes || !email) {
      return NextResponse.json(
        { error: "Note ed email sono obbligatorie" },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Genera token con retry su collision
    let tokenRecord: AdminToken | null = null;
    for (let i = 0; i < 5; i++) {
      const tokenValue = generateTokenValue();
      const { data, error } = await supabase
        .from("access_tokens")
        .insert([{ token: tokenValue, notes, email }])
        .select("id, token, notes, email, created_at, used_at, response_id")
        .single();

      if (!error && data) {
        tokenRecord = { ...data, status: "unused" };
        break;
      }
    }

    if (!tokenRecord) {
      return NextResponse.json({ error: "Errore interno" }, { status: 500 });
    }

    // Invia email via Resend
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_BASE_URL is not set");
      return NextResponse.json({ error: "Configurazione server incompleta" }, { status: 500 });
    }

    const emailResult = await resend.emails.send({
      from: "noreply@fai-microimpresa.it",
      to: email,
      subject: "Il tuo accesso alla diagnosi FAI Microimpresa",
      text: [
        "Ciao,",
        "hai richiesto l'accesso alla diagnosi gratuita per la tua attività.",
        "",
        "Clicca il link qui sotto per iniziare:",
        `${baseUrl}/start?token=${tokenRecord.token}`,
        "",
        "Il link è personale e può essere usato una sola volta.",
        "",
        "— Team FAI Microimpresa",
      ].join("\n"),
    });

    if (emailResult.error) {
      console.error("Resend error:", emailResult.error);
      return NextResponse.json({ error: "Errore invio email" }, { status: 500 });
    }

    return NextResponse.json({ token: tokenRecord }, { status: 201 });
  } catch (err) {
    console.error("Admin tokens POST error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
