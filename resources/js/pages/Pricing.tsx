
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const plans = [
    {
      name: t('plan_basic'),
      price: 499,
      maxEmployees: 3,
      features: ['Gestion Terrains', 'Gestion Clients', 'Suivi Paiements', 'Support Email']
    },
    {
      name: t('plan_pro'),
      price: 1499,
      maxEmployees: 10,
      popular: true,
      features: ['Tout dans Basic', 'Gestion Immeubles', 'Automatisation Commissions', 'Rapports Avancés', 'Support 24/7']
    },
    {
      name: t('plan_enterprise'),
      price: 3999,
      maxEmployees: 50,
      features: ['Tout dans Pro', 'Utilisateurs illimités', 'API Access', 'Account Manager dédié', 'Formation sur site']
    }
  ];

  const handleSubscribe = (plan: string) => {
    // Navigate to registration page
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 overflow-hidden relative">
      <div className="absolute top-0 start-0 w-full h-96 bg-gradient-to-b from-white to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 animate-slideDown">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-100 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Plans 2024 - Offres Limitées
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
            Propulsez votre <br />
            <span className="text-emerald-600">Agence Immobilière</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Une gestion simplifiée, des commissions automatisées et une traçabilité totale. Choisissez le plan adapté à votre croissance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-[40px] p-10 bg-white border transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] ${
                plan.popular ? 'border-emerald-500 ring-8 ring-emerald-500 ring-opacity-5 z-10' : 'border-slate-100 shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 start-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black shadow-lg shadow-emerald-500/30 uppercase tracking-widest">
                  PLUS POPULAIRE
                </div>
              )}
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-10">
                <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">{t('currency')} / MOIS</span>
              </div>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-slate-600 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Check size={20} className="text-emerald-500" />
                  <span>Jusqu'à {plan.maxEmployees} employés</span>
                </div>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-slate-500 text-sm font-medium ps-2">
                    <Check size={18} className="text-emerald-300" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSubscribe(plan.name)}
                className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                  plan.popular 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/30' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20'
                }`}
              >
                Sélectionner ce plan
                <ArrowRight size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-32 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center gap-16 grayscale opacity-30">
            <img src="https://picsum.photos/id/10/140/40" alt="Partner" />
            <img src="https://picsum.photos/id/20/140/40" alt="Partner" />
            <img src="https://picsum.photos/id/30/140/40" alt="Partner" />
            <img src="https://picsum.photos/id/40/140/40" alt="Partner" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
