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

// ─── DISCORD WEBHOOKS ────────────────────────────────────────────────────────
const WEBHOOKS = {
  Ilias:
    "https://discord.com/api/webhooks/1478804168813576313/-EUl3FSAcIjZEDvua8VlKcyHAT5GJLg7wX4tmzS6oKNVLehmb7T4qK6P0Mza86hZyniN",
  Mehdi:
    "https://discord.com/api/webhooks/1480330839307976767/J2IQdDFRUw-SNKL3-uZ6DEuwkhcRxvIcZxb2VGdqF7IV7QIgOLo3_hx1TirXpFAFEtac",
};

const DISCORD_MENTIONS = {
  Ilias: "<@691970121362571315>",
  Mehdi: "<@940298554432430131>",
};

async function sendRappelDiscord(tache) {
  const responsables = tache.responsable.split(",").map((r) => r.trim());
  for (const r of responsables) {
    const webhookUrl = WEBHOOKS[r];
    if (!webhookUrl) continue;
    const mention = DISCORD_MENTIONS[r] || r;
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `⏰ **RAPPEL KANBAN** - ${mention}`,
          embeds: [
            {
              title: `⏰ Rappel : ${tache.titre}`,
              description: `La tâche expire dans **${tache.rappel_jours} jour(s)** !\n\n**📝 Description :**\n${tache.description || "*Aucune description.*"}`,
              color: 0xe67e22,
              fields: [
                {
                  name: "⚡ Priorité",
                  value: `\`${tache.priorite}\``,
                  inline: true,
                },
                {
                  name: "📅 Date limite",
                  value: `\`${tache.date_limite}\``,
                  inline: true,
                },
              ],
              footer: { text: "Resto2Luxe — Rappel automatique" },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    } catch (err) {
      console.error(`Erreur rappel Discord (${r}):`, err.message);
    }
  }
}

async function checkRappels() {
  try {
    const result = await db.execute(
      `SELECT * FROM taches WHERE rappel_jours IS NOT NULL AND rappel_envoye = 0 AND date_limite IS NOT NULL AND statut != 'done'`,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const tache of result.rows) {
      const deadline = new Date(tache.date_limite);
      deadline.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= Number(tache.rappel_jours) && diffDays >= 0) {
        await sendRappelDiscord(tache);
        await db.execute({
          sql: "UPDATE taches SET rappel_envoye = 1 WHERE id = ?",
          args: [tache.id],
        });
        console.log(`✅ Rappel envoyé pour "${tache.titre}"`);
      }
    }
  } catch (err) {
    console.error("Erreur vérification rappels:", err.message);
  }
}

// ─── MILESTONES DU PROJET (planning fixe) ────────────────────────────────────
const PROJECT_MILESTONES = [
  {
    id: "s1",
    date: "2026-03-16",
    label: "Semaine du 16 mars",
    tasks: ["Inscription des équipes", "Développement d'un Proof of Concept"],
  },
  {
    id: "s2",
    date: "2026-03-23",
    label: "Semaine du 23 mars",
    tasks: [
      "Fin des inscriptions des équipes",
      "Analyse du projet",
      "Écriture du README.md",
    ],
  },
  {
    id: "s3",
    date: "2026-03-30",
    label: "Semaines du 30 mars – 24 avr.",
    tasks: ["Analyse approfondie du projet", "Implémentation du projet"],
  },
  {
    id: "s4",
    date: "2026-04-27",
    label: "Semaines du 27 avr. – 7 mai",
    tasks: ["Vacances de printemps 🌸"],
    isBreak: true,
  },
  {
    id: "s5",
    date: "2026-05-11",
    label: "Semaine du 11 mai",
    tasks: [
      "Remise de la vidéo sur Google Drive",
      "Remise finale du code sur Git",
      "Dernière mise à jour du README.md",
      "Inscription à l'évaluation finale",
    ],
    isDeadline: true,
  },
  {
    id: "s6",
    date: "2026-06-01",
    label: "Session mai/juin",
    tasks: ["Évaluation finale"],
    isFinal: true,
  },
];

