import { useState, useEffect } from "react";
import { updateSetting, toggleMilestoneRappel } from "../api.js";
import { MILESTONES } from "./TimelineMilestones.jsx";
import toast from "react-hot-toast";

export default function AdminPanel({ settings, onClose, onSaved }) {
  const [form, setForm] = useState({
    project_start: settings.project_start || "",
    project_end: settings.project_end || "",
  });
  const [loading, setLoading] = useState(false);

  // État des rappels milestones : { s1: false, s2: false, ... }
  // true = désactivé
  const [rappelsDisabled, setRappelsDisabled] = useState(() => {
    const init = {};
    MILESTONES.forEach((m) => {
      init[m.id] = settings[`milestone_disabled_${m.id}`] === "1";
    });
    return init;
  });
  const [rappelLoading, setRappelLoading] = useState(null);

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

  const handleToggleRappel = async (milestoneId) => {
    const newValue = !rappelsDisabled[milestoneId];
    setRappelLoading(milestoneId);
    try {
      await toggleMilestoneRappel(milestoneId, newValue);
      setRappelsDisabled((prev) => ({ ...prev, [milestoneId]: newValue }));
      toast.success(newValue ? "Rappel désactivé" : "Rappel réactivé");
    } catch {
      toast.error("Erreur lors de la mise à jour du rappel");
    } finally {
      setRappelLoading(null);
    }
  };

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
      <div className="relative w-full max-w-lg bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
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

        <div className="p-6 space-y-5 overflow-y-auto">
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

          {/* ── Rappels Discord milestones ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-200">
                🔔 Rappels Discord
              </span>
              <span className="text-[10px] text-gray-500 bg-dark-700 px-2 py-0.5 rounded-full border border-dark-600">
                J‑3 &amp; J‑1 avant chaque étape
              </span>
            </div>
            <div className="space-y-2">
              {MILESTONES.filter((m) => !m.isBreak).map((m) => {
                const isDisabled = rappelsDisabled[m.id];
                const isLoading = rappelLoading === m.id;
                const milestoneDate = new Date(m.date);
                const isPast = milestoneDate < new Date();
                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                      isDisabled
                        ? "bg-dark-800/30 border-dark-700 opacity-60"
                        : "bg-dark-700/40 border-dark-600"
                    }`}
                  >
                    {/* Indicateur couleur + label */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: isDisabled ? "#4b5563" : m.color }}
                      />
                      <span className="text-xs font-medium text-gray-300 truncate">
                        {m.label}
                      </span>
                      {isPast && (
                        <span className="text-[10px] text-gray-600 italic shrink-0">
                          passé
                        </span>
                      )}
                      {m.isDeadline && (
                        <span className="text-[10px] bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded-full border border-orange-500/25 shrink-0">
                          RENDU
                        </span>
                      )}
                      {m.isFinal && (
                        <span className="text-[10px] bg-rose-500/15 text-rose-400 px-1.5 py-0.5 rounded-full border border-rose-500/25 shrink-0">
                          FINAL
                        </span>
                      )}
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggleRappel(m.id)}
                      disabled={isLoading || isPast}
                      title={
                        isPast
                          ? "Étape passée"
                          : isDisabled
                            ? "Réactiver le rappel"
                            : "Désactiver le rappel"
                      }
                      className={`relative shrink-0 w-10 h-5 rounded-full border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none ${
                        !isDisabled
                          ? "bg-[#D88D23] border-[#D88D23]"
                          : "bg-dark-700 border-dark-600"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                          !isDisabled ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                      {isLoading && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

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
