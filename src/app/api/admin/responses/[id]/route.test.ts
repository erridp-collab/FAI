// src/app/api/admin/responses/[id]/route.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("ADMIN_PASSWORD", "password-segreta");

const maybeSingleFn = vi.fn();
const notFn = vi.fn(() => ({ maybeSingle: maybeSingleFn }));
const eqFn = vi.fn(() => ({ not: notFn }));
const selectFn = vi.fn(() => ({ eq: eqFn }));
const fromFn = vi.fn(() => ({ select: selectFn }));

vi.mock("@/utils/supabase/server", () => ({
  getServerSupabase: () => ({ from: fromFn }),
}));

import { GET } from "@/app/api/admin/responses/[id]/route";

function makeRequest(id: string, cookie?: string) {
  return new Request(`http://localhost/api/admin/responses/${id}`, {
    headers: cookie ? { cookie } : {},
  });
}

describe("GET /api/admin/responses/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ritorna 401 senza cookie admin", async () => {
    const response = await GET(makeRequest("resp-1"));
    expect(response.status).toBe(401);
    expect(fromFn).not.toHaveBeenCalled();
  });

  it("ritorna 404 se la risposta non esiste o non è completata", async () => {
    maybeSingleFn.mockResolvedValueOnce({ data: null, error: null });

    const response = await GET(makeRequest("resp-404", "fai_admin_session=password-segreta"));
    expect(response.status).toBe(404);
  });

  it("ritorna i dati della risposta completata", async () => {
    maybeSingleFn.mockResolvedValueOnce({
      data: {
        id: "resp-1",
        email: "mario@test.com",
        nome_attivita: "Bar Mario",
        area_scores: { "La tua voce": 3.5 },
        composite_indicators: { identita: 3.2 },
      },
      error: null,
    });

    const response = await GET(makeRequest("resp-1", "fai_admin_session=password-segreta"));
    const body = (await response.json()) as { data?: { nome_attivita: string } };

    expect(response.status).toBe(200);
    expect(body.data?.nome_attivita).toBe("Bar Mario");
    expect(fromFn).toHaveBeenCalledWith("fai_responses");
  });
});
