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
