import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TacheCard from "./TacheCard.jsx";

const COLUMN_STYLES = {
  todo: {
    border: "border-t-blue-500",
    dot: "bg-blue-500",
    header: "text-blue-400",
    count: "bg-blue-500/20 text-blue-400",
  },
  inprogress: {
    border: "border-t-purple-500",
    dot: "bg-purple-500",
    header: "text-purple-400",
    count: "bg-purple-500/20 text-purple-400",
  },
  done: {
    border: "border-t-green-500",
    dot: "bg-green-500",
    header: "text-green-400",
    count: "bg-green-500/20 text-green-400",
  },
};

export default function KanbanColonne({
  id,
  label,
  taches,
  onCardClick,
  onAddClick,
  onCardMove,
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const styles = COLUMN_STYLES[id] || COLUMN_STYLES.todo;
  const ids = taches.map((t) => t.id);

  return (
    <div className="flex flex-col min-w-0 flex-1">
      {/* Column header */}
      <div
        className={`bg-dark-800 rounded-xl border border-dark-600 border-t-2 ${styles.border} mb-3 px-4 py-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
            <span
              className={`text-xs font-bold tracking-wider uppercase ${styles.header}`}
            >
              {label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.count}`}
            >
              {taches.length}
            </span>
            {id === "todo" && (
              <button
                onClick={onAddClick}
                className="text-dark-500 hover:text-gray-300 transition-colors rounded p-0.5 hover:bg-dark-700"
                title="Ajouter une tâche"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Droppable zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl transition-all duration-150 min-h-[120px] ${
          isOver ? "bg-dark-700/50 ring-1 ring-blue-500/30" : "bg-dark-800/30"
        }`}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 p-2">
            {taches.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-dark-500">
                <svg
                  className="w-8 h-8 mb-2 opacity-40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-xs opacity-50">Aucune tâche</span>
              </div>
            )}
            {taches.map((tache) => (
              <TacheCard
                key={tache.id}
                tache={tache}
                onClick={() => onCardClick(tache)}
                onMove={onCardMove}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
