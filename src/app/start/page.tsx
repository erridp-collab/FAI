"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ValidateTokenResponse = {
  ok?: boolean;
  tokenId?: string;
  error?: "used" | "invalid" | string;
};

function StartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch("/api/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = (await res.json()) as ValidateTokenResponse;

        if (res.ok && data.ok && data.tokenId) {
          sessionStorage.setItem("fai_token", token);
          sessionStorage.setItem("fai_token_id", data.tokenId);
          router.push("/questionnaire");
          return;
        }

        if (data.error === "used") {
          setRuntimeError("Diagnosi già completata per questo link.");
          return;
        }

        setRuntimeError("Link non valido o scaduto.");
      } catch {
        setRuntimeError("Errore di connessione. Riprova più tardi.");
      }
    };

    void validate();
  }, [router, token]);

  const error = !token
    ? "Token mancante. Usa il link completo ricevuto via email."
    : runtimeError;

  return (
    <div className="min-h-screen bg-canvas text-primary flex items-center justify-center p-6">
      <div className="bg-surface p-8 rounded-xl max-w-md w-full text-center">
        {error ? (
          <div>
            <h1 className="text-2xl font-semibold text-accent-surface mb-4">
              Errore Accesso
            </h1>
            <p className="text-secondary">{error}</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-semibold mb-4 animate-pulse">
              Validazione in corso...
            </h1>
            <p className="text-secondary">Stiamo verificando il tuo link di accesso.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas text-primary flex items-center justify-center">
          Caricamento...
        </div>
      }
    >
      <StartContent />
    </Suspense>
  );
}
