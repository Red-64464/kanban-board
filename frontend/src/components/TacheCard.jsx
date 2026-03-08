import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getDeadlineStatus, getPrioriteConfig } from "../utils.js";

const AVATAR_COLORS = {
  Ilias: "bg-blue-600",
  Mehdi: "bg-purple-600",
};

export default function TacheCard({ tache, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tache.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  const deadline = getDeadlineStatus(tache.date_limite);
  const priorite = getPrioriteConfig(tache.priorite);

  // Border left color based on deadline urgency
  const borderColor =
    {
      overdue: "border-l-red-500",
      critical: "border-l-red-500",
      warning: "border-l-orange-400",
      ok: "border-l-dark-600",
      undefined: "border-l-dark-600",
    }[deadline.urgency] || "border-l-dark-600";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`kanban-card group bg-dark-700 rounded-xl border border-dark-600 border-l-2 ${borderColor} p-4 cursor-grab active:cursor-grabbing shadow-sm hover:border-dark-500 hover:shadow-lg hover:shadow-black/30`}
    >
      {/* Drag handle + click area */}
      <div
        {...listeners}
        className="flex items-start gap-2"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Drag dots */}
        <div className="mt-0.5 text-dark-500 group-hover:text-dark-400 transition-colors flex-shrink-0 cursor-grab active:cursor-grabbing">
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
            <circle cx="3" cy="3" r="1.5" />
            <circle cx="9" cy="3" r="1.5" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="9" cy="8" r="1.5" />
            <circle cx="3" cy="13" r="1.5" />
            <circle cx="9" cy="13" r="1.5" />
          </svg>
        </div>

        {/* Content (clickable) */}
        <div
          className="flex-1 min-w-0"
          onClick={onClick}
          style={{ cursor: "pointer" }}
        >
          {/* Title */}
          <h4 className="text-sm font-medium text-gray-100 leading-snug line-clamp-2 mb-2">
            {tache.titre}
          </h4>

          {/* Description preview */}
          {tache.description && (
            <p className="text-xs text-gray-500 line-clamp-1 mb-2">
              {tache.description}
            </p>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Priority badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${priorite.className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorite.dot}`} />
              {priorite.label}
            </span>

            {/* Deadline */}
            {deadline.label && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${deadline.className}`}
              >
                {deadline.icon && (
                  <span className="mr-0.5">{deadline.icon}</span>
                )}
                {deadline.label}
              </span>
            )}
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <span
              className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold text-white ${AVATAR_COLORS[tache.responsable] || "bg-gray-600"}`}
            >
              {tache.responsable?.[0] || "?"}
            </span>
            <span className="text-xs text-gray-500">{tache.responsable}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
