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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Responsable</label>
              <select
                name="responsable"
                value={form.responsable}
                onChange={handleChange}
                className="form-input"
              >
                {RESPONSABLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
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
