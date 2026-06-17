# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere una dashboard admin a `/admin` per creare token di accesso, inviare email via Resend e visualizzare i risultati completati.

**Architecture:** Next.js middleware protegge `/admin/*` tramite cookie HttpOnly impostato al login con password da env. Le API `/api/admin/*` verificano lo stesso cookie. Il frontend è client-side con fetch. Resend invia le email al momento della creazione del token.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, Supabase (service role), Resend SDK, Vitest

---

## File map

| File | Ruolo |
|------|-------|
| `database_schema.sql` | Aggiunge `email TEXT` ad `access_tokens` (solo SQL, no migrazione) |
| `src/middleware.ts` | Protegge `/admin/*` — redirect a `/admin/login` se cookie assente |
| `src/utils/admin-auth.ts` | Helper: legge e valida il cookie admin dalle API route |
| `src/app/api/admin/login/route.ts` | POST — valida password, imposta cookie |
| `src/app/api/admin/login/route.test.ts` | Test login API |
| `src/app/api/admin/tokens/route.ts` | GET lista token, POST crea token + invia email |
| `src/app/api/admin/tokens/route.test.ts` | Test tokens API |
| `src/app/api/admin/responses/[id]/route.ts` | GET dati risposta completata (bypass auth utente) |
| `src/app/api/admin/responses/[id]/route.test.ts` | Test responses API |
| `src/app/admin/login/page.tsx` | Pagina login |
| `src/app/admin/page.tsx` | Lista token + modale crea token |
| `src/app/admin/responses/[id]/page.tsx` | Vista risultati admin |

---

## Task 1: Aggiorna database_schema.sql

**Files:**
- Modify: `database_schema.sql`

> **NOTA:** aggiornare solo il file SQL. NON applicare la migrazione su Supabase — il DB è disabilitato.

- [ ] **Step 1: Aggiungi la colonna `email` alla definizione di `access_tokens`**

Dopo la riga `notes TEXT, -- Uso admin` aggiungi:

```sql
CREATE TABLE public.access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    notes TEXT, -- Uso admin (es. "Cliente: Mario Rossi - 08/06/2026")
    email TEXT, -- Email destinatario, impostata al momento della creazione
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE, -- Null finche' non completato
    response_id UUID -- FK a fai_responses, settato alla fine
);
```

Aggiungi anche alla fine del file il commento con la migrazione da eseguire quando il DB è disponibile:

```sql
-- ==============================================================================
-- MIGRAZIONI PENDENTI (da applicare quando il DB è attivo)
-- ==============================================================================

-- Aggiunge email destinatario ad access_tokens (admin dashboard)
-- ALTER TABLE public.access_tokens ADD COLUMN IF NOT EXISTS email TEXT;
```

- [ ] **Step 2: Commit**

```bash
git add database_schema.sql
git commit -m "feat: add email column to access_tokens schema (migration pending)"
```

---

## Task 2: Middleware di protezione `/admin/*`

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Crea il middleware**

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = request.cookies.get("fai_admin_session")?.value;
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
```

- [ ] **Step 2: Verifica che la build passi**

```bash
npm run build
```

Expected: nessun errore TypeScript o di compilazione.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add admin middleware for /admin/* route protection"
```

---

## Task 3: Admin auth utility

**Files:**
- Create: `src/utils/admin-auth.ts`

Il middleware protegge le *pagine*. Le *API route* devono verificare il cookie autonomamente (non passano per il middleware di Next.js).

- [ ] **Step 1: Crea il file**

```typescript
// src/utils/admin-auth.ts
import { NextResponse } from "next/server";

export function getAdminSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)fai_admin_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function requireAdmin(request: Request): NextResponse | null {
  const session = getAdminSessionFromRequest(request);
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/admin-auth.ts
git commit -m "feat: add admin auth utility for API route protection"
```

---

## Task 4: Login API

**Files:**
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/login/route.test.ts`

- [ ] **Step 1: Scrivi il test**

```typescript
// src/app/api/admin/login/route.test.ts
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
    expect(setCookie).toContain("SameSite=Strict");
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
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

