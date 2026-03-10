import { useState } from "react";

// ─── Définition des milestones du projet ─────────────────────────────────────
export const MILESTONES = [
  {
    id: "s1",
    date: "2026-03-16",
    label: "16 mars",
    shortLabel: "S1",
    color: "#818cf8", // indigo
    tasks: [
      "📋 Inscription des équipes",
      "🧪 Développement d'un Proof of Concept",
    ],
  },
  {
    id: "s2",
    date: "2026-03-23",
    label: "23 mars",
    shortLabel: "S2",
    color: "#facc15", // yellow
    tasks: [
      "🔒 Fin des inscriptions des équipes",
      "🔍 Analyse du projet",
      "📝 Écriture du README.md",
    ],
  },
  {
    id: "s3",
    date: "2026-03-30",
    label: "30 mars – 24 avr.",
    shortLabel: "S3",
    color: "#4ade80", // green
    tasks: ["🔍 Analyse approfondie du projet", "⚙️ Implémentation du projet"],
  },
  {
    id: "s4",
    date: "2026-04-27",
    label: "27 avr. – 7 mai",
    shortLabel: "S4",
    color: "#f472b6", // pink
    tasks: ["🌸 Vacances de printemps"],
    isBreak: true,
  },
  {
    id: "s5",
    date: "2026-05-11",
    label: "11 mai",
    shortLabel: "S5",
    color: "#f97316", // orange
    tasks: [
      "🎬 Remise de la vidéo sur Google Drive",
      "💻 Remise finale du code sur Git",
      "📄 Dernière mise à jour du README.md",
      "📝 Inscription à l'évaluation finale",
    ],
    isDeadline: true,
  },
  {
    id: "s6",
    date: "2026-06-01",
    label: "Session mai/juin",
    shortLabel: "S6",
    color: "#f43f5e", // rose
    tasks: ["🏆 Évaluation finale"],
    isFinal: true,
  },
];

