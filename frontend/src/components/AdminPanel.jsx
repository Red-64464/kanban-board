import { useState } from "react";
import { updateSetting } from "../api.js";
import toast from "react-hot-toast";

export default function AdminPanel({ settings, onClose, onSaved }) {
  const [form, setForm] = useState({
    project_start: settings.project_start || "",
    project_end: settings.project_end || "",
  });
  const [loading, setLoading] = useState(false);

  // Timeline calculations based on form values (live preview)
  const tStart = form.project_start ? new Date(form.project_start) : null;
  const tEnd = form.project_end ? new Date(form.project_end) : null;
  const now = new Date();
  const totalMs = tStart && tEnd ? tEnd - tStart : 0;
  const elapsedMs = tStart ? now - tStart : 0;
  const timeProgress =
    totalMs > 0
      ? Math.max(0, Math.min(100, Math.round((elapsedMs / totalMs) * 100)))
      : 0;
  const daysTotal =
    totalMs > 0 ? Math.ceil(totalMs / (1000 * 60 * 60 * 24)) : 0;
  const daysLeft = tEnd
    ? Math.max(0, Math.ceil((tEnd - now) / (1000 * 60 * 60 * 24)))
    : null;
  const daysElapsed = tStart
    ? Math.max(0, Math.ceil((now - tStart) / (1000 * 60 * 60 * 24)))
    : 0;
  const isOver = tEnd && now > tEnd;
  const isStarted = tStart && now >= tStart;

  const handleSave = async () => {
    if (!form.project_start || !form.project_end) {
      toast.error("Les deux dates sont requises");
      return;
    }
    if (new Date(form.project_start) >= new Date(form.project_end)) {
      toast.error("La date de fin doit être après le début");
      return;
    }
    setLoading(true);
    try {
      await Promise.all([
        updateSetting("project_start", form.project_start),
        updateSetting("project_end", form.project_end),
      ]);
      toast.success("Paramètres sauvegardés");
      onSaved({
        project_start: form.project_start,
        project_end: form.project_end,
      });
      onClose();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
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
      <div className="relative w-full max-w-lg bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#D88D23]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 className="text-base font-semibold text-gray-100">
              Paramètres du projet
            </h2>
          </div>
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

        <div className="p-6 space-y-5">
          {/* Date inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Date de début</label>
              <input
                type="date"
                value={form.project_start}
                onChange={(e) =>
                  setForm({ ...form, project_start: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Date de fin</label>
              <input
                type="date"
                value={form.project_end}
                onChange={(e) =>
                  setForm({ ...form, project_end: e.target.value })
                }
                className="form-input"
              />
            </div>
          </div>

          {/* Timeline visualization */}
          {tStart && tEnd && (
            <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600 space-y-4">
              {/* Labels */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  📅{" "}
                  {tStart.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span
                  className={`font-semibold ${
                    isOver
                      ? "text-red-400"
                      : isStarted
                        ? "text-[#E7B54C]"
                        : "text-gray-400"
                  }`}
                >
                  {isOver
                    ? "Projet terminé"
                    : isStarted
                      ? `J+${daysElapsed} en cours`
                      : "Pas encore commencé"}
                </span>
                <span className="text-gray-400">
                  🏁{" "}
                  {tEnd.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Timeline bar */}
              <div className="relative h-4 bg-dark-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D88D23] to-[#E7B54C] rounded-full transition-all duration-700"
                  style={{ width: `${timeProgress}%` }}
                />
                {isStarted && !isOver && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/70"
                    style={{ left: `${timeProgress}%` }}
                  />
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-dark-600/50 rounded-lg py-2.5">
                  <p className="text-lg font-bold text-[#E7B54C]">
                    {daysTotal}
                  </p>
                  <p className="text-xs text-gray-500">jours total</p>
                </div>
                <div className="bg-dark-600/50 rounded-lg py-2.5">
                  <p className="text-lg font-bold text-blue-400">
                    {timeProgress}%
                  </p>
                  <p className="text-xs text-gray-500">temps écoulé</p>
                </div>
                <div className="bg-dark-600/50 rounded-lg py-2.5">
                  <p
                    className={`text-lg font-bold ${
                      daysLeft === null
                        ? "text-gray-400"
                        : daysLeft <= 3
                          ? "text-red-400"
                          : daysLeft <= 7
                            ? "text-orange-400"
                            : "text-green-400"
                    }`}
                  >
                    {daysLeft ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500">jours restants</p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !form.project_start || !form.project_end}
              className="px-4 py-2.5 rounded-lg bg-[#D88D23] hover:bg-[#E7B54C] text-[#161313] text-sm font-bold transition-colors disabled:opacity-50"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
