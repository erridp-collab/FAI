import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const not = vi.fn(() => ({ maybeSingle }));
const eqTokenId = vi.fn(() => ({ not }));
const eqId = vi.fn(() => ({ eq: eqTokenId }));
const select = vi.fn(() => ({ eq: eqId }));
const from = vi.fn(() => ({ select }));

vi.mock("@/utils/supabase/server", () => ({
  getServerSupabase: () => ({
    from,
  }),
}));

import { GET } from "@/app/api/results/[id]/route";

describe("GET /api/results/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rifiuta la richiesta senza tokenId di sessione", async () => {
    const request = new Request("http://localhost:3000/api/results/resp-1");

    const response = await GET(request);
    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(401);
    expect(payload.error).toBe("tokenId mancante");
    expect(from).not.toHaveBeenCalled();
  });

  it("restituisce i risultati solo se responseId e tokenId combaciano", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: {
        id: "resp-1",
        email: "utente@example.com",
        nome_attivita: "Bottega Test",
        area_scores: { "La tua voce": 3.2 },
      },
      error: null,
    });

    const request = new Request("http://localhost:3000/api/results/resp-1", {
      headers: {
        "x-fai-token-id": "token-123",
      },
    });

    const response = await GET(request);
    const payload = (await response.json()) as {
      ok?: boolean;
      data?: { id: string; nome_attivita: string };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data?.id).toBe("resp-1");
    expect(payload.data?.nome_attivita).toBe("Bottega Test");
    expect(from).toHaveBeenCalledWith("fai_responses");
    expect(select).toHaveBeenCalledWith(
      "id, email, nome_attivita, area_scores, composite_indicators, completed_at, token_id",
    );
    expect(eqId).toHaveBeenCalledWith("id", "resp-1");
    expect(eqTokenId).toHaveBeenCalledWith("token_id", "token-123");
    expect(not).toHaveBeenCalledWith("completed_at", "is", null);
  });

  it("restituisce 404 se non esiste una risposta accessibile con quel token", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const request = new Request("http://localhost:3000/api/results/resp-404", {
      headers: {
        "x-fai-token-id": "token-xyz",
      },
    });

    const response = await GET(request);
    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(404);
    expect(payload.error).toBe("Risultati non trovati");
  });
});
