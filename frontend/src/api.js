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

// Mappage des IDs Discord pour les mentions
const DISCORD_MENTIONS = {
  Ilias: "858348348348348348", // ID d'Ilias (à remplacer par le vrai ID si besoin)
  Mehdi: "947348348348348348", // ID de Mehdi (à remplacer par le vrai ID si besoin)
};

export const sendDiscordNotification = async (tache, nouveauStatut) => {
  const statusLabels = {
    todo: "À FAIRE 📝",
    inprogress: "EN COURS ⚡",
    done: "TERMINÉ ✅",
  };

  const mention = DISCORD_MENTIONS[tache.responsable]
    ? `<@${DISCORD_MENTIONS[tache.responsable]}>`
    : tache.responsable;

  const message = {
    content: `🔔 **Notification Kanban** - ${mention}`,
    embeds: [
      {
        title: tache.titre,
        description: `La tâche de **${tache.responsable}** vient de passer en **${statusLabels[nouveauStatut]}**.`,
        color: 0xd88d23, // Couleur Resto2Luxe
        fields: [
          { name: "Priorité", value: tache.priorite, inline: true },
          {
            name: "Date limite",
            value: tache.date_limite || "Non définie",
            inline: true,
          },
        ],
        thumbnail: {
          url: "https://raw.githubusercontent.com/username/repo/main/logo.png", // Optionnel : URL directe du logo
        },
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
