"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { perceptionQuestions, objectives, mainQuestions } from "@/data/questions";
import { calculateResults } from "@/utils/scoring";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const TOTAL_STEPS = 42;

function QuestionnaireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const devMode = searchParams.get("dev") === "1";

  const [tokenId, setTokenId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [answersPercezione, setAnswersPercezione] = useState<Record<string, number>>({});
  const [answersObiettivi, setAnswersObiettivi] = useState<string[]>([]);
  const [answersMain, setAnswersMain] = useState<Record<number, number>>({});
  const [finalData, setFinalData] = useState({ nome_attivita: "", settore: "", citta: "", email: "" });

  useEffect(() => {
    if (devMode) {
      setTokenId("__dev__");
      setIsInitializing(false);
      return;
    }

    const token = sessionStorage.getItem("fai_token");
    const tid = sessionStorage.getItem("fai_token_id");

    if (!token || !tid) {
      router.push("/");
      return;
    }
    setTokenId(tid);

    fetch(`/api/save-progress?tokenId=${tid}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data) {
          const loaded = data.data;
          setAnswersPercezione(loaded.answers_percezione || {});
          setAnswersObiettivi(loaded.answers_obiettivi || []);
          setAnswersMain(loaded.answers_main || {});

          if (loaded.completed_at) {
            router.push(`/results/${loaded.id}`);
            return;
          }

          let step = 0;
          const percCount = Object.keys(loaded.answers_percezione || {}).length;
          if (percCount < 7) {
            step = percCount;
          } else if ((loaded.answers_obiettivi || []).length < 3) {
            step = 7;
          } else {
            const mainCount = Object.keys(loaded.answers_main || {}).length;
            step = mainCount < 33 ? 8 + mainCount : 41;
          }
          setCurrentStep(step);
        }
        setIsInitializing(false);
      })
      .catch(() => setIsInitializing(false));
  }, [router, devMode]);

  const saveProgress = async (isFinal = false): Promise<string | null> => {
    if (tokenId === "__dev__") {
      if (isFinal) return "__dev__";
      return null;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/save-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
          answers_percezione: answersPercezione,
          answers_obiettivi: answersObiettivi,
          answers_main: answersMain,
          isFinal,
          finalData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.responseId;
    } catch (err: any) {
      setSaveError(err.message || "Errore di salvataggio");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = async (value: number) => {
    let advanced = false;

    if (currentStep < 7) {
      const q = perceptionQuestions[currentStep];
      setAnswersPercezione(prev => ({ ...prev, [q.id]: value }));
      advanced = true;
    } else if (currentStep >= 8 && currentStep <= 40) {
      const q = mainQuestions[currentStep - 8];
      setAnswersMain(prev => ({ ...prev, [q.id]: value }));
      advanced = true;
    }

    if (advanced) {
      setTimeout(() => saveProgress(), 0);
      if (currentStep < TOTAL_STEPS - 1) {
        setTimeout(() => setCurrentStep(s => s + 1), 300);
      }
    }
  };

  const handleObjectiveToggle = (id: string) => {
    setAnswersObiettivi(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length < 3) return [...prev, id];
      return prev;
    });
  };

  const handleObjectivesSubmit = async () => {
    if (answersObiettivi.length === 3) {
      await saveProgress();
      setCurrentStep(8);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalData.nome_attivita || !finalData.settore || !finalData.citta || !finalData.email) return;

    if (tokenId === "__dev__") {
      const results = calculateResults(answersMain);
      const devPayload = {
        nome_attivita: finalData.nome_attivita,
        settore: finalData.settore,
        citta: finalData.citta,
        email: finalData.email,
        area_scores: results.areaScores,
        composite_indicators: results.compositeIndicators,
      };
      sessionStorage.setItem("fai_dev_results", JSON.stringify(devPayload));
      router.push("/results/__dev__");
      return;
    }

    const responseId = await saveProgress(true);
    if (responseId) router.push(`/results/${responseId}`);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-surface animate-spin" />
      </div>
    );
  }

  const isPerception = currentStep < 7;
  const isObjectives = currentStep === 7;
  const isMain = currentStep >= 8 && currentStep <= 40;
  const isFinalStep = currentStep === 41;

  const renderSquares = () => {
    const squares = [];
    for (let i = 0; i < TOTAL_STEPS; i++) {
      let status = "future";
      if (i < currentStep) status = "completed";
      if (i === currentStep) status = "current";

      let className = "w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-sm transition-colors cursor-default ";
      if (status === "current") className += "bg-accent text-primary ";
      else if (status === "completed") className += "bg-surface text-accent-surface cursor-pointer hover:bg-raised ";
      else className += "bg-raised text-tertiary ";

      squares.push(
        <div
          key={i}
          className={className}
          onClick={() => status === "completed" && setCurrentStep(i)}
        >
          {i + 1}
        </div>
      );
    }
    return (
      <div className="flex flex-wrap gap-1 mb-8 max-w-3xl mx-auto justify-center">
        {squares}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-canvas text-primary p-4 md:p-8 flex flex-col">
      {devMode && (
        <div className="text-center text-xs text-gold bg-gold/10 border border-gold/20 rounded-md px-3 py-1.5 mb-4 max-w-3xl mx-auto w-full">
          Modalità sviluppo attiva — i dati non vengono salvati nel database
        </div>
      )}

      {renderSquares()}

      <div className="flex-grow flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl bg-surface p-6 md:p-10 rounded-2xl shadow-xl relative overflow-hidden"
          >
            {isPerception && (
              <div className="text-accent-surface text-sm font-semibold mb-4 uppercase tracking-wider">Prima di iniziare</div>
            )}
            {isMain && (
              <div className="text-accent-surface text-sm font-semibold mb-4 uppercase tracking-wider">
                {mainQuestions[currentStep - 8].area}
              </div>
            )}

            {saveError && (
              <div className="absolute top-0 left-0 w-full bg-red-900/50 text-red-200 p-2 text-center text-sm flex justify-center items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {saveError}
              </div>
            )}

            {/* Domande scala 1-5 */}
            {(isPerception || isMain) && (
              <div className="flex flex-col gap-8">
                <h2 className="text-2xl md:text-3xl font-medium leading-tight text-primary">
                  {isPerception ? perceptionQuestions[currentStep].text : mainQuestions[currentStep - 8].text}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const qData = isPerception ? perceptionQuestions[currentStep] : mainQuestions[currentStep - 8];
                    const selected = isPerception
                      ? answersPercezione[(qData as any).id] === val
                      : answersMain[(qData as any).id] === val;

                    let label = "";
                    if (val === 1) label = qData.labels[1];
                    if (val === 3) label = qData.labels[3];
                    if (val === 5) label = qData.labels[5];

                    return (
                      <button
                        key={val}
                        onClick={() => handleAnswer(val)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center relative group
                          ${selected ? "border-accent bg-accent/20 text-primary" : "border-raised bg-raised/30 text-secondary hover:border-accent-surface hover:bg-raised/50"}
                        `}
                      >
                        <span className="text-2xl font-bold mb-2">{val}</span>
                        {label && (
                          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 bg-canvas text-secondary text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 hidden md:block">
                            {label}
                          </div>
                        )}
                        {label && (
                          <span className="text-[10px] md:hidden leading-tight text-tertiary">
                            {label.substring(0, 30)}...
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Obiettivi (Step 7) */}
            {isObjectives && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-medium text-primary">Quali sono i tuoi 3 obiettivi principali adesso?</h2>
                <p className="text-secondary text-sm">Seleziona esattamente 3 obiettivi per continuare.</p>
                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2">
                  {objectives.map((obj) => {
                    const isSelected = answersObiettivi.includes(obj.id);
                    const isDisabled = !isSelected && answersObiettivi.length >= 3;
                    return (
                      <button
                        key={obj.id}
                        onClick={() => handleObjectiveToggle(obj.id)}
                        disabled={isDisabled}
                        className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4
                          ${isSelected ? "border-accent bg-accent/20" : "border-raised bg-raised/30 hover:bg-raised/50"}
                          ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                        `}
                      >
                        <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 mt-0.5
                          ${isSelected ? "bg-accent border-accent text-white" : "border-tertiary"}
                        `}>
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <span className={isSelected ? "text-primary font-medium" : "text-secondary"}>
                          {obj.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleObjectivesSubmit}
                  disabled={answersObiettivi.length !== 3 || isSaving}
                  className="mt-4 w-full bg-accent hover:bg-accent/80 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continua"}
                </button>
              </div>
            )}

            {/* Form finale (Step 41) */}
            {isFinalStep && (
              <div className="flex flex-col gap-6">
                <h2 className="text-3xl font-medium text-primary">Ultimo step</h2>
                <p className="text-secondary">
                  Inserisci i dati della tua attività per visualizzare i risultati e ricevere il report completo via email.
                </p>
                <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4 mt-4">
                  {[
                    { label: "Nome Attività", key: "nome_attivita", type: "text" },
                    { label: "Settore", key: "settore", type: "text" },
                    { label: "Città", key: "citta", type: "text" },
                    { label: "Email", key: "email", type: "email" },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-secondary mb-1">{label} *</label>
                      <input
                        type={type}
                        required
                        value={(finalData as any)[key]}
                        onChange={e => setFinalData({ ...finalData, [key]: e.target.value })}
                        className="w-full bg-canvas border border-raised rounded-lg p-3 text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-6 w-full bg-accent hover:bg-accent/80 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center shadow-lg shadow-accent/20"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Calcola i tuoi risultati →"}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-surface animate-spin" />
      </div>
    }>
      <QuestionnaireContent />
    </Suspense>
  );
}
