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

const WEBHOOKS = {
  Ilias:
    "https://discord.com/api/webhooks/1478804168813576313/-EUl3FSAcIjZEDvua8VlKcyHAT5GJLg7wX4tmzS6oKNVLehmb7T4qK6P0Mza86hZyniN",
  Mehdi:
    "https://discord.com/api/webhooks/1480330839307976767/J2IQdDFRUw-SNKL3-uZ6DEuwkhcRxvIcZxb2VGdqF7IV7QIgOLo3_hx1TirXpFAFEtac",
};

// Mappage des IDs Discord pour les vrais pings (format <@ID>)
const DISCORD_MENTIONS = {
  Ilias: "<@691970121362571315>",
  Mehdi: "<@940298554432430131>",
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

  const responsables = (tache.responsable || "Ilias")
    .split(",")
    .map((r) => r.trim());

  for (const r of responsables) {
    const webhookUrl = WEBHOOKS[r];
    if (!webhookUrl) continue;
    const mention = DISCORD_MENTIONS[r] || r;

    let content = "";
    let title = "";
    let description = "";

    if (actionType === "move") {
      content = `🔄 **MISE À JOUR KANBAN** - ${mention}`;
      title = `📋 ${tache.titre}`;
      description = `**Changement de statut :** La tâche est passée en **${statusLabels[extraInfo.nouveauStatut]}**.\n\n**📝 Description :**\n${tache.description || "*Aucune description fournie.*"}`;
    } else if (actionType === "create") {
      content = `🚀 **NOUVELLE TÂCHE ASSIGNÉE** - ${mention}`;
      title = `🆕 ${tache.titre}`;
      description = `**Responsable :** ${tache.responsable}\n\n**📝 Description :**\n${tache.description || "*Aucune description fournie.*"}`;
    }

    const fields = [
      { name: "⚡ Priorité", value: `\`${tache.priorite}\``, inline: true },
      {
        name: "📅 Date limite",
        value: `\`${tache.date_limite || "Non définie"}\``,
        inline: true,
      },
    ];
    if (tache.duree_estimee) {
      fields.push({
        name: "⏱ Durée estimée",
        value: `\`~${tache.duree_estimee}h\``,
        inline: true,
      });
    }

    const message = {
      content,
      embeds: [
        {
          title,
          description,
          color: 0xd88d23,
          fields,
          footer: { text: "Resto2Luxe — Système de Gestion Interne" },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      await axios.post(webhookUrl, message);
    } catch (err) {
      console.error("Erreur Discord Webhook:", err);
    }
  }
};

export const getSettings = () => api.get("/settings");
export const updateSetting = (key, value) =>
  api.put(`/settings/${key}`, { value });