```bash
npm run test -- src/app/api/admin/login/route.test.ts
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implementa la route**

```typescript
// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = (await request.json()) as { password?: string };

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Password non corretta" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("fai_admin_session", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Esegui il test e verifica che passi**

```bash
npm run test -- src/app/api/admin/login/route.test.ts
```

Expected: 3/3 PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/login/route.ts src/app/api/admin/login/route.test.ts
git commit -m "feat: add admin login API"
```

---

## Task 5: Pagina login

**Files:**
- Create: `src/app/admin/login/page.tsx`

Nessun test automatico — componente UI client.

- [ ] **Step 1: Crea la pagina**

```typescript
// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Password non corretta");
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="bg-surface border border-raised rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-primary mb-6">Accesso admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-accent-surface uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-canvas border border-raised rounded-xl px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent-surface"
              autoFocus
              required
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-primary font-bold py-2.5 rounded-xl text-sm shadow-[0_4px_16px_rgba(74,63,140,0.4)] disabled:opacity-50"
          >
            {loading ? "Accesso in corso…" : "Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifica build**

```bash
npm run build
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/login/page.tsx
git commit -m "feat: add admin login page"
```

---

## Task 6: Tokens API — GET

**Files:**
- Create: `src/app/api/admin/tokens/route.ts`
- Create: `src/app/api/admin/tokens/route.test.ts`

La derivazione dello stato si basa su due query: `access_tokens` e `fai_responses`.

- [ ] **Step 1: Scrivi i test**

```typescript
// src/app/api/admin/tokens/route.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("ADMIN_PASSWORD", "password-segreta");

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

import { GET } from "@/app/api/admin/tokens/route";

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
});
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

```bash
npm run test -- src/app/api/admin/tokens/route.test.ts
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implementa GET in `route.ts`**

```typescript
// src/app/api/admin/tokens/route.ts
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
```

- [ ] **Step 4: Esegui i test**

```bash
npm run test -- src/app/api/admin/tokens/route.test.ts
```

Expected: 2/2 PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/tokens/route.ts src/app/api/admin/tokens/route.test.ts
git commit -m "feat: add admin tokens GET API"
```

---

## Task 7: Tokens API — POST (Resend)

**Files:**
- Modify: `src/app/api/admin/tokens/route.ts`
- Modify: `src/app/api/admin/tokens/route.test.ts`

- [ ] **Step 1: Installa Resend**

```bash
npm install resend
```

- [ ] **Step 2: Aggiungi i test POST in `route.test.ts`**

In cima al file, aggiungi il mock di Resend **prima** degli import della route:

```typescript
// Aggiungi dopo le altre dichiarazioni vi.mock, prima dell'import della route

const sendEmailMock = vi.fn().mockResolvedValue({ data: { id: "email-1" }, error: null });

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendEmailMock },
  })),
}));
```

Poi aggiungi i test in fondo al `describe`:

```typescript
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
      subject: "Il tuo accesso alla diagnosi FAI Microimpresa",
    })
  );
});
```

- [ ] **Step 3: Esegui i nuovi test e verifica che falliscano**

```bash
npm run test -- src/app/api/admin/tokens/route.test.ts
```

Expected: i 2 nuovi test FAIL — "POST is not a function"

- [ ] **Step 4: Aggiungi POST in `route.ts`**

In fondo al file `src/app/api/admin/tokens/route.ts`, aggiungi:

```typescript
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

    await resend.emails.send({
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

    return NextResponse.json({ token: tokenRecord }, { status: 201 });
  } catch (err) {
    console.error("Admin tokens POST error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
```

- [ ] **Step 5: Esegui tutti i test**

```bash
npm run test -- src/app/api/admin/tokens/route.test.ts
```

Expected: tutti i test PASS (almeno 4).

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/tokens/route.ts src/app/api/admin/tokens/route.test.ts package.json package-lock.json
git commit -m "feat: add admin tokens POST API with Resend email"
```

---

## Task 8: Admin list page

**Files:**
- Create: `src/app/admin/page.tsx`

Nessun test automatico — componente UI client.

- [ ] **Step 1: Crea la pagina**

```typescript
// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { AdminToken } from "@/app/api/admin/tokens/route";

const STATUS_BADGE: Record<AdminToken["status"], string> = {
  unused: "text-[#6B6890] bg-[#3A3550]/60 border border-[#3A3550]",
  in_progress: "text-[#F3CF69] bg-[rgba(243,207,105,0.12)] border border-[rgba(243,207,105,0.25)]",
  completed: "text-[#4ade80] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)]",
};

const STATUS_LABEL: Record<AdminToken["status"], string> = {
  unused: "Non usato",
  in_progress: "In corso",
  completed: "Completato",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default function AdminPage() {
  const [tokens, setTokens] = useState<AdminToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/tokens")
      .then((r) => r.json())
      .then((data: { tokens?: AdminToken[] }) => {
        setTokens(data.tokens ?? []);
        setLoading(false);
      });
  }, []);

  const openModal = () => {
    setNotes("");
    setEmail("");
    setModalError(null);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    const res = await fetch("/api/admin/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, email }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setModalError(body.error ?? "Errore durante la creazione");
      return;
    }

    const body = (await res.json()) as { token?: AdminToken };
    if (body.token) {
      setTokens((prev) => [body.token!, ...prev]);
    }

    closeModal();
    setToast("Token creato e email inviata");
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-canvas text-primary p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 bg-[rgba(74,222,128,0.15)] border border-[rgba(74,222,128,0.3)] text-[#4ade80] text-sm font-semibold px-4 py-2.5 rounded-xl z-50">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Token di accesso</h1>
          <button
            onClick={openModal}
            className="bg-accent text-primary text-sm font-bold px-4 py-2 rounded-lg shadow-[0_4px_16px_rgba(74,63,140,0.4)]"
          >
            + Nuovo token
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-secondary text-sm">Caricamento…</p>
        ) : tokens.length === 0 ? (
          <p className="text-secondary text-sm">Nessun token creato.</p>
        ) : (
          <div className="bg-surface border border-raised rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-raised">
                  <th className="text-left px-4 py-3 text-[0.65rem] font-semibold text-secondary uppercase tracking-wider">Token</th>
                  <th className="text-left px-4 py-3 text-[0.65rem] font-semibold text-secondary uppercase tracking-wider">Note</th>
                  <th className="text-left px-4 py-3 text-[0.65rem] font-semibold text-secondary uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-[0.65rem] font-semibold text-secondary uppercase tracking-wider">Stato</th>
                  <th className="text-left px-4 py-3 text-[0.65rem] font-semibold text-secondary uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t, i) => (
                  <tr
                    key={t.id}
                    className={i < tokens.length - 1 ? "border-b border-raised/50" : ""}
                  >
                    <td className="px-4 py-3 font-mono text-accent-surface text-xs">
                      {t.token}
                    </td>
                    <td className="px-4 py-3 text-primary text-sm">
                      {t.notes ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {t.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${STATUS_BADGE[t.status]}`}
                      >
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.status === "completed" && t.response_id && (
                        <a
                          href={`/admin/responses/${t.response_id}`}
                          className="text-accent-surface text-xs hover:underline"
                        >
                          Risultati →
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-surface border border-raised rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-base font-bold mb-5">Nuovo token di accesso</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-accent-surface uppercase tracking-wider mb-1.5">
                    Nome / Note
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="es. Mario Rossi – Bar Centro"
                    className="w-full bg-canvas border border-raised rounded-xl px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent-surface"
                    required
                  />
                  <p className="text-[0.62rem] text-secondary mt-1">Uso interno, non visibile all'utente</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-accent-surface uppercase tracking-wider mb-1.5">
                    Email destinatario
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mario@example.com"
                    className="w-full bg-canvas border border-raised rounded-xl px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent-surface"
                    required
                  />
                  <p className="text-[0.62rem] text-secondary mt-1">Riceverà il link con il token via email</p>
                </div>
                {modalError && (
                  <p className="text-red-400 text-sm">{modalError}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-accent text-primary font-bold py-2.5 rounded-xl text-sm shadow-[0_4px_16px_rgba(74,63,140,0.4)] disabled:opacity-50"
                  >
                    {submitting ? "Invio in corso…" : "Crea token e invia email →"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 rounded-xl text-sm text-secondary border border-raised"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifica build**

```bash
npm run build
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: add admin token list page with modal"
```

---

## Task 9: Responses API

**Files:**
- Create: `src/app/api/admin/responses/[id]/route.ts`
- Create: `src/app/api/admin/responses/[id]/route.test.ts`

- [ ] **Step 1: Scrivi i test**

```typescript
// src/app/api/admin/responses/[id]/route.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("ADMIN_PASSWORD", "password-segreta");

const maybeSingle = vi.fn();
const notChain = vi.fn(() => ({ maybeSingle }));
const eqChain = vi.fn(() => ({ not: notChain }));
const selectChain = vi.fn(() => ({ eq: eqChain }));
const from = vi.fn(() => ({ select: selectChain }));

vi.mock("@/utils/supabase/server", () => ({
  getServerSupabase: () => ({ from }),
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
    expect(from).not.toHaveBeenCalled();
  });

  it("ritorna 404 se la risposta non esiste o non è completata", async () => {
    maybySingle.mockResolvedValueOnce({ data: null, error: null });

    const response = await GET(makeRequest("resp-404", "fai_admin_session=password-segreta"));
    expect(response.status).toBe(404);
  });

  it("ritorna i dati della risposta completata", async () => {
    maybySingle.mockResolvedValueOnce({
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
  });
});
```

> Nota: sostituisci `maybySingle` con `maybySingle` — il nome variabile è intenzionalmente diverso da quelli di altri test file per evitare conflitti di scope. Verifica che il nome sia consistente nel file.

- [ ] **Step 2: Correggi il typo nel test** — il mock si chiama `maybySingle` nel `describe` ma va dichiarato all'inizio del file. Assicurati che la dichiarazione `const maybySingle = vi.fn();` sia la stessa variabile usata nei test.

Usa questo test definitivo con variabili corrette:

```typescript
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
```

- [ ] **Step 3: Esegui il test e verifica che fallisca**

```bash
npm run test -- "src/app/api/admin/responses/[id]/route.test.ts"
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 4: Implementa la route**

```typescript
// src/app/api/admin/responses/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireAdmin } from "@/utils/admin-auth";

function getResponseIdFromRequest(request: Request): string | null {
  const pathname = new URL(request.url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  return segments.at(-1) ?? null;
}

export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const responseId = getResponseIdFromRequest(request);
    if (!responseId) {
      return NextResponse.json({ error: "responseId mancante" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("fai_responses")
      .select("id, email, nome_attivita, area_scores, composite_indicators")
      .eq("id", responseId)
      .not("completed_at", "is", null)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: "Risultati non trovati" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Admin responses GET error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
```

- [ ] **Step 5: Esegui i test**

```bash
npm run test -- "src/app/api/admin/responses/[id]/route.test.ts"
```

Expected: 3/3 PASS

- [ ] **Step 6: Commit**

```bash
git add "src/app/api/admin/responses/[id]/route.ts" "src/app/api/admin/responses/[id]/route.test.ts"
git commit -m "feat: add admin responses GET API"
```

---

## Task 10: Admin responses page

**Files:**
- Create: `src/app/admin/responses/[id]/page.tsx`

Nessun test automatico — componente UI client. Riusa il layout di `results/[id]/page.tsx` con le differenze: breadcrumb in cima, dati da `/api/admin/responses/[id]` (nessun token utente necessario).

- [ ] **Step 1: Crea la pagina**

```typescript
// src/app/admin/responses/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { getCompositeLevel, type CompositeIndicators } from "@/utils/scoring";

type ResultsData = {
  nome_attivita: string;
  email: string;
  area_scores?: Record<string, number>;
  composite_indicators?: CompositeIndicators;
};

type RadarPointProps = {
  cx?: number;
  cy?: number;
  payload?: { subject?: string };
};

const AREA_DEFINITIONS = [
  { area: "La tua voce", definition: "Quanto sei riconoscibile e differente dai tuoi competitor." },
  { area: "I tuoi ricavi", definition: "Diversificazione delle entrate e stabilità finanziaria." },
  { area: "I tuoi margini", definition: "Conoscenza dei costi, margini e conformità normativa." },
  { area: "La tua adattabilità", definition: "Capacità di rispondere a imprevisti e nuovi mercati." },
  { area: "Il tuo sistema", definition: "Quanto l'attività funziona in modo indipendente da te." },
  { area: "La tua rete", definition: "Connessioni con il territorio e altri operatori locali." },
  { area: "Il tuo apprendimento", definition: "Capacità di evolvere, sperimentare e imparare dall'esterno." },
];

const COMPOSITE_META: { key: keyof CompositeIndicators; label: string; description: string }[] = [
  { key: "identita", label: "Identità", description: "Riconoscibilità e differenziazione sul mercato" },
  { key: "tenutaAttivita", label: "Sopravvivenza", description: "Stabilità finanziaria e capacità di generare ricavi" },
  { key: "liquidita", label: "Liquidità", description: "Disponibilità di riserve per affrontare imprevisti" },
  { key: "resilienzaOperativa", label: "Resilienza operativa", description: "Capacità di reggere e reagire agli imprevisti" },
  { key: "digitalReadiness", label: "Digital Readiness", description: "Maturità digitale e presidio online" },
  { key: "complianceProtezione", label: "Compliance e protezione", description: "Conformità normativa e gestione dei rischi" },
  { key: "capacitaEvoluzione", label: "Capacità di evoluzione", description: "Propensione ad adattarsi e migliorare" },
];

const LEVEL_BORDER_COLOR = {
  Fragile: "#f87171",
  Vulnerabile: "#F3CF69",
  Adeguata: "#9A8FE0",
  Solida: "#4ade80",
} as const;

const LEVEL_BAR_COLOR = {
  Fragile: "bg-red-400",
  Vulnerabile: "bg-yellow-400",
  Adeguata: "bg-accent",
  Solida: "bg-green-400",
} as const;

export default function AdminResponsePage() {
  const params = useParams();
  const responseId = params?.id as string;
  const [data, setData] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!responseId) return;
    void fetch(`/api/admin/responses/${responseId}`)
      .then((r) => r.json())
      .then((body: { data?: ResultsData; error?: string }) => {
        if (body.data) {
          setData(body.data);
        } else {
          setError(body.error ?? "Errore sconosciuto");
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError("Errore di connessione");
        setIsLoading(false);
      });
  }, [responseId]);

  const scores = useMemo(() => data?.area_scores ?? {}, [data]);
  const compositeIndicators = data?.composite_indicators;

  const lowestArea = useMemo(() => {
    let lowest = "";
    let lowestScore = 6;
    for (const def of AREA_DEFINITIONS) {
      const score = scores[def.area] ?? 0;
      if (score < lowestScore) {
        lowestScore = score;
        lowest = def.area;
      }
    }
    return lowest;
  }, [scores]);

  const chartData = AREA_DEFINITIONS.map((def) => ({
    subject: def.area,
    score: scores[def.area] ?? 0,
    fullMark: 5,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-surface animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-canvas text-primary flex items-center justify-center">
        <div className="bg-surface p-8 rounded-xl flex items-center gap-4 text-red-300">
          <AlertCircle /> {error ?? "Errore sconosciuto"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-primary p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Breadcrumb */}
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 text-secondary text-sm hover:text-accent-surface transition-colors"
        >
          ← Torna alla lista
        </a>

        {/* Header */}
        <header className="relative text-center space-y-4 py-4 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(74,63,140,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10 inline-flex items-center gap-2 bg-accent/25 text-accent-surface px-4 py-2 rounded-full text-sm font-semibold tracking-wider border border-accent-surface/30 shadow-[0_0_20px_rgba(74,63,140,0.3)]">
            <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-[9px] font-bold text-white shadow-[0_0_8px_rgba(154,143,224,0.6)]">
              ✓
            </div>
            DIAGNOSI COMPLETATA
          </div>
          <h1 className="relative z-10 text-3xl md:text-5xl font-medium tracking-tight">
            Risultati per{" "}
            <span className="text-accent-surface font-semibold">{data.nome_attivita}</span>
          </h1>
          <p className="relative z-10 text-secondary text-sm">{data.email}</p>
        </header>

        {/* Radar chart */}
        <div className="bg-surface rounded-3xl p-6 md:p-10 shadow-xl border border-raised relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(154,143,224,0.05),transparent)] pointer-events-none" />
          <h2 className="text-xl font-medium mb-6 text-center">La mappa della solidità</h2>
          <div className="w-full h-[300px] sm:h-[380px] md:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                <PolarGrid stroke="#3A3550" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9490B8", fontSize: 11, fontWeight: 500 }} />
                <Radar
                  name={data.nome_attivita}
                  dataKey="score"
                  stroke="#9A8FE0"
                  strokeWidth={2}
                  fill="rgba(154,143,224,0.15)"
                  fillOpacity={1}
                  dot={(props: RadarPointProps) => {
                    if (props.cx == null || props.cy == null) return <></>;
                    const isLowest = props.payload?.subject === lowestArea;
                    return (
                      <circle
                        key={props.payload?.subject}
                        cx={props.cx}
                        cy={props.cy}
                        r={5}
                        fill={isLowest ? "#F3CF69" : "#9A8FE0"}
                        stroke="#16141F"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area scores */}
        <div>
          <h3 className="text-xl font-medium mb-4">Analisi per area</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AREA_DEFINITIONS.map((def) => {
              const score = scores[def.area] ?? 0;
              const isLowest = def.area === lowestArea;
              return (
                <div
                  key={def.area}
                  className={`bg-surface p-5 rounded-2xl border transition-all ${isLowest ? "border-gold/40 shadow-[0_0_15px_rgba(243,207,105,0.1)]" : "border-raised"}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-accent-surface font-semibold uppercase tracking-wider text-xs">{def.area}</div>
                    <div className={`text-lg font-bold ${isLowest ? "text-gold" : "text-primary"}`}>{score.toFixed(2)}</div>
                  </div>
                  <div className="w-full bg-raised rounded-full h-1.5 mb-3">
                    <div className={`h-1.5 rounded-full transition-all ${isLowest ? "bg-gold" : "bg-accent"}`} style={{ width: `${(score / 5) * 100}%` }} />
                  </div>
                  <p className="text-secondary text-sm leading-relaxed">{def.definition}</p>
                  {isLowest && (
                    <div className="mt-3 text-xs font-semibold text-gold bg-gold/10 inline-block px-2 py-1 rounded">
                      Area con maggiore margine di miglioramento
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Composite indicators */}
        {compositeIndicators && (
          <div>
            <h3 className="text-xl font-medium mb-1">Indicatori chiave</h3>
            <p className="text-secondary text-sm mb-4">Sette dimensioni trasversali che emergono dall&apos;insieme delle risposte.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMPOSITE_META.map(({ key, label, description }) => {
                const score = compositeIndicators[key];
                const level = getCompositeLevel(score);
                const borderColor = LEVEL_BORDER_COLOR[level];
                const barColor = LEVEL_BAR_COLOR[level];
                return (
                  <div
                    key={key}
                    className="bg-surface border border-raised rounded-2xl p-4"
                    style={{ borderLeft: `3px solid ${borderColor}` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-primary text-sm">{label}</span>
                      <span className="text-base font-extrabold tabular-nums" style={{ color: borderColor }}>
                        {score.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-raised rounded-full h-[3px] mb-2">
                      <div className={`h-[3px] rounded-full transition-all ${barColor}`} style={{ width: `${(score / 5) * 100}%` }} />
                    </div>
                    <p className="text-tertiary text-xs leading-relaxed">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifica build**

```bash
npm run build
```

Expected: nessun errore.

- [ ] **Step 3: Esegui tutti i test**

```bash
npm run test
```

Expected: tutti i test esistenti + i nuovi PASS.

- [ ] **Step 4: Commit finale**

```bash
git add src/app/admin/responses/[id]/page.tsx
git commit -m "feat: add admin responses view page"
```

---

## Variabili d'ambiente da aggiungere a `.env.local`

```env
ADMIN_PASSWORD=<password-segreta>
RESEND_API_KEY=re_<chiave-resend>
NEXT_PUBLIC_BASE_URL=https://fai-microimpresa.it
```

## Migrazione DB da applicare quando Supabase è attivo

```sql
ALTER TABLE public.access_tokens ADD COLUMN IF NOT EXISTS email TEXT;
```
