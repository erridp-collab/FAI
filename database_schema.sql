-- ==============================================================================
-- FAI MICROIMPRESA - SCHEMA DATABASE (Supabase)
-- ==============================================================================

-- 1. TABELLA ACCESS TOKENS
-- Gestisce i token univoci generati per gli utenti (es. ALVA-XXXXXXXX)
CREATE TABLE public.access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    notes TEXT, -- Uso admin (es. "Cliente: Mario Rossi - 08/06/2026")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE, -- Null finché non completato
    response_id UUID -- FK a fai_responses, settato alla fine
);

-- 2. TABELLA RISPOSTE
-- Salva le risposte parziali e complete degli utenti
CREATE TABLE public.fai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID REFERENCES public.access_tokens(id) ON DELETE CASCADE,
    email TEXT,
    nome_attivita TEXT,
    settore TEXT,
    citta TEXT,
    answers_percezione JSONB DEFAULT '{}'::jsonb,
    answers_obiettivi JSONB DEFAULT '[]'::jsonb,
    answers_main JSONB DEFAULT '{}'::jsonb,
    area_scores JSONB DEFAULT '{}'::jsonb,
    composite_indicators JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE -- Null finché non completato
);

-- Aggiunta della foreign key per access_tokens.response_id (Riferimento circolare, quindi facciamo l'ALTER)
ALTER TABLE public.access_tokens 
ADD CONSTRAINT fk_response 
FOREIGN KEY (response_id) 
REFERENCES public.fai_responses(id) 
ON DELETE SET NULL;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fai_responses ENABLE ROW LEVEL SECURITY;

-- Sicurezza: API e Web App comunicheranno tramite service role (per validare token) 
-- oppure con chiamate anon, in cui gestiamo la sicurezza via API Routes (più sicuro).
-- Per il momento, permettiamo letture e inserimenti generici (da restringere in prod).

CREATE POLICY "Enable read access for all users" ON public.access_tokens FOR SELECT USING (true);
CREATE POLICY "Enable all access for responses" ON public.fai_responses FOR ALL USING (true) WITH CHECK (true);
