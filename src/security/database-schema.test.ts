import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("database_schema.sql", () => {
  const schema = readFileSync(resolve(process.cwd(), "database_schema.sql"), "utf8");

  it("mantiene RLS attivo sulle tabelle sensibili", () => {
    expect(schema).toContain("ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;");
    expect(schema).toContain("ALTER TABLE public.fai_responses ENABLE ROW LEVEL SECURITY;");
  });

  it("rimuove le policy permissive legacy", () => {
    expect(schema).toContain(
      'DROP POLICY IF EXISTS "Enable read access for all users" ON public.access_tokens;',
    );
    expect(schema).toContain(
      'DROP POLICY IF EXISTS "Enable all access for responses" ON public.fai_responses;',
    );
    expect(schema).not.toContain('CREATE POLICY "Enable all access for responses"');
    expect(schema).not.toContain("USING (true) WITH CHECK (true)");
  });
});
