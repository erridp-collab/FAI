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

export type CreateAdminTokenResult = {
  token: AdminToken;
  accessUrl: string;
  emailSent: boolean;
  warning?: string;
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
      const { data: responses, error: responsesError } = await supabase
        .from("fai_responses")
        .select("token_id, completed_at")
        .in("token_id", tokenIds);

      if (responsesError) throw responsesError;

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
    const { notes, email, sendEmail } = (await request.json()) as {
      notes?: string;
      email?: string;
      sendEmail?: boolean;
    };

    const normalizedNotes = notes?.trim();
    const normalizedEmail = email?.trim().toLowerCase() || null;

    if (!normalizedNotes) {
      return NextResponse.json(
        { error: "Nome o note sono obbligatori" },
        { status: 400 }
      );
    }

    if (sendEmail && !normalizedEmail) {
      return NextResponse.json(
        { error: "Inserisci un indirizzo email per effettuare l'invio" },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Genera token con retry su collision
    let tokenRecord: AdminToken | null = null;
    let lastInsertError: unknown = null;
    for (let i = 0; i < 5; i++) {
      const tokenValue = generateTokenValue();
      const { data, error } = await supabase
        .from("access_tokens")
        .insert([{ token: tokenValue, notes: normalizedNotes, email: normalizedEmail }])
        .select("id, token, notes, email, created_at, used_at, response_id")
        .single();

      if (!error && data) {
        tokenRecord = { ...data, status: "unused" };
        break;
      }

      lastInsertError = error;
      if (error?.code !== "23505") throw error;
    }

    if (!tokenRecord) {
      console.error("Admin token creation exhausted retries:", lastInsertError);
      return NextResponse.json({ error: "Errore interno" }, { status: 500 });
    }

    const accessUrl = new URL("/start", request.url);
    accessUrl.searchParams.set("token", tokenRecord.token);

    let emailSent = false;
    let warning: string | undefined;

    if (sendEmail) {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        warning = "Token creato, ma l'invio email non è ancora configurato.";
        console.warn("Admin token email skipped: RESEND_API_KEY is not set");
      } else {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(resendApiKey);
          const emailResult = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? "noreply@fai-microimpresa.it",
            to: normalizedEmail as string,
            subject: "Il tuo accesso alla Diagnosi di solidità",
            text: [
              "Ciao,",
              "hai richiesto l'accesso alla diagnosi gratuita per la tua attività.",
              "",
              "Clicca il link qui sotto per iniziare:",
              accessUrl.toString(),
              "",
              "Il link è personale e può essere usato una sola volta.",
              "",
              "— Team Alvaland",
            ].join("\n"),
          });

          if (emailResult.error) {
            warning = "Token creato, ma l'email non è stata inviata.";
            console.error("Admin token email failed:", emailResult.error);
          } else {
            emailSent = true;
          }
        } catch (emailError) {
          warning = "Token creato, ma l'email non è stata inviata.";
          console.error("Admin token email failed:", emailError);
        }
      }
    }

    const result: CreateAdminTokenResult = {
      token: tokenRecord,
      accessUrl: accessUrl.toString(),
      emailSent,
      warning,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Admin tokens POST error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
