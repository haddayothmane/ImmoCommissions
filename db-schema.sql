
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. AGENCIES
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    city TEXT,
    phone TEXT,
    address TEXT,
    plan_type TEXT DEFAULT 'basic', -- basic, pro, enterprise
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EMPLOYEES
CREATE TABLE employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    agence_id UUID REFERENCES agencies(id) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'agent', 'comptable')) DEFAULT 'agent',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TERRAINS
CREATE TABLE terrains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agence_id UUID REFERENCES agencies(id) NOT NULL,
    created_by UUID REFERENCES employees(id) NOT NULL,
    nom_projet TEXT NOT NULL,
    ville TEXT NOT NULL,
    quartier TEXT,
    surface DECIMAL,
    prix_achat DECIMAL,
    statut TEXT DEFAULT 'disponible',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. IMMEUBLES
CREATE TABLE immeubles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agence_id UUID REFERENCES agencies(id) NOT NULL,
    terrain_id UUID REFERENCES terrains(id) NOT NULL,
    created_by UUID REFERENCES employees(id) NOT NULL,
    nom TEXT NOT NULL,
    nombre_etages INTEGER,
    statut TEXT DEFAULT 'en_construction',
    date_debut DATE,
    date_livraison DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CLIENTS
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agence_id UUID REFERENCES agencies(id) NOT NULL,
    created_by UUID REFERENCES employees(id) NOT NULL,
    nom TEXT NOT NULL,
    cin TEXT UNIQUE,
    telephone TEXT,
    email TEXT,
    mode_paiement_prefere TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. APPARTEMENTS
CREATE TABLE appartements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agence_id UUID REFERENCES agencies(id) NOT NULL,
    immeuble_id UUID REFERENCES immeubles(id) NOT NULL,
    created_by UUID REFERENCES employees(id) NOT NULL,
    client_id UUID REFERENCES clients(id),
    numero TEXT NOT NULL,
    etage INTEGER,
    surface DECIMAL,
    chambres INTEGER,
    prix_total DECIMAL,
    statut TEXT DEFAULT 'disponible',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PAIEMENTS
CREATE TABLE paiements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agence_id UUID REFERENCES agencies(id) NOT NULL,
    created_by UUID REFERENCES employees(id) NOT NULL,
    appartement_id UUID REFERENCES appartements(id) NOT NULL,
    client_id UUID REFERENCES clients(id) NOT NULL,
    montant DECIMAL NOT NULL,
    date_paiement DATE DEFAULT CURRENT_DATE,
    echeance DATE,
    mode_reglement TEXT,
    statut TEXT DEFAULT 'paye',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. COMMISSIONS
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agence_id UUID REFERENCES agencies(id) NOT NULL,
    created_by UUID REFERENCES employees(id) NOT NULL,
    appartement_id UUID REFERENCES appartements(id) NOT NULL,
    agent_id UUID REFERENCES employees(id) NOT NULL,
    pourcentage DECIMAL NOT NULL,
    montant_total DECIMAL NOT NULL,
    montant_paye DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrains ENABLE ROW LEVEL SECURITY;
ALTER TABLE immeubles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appartements ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Helper: Current Employee's Agency
-- We assume the user's metadata or a custom table stores their agence_id for performance
-- But for strict RLS, we check the employees table.

CREATE POLICY agency_isolation ON terrains FOR ALL
USING (agence_id = (SELECT agence_id FROM employees WHERE id = auth.uid()));

CREATE POLICY agency_isolation ON immeubles FOR ALL
USING (agence_id = (SELECT agence_id FROM employees WHERE id = auth.uid()));

CREATE POLICY agency_isolation ON appartements FOR ALL
USING (agence_id = (SELECT agence_id FROM employees WHERE id = auth.uid()));

CREATE POLICY agency_isolation ON clients FOR ALL
USING (agence_id = (SELECT agence_id FROM employees WHERE id = auth.uid()));

CREATE POLICY agency_isolation ON paiements FOR ALL
USING (agence_id = (SELECT agence_id FROM employees WHERE id = auth.uid()));

CREATE POLICY agency_isolation ON commissions FOR ALL
USING (agence_id = (SELECT agence_id FROM employees WHERE id = auth.uid()));

-- Policy for Employees: An employee can see others in the same agency
CREATE POLICY employee_isolation ON employees FOR SELECT
USING (agence_id = (SELECT agence_id FROM employees WHERE id = auth.uid()));
