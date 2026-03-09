import { useState } from "react";
import { RESPONSABLES, PRIORITES, formatDateTime } from "../utils.js";
import { updateTache, deleteTache } from "../api.js";
import toast from "react-hot-toast";

export default function TacheModal({ tache, onClose, onUpdated, onDeleted }) {
  const [form, setForm] = useState({
    titre: tache.titre,
    description: tache.description || "",
    responsable: tache.responsable,
    priorite: tache.priorite,
    date_limite: tache.date_limite ? tache.date_limite.split("T")[0] : "",
    rappel_jours: tache.rappel_jours != null ? String(tache.rappel_jours) : "",
    duree_estimee:
      tache.duree_estimee != null ? String(tache.duree_estimee) : "",
  });
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      const res = await updateTache(tache.id, {
        ...form,
        date_limite: form.date_limite || null,
        rappel_jours: form.rappel_jours ? Number(form.rappel_jours) : null,
        duree_estimee: form.duree_estimee ? Number(form.duree_estimee) : null,
      });
      toast.success("Tâche mise à jour !");
      onUpdated(res.data);
      onClose();
    } catch {
      toast.error("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    try {
      await deleteTache(tache.id);
      toast.success("Tâche supprimée");
      onDeleted(tache.id);
      onClose();
    } catch {
      toast.error("Erreur lors de la suppression");
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
            Modifier la tâche
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

        {/* Meta */}
        <div className="px-6 pt-4 pb-0">
          <p className="text-xs text-gray-500">
            Créée le {formatDateTime(tache.date_creation)}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Titre *</label>
            <input
              name="titre"
              value={form.titre}
              onChange={handleChange}
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
              onClick={handleDelete}
              disabled={loading}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                confirmDelete
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-dark-700 hover:bg-red-900/40 text-red-400 border border-red-500/20"
              }`}
            >
              {confirmDelete ? "Confirmer" : "Supprimer"}
            </button>
            {confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2.5 rounded-lg bg-dark-700 text-gray-400 text-sm transition-colors hover:bg-dark-600"
              >
                Annuler
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm font-medium transition-colors"
            >
              Fermer
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
