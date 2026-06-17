import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("ADMIN_PASSWORD", "password-segreta");

import { POST } from "@/app/api/admin/login/route";

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("imposta il cookie e ritorna 200 con la password corretta", async () => {
    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password: "password-segreta" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = (await response.json()) as { ok?: boolean };

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("fai_admin_session=password-segreta");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=strict");
  });

  it("ritorna 401 con la password sbagliata", async () => {
    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password: "sbagliata" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(401);
    expect(body.error).toBe("Password non corretta");
  });

  it("ritorna 401 se la password è assente", async () => {
    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
