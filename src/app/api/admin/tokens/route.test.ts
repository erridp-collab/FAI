import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("ADMIN_PASSWORD", "password-segreta");

const sendEmailMock = vi.fn().mockResolvedValue({ data: { id: "email-1" }, error: null });

vi.mock("resend", () => {
  const ResendMock = function (this: { emails: { send: typeof sendEmailMock } }) {
    this.emails = { send: sendEmailMock };
  };
  return { Resend: ResendMock };
});

// Mock per access_tokens
const tokensOrder = vi.fn();
const tokensSelect = vi.fn(() => ({ order: tokensOrder }));

// Mock per fai_responses
const responsesIn = vi.fn();
const responsesSelect = vi.fn(() => ({ in: responsesIn }));

const fromMock = vi.fn((table: string) => {
  if (table === "access_tokens") return { select: tokensSelect };
  if (table === "fai_responses") return { select: responsesSelect };
  return {};
});

vi.mock("@/utils/supabase/server", () => ({
  getServerSupabase: () => ({ from: fromMock }),
}));

import { GET, POST } from "@/app/api/admin/tokens/route";

function makeRequest(cookie?: string) {
  return new Request("http://localhost/api/admin/tokens", {
    headers: cookie ? { cookie } : {},
  });
}

describe("GET /api/admin/tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ritorna 401 senza cookie admin", async () => {
    const response = await GET(makeRequest());
    expect(response.status).toBe(401);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("ritorna la lista token con stato derivato correttamente", async () => {
    tokensOrder.mockResolvedValueOnce({
      data: [
        { id: "tok-1", token: "ALVA-AAA111", notes: "Mario", email: "mario@test.com", created_at: "2026-06-01T00:00:00Z", used_at: null, response_id: null },
        { id: "tok-2", token: "ALVA-BBB222", notes: "Lucia", email: "lucia@test.com", created_at: "2026-06-02T00:00:00Z", used_at: "2026-06-03T00:00:00Z", response_id: "resp-2" },
        { id: "tok-3", token: "ALVA-CCC333", notes: "Piero", email: "piero@test.com", created_at: "2026-06-04T00:00:00Z", used_at: null, response_id: null },
      ],
      error: null,
    });

    // Una sola query .in() per tutti i tokenIds — tok-2 completato, tok-3 in corso
    responsesIn.mockResolvedValueOnce({
      data: [
        { token_id: "tok-2", completed_at: "2026-06-03T00:00:00Z" },
        { token_id: "tok-3", completed_at: null },
      ],
      error: null,
    });

    const response = await GET(
      makeRequest("fai_admin_session=password-segreta")
    );
    const body = (await response.json()) as {
      tokens: Array<{ id: string; status: string }>;
    };

    expect(response.status).toBe(200);
    expect(body.tokens).toHaveLength(3);

    const tok1 = body.tokens.find((t) => t.id === "tok-1");
    const tok2 = body.tokens.find((t) => t.id === "tok-2");
    const tok3 = body.tokens.find((t) => t.id === "tok-3");

    expect(tok1?.status).toBe("unused");
    expect(tok2?.status).toBe("completed");
    expect(tok3?.status).toBe("in_progress");
  });

  it("ritorna 401 senza cookie admin (POST)", async () => {
    const request = new Request("http://localhost/api/admin/tokens", {
      method: "POST",
      body: JSON.stringify({ notes: "Test", email: "test@test.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("crea il token, lo salva in DB e invia l'email", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://fai-test.it");

    const insertSingle = vi.fn().mockResolvedValue({
      data: { id: "tok-new", token: "ALVA-NEWXXX", notes: "Nuovo", email: "nuovo@test.com", created_at: "2026-06-17T00:00:00Z", used_at: null, response_id: null },
      error: null,
    });
    const insertSelect = vi.fn(() => ({ single: insertSingle }));
    const insertMock = vi.fn(() => ({ select: insertSelect }));
    fromMock.mockReturnValueOnce({ insert: insertMock });

    const request = new Request("http://localhost/api/admin/tokens", {
      method: "POST",
      body: JSON.stringify({ notes: "Nuovo", email: "nuovo@test.com" }),
      headers: {
        "Content-Type": "application/json",
        cookie: "fai_admin_session=password-segreta",
      },
    });

    const response = await POST(request);
    const body = (await response.json()) as { token?: { id: string } };

    expect(response.status).toBe(201);
    expect(body.token?.id).toBe("tok-new");
    expect(sendEmailMock).toHaveBeenCalledOnce();
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "nuovo@test.com",
        subject: "Il tuo accesso alla Diagnosi di solidità",
      })
    );
  });
});
