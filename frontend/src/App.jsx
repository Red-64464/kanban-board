import { useState, useEffect, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import KanbanColonne from "./components/KanbanColonne.jsx";
import TacheCard from "./components/TacheCard.jsx";
import TacheModal from "./components/TacheModal.jsx";
import NouvellesTacheModal from "./components/NouvellesTacheModal.jsx";
import FiltresBar from "./components/FiltresBar.jsx";

import { getTaches, updateStatut } from "./api.js";
import { COLONNES } from "./utils.js";

const COLONNES_IDS = ["todo", "inprogress", "done"];

export default function App() {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTache, setActiveTache] = useState(null);
  const [selectedTache, setSelectedTache] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filtreResponsable, setFiltreResponsable] = useState("");
  const [filtrePriorite, setFiltrePriorite] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Load tasks
  const loadTaches = useCallback(async () => {
    try {
      const res = await getTaches();
      setTaches(res.data);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTaches();
  }, [loadTaches]);

  // Get tasks by column, applied filters
  const getTachesByColonne = (colonneId) => {
    return taches
      .filter((t) => t.statut === colonneId)
      .filter((t) => {
        if (search) {
          const q = search.toLowerCase();
          return (
            t.titre.toLowerCase().includes(q) ||
            (t.description || "").toLowerCase().includes(q)
          );
        }
        return true;
      })
      .filter((t) =>
        filtreResponsable ? t.responsable === filtreResponsable : true,
      )
      .filter((t) => (filtrePriorite ? t.priorite === filtrePriorite : true))
      .sort((a, b) => a.position - b.position);
  };

  // Find which column a task belongs to
  const findColumnOfTask = (taskId) => {
    return taches.find((t) => t.id === taskId)?.statut || null;
  };

  const handleDragStart = ({ active }) => {
    const t = taches.find((t) => t.id === active.id);
    setActiveTache(t || null);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    const activeCol = findColumnOfTask(activeId);
    const overCol = COLONNES_IDS.includes(overId)
      ? overId
      : findColumnOfTask(overId);

    if (!activeCol || !overCol || activeCol === overCol) return;

    // Move task to new column (optimistic update)
    setTaches((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, statut: overCol } : t)),
    );
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTache(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeCol = findColumnOfTask(activeId);
    const overCol = COLONNES_IDS.includes(overId)
      ? overId
      : findColumnOfTask(overId);

    if (!activeCol || !overCol) return;

    let newTaches = [...taches];

    if (activeCol === overCol) {
      // Same column reorder
      const colTaches = newTaches
        .filter((t) => t.statut === activeCol)
        .sort((a, b) => a.position - b.position);
      const oldIndex = colTaches.findIndex((t) => t.id === activeId);
      const newIndex = colTaches.findIndex((t) => t.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(colTaches, oldIndex, newIndex);
        reordered.forEach((t, idx) => {
          const i = newTaches.findIndex((x) => x.id === t.id);
          if (i !== -1) newTaches[i] = { ...newTaches[i], position: idx };
        });
        setTaches(newTaches);
      }
    }

    // Persist to backend
    const movedTask = newTaches.find((t) => t.id === activeId);
    if (movedTask) {
      try {
        await updateStatut(activeId, movedTask.statut, movedTask.position);
      } catch (err) {
        console.error("Erreur mise à jour statut:", err);
        loadTaches(); // revert on error
      }
    }
  };

  // Handlers
  const handleCreated = (newTache) => setTaches((prev) => [...prev, newTache]);
  const handleUpdated = (updated) =>
    setTaches((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  const handleDeleted = (id) =>
    setTaches((prev) => prev.filter((t) => t.id !== id));

  // Stats
  const total = taches.length;
  const done = taches.filter((t) => t.statut === "done").length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#21262d",
            color: "#e6edf3",
            border: "1px solid #30363d",
          },
          success: { iconTheme: { primary: "#3fb950", secondary: "#21262d" } },
          error: { iconTheme: { primary: "#f85149", secondary: "#21262d" } },
        }}
      />

      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo + title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-100">
                  Kanban Board
                </h1>
                <p className="text-xs text-dark-500">Projet Scolaire</p>
              </div>
            </div>

            {/* Progress */}
            {total > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-dark-500">
                    {done}/{total} tâches terminées
                  </p>
                  <p className="text-xs font-semibold text-gray-300">
                    {progress}% complété
                  </p>
                </div>
                <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* New task button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/30"
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
              Nouvelle tâche
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-dark-700 bg-dark-800/40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <FiltresBar
            search={search}
            onSearch={setSearch}
            filtreResponsable={filtreResponsable}
            onFiltreResponsable={setFiltreResponsable}
            filtrePriorite={filtrePriorite}
            onFiltrePriorite={setFiltrePriorite}
          />
        </div>
      </div>

      {/* Main board */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-dark-500">Chargement des tâches...</p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COLONNES.map((col) => (
                <KanbanColonne
                  key={col.id}
                  id={col.id}
                  label={col.label}
                  taches={getTachesByColonne(col.id)}
                  onCardClick={setSelectedTache}
                  onAddClick={() => setShowCreateModal(true)}
                />
              ))}
            </div>

            {/* Drag overlay */}
            <DragOverlay>
              {activeTache ? (
                <div className="rotate-1 scale-105">
                  <TacheCard tache={activeTache} onClick={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-700 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-dark-500">
            {total} tâche{total !== 1 ? "s" : ""} au total · {done} terminée
            {done !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-dark-500">
            Ilias & Mehdi · Projet Scolaire
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showCreateModal && (
        <NouvellesTacheModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
      {selectedTache && (
        <TacheModal
          tache={selectedTache}
          onClose={() => setSelectedTache(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
