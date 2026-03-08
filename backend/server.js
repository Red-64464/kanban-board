require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@libsql/client");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── DB TURSO ────────────────────────────────────────────────────────────────
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS taches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      description TEXT DEFAULT '',
      responsable TEXT NOT NULL DEFAULT 'Ilias',
      priorite TEXT NOT NULL DEFAULT 'Moyenne',
      statut TEXT NOT NULL DEFAULT 'todo',
      date_limite TEXT,
      date_creation TEXT NOT NULL DEFAULT (datetime('now')),
      position INTEGER DEFAULT 0
    )
  `);
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// GET /api/taches
app.get("/api/taches", async (req, res) => {
  try {
    const result = await db.execute(
      "SELECT * FROM taches ORDER BY statut, position ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// POST /api/taches
app.post("/api/taches", async (req, res) => {
  const { titre, description, responsable, priorite, date_limite } = req.body;
  if (!titre?.trim())
    return res.status(400).json({ erreur: "Le titre est requis" });
  try {
    const maxRes = await db.execute(
      "SELECT COALESCE(MAX(position), -1) as max FROM taches WHERE statut = 'todo'",
    );
    const maxPos = Number(maxRes.rows[0]?.max ?? -1);
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const r = await db.execute({
      sql: `INSERT INTO taches (titre, description, responsable, priorite, statut, date_limite, date_creation, position)
            VALUES (?, ?, ?, ?, 'todo', ?, ?, ?)`,
      args: [
        titre.trim(),
        (description || "").trim(),
        responsable || "Ilias",
        priorite || "Moyenne",
        date_limite || null,
        now,
        maxPos + 1,
      ],
    });
    const newTache = await db.execute({
      sql: "SELECT * FROM taches WHERE id = ?",
      args: [r.lastInsertRowid],
    });
    res.status(201).json(newTache.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// PUT /api/taches/:id
app.put("/api/taches/:id", async (req, res) => {
  const id = Number(req.params.id);
  const {
    titre,
    description,
    responsable,
    priorite,
    statut,
    date_limite,
    position,
  } = req.body;
  try {
    const ex = await db.execute({
      sql: "SELECT * FROM taches WHERE id = ?",
      args: [id],
    });
    const existing = ex.rows[0];
    if (!existing) return res.status(404).json({ erreur: "Tâche introuvable" });
    await db.execute({
      sql: `UPDATE taches SET titre=?, description=?, responsable=?, priorite=?, statut=?, date_limite=?, position=? WHERE id=?`,
      args: [
        titre !== undefined ? titre.trim() : existing.titre,
        description !== undefined ? description.trim() : existing.description,
        responsable ?? existing.responsable,
        priorite ?? existing.priorite,
        statut ?? existing.statut,
        date_limite !== undefined ? date_limite : existing.date_limite,
        position !== undefined ? Number(position) : existing.position,
        id,
      ],
    });
    const updated = await db.execute({
      sql: "SELECT * FROM taches WHERE id = ?",
      args: [id],
    });
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// PATCH /api/taches/:id/statut
app.patch("/api/taches/:id/statut", async (req, res) => {
  const id = Number(req.params.id);
  const { statut, position } = req.body;
  if (!["todo", "inprogress", "done"].includes(statut))
    return res
      .status(400)
      .json({ erreur: "Statut invalide. Valeurs: todo, inprogress, done" });
  try {
    const ex = await db.execute({
      sql: "SELECT * FROM taches WHERE id = ?",
      args: [id],
    });
    if (!ex.rows[0])
      return res.status(404).json({ erreur: "Tâche introuvable" });
    await db.execute({
      sql: "UPDATE taches SET statut=?, position=? WHERE id=?",
      args: [statut, position ?? 0, id],
    });
    const updated = await db.execute({
      sql: "SELECT * FROM taches WHERE id = ?",
      args: [id],
    });
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// DELETE /api/taches/:id
app.delete("/api/taches/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const ex = await db.execute({
      sql: "SELECT * FROM taches WHERE id = ?",
      args: [id],
    });
    if (!ex.rows[0])
      return res.status(404).json({ erreur: "Tâche introuvable" });
    await db.execute({ sql: "DELETE FROM taches WHERE id = ?", args: [id] });
    res.json({ message: "Tâche supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
initDB()
  .then(() =>
    app.listen(PORT, () =>
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`),
    ),
  )
  .catch((err) => {
    console.error("Erreur DB:", err);
    process.exit(1);
  });
