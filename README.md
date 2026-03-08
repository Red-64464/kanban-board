# Kanban Board — Projet Scolaire

Application web interne pour gérer les tâches d'un projet scolaire via un Kanban board moderne, en dark mode.

---

## Structure du projet

```
todo/
├── backend/
│   ├── server.js        ← API Express + SQLite
│   ├── package.json
│   └── kanban.db        ← Base de données (créée automatiquement)
├── frontend/
│   ├── src/
│   │   ├── App.jsx                        ← Composant principal + logique DnD
│   │   ├── api.js                         ← Appels API
│   │   ├── utils.js                       ← Utilitaires (dates, couleurs…)
│   │   ├── index.css                      ← Styles globaux + Tailwind
│   │   └── components/
│   │       ├── KanbanColonne.jsx          ← Colonne droppable
│   │       ├── TacheCard.jsx              ← Carte draggable
│   │       ├── TacheModal.jsx             ← Modale modification/suppression
│   │       ├── NouvellesTacheModal.jsx    ← Modale création
│   │       └── FiltresBar.jsx             ← Barre de filtres + recherche
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## Lancer l'application

### Prérequis

- Node.js 18+ installé

### 1. Installer les dépendances backend

```bash
cd backend
npm install
```

### 2. Installer les dépendances frontend

```bash
cd frontend
npm install
```

### 3. Démarrer le backend

```bash
cd backend
npm start
```

Le serveur démarre sur **http://localhost:3001**

### 4. Démarrer le frontend (dans un 2ème terminal)

```bash
cd frontend
npm run dev
```

L'application s'ouvre sur **http://localhost:3000**

---

## Fonctionnalités

- **Kanban board** avec 3 colonnes : À FAIRE / EN COURS / TERMINÉ
- **Drag & Drop** entre colonnes et dans la même colonne
- **Créer** une tâche (titre, description, responsable, priorité, date limite)
- **Modifier** une tâche via clic sur la carte (modale)
- **Supprimer** une tâche (avec confirmation)
- **Filtres** : par responsable (Ilias / Mehdi), par priorité
- **Recherche** en temps réel sur le titre et la description
- **Indicateur visuel** selon la date limite :
  - 🟢 Loin → normal
  - 🟠 ≤ 5 jours → orange
  - 🔴 ≤ 2 jours ou dépassée → rouge
- **Compteur** de tâches par colonne
- **Barre de progression** globale du projet

---

## API Backend

| Méthode | Route                    | Description                   |
| ------- | ------------------------ | ----------------------------- |
| GET     | `/api/taches`            | Récupérer toutes les tâches   |
| POST    | `/api/taches`            | Créer une tâche               |
| PUT     | `/api/taches/:id`        | Modifier une tâche            |
| PATCH   | `/api/taches/:id/statut` | Changer le statut d'une tâche |
| DELETE  | `/api/taches/:id`        | Supprimer une tâche           |

---

## Technologies

- **Frontend** : React 18 + Vite + TailwindCSS + @dnd-kit
- **Backend** : Node.js + Express
- **BDD** : SQLite via better-sqlite3

---

# Resto2Luxe (JavaFX)

Application JavaFX de commande de repas en Click & Collect.
