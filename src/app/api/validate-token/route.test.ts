import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_ALLOW_DEV_MODE", "1");

const single = vi.fn();
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock("@/utils/supabase/server", () => ({
  getServerSupabase: () => ({
    from,
  }),
}));

import { POST } from "@/app/api/validate-token/route";

describe("POST /api/validate-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usa access_tokens_test quando trova un token test", async () => {
    single.mockResolvedValueOnce({
      data: { id: "test-token-1", is_active: true },
      error: null,
    });

    const request = new Request("http://localhost/api/validate-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "FAI-TEST-ALVA-001",
      }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as { ok?: boolean; tokenId?: string; mode?: string };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.tokenId).toBe("test-token-1");
    expect(payload.mode).toBe("test");
    expect(from).toHaveBeenCalledWith("access_tokens_test");
    expect(select).toHaveBeenCalledWith("id, is_active");
    expect(eq).toHaveBeenCalledWith("token", "FAI-TEST-ALVA-001");
  });

  it("prosegue al flusso reale se il token test e inattivo o assente", async () => {
    single.mockResolvedValueOnce({
      data: { id: "test-token-1", is_active: false },
      error: null,
    }).mockResolvedValueOnce({
      data: { id: "prod-token-1", response_id: null },
      error: null,
    });

    const request = new Request("http://localhost/api/validate-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "FAI-TEST-ALVA-001",
      }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as {
      ok?: boolean;
      tokenId?: string;
      mode?: string;
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.tokenId).toBe("prod-token-1");
    expect(payload.mode).toBe("prod");
  });
});
