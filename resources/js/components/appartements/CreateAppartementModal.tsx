import React, { useState, useEffect } from "react";
import {
    X,
    Home,
    Layers,
    Maximize,
    DoorOpen,
    DollarSign,
    Building2,
    FileText,
} from "lucide-react";
import axios from "axios";
import { Immeuble } from "../../types";

interface CreateAppartementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormData) => void;
    defaultImmeubleId?: string;
}

const CreateAppartementModal: React.FC<CreateAppartementModalProps> = ({
    isOpen,
    onClose,
    onSave,
    defaultImmeubleId,
}) => {
    const [immeubles, setImmeubles] = useState<Immeuble[]>([]);
    const [formData, setFormData] = useState({
        numero: "",
        immeuble_id: "",
        etage: "",
        surface: "",
        chambres: "",
        prix_total: "",
        statut: "disponible",
        description: "",
    });

    const resetForm = () => {
        setFormData({
            numero: "",
            immeuble_id: defaultImmeubleId || "",
            etage: "",
            surface: "",
            chambres: "",
            prix_total: "",
            statut: "disponible",
            description: "",
        });
    };

    useEffect(() => {
        if (isOpen) {
            resetForm();
            axios.get("/api/immeubles?paginate=false").then((res) => {
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.data || [];
                setImmeubles(data);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append("numero", formData.numero);
        data.append("immeuble_id", formData.immeuble_id);
        if (formData.etage) data.append("etage", formData.etage);
        if (formData.surface) data.append("surface", formData.surface);
        if (formData.chambres) data.append("chambres", formData.chambres);
        if (formData.prix_total) data.append("prix_total", formData.prix_total);
        data.append("statut", formData.statut);
        if (formData.description)
            data.append("description", formData.description);

        const form = e.currentTarget as HTMLFormElement;
        const filesInput = form.querySelector(
            'input[name="files"]',
        ) as HTMLInputElement;
        if (filesInput?.files) {
            Array.from(filesInput.files).forEach((file) =>
                data.append("files[]", file),
            );
        }

        onSave(data);
    };

    const inputClasses =
        "w-full ps-11 pe-4 py-3 bg-muted/30 border border-border rounded-xl text-sm transition-all duration-200 focus:bg-card focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-foreground placeholder:text-muted-foreground";
    const labelClasses =
        "text-[11px] font-black text-muted-foreground uppercase mb-1.5 block tracking-widest ms-1";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/50">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Home className="text-emerald-500" />
                        Ajouter un Appartement
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <div className="p-6 space-y-5 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>
                                    Numéro de l'appartement
                                </label>
                                <div className="relative">
                                    <Home
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground shadow-sm"
                                        size={18}
                                    />
                                    <input
                                        required
                                        type="text"
                                        className={inputClasses}
                                        value={formData.numero}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                numero: e.target.value,
                                            })
                                        }
                                        placeholder="Ex: A-101"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>
                                    Immeuble associé
                                </label>
                                <div className="relative">
                                    <Building2
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <select
                                        required
                                        className={inputClasses}
                                        value={formData.immeuble_id}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                immeuble_id: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">
                                            Sélectionner un immeuble
                                        </option>
                                        {immeubles.map((i) => (
                                            <option key={i.id} value={i.id}>
                                                {i.nom} (
                                                {i.terrain?.nom_projet || "N/A"}
                                                )
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClasses}>Étage</label>
                                <div className="relative">
                                    <Layers
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <input
                                        type="number"
                                        className={inputClasses}
                                        value={formData.etage}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                etage: e.target.value,
                                            })
                                        }
                                        placeholder="Ex: 2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>
                                    Surface (m²)
                                </label>
                                <div className="relative">
                                    <Maximize
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={inputClasses}
                                        value={formData.surface}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                surface: e.target.value,
                                            })
                                        }
                                        placeholder="Ex: 85.5"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Chambres</label>
                                <div className="relative">
                                    <DoorOpen
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <input
                                        type="number"
                                        className={inputClasses}
                                        value={formData.chambres}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                chambres: e.target.value,
                                            })
                                        }
                                        placeholder="Ex: 3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>
                                    Prix Total (DH)
                                </label>
                                <div className="relative">
                                    <DollarSign
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <input
                                        type="number"
                                        className={inputClasses}
                                        value={formData.prix_total}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                prix_total: e.target.value,
                                            })
                                        }
                                        placeholder="Ex: 850000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Statut</label>
                                <div className="relative">
                                    <FileText
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <select
                                        className={inputClasses}
                                        value={formData.statut}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                statut: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="disponible">
                                            Disponible
                                        </option>
                                        <option value="reserve">Réservé</option>
                                        <option value="vendu">Vendu</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Description</label>
                            <div className="relative">
                                <FileText
                                    className="absolute start-4 top-3 text-muted-foreground"
                                    size={18}
                                />
                                <textarea
                                    className={`${inputClasses} min-h-[100px] pt-3`}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Description détaillée de l'appartement..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>
                                Documents & Images
                            </label>
                            <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-2xl hover:border-emerald-500/30 transition-all group">
                                <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border shadow-sm group-hover:scale-110 transition-all">
                                    <FileText
                                        className="text-emerald-500"
                                        size={20}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        id="file-label-create-apt"
                                        className="text-sm font-bold text-foreground truncate"
                                    >
                                        Aucun document sélectionné
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                                        PDF, JPG, PNG (Max 10MB)
                                    </p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="file"
                                        name="files"
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => {
                                            const files = e.target.files;
                                            const label =
                                                document.getElementById(
                                                    "file-label-create-apt",
                                                );
                                            if (label && files) {
                                                label.innerText =
                                                    files.length > 1
                                                        ? `${files.length} documents`
                                                        : files[0]?.name ||
                                                          "Aucun document";
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="px-4 py-2.5 bg-card border border-border rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-all shadow-sm"
                                    >
                                        Parcourir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/30 font-bold">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all text-sm"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 text-sm"
                        >
                            Enregistrer l'appartement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAppartementModal;
