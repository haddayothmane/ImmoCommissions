// Role type is now handled by an interface further down


export interface Plan {
    id: string;
    name: string;
    price: number;
    maxEmployees: number;
    maxTerrains: number;
    features: string[];
}

export interface Agency {
    id: string;
    name: string;
    logo_url?: string;
    city?: string;
    phone?: string;
    address?: string;
    plan_type: string;
    subscription_status: "active" | "expired" | "blocked";
}

export interface Permission {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export interface Role {
    id: string;
    name: string;
    slug: string;
    description?: string;
    permissions?: Permission[];
}


export interface Employee {
    id: string;
    agence_id: string;
    full_name: string;
    email: string;
    role_id?: string;
    role?: Role;
    active: boolean;
    created_at: string;
}

export interface Terrain {
    id: string;
    agence_id: string;
    created_by: string;
    creator?: { id: string; full_name: string; email: string };
    nom_projet: string;
    ville: string;
    quartier?: string;
    surface: number;
    prix_achat: number;
    statut: "disponible" | "vendu" | "reserve";
    created_at: string;
    created_by_name?: string;
    // New optional fields
    description?: string;
    documents?: string[]; // URLs or paths of uploaded PDFs/images
    immeubles?: Immeuble[];
    immeubles_count?: number;
    appartements_count?: number;
}

export interface Immeuble {
    id: string;
    agence_id: string;
    terrain_id: string;
    created_by: string;
    nom: string;
    nombre_etages: number;
    statut: "sur_plan" | "en_construction" | "livre" | string;
    date_debut?: string;
    date_livraison?: string;
    description?: string;
    documents?: string[];
    terrain?: Terrain;
    creator?: { id: string; full_name: string; email: string };
    created_at: string;
    created_by_name?: string;
}

export interface Appartement {
    id: string;
    agence_id: string;
    immeuble_id: string;
    created_by: string;
    client_id?: string;
    numero: string;
    etage: number;
    surface: number;
    chambres: number;
    prix_total: number;
    statut: "disponible" | "vendu" | "reserve";
    description?: string;
    documents?: string[];
    immeuble?: Immeuble;
    client?: Client;
    creator?: { id: string; full_name: string; email: string };
    created_at?: string;
    created_by_name?: string;
    contracts?: Contract[];
    paiements?: PaiementRecord[];
}

export interface Client {
    id: string;
    agence_id: string;
    created_by: string;
    nom: string;
    cin: string;
    telephone: string;
    email: string;
    contracts?: Contract[];
}

export interface PaiementRecord {
    id: string;
    agence_id: string;
    created_by: string;
    appartement_id?: string;
    contract_id?: string;
    client_id: string;
    milestone_id?: string;
    montant: number;
    mode_reglement: string;
    date_paiement: string;
    reference?: string;
    description?: string;
    statut?: string;
    created_at: string;
    client?: Client;
    contract?: Contract;
    appartement?: Appartement;
    milestone?: PaymentMilestone;
}

export interface PaymentMilestone {
    id: string;
    contract_id: string;
    label: string;
    percentage: number;
    amount: number;
    due_date?: string;
    status: "pending" | "paid";
    created_at: string;
    payments?: PaiementRecord[];
}

export interface Contract {
    id: string;
    agence_id: string;
    client_id: string;
    created_by: string;
    target_id: string;
    target_type: "App\\Models\\Terrain" | "App\\Models\\Immeuble" | "App\\Models\\Appartement";
    total_sale_price: number;
    status: "draft" | "active" | "completed" | "cancelled";
    payment_mode?: "cheque" | "virement" | "especes";
    payment_type?: "totalite" | "tranches";
    installments?: number;
    interval_days?: number;
    client?: Client;
    target?: Terrain | Immeuble | Appartement;
    milestones?: PaymentMilestone[];
    creator?: { id: string; full_name: string; email: string };
    created_at: string;
}

export interface Commission {
    id: string;
    agence_id: string;
    created_by: string;
    appartement_id: string;
    agent_id: string;
    client_id?: string;
    pourcentage: number;
    montant_total: number;
    montant_paye: number;
    montant_restant: number;
    prix_vente: number;
    statut: "non payé" | "partiellement payé" | "payé";
    created_at: string;
    appartement?: Appartement;
    agent?: Employee;
    client?: Client;
    payments?: CommissionPayment[];
}

export interface CommissionPayment {
    id: string;
    agence_id: string;
    commission_id: string;
    montant: number;
    date_paiement: string;
    mode_paiement: string;
    reference?: string;
    created_by: string;
    creator?: Employee;
    created_at: string;
}
