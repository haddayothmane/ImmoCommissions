import React, { useState, useEffect } from "react";
import { X, Building2, Layers, Calendar, FileText, Layout } from "lucide-react";
import axios from "axios";
import { Terrain, Immeuble } from "../../types";

interface EditImmeubleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: FormData) => void;
    immeuble: Immeuble | null;
}

const EditImmeubleModal: React.FC<EditImmeubleModalProps> = ({
    isOpen,
    onClose,
    onSave,
    immeuble,
}) => {
    const [terrains, setTerrains] = useState<Terrain[]>([]);
    const [formData, setFormData] = useState({
        nom: "",
        terrain_id: "",
        nombre_etages: "",
        statut: "",
        date_debut: "",
        date_livraison: "",
        description: "",
    });

    useEffect(() => {
        if (isOpen) {
            axios.get("/api/terrains?paginate=false").then((res) => {
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.data || [];
                setTerrains(data);
            });
            if (immeuble) {
                setFormData({
                    nom: immeuble.nom || "",
                    terrain_id: immeuble.terrain_id || "",
                    nombre_etages: immeuble.nombre_etages?.toString() || "",
                    statut: immeuble.statut || "en_construction",
                    date_debut: immeuble.date_debut || "",
                    date_livraison: immeuble.date_livraison || "",
                    description: immeuble.description || "",
                });
            }
        }
    }, [isOpen, immeuble]);

    if (!isOpen || !immeuble) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append("nom", formData.nom);
        data.append("terrain_id", formData.terrain_id);
        data.append("nombre_etages", formData.nombre_etages);
        data.append("statut", formData.statut);
        data.append("date_debut", formData.date_debut);
        data.append("date_livraison", formData.date_livraison);
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

        onSave(immeuble.id, data);
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
                        <Building2 className="text-emerald-500" />
                        Modifier l'Immeuble
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
                        <div>
                            <label className={labelClasses}>
                                Nom de l'immeuble
                            </label>
                            <div className="relative">
                                <Building2
                                    className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground shadow-sm"
                                    size={18}
                                />
                                <input
                                    required
                                    type="text"
                                    className={inputClasses}
                                    value={formData.nom}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nom: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>
                                Terrain associé (Optionnel)
                            </label>
                            <div className="relative">
                                <Layout
                                    className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    size={18}
                                />
                                <select
                                    className={inputClasses}
                                    value={formData.terrain_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            terrain_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">
                                        Sélectionner un terrain
                                    </option>
                                    {terrains.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nom_projet} ({t.ville})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>
                                    Nombre d'étages
                                </label>
                                <div className="relative">
                                    <Layers
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <input
                                        type="number"
                                        className={inputClasses}
                                        value={formData.nombre_etages}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                nombre_etages: e.target.value,
                                            })
                                        }
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
                                        <option value="sur_plan">
                                            Sur plan
                                        </option>
                                        <option value="en_construction">
                                            En construction
                                        </option>
                                        <option value="livre">Livré</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>
                                    Date de début
                                </label>
                                <div className="relative">
                                    <Calendar
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <input
                                        type="date"
                                        className={inputClasses}
                                        value={formData.date_debut}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                date_debut: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>
                                    Date de livraison
                                </label>
                                <div className="relative">
                                    <Calendar
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <input
                                        type="date"
                                        className={inputClasses}
                                        value={formData.date_livraison}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                date_livraison: e.target.value,
                                            })
                                        }
                                    />
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
                                    placeholder="Description détaillée de l'immeuble..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>
                                Ajouter des documents
                            </label>
                            <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-2xl hover:border-emerald-500/30 transition-all group">
                                <div className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all">
                                    <FileText
                                        className="text-emerald-500"
                                        size={20}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        id="file-label-edit"
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
                                                    "file-label-edit",
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

                    <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/30">
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
                            Mettre à jour
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditImmeubleModal;
