/**
 * Retourne l'état de la date limite
 * @param {string|null} dateLimite - Date au format ISO string
 * @returns {{ label: string, className: string, icon: string }}
 */
export function getDeadlineStatus(dateLimite) {
  if (!dateLimite)
    return { label: null, className: "deadline-normal", icon: null };

  const now = new Date();
  const deadline = new Date(dateLimite);
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `En retard (${Math.abs(diffDays)}j)`,
      className: "deadline-danger",
      icon: "🔴",
      urgency: "overdue",
    };
  } else if (diffDays <= 2) {
    return {
      label: `Urgent — ${diffDays}j`,
      className: "deadline-danger",
      icon: "🔴",
      urgency: "critical",
    };
  } else if (diffDays <= 5) {
    return {
      label: `${diffDays}j restants`,
      className: "deadline-warning",
      icon: "🟠",
      urgency: "warning",
    };
  } else {
    return {
      label: formatDate(dateLimite),
      className: "deadline-ok",
      icon: null,
      urgency: "ok",
    };
  }
}

/**
 * Formate une date en français
 */
export function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formate une date-heure
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const COLONNES = [
  {
    id: "todo",
    label: "À FAIRE",
    colorClass: "border-t-blue-500",
    dotClass: "bg-blue-500",
    headerColor: "text-blue-400",
  },
  {
    id: "inprogress",
    label: "EN COURS",
    colorClass: "border-t-purple-500",
    dotClass: "bg-purple-500",
    headerColor: "text-purple-400",
  },
  {
    id: "done",
    label: "TERMINÉ",
    colorClass: "border-t-green-500",
    dotClass: "bg-green-500",
    headerColor: "text-green-400",
  },
];

export const RESPONSABLES = ["Ilias", "Mehdi"];

export const PRIORITES = [
  {
    value: "Haute",
    label: "Haute",
    className: "badge-haute",
    dot: "bg-red-400",
  },
  {
    value: "Moyenne",
    label: "Moyenne",
    className: "badge-moyenne",
    dot: "bg-yellow-400",
  },
  {
    value: "Basse",
    label: "Basse",
    className: "badge-basse",
    dot: "bg-green-400",
  },
];

export function getPrioriteConfig(priorite) {
  return PRIORITES.find((p) => p.value === priorite) || PRIORITES[1];
}
