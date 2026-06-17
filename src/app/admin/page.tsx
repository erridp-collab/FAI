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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/tokens")
      .then((r) => {
        if (!r.ok) throw new Error("Errore nel caricamento");
        return r.json();
      })
      .then((data: { tokens?: AdminToken[] }) => {
        setTokens(data.tokens ?? []);
        setLoading(false);
      })
      .catch(() => {
        setFetchError("Impossibile caricare i token. Ricarica la pagina.");
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
        ) : fetchError ? (
          <p className="text-red-400 text-sm">{fetchError}</p>
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