// ─── Calcule la position % d'une date sur la timeline ─────────────────────────
function getPositionPercent(dateStr, startDate, endDate) {
  const d = new Date(dateStr);
  const total = endDate - startDate;
  if (total <= 0) return 0;
  return Math.max(2, Math.min(98, ((d - startDate) / total) * 100));
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function MilestoneTooltip({ milestone, position, isAbove }) {
  const isRight = position > 70;
  const isLeft = position < 30;

  return (
    <div
      className={`absolute z-50 pointer-events-none transition-all duration-200 ${
        isAbove ? "bottom-[calc(100%+14px)]" : "top-[calc(100%+14px)]"
      } ${
        isRight
          ? "right-0 translate-x-2"
          : isLeft
            ? "left-0 -translate-x-2"
            : "left-1/2 -translate-x-1/2"
      }`}
    >
      <div
        className="w-52 rounded-xl border shadow-2xl shadow-black/50 p-3 text-left"
        style={{
          background: "#1c2128",
          borderColor: milestone.color + "50",
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${milestone.color}30`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2"
            style={{
              background: milestone.color,
              boxShadow: `0 0 8px ${milestone.color}80`,
              ringColor: milestone.color + "30",
            }}
          />
          <p className="text-xs font-bold text-gray-100 leading-tight">
            Semaine du {milestone.label}
          </p>
          {milestone.isDeadline && (
            <span className="ml-auto text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-semibold border border-orange-500/30">
              RENDU
            </span>
          )}
          {milestone.isFinal && (
            <span className="ml-auto text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full font-semibold border border-rose-500/30">
              FINAL
            </span>
          )}
          {milestone.isBreak && (
            <span className="ml-auto text-[10px] bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded-full font-semibold border border-pink-500/30">
              CONGÉS
            </span>
          )}
        </div>

        {/* Tasks */}
        <ul className="space-y-1.5">
          {milestone.tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span
                className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: milestone.color }}
              />
              <span className="text-[11px] text-gray-300 leading-snug">
                {task}
              </span>
            </li>
          ))}
        </ul>

        {/* Flèche du tooltip */}
        <div
          className={`absolute w-2.5 h-2.5 rotate-45 ${
            isAbove ? "-bottom-[6px]" : "-top-[6px]"
          } ${
            isRight
              ? "right-4"
              : isLeft
                ? "left-4"
                : "left-1/2 -translate-x-1/2"
          }`}
          style={{
            background: "#1c2128",
            borderRight: isAbove ? `1px solid ${milestone.color}50` : "none",
            borderBottom: isAbove ? `1px solid ${milestone.color}50` : "none",
            borderLeft: !isAbove ? `1px solid ${milestone.color}50` : "none",
            borderTop: !isAbove ? `1px solid ${milestone.color}50` : "none",
          }}
        />
      </div>
    </div>
  );
}

// ─── Point milestone ─────────────────────────────────────────────────────────
function MilestonePoint({ milestone, position, isPast, isCurrent, isAbove }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2"
      style={{ left: `${position}%` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pulse animation pour le milestone actuel */}
      {isCurrent && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ background: milestone.color, transform: "scale(1.8)" }}
        />
      )}

      {/* Point principal */}
      <div
        className={`relative w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 -translate-x-1/2 ${
          hovered ? "scale-150" : isPast ? "scale-110" : "scale-100"
        }`}
        style={{
          background: isPast || isCurrent ? milestone.color : "#21262d",
          borderColor: milestone.color,
          boxShadow: hovered
            ? `0 0 16px ${milestone.color}90, 0 0 4px ${milestone.color}`
            : isPast
              ? `0 0 8px ${milestone.color}50`
              : "none",
        }}
      >
        {/* Icône checkmark si passé */}
        {isPast && !isCurrent && (
          <svg
            className="absolute inset-0 w-full h-full p-[2px]"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="#0d1117"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Label sous/sur le point */}
      <div
        className={`absolute whitespace-nowrap text-[9px] font-semibold transition-colors duration-200 -translate-x-1/2 ${
          isAbove ? "bottom-[18px]" : "top-[18px]"
        } ${
          hovered
            ? "text-gray-200"
            : isCurrent
              ? "text-gray-300"
              : isPast
                ? "text-gray-500"
                : "text-dark-500"
        }`}
        style={{ color: hovered ? milestone.color : undefined }}
      >
        {milestone.shortLabel}
      </div>

      {/* Tooltip au hover */}
      {hovered && (
        <MilestoneTooltip
          milestone={milestone}
          position={position}
          isAbove={isAbove}
        />
      )}
    </div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────
export default function TimelineMilestones({ timelineData, projectSettings }) {
  if (!timelineData) return null;

  const startDate = new Date(projectSettings.project_start);
  const endDate = new Date(projectSettings.project_end);
  const now = new Date();

  // Filtre les milestones qui sont dans la plage du projet
  const visibleMilestones = MILESTONES.filter((m) => {
    const d = new Date(m.date);
    return d >= startDate && d <= endDate;
  });

  return (
    <div className="border-b border-dark-700 bg-dark-800/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Ligne principale de la timeline */}
        <div className="flex items-center gap-3 mb-1">
          {/* Date début */}
          <span className="text-xs text-dark-500 whitespace-nowrap font-medium">
            📅 {timelineData.startLabel}
          </span>

          {/* Zone timeline avec milestones */}
          <div className="relative flex-1 h-10 flex items-center">
            {/* Track de fond */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-dark-700 rounded-full" />

            {/* Progression */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full transition-all duration-700"
              style={{
                width: `${timelineData.timeProgress}%`,
                background: "linear-gradient(to right, #D88D23, #E7B54C)",
                boxShadow: "0 0 8px rgba(231,181,76,0.4)",
              }}
            />

            {/* Curseur "aujourd'hui" */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
              style={{ left: `${timelineData.timeProgress}%` }}
            >
              <div
                className="w-2 h-2 rounded-full ring-2 ring-[#E7B54C]/40"
                style={{
                  background: "#E7B54C",
                  boxShadow: "0 0 10px rgba(231,181,76,0.7)",
                }}
              />
            </div>

            {/* Points milestones — labels alternés haut/bas */}
            {visibleMilestones.map((m, i) => {
              const pos = getPositionPercent(m.date, startDate, endDate);
              const milestoneDate = new Date(m.date);
              const isPast = milestoneDate < now;
              const isCurrent =
                !isPast &&
                i > 0 &&
                new Date(visibleMilestones[i - 1].date) < now;
              // Alterne labels haut/bas
              const isAbove = i % 2 === 0;

              return (
                <MilestonePoint
                  key={m.id}
                  milestone={m}
                  position={pos}
                  isPast={isPast}
                  isCurrent={isCurrent}
                  isAbove={isAbove}
                />
              );
            })}
          </div>

          {/* Date fin */}
          <span className="text-xs text-dark-500 whitespace-nowrap font-medium">
            🏁 {timelineData.endLabel}
          </span>

          {/* Indicateur % + jours restants */}
          <span
            className={`text-xs font-bold whitespace-nowrap tabular-nums ${
              timelineData.daysLeft <= 3
                ? "text-red-400"
                : timelineData.daysLeft <= 14
                  ? "text-orange-400"
                  : "text-[#E7B54C]"
            }`}
          >
            {timelineData.timeProgress}%
            <span className="text-dark-500 font-normal mx-1">·</span>
            {timelineData.daysLeft}j
          </span>
        </div>

        {/* Légende compacte sous la timeline */}
        <div className="flex items-center gap-3 mt-3 flex-wrap pl-1">
          <span className="text-[10px] text-dark-600 uppercase tracking-widest font-semibold mr-1">
            Étapes
          </span>
          {visibleMilestones.map((m) => {
            const milestoneDate = new Date(m.date);
            const isPast = milestoneDate < now;
            return (
              <div key={m.id} className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isPast ? m.color : "transparent",
                    border: `1.5px solid ${m.color}`,
                    opacity: isPast ? 1 : 0.5,
                  }}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: isPast ? m.color : "#4a5568",
                    opacity: isPast ? 1 : 0.6,
                  }}
                >
                  {m.label}
                </span>
              </div>
            );
          })}
          <span className="text-[10px] text-dark-600 ml-auto italic">
            Survolez un point pour voir les tâches
          </span>
        </div>
      </div>
    </div>
  );
}
