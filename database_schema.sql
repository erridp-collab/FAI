-- ==============================================================================
-- STRUTTURA DEL MASTER DATABASE (Ecosistema) E DELLE TABELLE "FAI"
-- ==============================================================================

-- 1. TABELLA CENTRALE UTENTI (Lead / Clienti)
-- Supabase ha già la sua tabella auth.users, ma è buona norma avere una tabella pubblica o privata nel db per gestire i profili in modo più flessibile.
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELLA CENTRALE PRODOTTI (L'ecosistema SaaS)
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,          -- es. "FAI", "Business Manager", "SaaS 1"
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inseriamo subito il prodotto FAI
INSERT INTO public.products (name, description) VALUES ('FAI Microimpresa', 'Questionario diagnostico digitale');

-- 3. TABELLA PONTE: UTENTI - PRODOTTI
-- Serve per sapere quali utenti usano quali prodotti
CREATE TABLE public.user_products (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, product_id)
);

-- ==============================================================================
-- TABELLE SPECIFICHE PER "FAI MICROIMPRESA"
-- ==============================================================================

-- 4. TIPI DI ATTIVITÀ (Il "Bivio" iniziale)
CREATE TABLE public.fai_activity_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,    -- es. "Commercio", "Attività Ricettive"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inseriamo le due attività concordate
INSERT INTO public.fai_activity_types (name) VALUES ('Commercio'), ('Attività Ricettive');

-- 5. LE DOMANDE DEL QUESTIONARIO
CREATE TABLE public.fai_questions (
    id SERIAL PRIMARY KEY,
    area TEXT NOT NULL,                 -- es. "Prima di iniziare", "1. La tua voce", ecc.
    question_text TEXT NOT NULL,        -- Il testo della domanda
    activity_type_id INTEGER REFERENCES public.fai_activity_types(id), -- NULL se la domanda vale per tutti i tipi
    question_type TEXT DEFAULT 'score', -- 'score' (1-5), 'text', 'multiple'
    order_index INTEGER DEFAULT 0       -- Per ordinare le domande nel frontend
);

-- 6. LE RISPOSTE E I RISULTATI DEGLI UTENTI
CREATE TABLE public.fai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Se si cancella l'utente, possiamo tenere anonime le risposte (SET NULL)
    guest_email TEXT, -- Se l'utente non è ancora registrato in auth, salviamo la mail qui
    activity_type_id INTEGER REFERENCES public.fai_activity_types(id),
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,      -- Tutte le risposte grezze
    calculated_results JSONB DEFAULT '{}'::jsonb,    -- I punteggi calcolati (Identità, Liquidità, ecc.)
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sicurezza: Impostiamo le Policy (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fai_activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fai_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fai_responses ENABLE ROW LEVEL SECURITY;

-- Esempio base: Tutti possono leggere domande e tipi di attività, nessuno può modificarle tranne gli admin
CREATE POLICY "Public read access to activity types" ON public.fai_activity_types FOR SELECT USING (true);
CREATE POLICY "Public read access to questions" ON public.fai_questions FOR SELECT USING (true);

-- Permettiamo agli utenti (anche anonimi se necessario, o tramite un service_role) di inserire le risposte
CREATE POLICY "Anyone can insert responses" ON public.fai_responses FOR INSERT WITH CHECK (true);
