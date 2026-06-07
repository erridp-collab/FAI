import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center w-full px-4 sm:px-6 animate-fade-in-up">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        {/* Header Text */}
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full border border-border/50 bg-white/50 backdrop-blur-sm text-sm font-medium text-muted-foreground shadow-sm">
            Diagnosi Gratuita in 10 minuti
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Quanto è solida la tua <span className="text-primary">attività</span>?
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Non è un esame: è una diagnosi onesta basata sui tuoi dati, costruita su misura per le piccole imprese. Scopri punti di forza ed eventuali aree esposte.
          </p>
        </div>

        {/* Selection Area */}
        <div className="pt-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Per iniziare, che tipo di attività gestisci?</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Card Commercio */}
            <Link 
              href="/questionnaire?type=commercio"
              className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">Commercio</h3>
              <p className="text-sm text-muted-foreground mt-2">Negozi, botteghe, retail e vendita diretta</p>
            </Link>

            {/* Card Ricettività */}
            <Link 
              href="/questionnaire?type=ricettivita"
              className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">Attività Ricettive</h3>
              <p className="text-sm text-muted-foreground mt-2">B&B, case vacanza, hotel, agriturismi</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