// Envoie un rappel milestone à Ilias ET Mehdi
async function sendRappelMilestone(milestone, diffDays) {
  const couleur = milestone.isDeadline
    ? 0xf97316 // orange
    : milestone.isFinal
      ? 0xf43f5e // rose
      : milestone.isBreak
        ? 0xf472b6 // rose pâle
        : 0x818cf8; // indigo

  const urgenceLabel =
    diffDays === 0
      ? "⚠️ **C'est aujourd'hui !**"
      : diffDays === 1
        ? "⚡ **Demain !**"
        : `📅 Dans **${diffDays} jour(s)**`;

  const tasksText = milestone.tasks.map((t) => `• ${t}`).join("\n");

  const embed = {
    title: `🗓️ ${milestone.label}`,
    description: `${urgenceLabel}\n\n**Tâches prévues :**\n${tasksText}`,
    color: couleur,
    footer: { text: "Resto2Luxe — Rappel Planning" },
    timestamp: new Date().toISOString(),
  };

  for (const [name, webhookUrl] of Object.entries(WEBHOOKS)) {
    const mention = DISCORD_MENTIONS[name] || name;
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `📆 **RAPPEL PLANNING** — ${mention}`,
          embeds: [embed],
        }),
      });
      console.log(`✅ Rappel milestone "${milestone.label}" envoyé à ${name}`);
    } catch (err) {
      console.error(`Erreur rappel milestone (${name}):`, err.message);
    }
  }
}

