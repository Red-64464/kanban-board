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
  const isRight = position > 72;
  const isLeft = position < 28;

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 100,
        pointerEvents: "none",
        /* Se place au-dessus ou en-dessous du point selon isAbove */
        ...(isAbove
          ? { bottom: "calc(100% + 18px)" }
          : { top: "calc(100% + 18px)" }),
        /* Alignement horizontal intelligent */
        ...(isRight
          ? { right: 0 }
          : isLeft
            ? { left: 0 }
            : { left: "50%", transform: "translateX(-50%)" }),
      }}
    >
      {/* Carte tooltip */}
      <div
        style={{
          width: 220,
          background: "#161b22",
          border: `1px solid ${milestone.color}55`,
          borderRadius: 12,
          padding: "10px 12px",
          boxShadow: `0 12px 40px rgba(0,0,0,0.65), 0 0 0 1px ${milestone.color}25`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: milestone.color,
              boxShadow: `0 0 8px ${milestone.color}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#f3f4f6",
              flex: 1,
              lineHeight: 1.3,
            }}
          >
            Semaine du {milestone.label}
          </span>
          {milestone.isDeadline && (
            <span
              style={{
                fontSize: 9,
                background: "rgba(249,115,22,0.18)",
                color: "#fb923c",
                padding: "2px 6px",
                borderRadius: 99,
                border: "1px solid rgba(249,115,22,0.35)",
                fontWeight: 700,
              }}
            >
              RENDU
            </span>
          )}
          {milestone.isFinal && (
            <span
              style={{
                fontSize: 9,
                background: "rgba(244,63,94,0.18)",
                color: "#fb7185",
                padding: "2px 6px",
                borderRadius: 99,
                border: "1px solid rgba(244,63,94,0.35)",
                fontWeight: 700,
              }}
            >
              FINAL
            </span>
          )}
          {milestone.isBreak && (
            <span
              style={{
                fontSize: 9,
                background: "rgba(244,114,182,0.18)",
                color: "#f9a8d4",
                padding: "2px 6px",
                borderRadius: 99,
                border: "1px solid rgba(244,114,182,0.35)",
                fontWeight: 700,
              }}
            >
              CONGÉS
            </span>
          )}
        </div>

        {/* Tâches */}
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {milestone.tasks.map((task, i) => (
            <li
              key={i}
              style={{ display: "flex", alignItems: "flex-start", gap: 7 }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: milestone.color,
                  flexShrink: 0,
                  marginTop: 4,
                }}
              />
              <span
                style={{ fontSize: 11, color: "#d1d5db", lineHeight: 1.45 }}
              >
                {task}
              </span>
            </li>
          ))}
        </ul>

        {/* Flèche */}
        <div
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            background: "#161b22",
            transform: "rotate(45deg)",
            ...(isAbove ? { bottom: -5 } : { top: -5 }),
            ...(isRight
              ? { right: 14 }
              : isLeft
                ? { left: 14 }
                : { left: "50%", marginLeft: -5 }),
            borderRight: isAbove ? `1px solid ${milestone.color}45` : "none",
            borderBottom: isAbove ? `1px solid ${milestone.color}45` : "none",
            borderLeft: !isAbove ? `1px solid ${milestone.color}45` : "none",
            borderTop: !isAbove ? `1px solid ${milestone.color}45` : "none",
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
      style={{
        position: "absolute",
        left: `${position}%`,
        top: 8,
        transform: "translate(-50%, -50%)",
        zIndex: hovered ? 50 : 20,
        overflow: "visible",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pulse pour le milestone en cours */}
      {isCurrent && (
        <span
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            background: milestone.color,
            opacity: 0.35,
            animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
          }}
        />
      )}

      {/* Label AU-DESSUS du point */}
      {isAbove && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 5px)",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.03em",
            color: hovered
              ? milestone.color
              : isCurrent
                ? "#d1d5db"
                : isPast
                  ? "#9ca3af"
                  : "#6b7280",
            transition: "color 0.15s",
          }}
        >
          {milestone.shortLabel}
        </div>
      )}

      {/* Point principal */}
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: `2px solid ${milestone.color}`,
          background: isPast || isCurrent ? milestone.color : "#161b22",
          boxShadow: hovered
            ? `0 0 0 4px ${milestone.color}30, 0 0 16px ${milestone.color}70`
            : isCurrent
              ? `0 0 10px ${milestone.color}60`
              : isPast
                ? `0 0 6px ${milestone.color}40`
                : "none",
          transform: hovered
            ? "scale(1.6)"
            : isCurrent
              ? "scale(1.2)"
              : "scale(1)",
          transition: "transform 0.15s, box-shadow 0.15s",
          cursor: "pointer",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Checkmark si passé */}
        {isPast && (
          <svg
            viewBox="0 0 12 12"
            fill="none"
            style={{ position: "absolute", inset: 1 }}
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="#0d1117"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Label EN-DESSOUS du point */}
      {!isAbove && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.03em",
            color: hovered
              ? milestone.color
              : isCurrent
                ? "#d1d5db"
                : isPast
                  ? "#9ca3af"
                  : "#6b7280",
            transition: "color 0.15s",
          }}
        >
          {milestone.shortLabel}
        </div>
      )}

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

  const visibleMilestones = MILESTONES.filter((m) => {
    const d = new Date(m.date);
    return d >= startDate && d <= endDate;
  });

  return (
    <div className="border-b border-dark-700 bg-dark-800/20">
      <div className="max-w-7xl mx-auto px-6 pt-2 pb-4">
        {/* ── Rangée header : date début · barre · date fin · stats ── */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 whitespace-nowrap font-medium shrink-0">
            📅 {timelineData.startLabel}
          </span>

          {/* ── Zone barre + milestones ── */}
          <div
            className="relative flex-1"
            style={{ height: 36, overflow: "visible" }}
          >
            {/* Track gris — positionné en haut */}
            <div
              className="absolute rounded-full bg-dark-700"
              style={{ left: 0, right: 0, top: 8, height: 3 }}
            />

            {/* Progression dorée */}
            <div
              className="absolute rounded-full transition-all duration-700"
              style={{
                left: 0,
                width: `${timelineData.timeProgress}%`,
                top: 8,
                height: 3,
                background: "linear-gradient(to right, #D88D23, #E7B54C)",
                boxShadow: "0 0 8px rgba(231,181,76,0.45)",
              }}
            />

            {/* Curseur aujourd'hui */}
            <div
              className="absolute z-10"
              style={{
                left: `${timelineData.timeProgress}%`,
                top: 8,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: "#E7B54C",
                  boxShadow: "0 0 12px rgba(231,181,76,0.8)",
                  outline: "2px solid rgba(231,181,76,0.25)",
                }}
              />
            </div>

            {/* Points milestones */}
            {visibleMilestones.map((m, i) => {
              const pos = getPositionPercent(m.date, startDate, endDate);
              const milestoneDate = new Date(m.date);
              const isPast = milestoneDate < now;
              const isCurrent =
                !isPast &&
                i > 0 &&
                new Date(visibleMilestones[i - 1].date) < now;
              return (
                <MilestonePoint
                  key={m.id}
                  milestone={m}
                  position={pos}
                  isPast={isPast}
                  isCurrent={isCurrent}
                  isAbove={false}
                />
              );
            })}
          </div>

          <span className="text-xs text-gray-500 whitespace-nowrap font-medium shrink-0">
            🏁 {timelineData.endLabel}
          </span>

          <span
            className={`text-xs font-bold whitespace-nowrap tabular-nums shrink-0 ${
              timelineData.daysLeft <= 3
                ? "text-red-400"
                : timelineData.daysLeft <= 14
                  ? "text-orange-400"
                  : "text-[#E7B54C]"
            }`}
          >
            {timelineData.timeProgress}%
            <span className="text-gray-600 font-normal mx-1">·</span>
            {timelineData.daysLeft}j
          </span>
        </div>

        {/* ── Légende ── */}
        <div className="flex items-center gap-x-4 gap-y-1 mt-3 flex-wrap">
          <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
            Étapes
          </span>
          {visibleMilestones.map((m) => {
            const isPast = new Date(m.date) < now;
            return (
              <div key={m.id} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: isPast ? m.color : "transparent",
                    border: `1.5px solid ${m.color}`,
                    opacity: isPast ? 1 : 0.55,
                  }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{
                    color: isPast ? m.color : "#6b7280",
                    opacity: isPast ? 1 : 0.65,
                  }}
                >
                  {m.label}
                </span>
              </div>
            );
          })}
          <span className="text-[10px] text-gray-600 ml-auto italic hidden sm:block">
            Survolez un point pour voir les tâches
          </span>
        </div>
      </div>
    </div>
  );
}
