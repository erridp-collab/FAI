"use client";

import {
  type FormEvent,
  type HTMLInputTypeAttribute,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { mainQuestions, objectives, perceptionQuestions, worries } from "@/data/questions";
import { calculateResults } from "@/utils/scoring";

const N_PERCEPTION = perceptionQuestions.length; // 7
const N_MAIN = mainQuestions.length; // 33
const STEP_OBJECTIVES    = N_PERCEPTION;           // 7
const STEP_PREOCCUPAZIONE = N_PERCEPTION + 1;      // 8
const STEP_TRANSITION    = N_PERCEPTION + 2;       // 9
const STEP_MAIN_START    = N_PERCEPTION + 3;       // 10
const STEP_MAIN_END      = N_PERCEPTION + 2 + N_MAIN; // 42
const STEP_FINAL         = N_PERCEPTION + 3 + N_MAIN; // 43
const TOTAL_STEPS        = STEP_FINAL + 1;         // 44

type FinalData = {
  nome_attivita: string;
  settore: string;
  citta: string;
  email: string;
};

type SavedProgressData = {
  id: string;
  answers_percezione?: Record<string, number>;
  answers_obiettivi?: string[];
  answers_main?: Record<number, number>;
  comments_percezione?: Record<string, string>;
  comments_main?: Record<number, string>;
  objectives_comments?: Record<string, string>;
  preoccupazione?: string | null;
  preoccupazione_comment?: string;
  completed_at?: string | null;
};

type SaveProgressGetResponse = {
  ok?: boolean;
  data?: SavedProgressData | null;
};

type SaveProgressPostResponse = {
  ok?: boolean;
  responseId?: string;
  error?: string;
};

type DevResultsPayload = {
  nome_attivita: string;
  settore: string;
  citta: string;
  email: string;
  area_scores: Record<string, number>;
  composite_indicators: ReturnType<typeof calculateResults>["compositeIndicators"];
};

const FINAL_FIELDS = [
  { label: "Nome Attività", key: "nome_attivita", type: "text" },
  { label: "Settore", key: "settore", type: "text" },
  { label: "Città", key: "citta", type: "text" },
  { label: "Email", key: "email", type: "email" },
] as const satisfies ReadonlyArray<{
  label: string;
  key: keyof FinalData;
  type: HTMLInputTypeAttribute;
}>;

function getMissingMainQuestionNumbers(answersMain: Record<number, number>) {
  return mainQuestions
    .filter((question) => answersMain[question.id] === undefined)
    .map((question) => question.number);
}

function QuestionnaireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const devMode = process.env.NEXT_PUBLIC_ALLOW_DEV_MODE === "1" && searchParams.get("dev") === "1";

  const [tokenId, setTokenId] = useState<string | null>(() => (devMode ? "__dev__" : null));
  const [isInitializing, setIsInitializing] = useState(() => !devMode);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [answersPercezione, setAnswersPercezione] = useState<Record<string, number>>({});
  const [answersObiettivi, setAnswersObiettivi] = useState<string[]>([]);
  const [answersMain, setAnswersMain] = useState<Record<number, number>>({});
  const [finalData, setFinalData] = useState<FinalData>({
    nome_attivita: "",
    settore: "",
    citta: "",
    email: "",
  });
  const [commentsPercezione, setCommentsPercezione] = useState<Record<string, string>>({});
  const [commentsMain, setCommentsMain] = useState<Record<number, string>>({});
  const [objectivesComments, setObjectivesComments] = useState<Record<string, string>>({});
  const [preoccupazione, setPreoccupazione] = useState<string | null>(null);
  const [preoccupazioneComment, setPreoccupazioneComment] = useState<string>("");

  useEffect(() => {
    if (devMode) {
      return;
    }

    const token = sessionStorage.getItem("fai_token");
    const storedTokenId = sessionStorage.getItem("fai_token_id");

    if (!token || !storedTokenId) {
      router.push("/");
      return;
    }

    const loadProgress = async () => {
      try {
        setTokenId(storedTokenId);
        const res = await fetch(`/api/save-progress?tokenId=${storedTokenId}`);
        const data = (await res.json()) as SaveProgressGetResponse;

        if (data.ok && data.data) {
          const loaded = data.data;
          setAnswersPercezione(loaded.answers_percezione || {});
          setAnswersObiettivi(loaded.answers_obiettivi || []);
          setAnswersMain(loaded.answers_main || {});
          setCommentsPercezione(loaded.comments_percezione || {});
          setCommentsMain(loaded.comments_main || {});
          setObjectivesComments(loaded.objectives_comments || {});
          setPreoccupazione(loaded.preoccupazione || null);
          setPreoccupazioneComment(loaded.preoccupazione_comment || "");

          if (loaded.completed_at) {
            router.push(`/results/${loaded.id}`);
            return;
          }

          const perceptionCount = Object.keys(loaded.answers_percezione || {}).length;

          if (perceptionCount < N_PERCEPTION) {
            setCurrentStep(perceptionCount);
            return;
          }

          if ((loaded.answers_obiettivi || []).length < 3) {
            setCurrentStep(STEP_OBJECTIVES);
            return;
          }

          if (!loaded.preoccupazione) {
            setCurrentStep(STEP_PREOCCUPAZIONE);
            return;
          }

          const mainCount = Object.keys(loaded.answers_main || {}).length;

          if (mainCount === 0) {
            setCurrentStep(STEP_TRANSITION);
            return;
          }

          setCurrentStep(mainCount < N_MAIN ? STEP_MAIN_START + mainCount : STEP_FINAL);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    void loadProgress();
  }, [devMode, router]);

  const saveProgress = async (
    isFinal = false,
    overrides?: { percezione?: Record<string, number>; main?: Record<number, number> },
  ): Promise<string | null> => {
    if (tokenId === "__dev__") {
      return isFinal ? "__dev__" : null;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/save-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
          answers_percezione: overrides?.percezione ?? answersPercezione,
          answers_obiettivi: answersObiettivi,
          answers_main: overrides?.main ?? answersMain,
          isFinal,
          finalData,
          comments_percezione: commentsPercezione,
          comments_main: commentsMain,
          objectives_comments: objectivesComments,
          preoccupazione,
          preoccupazione_comment: preoccupazioneComment,
        }),
      });

      const data = (await res.json()) as SaveProgressPostResponse;

      if (!res.ok) {
        throw new Error(data.error || "Errore di salvataggio");
      }

      return data.responseId || null;
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Errore di salvataggio",
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = (value: number) => {
    if (currentStep < STEP_OBJECTIVES) {
      const question = perceptionQuestions[currentStep];
      const updated = { ...answersPercezione, [question.id]: value };
      setAnswersPercezione(updated);
      void saveProgress(false, { percezione: updated });
    } else if (currentStep >= STEP_MAIN_START && currentStep <= STEP_MAIN_END) {
      const question = mainQuestions[currentStep - STEP_MAIN_START];
      const updated = { ...answersMain, [question.id]: value };
      setAnswersMain(updated);
      void saveProgress(false, { main: updated });
    } else {
      return;
    }
  };

  const handleObjectiveToggle = (id: string) => {
    setAnswersObiettivi((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      }

      if (prev.length < 3) {
        return [...prev, id];
      }

      return prev;
    });
  };

  const handleObjectivesSubmit = async () => {
    if (answersObiettivi.length === 3) {
      await saveProgress();
      setCurrentStep(STEP_PREOCCUPAZIONE);
    }
  };

  const handleFinalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!finalData.nome_attivita || !finalData.settore || !finalData.citta || !finalData.email) {
      return;
    }

    if (tokenId === "__dev__") {
      const missingQuestions = getMissingMainQuestionNumbers(answersMain);
      if (missingQuestions.length > 0) {
        const firstMissingQuestion = mainQuestions.find(
          (question) => question.number === missingQuestions[0],
        );

        setSaveError(
          `Mancano alcune risposte nel questionario: ${missingQuestions.join(", ")}.`,
        );

        if (firstMissingQuestion) {
          setCurrentStep(STEP_MAIN_START + mainQuestions.findIndex((question) => question.id === firstMissingQuestion.id));
        }

        return;
      }

      try {
        const results = calculateResults(answersMain);
        const devPayload: DevResultsPayload = {
          nome_attivita: finalData.nome_attivita,
          settore: finalData.settore,
          citta: finalData.citta,
          email: finalData.email,
          area_scores: results.areaScores,
          composite_indicators: results.compositeIndicators,
        };

        sessionStorage.setItem("fai_dev_results", JSON.stringify(devPayload));
        window.location.assign("/results/__dev__");
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Impossibile calcolare i risultati in modalità sviluppo.",
        );
      }
      return;
    }

    const responseId = await saveProgress(true);

    if (responseId) {
      router.push(`/results/${responseId}`);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-surface animate-spin" />
      </div>
    );
  }

  const isPerception = currentStep < STEP_OBJECTIVES;
  const isObjectives = currentStep === STEP_OBJECTIVES;
  const isMain = currentStep >= STEP_MAIN_START && currentStep <= STEP_MAIN_END;
  const isFinalStep = currentStep === STEP_FINAL;

  const currentPerceptionQuestion = isPerception
    ? perceptionQuestions[currentStep]
    : null;
  const currentMainQuestion = isMain ? mainQuestions[currentStep - STEP_MAIN_START] : null;
  const currentScaleQuestion = currentPerceptionQuestion || currentMainQuestion;

  const isScaleValueSelected = (value: number) => {
    if (currentPerceptionQuestion) {
      return answersPercezione[currentPerceptionQuestion.id] === value;
    }

    if (currentMainQuestion) {
      return answersMain[currentMainQuestion.id] === value;
    }

    return false;
  };

  const hasScoreSelected =
    (isPerception &&
      currentPerceptionQuestion !== null &&
      answersPercezione[currentPerceptionQuestion.id] !== undefined) ||
    (isMain &&
      currentMainQuestion !== null &&
      answersMain[currentMainQuestion.id] !== undefined);

  const currentComment =
    isPerception && currentPerceptionQuestion
      ? (commentsPercezione[currentPerceptionQuestion.id] ?? "")
      : isMain && currentMainQuestion
      ? (commentsMain[currentMainQuestion.id] ?? "")
      : "";

  const handleCommentChange = (value: string) => {
    if (isPerception && currentPerceptionQuestion) {
      setCommentsPercezione((prev) => ({ ...prev, [currentPerceptionQuestion.id]: value }));
    } else if (isMain && currentMainQuestion) {
      setCommentsMain((prev) => ({ ...prev, [currentMainQuestion.id]: value }));
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const renderSquares = () => {
    const squares = [];

    for (let index = 0; index < TOTAL_STEPS; index++) {
      let status = "future";
      if (index < currentStep) status = "completed";
      if (index === currentStep) status = "current";

      let className =
        "w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[9px] sm:text-[10px] font-bold rounded-sm transition-colors cursor-default ";
      if (status === "current") className += "bg-accent text-primary ";
      else if (status === "completed") {
        className += "bg-surface text-accent-surface cursor-pointer hover:bg-raised ";
      } else {
        className += "bg-raised text-tertiary ";
      }

      squares.push(
        <div
          key={index}
          className={className}
          onClick={() => status === "completed" && setCurrentStep(index)}
        >
          {index + 1}
        </div>,
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

      <div className="flex-grow flex flex-col items-center justify-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl bg-surface p-6 md:p-10 rounded-2xl shadow-xl relative overflow-hidden"
          >
            {isPerception && (
              <div className="text-accent-surface text-sm font-semibold mb-4 uppercase tracking-wider">
                Prima di iniziare
              </div>
            )}
            {isMain && (
              <div className="text-accent-surface text-sm font-semibold mb-4 uppercase tracking-wider">
                {mainQuestions[currentStep - STEP_MAIN_START].area}
              </div>
            )}

            {saveError && (
              <div className="absolute top-0 left-0 w-full bg-red-900/50 text-red-200 p-2 text-center text-sm flex justify-center items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {saveError}
              </div>
            )}

            {(isPerception || isMain) && currentScaleQuestion && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl md:text-3xl font-medium leading-tight text-primary">
                  {currentScaleQuestion.text}
                </h2>

                {isMain && currentMainQuestion && (
                  <div className="text-sm text-secondary italic border-l-2 border-accent-surface/30 pl-3">
                    {currentMainQuestion.hint}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2 text-xs text-secondary">
                    <span>
                      <span className="text-accent-surface font-semibold">1 — </span>
                      {currentScaleQuestion.labels[1]}
                    </span>
                    <span className="text-center">
                      <span className="text-accent-surface font-semibold">3 — </span>
                      {currentScaleQuestion.labels[3]}
                    </span>
                    <span className="text-right">
                      <span className="text-accent-surface font-semibold">5 — </span>
                      {currentScaleQuestion.labels[5]}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const selected = isScaleValueSelected(value);
                      return (
                        <button
                          key={value}
                          onClick={() => handleAnswer(value)}
                          aria-label={`Seleziona punteggio ${value} su 5`}
                          className={`flex items-center justify-center py-3 rounded-xl border-2 transition-all duration-200
                            ${
                              selected
                                ? "border-accent bg-accent/20 text-primary"
                                : "border-raised bg-raised/30 text-secondary hover:border-accent-surface hover:bg-raised/50"
                            }`}
                        >
                          <span className="text-xl font-bold">{value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    maxLength={400}
                    placeholder="Commento facoltativo — puoi aggiungere un dettaglio o un contesto se vuoi…"
                    value={currentComment}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    className="w-full bg-canvas border border-raised rounded-xl p-3 text-sm text-primary resize-none h-20 focus:outline-none focus:border-accent-surface placeholder:text-tertiary"
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-tertiary pointer-events-none">
                    {currentComment.length} / 400
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  {currentStep > 0 ? (
                    <button
                      onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                      className="text-secondary text-sm flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      ← Indietro
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!hasScoreSelected}
                    className="bg-accent hover:bg-accent/80 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-40"
                  >
                    Avanti →
                  </button>
                </div>
              </div>
            )}

            {isObjectives && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-medium text-primary">
                  Quali sono i tuoi 3 obiettivi principali adesso?
                </h2>
                <p className="text-secondary text-sm">
                  Seleziona esattamente 3 obiettivi per continuare.
                </p>
                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2">
                  {objectives.map((objective) => {
                    const isSelected = answersObiettivi.includes(objective.id);
                    const isDisabled = !isSelected && answersObiettivi.length >= 3;

                    return (
                      <button
                        key={objective.id}
                        onClick={() => handleObjectiveToggle(objective.id)}
                        disabled={isDisabled}
                        className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4
                          ${
                            isSelected
                              ? "border-accent bg-accent/20"
                              : "border-raised bg-raised/30 hover:bg-raised/50"
                          }
                          ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                        `}
                      >
                        <div
                          className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 mt-0.5
                            ${isSelected ? "bg-accent border-accent text-white" : "border-tertiary"}
                          `}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <span className={isSelected ? "text-primary font-medium" : "text-secondary"}>
                          {objective.text}
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

            {isFinalStep && (
              <div className="flex flex-col gap-6">
                <h2 className="text-3xl font-medium text-primary">Ultimo step</h2>
                <p className="text-secondary">
                  Inserisci i dati della tua attività per visualizzare i risultati e
                  ricevere il report completo via email.
                </p>
                <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4 mt-4">
                  {FINAL_FIELDS.map(({ label, key, type }) => (
                    <div key={key}>
                      <label
                        htmlFor={key}
                        className="block text-sm font-medium text-secondary mb-1"
                      >
                        {label} *
                      </label>
                      <input
                        id={key}
                        type={type}
                        required
                        value={finalData[key]}
                        onChange={(event) => {
                          const { value } = event.currentTarget;
                          setFinalData((prev) => ({
                            ...prev,
                            [key]: value,
                          }));
                        }}
                        className="w-full bg-canvas border border-raised rounded-lg p-3 text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-6 w-full bg-accent hover:bg-accent/80 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center shadow-lg shadow-accent/20"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Calcola i tuoi risultati →"
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {currentStep > 0 && !isFinalStep && !isPerception && !isMain && (
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            className="text-secondary text-sm flex items-center gap-1.5 hover:text-primary transition-colors py-2 px-4"
          >
            ← Indietro
          </button>
        )}
      </div>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent-surface animate-spin" />
        </div>
      }
    >
      <QuestionnaireContent />
    </Suspense>
  );
}