async function checkMilestoneRappels() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    for (const milestone of PROJECT_MILESTONES) {
      // Pas de rappel pour les congés
      if (milestone.isBreak) continue;

      const milestoneDate = new Date(milestone.date);
      milestoneDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(
        (milestoneDate - today) / (1000 * 60 * 60 * 24),
      );

      // On rappelle uniquement à J-3 et J-1
      if (diffDays !== 3 && diffDays !== 1) continue;

      // Vérifie si le rappel a été désactivé manuellement
      const disabledKey = `milestone_disabled_${milestone.id}`;
      const disabled = await db.execute({
        sql: "SELECT value FROM settings WHERE key = ?",
        args: [disabledKey],
      });
      if (disabled.rows.length > 0 && disabled.rows[0].value === "1") continue;

      // Vérifie si le rappel a déjà été envoyé aujourd'hui
      const sentKey = `milestone_sent_${milestone.id}_J${diffDays}_${todayStr}`;
      const alreadySent = await db.execute({
        sql: "SELECT value FROM settings WHERE key = ?",
        args: [sentKey],
      });
      if (alreadySent.rows.length > 0) continue;

      await sendRappelMilestone(milestone, diffDays);

      // Marque comme envoyé
      await db.execute({
        sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        args: [sentKey, new Date().toISOString()],
      });
    }
  } catch (err) {
    console.error("Erreur vérification rappels milestones:", err.message);
  }
}

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
      position INTEGER DEFAULT 0,
      rappel_jours INTEGER DEFAULT NULL,
      rappel_envoye INTEGER DEFAULT 0,
      duree_estimee INTEGER DEFAULT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
  // Migration: ajoute les colonnes si elles n'existent pas encore
  for (const sql of [
    "ALTER TABLE taches ADD COLUMN rappel_jours INTEGER DEFAULT NULL",
    "ALTER TABLE taches ADD COLUMN rappel_envoye INTEGER DEFAULT 0",
    "ALTER TABLE taches ADD COLUMN duree_estimee INTEGER DEFAULT NULL",
  ]) {
    try {
      await db.execute(sql);
    } catch (_) {
      // Colonne déjà présente — ignoré
    }
  }
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
  const {
    titre,
    description,
    responsable,
    priorite,
    date_limite,
    rappel_jours,
    duree_estimee,
  } = req.body;
  if (!titre?.trim())
    return res.status(400).json({ erreur: "Le titre est requis" });
  try {
    const maxRes = await db.execute(
      "SELECT COALESCE(MAX(position), -1) as max FROM taches WHERE statut = 'todo'",
    );
    const maxPos = Number(maxRes.rows[0]?.max ?? -1);
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const r = await db.execute({
      sql: `INSERT INTO taches (titre, description, responsable, priorite, statut, date_limite, date_creation, position, rappel_jours, duree_estimee)
            VALUES (?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?)`,
      args: [
        titre.trim(),
        (description || "").trim(),
        responsable || "Ilias",
        priorite || "Moyenne",
        date_limite || null,
        now,
        maxPos + 1,
        rappel_jours || null,
        duree_estimee || null,
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
    rappel_jours,
    duree_estimee,
  } = req.body;
  try {
    const ex = await db.execute({
      sql: "SELECT * FROM taches WHERE id = ?",
      args: [id],
    });
    const existing = ex.rows[0];
    if (!existing) return res.status(404).json({ erreur: "Tâche introuvable" });
    const newDateLimite =
      date_limite !== undefined ? date_limite : existing.date_limite;
    const newRappelJours =
      rappel_jours !== undefined ? rappel_jours : existing.rappel_jours;
    const rappelEnvoye =
      newDateLimite !== existing.date_limite ||
      String(newRappelJours) !== String(existing.rappel_jours)
        ? 0
        : Number(existing.rappel_envoye);
    await db.execute({
      sql: `UPDATE taches SET titre=?, description=?, responsable=?, priorite=?, statut=?, date_limite=?, position=?, rappel_jours=?, rappel_envoye=?, duree_estimee=? WHERE id=?`,
      args: [
        titre !== undefined ? titre.trim() : existing.titre,
        description !== undefined ? description.trim() : existing.description,
        responsable ?? existing.responsable,
        priorite ?? existing.priorite,
        statut ?? existing.statut,
        newDateLimite,
        position !== undefined ? Number(position) : existing.position,
        newRappelJours,
        rappelEnvoye,
        duree_estimee !== undefined ? duree_estimee : existing.duree_estimee,
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

// GET /api/settings
app.get("/api/settings", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM settings");
    const obj = {};
    result.rows.forEach((r) => {
      obj[r.key] = r.value;
    });
    res.json(obj);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// PUT /api/settings/:key
app.put("/api/settings/:key", async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const ALLOWED_KEYS = ["project_start", "project_end"];
  if (
    !ALLOWED_KEYS.includes(key) &&
    !key.startsWith("milestone_disabled_") &&
    !key.startsWith("milestone_sent_")
  )
    return res.status(400).json({ erreur: "Clé non autorisée" });
  try {
    await db.execute({
      sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      args: [key, value],
    });
    res.json({ key, value });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// PATCH /api/milestones/:id/rappel — active ou désactive les rappels d'un milestone
app.patch("/api/milestones/:id/rappel", async (req, res) => {
  const { id } = req.params;
  const { disabled } = req.body; // true = désactivé, false = réactivé
  const validIds = PROJECT_MILESTONES.map((m) => m.id);
  if (!validIds.includes(id))
    return res.status(404).json({ erreur: "Milestone introuvable" });
  const key = `milestone_disabled_${id}`;
  try {
    await db.execute({
      sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      args: [key, disabled ? "1" : "0"],
    });
    res.json({ id, disabled });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`),
    );
    // Vérifie les rappels tâches toutes les heures
    setInterval(checkRappels, 60 * 60 * 1000);
    setTimeout(checkRappels, 5000);

    // Vérifie les rappels milestones toutes les heures
    setInterval(checkMilestoneRappels, 60 * 60 * 1000);
    setTimeout(checkMilestoneRappels, 8000);
  })
  .catch((err) => {
    console.error("Erreur DB:", err);
    process.exit(1);
  });
