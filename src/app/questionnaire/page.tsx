"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { questions as allQuestions } from "@/data/questions";
import { calculateResults } from "@/utils/scoring";
import { supabase } from "@/utils/supabase/client";

function QuestionnaireContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activityType = searchParams.get("type"); // "commercio" o "ricettivita"
  
  // Filter questions based on type, although for now they all apply to both
  const mockQuestions = allQuestions.filter(q => q.activity_types.includes(activityType || 'commercio'));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const currentQuestion = mockQuestions[currentIndex];
  const progress = ((currentIndex) / mockQuestions.length) * 100;

  const handleAnswer = (score: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: score });
    
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentIndex < mockQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 400);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      router.push("/");
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in-up text-center px-4">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <Check size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-foreground">Ottimo lavoro!</h2>
        <p className="text-muted-foreground mb-8 max-w-md text-lg">
          Hai completato il questionario. Inserisci la tua email per calcolare il tuo punteggio e ricevere il report dettagliato della tua attività.
        </p>

        <form 
          className="w-full max-w-sm flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            
            try {
              // 1. Calcola i risultati
              const results = calculateResults(answers, mockQuestions);
              
              // 2. Determina l'ID dell'attività (1 per commercio, 2 per ricettivita)
              const activityTypeId = activityType === "ricettivita" ? 2 : 1;

              // 3. Salva su Supabase
              const { error } = await supabase
                .from("fai_responses")
                .insert([
                  {
                    guest_email: email,
                    activity_type_id: activityTypeId,
                    answers: answers,
                    calculated_results: results
                  }
                ]);

              if (error) throw error;

              alert("Dati inviati! Riceverai a breve il tuo report all'indirizzo indicato.");
              router.push("/");
            } catch (err) {
              console.error(err);
              alert("Errore durante il salvataggio dei dati. Riprova.");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            placeholder="La tua email aziendale"
            className="w-full px-5 py-4 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Ottieni il mio Report"}
          </button>
        </form>

        <button 
          onClick={() => setIsFinished(false)} 
          className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Rivedi le tue risposte
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col min-h-[80vh]">
      
      {/* Top Navigation & Progress */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Indietro</span>
        </button>
        <div className="text-sm font-medium text-muted-foreground">
          Domanda {currentIndex + 1} di {mockQuestions.length}
        </div>
      </div>

      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-12">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Area with Framer Motion */}
      <div className="flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full space-y-12"
          >
            <div className="space-y-4">
              <span className="text-sm font-bold tracking-widest uppercase text-brand">
                {currentQuestion.area}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-foreground">
                {currentQuestion.text}
              </h2>
            </div>

            {/* 1-5 Score Buttons - Optimized for mobile */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((score) => {
                const isSelected = answers[currentQuestion.id] === score;
                return (
                  <button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    className={`
                      relative group p-3 sm:p-6 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all duration-200
                      ${isSelected 
                        ? "border-primary bg-primary/5 text-primary scale-105 shadow-sm" 
                        : "border-border bg-card hover:border-brand/50 hover:bg-muted"
                      }
                    `}
                  >
                    <span className="text-xl sm:text-2xl font-bold">{score}</span>
                  </button>
                );
              })}
            </div>

            {/* Labels under the scale (optimized for mobile) */}
            <div className="flex justify-between text-[10px] sm:text-sm text-muted-foreground px-1 gap-2">
              <div className="flex-1 text-left">{currentQuestion.labels[1]}</div>
              <div className="flex-1 text-center hidden sm:block">{currentQuestion.labels[3]}</div>
              <div className="flex-1 text-right">{currentQuestion.labels[5]}</div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Caricamento...</div>}>
      <QuestionnaireContent />
    </Suspense>
  );
}
