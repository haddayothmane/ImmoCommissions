import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
// Added missing ArrowRight and User imports
import { Building, Users, CheckCircle2, MapPin, Phone, Mail, Layout, X, Plus, Shield, ArrowRight, User } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [agencyData, setAgencyData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    logo: null as any
  });
  const [employees, setEmployees] = useState([
    { name: '', email: '', role: 'agent' }
  ]);

  const { refreshUser } = useAuth();

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const addEmployee = () => {
    setEmployees([...employees, { name: '', email: '', role: 'agent' }]);
  };

  const removeEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const updateEmployee = (index: number, field: string, value: string) => {
    const next = [...employees];
    next[index] = { ...next[index], [field]: value };
    setEmployees(next);
  };

  const finish = async () => {
    try {
      await axios.post('/api/onboarding', {
        ...agencyData,
        employees: employees.filter(e => e.email && e.name) // Only send valid employees
      });
      
      await refreshUser();
      window.location.href = '/';
    } catch (error) {
      console.error('Onboarding failed', error);
      alert('Failed to save onboarding data. Please check your inputs.');
    }
  };

  const inputClasses = "w-full ps-11 pe-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none placeholder:text-slate-400 shadow-sm";
  const labelClasses = "text-[11px] font-black text-slate-500 uppercase mb-2 block tracking-widest ms-1";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white">
        {/* Header / Progress */}
        <div className="bg-emerald-900 p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 end-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl -me-32 -mt-32 opacity-50" />
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-6">Configuration de votre Agence</h1>
            <div className="flex items-center gap-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-lg ${
                    step === s ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/40' : 
                    step > s ? 'bg-emerald-400 text-white' : 'bg-emerald-800/50 text-emerald-400 border border-emerald-700'
                  }`}>
                    {step > s ? <CheckCircle2 size={20} /> : s}
                  </div>
                  {s < 3 && <div className={`w-20 h-1 rounded-full ${step > s ? 'bg-emerald-400' : 'bg-emerald-800'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-12">
          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <Building size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none">Identité de l'agence</h2>
                  <p className="text-slate-500 text-sm mt-1">Comment vos clients vous identifieront.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className={labelClasses}>Nom Commercial</label>
                  <div className="relative">
                    <Layout className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      className={inputClasses}
                      placeholder="Ex: Al Omrane Immobilier"
                      value={agencyData.name}
                      onChange={(e) => setAgencyData({...agencyData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Ville de Siège</label>
                  <div className="relative">
                    <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <select 
                      className={`${inputClasses} appearance-none cursor-pointer`}
                      value={agencyData.city}
                      onChange={(e) => setAgencyData({...agencyData, city: e.target.value})}
                    >
                      <option value="">Choisir une ville...</option>
                      <option value="casablanca">Casablanca</option>
                      <option value="rabat">Rabat</option>
                      <option value="marrakech">Marrakech</option>
                      <option value="tanger">Tanger</option>
                      <option value="agadir">Agadir</option>
                    </select>
                    <ArrowRight className="absolute end-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Téléphone Contact</label>
                  <div className="relative">
                    <Phone className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" 
                      className={inputClasses}
                      placeholder="+212 6..."
                      value={agencyData.phone}
                      onChange={(e) => setAgencyData({...agencyData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none">Votre équipe d'experts</h2>
                  <p className="text-slate-500 text-sm mt-1">Invitez vos premiers collaborateurs dès maintenant.</p>
                </div>
              </div>
              
              <div className="space-y-5 max-h-[350px] overflow-y-auto pe-4 custom-scrollbar">
                {employees.map((emp, index) => (
                  <div key={index} className="p-6 bg-slate-50/50 rounded-3xl grid grid-cols-12 gap-5 items-end border border-slate-100 group hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
                    <div className="col-span-12 md:col-span-4">
                      <label className={labelClasses}>Nom Complet</label>
                      <div className="relative">
                        <User className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          className={inputClasses} 
                          placeholder="Ahmed" 
                          value={emp.name}
                          onChange={(e) => updateEmployee(index, 'name', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                      <label className={labelClasses}>Email Professionnel</label>
                      <div className="relative">
                        <Mail className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="email" 
                          className={inputClasses} 
                          placeholder="ahmed@domaine.ma" 
                          value={emp.email}
                          onChange={(e) => updateEmployee(index, 'email', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-span-10 md:col-span-3">
                      <label className={labelClasses}>Rôle</label>
                      <div className="relative">
                        <Shield className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <select 
                          className={`${inputClasses} appearance-none`}
                          value={emp.role}
                          onChange={(e) => updateEmployee(index, 'role', e.target.value)}
                        >
                          <option value="agent">Agent</option>
                          <option value="comptable">Comptable</option>
                        </select>
                        <ArrowRight className="absolute end-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-center pb-3">
                      <button 
                        onClick={() => removeEmployee(index)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={addEmployee}
                className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest hover:text-emerald-700 transition-all px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm"
              >
                <Plus size={16} /> Ajouter un collaborateur
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-16 space-y-6 animate-fadeIn">
              <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/10 border border-emerald-100">
                <CheckCircle2 size={56} className="animate-pulse" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Bienvenue, Admin !</h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                Votre agence <span className="text-emerald-600 font-black">{agencyData.name}</span> est désormais active sur ImmoCommissions.
              </p>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-10">
            {step < 3 ? (
              <>
                <button 
                  onClick={handlePrev}
                  disabled={step === 1}
                  className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    step === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Précédent
                </button>
                <button 
                  onClick={handleNext}
                  className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center gap-3"
                >
                  Suivant
                  <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <button 
                onClick={finish}
                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/40 hover:bg-emerald-950 transition-all active:scale-[0.98]"
              >
                Accéder au tableau de bord
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
