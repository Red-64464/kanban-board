import { useState } from "react";
import { RESPONSABLES, PRIORITES } from "../utils.js";
import { createTache } from "../api.js";
import toast from "react-hot-toast";

export default function NouvellesTacheModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    titre: "",
    description: "",
    responsable: "Ilias",
    priorite: "Moyenne",
    date_limite: "",
    rappel_jours: "",
    duree_estimee: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    setLoading(true);
    try {
      const res = await createTache({
        ...form,
        date_limite: form.date_limite || null,
        rappel_jours: form.rappel_jours ? Number(form.rappel_jours) : null,
        duree_estimee: form.duree_estimee ? Number(form.duree_estimee) : null,
      });
      toast.success("Tâche créée !");
      onCreated(res.data);
      onClose();
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
          <h2 className="text-base font-semibold text-gray-100">
            Nouvelle tâche
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors rounded-lg p-1 hover:bg-dark-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Titre *</label>
            <input
              name="titre"
              value={form.titre}
              onChange={handleChange}
              placeholder="Ex: Implémenter la page d'accueil"
              className="form-input"
              autoFocus
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Détails de la tâche..."
              rows={3}
              className="form-input resize-none"
            />
          </div>

          <div>
            <label className="form-label">Responsable</label>
            <div className="flex gap-2">
              {[
                {
                  label: "Ilias",
                  value: "Ilias",
                  color: "bg-blue-600/30 text-blue-300 border-blue-500/40",
                },
                {
                  label: "Mehdi",
                  value: "Mehdi",
                  color:
                    "bg-purple-600/30 text-purple-300 border-purple-500/40",
                },
                {
                  label: "Les deux",
                  value: "Ilias,Mehdi",
                  color: "bg-[#D88D23]/20 text-[#E7B54C] border-[#D88D23]/40",
                },
              ].map(({ label, value, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, responsable: value })}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    form.responsable === value
                      ? color
                      : "border-dark-600 text-dark-400 hover:text-gray-300 hover:border-dark-500 hover:bg-dark-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Priorité</label>
              <select
                name="priorite"
                value={form.priorite}
                onChange={handleChange}
                className="form-input"
              >
                {PRIORITES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Durée estimée (h)</label>
              <input
                type="number"
                name="duree_estimee"
                value={form.duree_estimee}
                onChange={handleChange}
                placeholder="Ex: 4"
                min="0"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Date limite</label>
            <input
              type="date"
              name="date_limite"
              value={form.date_limite}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {form.date_limite && (
            <div>
              <label className="form-label">Rappel Discord</label>
              <select
                name="rappel_jours"
                value={form.rappel_jours}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Aucun rappel</option>
                <option value="1">1 jour avant</option>
                <option value="2">2 jours avant</option>
                <option value="3">3 jours avant</option>
                <option value="7">1 semaine avant</option>
              </select>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {loading ? "Création..." : "Créer la tâche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
