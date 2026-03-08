import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

export const getTaches = () => api.get("/taches");
export const createTache = (data) => api.post("/taches", data);
export const updateTache = (id, data) => api.put(`/taches/${id}`, data);
export const updateStatut = (id, statut, position) =>
  api.patch(`/taches/${id}/statut`, { statut, position });
export const deleteTache = (id) => api.delete(`/taches/${id}`);

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1478804168813576313/-EUl3FSAcIjZEDvua8VlKcyHAT5GJLg7wX4tmzS6oKNVLehmb7T4qK6P0Mza86hZyniN";

// Mappage des pseudos Discord pour les mentions
const DISCORD_MENTIONS = {
  Ilias: "691970121362571315",
  Mehdi: "940298554432430131",
};

export const sendDiscordNotification = async (
  tache,
  actionType,
  extraInfo = {},
) => {
  const statusLabels = {
    todo: "À FAIRE 📝",
    inprogress: "EN COURS ⚡",
    done: "TERMINÉ ✅",
  };

  const mention = DISCORD_MENTIONS[tache.responsable] || tache.responsable;

  let content = "";
  let title = "";
  let description = "";

  if (actionType === "move") {
    content = `🔄 **Mise à jour Kanban** - ${mention}`;
    title = tache.titre;
    description = `La tâche de **${tache.responsable}** est passée en **${statusLabels[extraInfo.nouveauStatut]}**.`;
  } else if (actionType === "create") {
    content = `🆕 **Nouvelle Tâche** - ${mention}`;
    title = `🚀 Nouvelle tâche : ${tache.titre}`;
    description = `Une nouvelle tâche a été assignée à **${tache.responsable}**.`;
  }

  const message = {
    content: content,
    embeds: [
      {
        title: title,
        description: description,
        color: 0xd88d23, // Couleur Resto2Luxe
        fields: [
          { name: "Priorité", value: tache.priorite, inline: true },
          {
            name: "Date limite",
            value: tache.date_limite || "Non définie",
            inline: true,
          },
        ],
        footer: { text: "Resto2Luxe — Kanban Automation" },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await api.post(DISCORD_WEBHOOK_URL, message);
  } catch (err) {
    console.error("Erreur Discord Webhook:", err);
  }
};
