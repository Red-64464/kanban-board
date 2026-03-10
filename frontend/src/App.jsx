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

import AdminPanel from "./components/AdminPanel.jsx";
import KanbanColonne from "./components/KanbanColonne.jsx";
import TacheCard from "./components/TacheCard.jsx";
import TacheModal from "./components/TacheModal.jsx";
import NouvellesTacheModal from "./components/NouvellesTacheModal.jsx";
import FiltresBar from "./components/FiltresBar.jsx";
import TimelineMilestones from "./components/TimelineMilestones.jsx";

import {
  getTaches,
  updateStatut,
  sendDiscordNotification,
  getSettings,
} from "./api.js";
import { COLONNES } from "./utils.js";
import logo from "../logo/ChatGPT Image 8 mars 2026, 22_39_42.png";

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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [projectSettings, setProjectSettings] = useState({});

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

  const loadSettings = useCallback(async () => {
    try {
      const res = await getSettings();
      setProjectSettings(res.data);
    } catch (err) {
      console.error("Erreur settings:", err);
    }
  }, []);

  useEffect(() => {
    loadTaches();
    loadSettings();
  }, [loadTaches, loadSettings]);

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
      .filter((t) => {
        if (!filtreResponsable) return true;
        if (filtreResponsable === "Commun") return t.responsable.includes(",");
        return t.responsable
          .split(",")
          .map((r) => r.trim())
          .includes(filtreResponsable);
      })
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
        // Notification Discord après le drag & drop
        sendDiscordNotification(movedTask, "move", {
          nouveauStatut: movedTask.statut,
        });
      } catch (err) {
        console.error("Erreur mise à jour statut:", err);
        loadTaches(); // revert on error
      }
    }
  };

  // Handlers
  const handleCreated = (newTache) => {
    setTaches((prev) => [...prev, newTache]);
    sendDiscordNotification(newTache, "create");
  };
  const handleUpdated = (updated) =>
    setTaches((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  const handleDeleted = (id) =>
    setTaches((prev) => prev.filter((t) => t.id !== id));

  const handleMoveTask = async (tache) => {
    const currentIndex = COLONNES_IDS.indexOf(tache.statut);
    const nextIndex = (currentIndex + 1) % COLONNES_IDS.length;
    const nextStatut = COLONNES_IDS[nextIndex];

    // Calculer la nouvelle position (à la fin de la colonne cible)
    const targetColTaches = taches.filter((t) => t.statut === nextStatut);
    const nextPosition = targetColTaches.length;

    try {
      // Mise à jour optimiste
      setTaches((prev) =>
        prev.map((t) =>
          t.id === tache.id
            ? { ...t, statut: nextStatut, position: nextPosition }
            : t,
        ),
      );
      await updateStatut(tache.id, nextStatut, nextPosition);
      // Notification Discord après le déplacement manuel
      sendDiscordNotification(tache, "move", { nouveauStatut: nextStatut });
    } catch (err) {
      console.error("Erreur déplacement manuel:", err);
      loadTaches();
    }
  };

  // Stats
  const total = taches.length;
  const done = taches.filter((t) => t.statut === "done").length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const timelineData = (() => {
    if (!projectSettings.project_start || !projectSettings.project_end)
      return null;
    const tStart = new Date(projectSettings.project_start);
    const tEnd = new Date(projectSettings.project_end);
    const now = new Date();
    const totalMs = tEnd - tStart;
    if (totalMs <= 0) return null;
    const timeProgress = Math.max(
      0,
      Math.min(100, Math.round(((now - tStart) / totalMs) * 100)),
    );
    const daysLeft = Math.max(
      0,
      Math.ceil((tEnd - now) / (1000 * 60 * 60 * 24)),
    );
    const startLabel = tStart.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
    const endLabel = tEnd.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
    return { timeProgress, daysLeft, startLabel, endLabel };
  })();

  const handleSaveSettings = (newSettings) => {
    setProjectSettings(newSettings);
  };

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
      <header className="border-b border-[#D88D23]/30 bg-[#161313] backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo + title */}
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Resto2Luxe Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-[#E7B54C]">Resto2Luxe</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                  Gestion Kanban
                </p>
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
                    className="h-full bg-gradient-to-r from-[#D88D23] to-[#E7B54C] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(231,181,76,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* New task button */}
            <button
              onClick={() => setShowAdminPanel(true)}
              className="p-2 rounded-lg text-dark-400 hover:text-gray-300 hover:bg-dark-700 transition-colors"
              title="Paramètres du projet"
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
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D88D23] hover:bg-[#E7B54C] text-[#161313] rounded-lg text-sm font-bold transition-all shadow-lg shadow-orange-950/20 active:scale-95"
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
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nouvelle tâche
            </button>
          </div>
        </div>
      </header>

      {/* Timeline du projet avec milestones */}
      <TimelineMilestones
        timelineData={timelineData}
        projectSettings={projectSettings}
      />

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
                  onCardMove={handleMoveTask}
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
      {showAdminPanel && (
        <AdminPanel
          settings={projectSettings}
          onClose={() => setShowAdminPanel(false)}
          onSaved={handleSaveSettings}
        />
      )}
    </div>
  );
}
