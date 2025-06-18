import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const StatutDemande = {
  EN_ATTENTE_DE_CHEF: "EN_ATTENTE_DE_CHEF",
  AFFECTEE: "AFFECTEE",
  ANNULEE: "ANNULEE",
  EN_ATTENTE_DE_RESPONSABLE: "EN_ATTENTE_DE_RESPONSABLE",
  EN_ATTENTE_DE_DEPENDENCE: "EN_ATTENTE_DE_DEPENDENCE",
  REJECTEE: "REJECTEE",
  EN_COURS: "EN_COURS",
  TERMINEE: "TERMINEE",
  ACCEPTEE: "ACCEPTEE"
};

export const statutLabels = {
  EN_ATTENTE_DE_CHEF: "En attente de chef",
  AFFECTEE: "Affectée",
  ANNULEE: "Annulée",
  EN_ATTENTE_DE_RESPONSABLE: "En attente de responsable",
  EN_ATTENTE_DE_DEPENDENCE: "En attente de dépendance",
  REJECTEE: "Rejetée",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ACCEPTEE: "Acceptée"
};


export const statutClasses = {

  EN_COURS: "bg-violet-50 text-violet-800 border-violet-200 font-semibold px-2 py-1 rounded-md",
  EN_ATTENTE_DE_RESPONSABLE: "bg-red-50 text-red-800 border-red-200 font-semibold px-2 py-1 rounded-md",
  EN_ATTENTE_DE_CHEF: "bg-amber-50 text-amber-800 border-amber-200 font-semibold px-2 py-1 rounded-md",
  EN_ATTENTE_DE_DEPENDENCE: "bg-pink-70 text-pink-800 border-pink-200 font-semibold px-2 py-1 rounded-md",
  ANNULEE: "bg-gray-100 text-gray-600 border border-gray-300 rounded-md",
  AFFECTEE: "bg-green-100 text-green-600 border border-green-300 rounded-md",
  REJECTEE: "bg-red-100 text-red-600 border border-red-300 rounded-md",
  TERMINEE: "bg-green-100 text-green-600 border border-green-300 rounded-md",
  ACCEPTEE: "bg-green-100 text-green-600 border border-green-300 rounded-md"
};
export const urgenceClasses = {
  urgent: "bg-red-600 text-white",
  true: "bg-red-600 text-white", 
  moyenne: "bg-yellow-500 text-white",
  moyen: "bg-yellow-500 text-white",
  "pas urgent": "bg-blue-500 text-white"
};

export const urgenceLabels = {
  urgent: "Urgent",

  moyen: "Moyenne",
  "pas urgent": "Non urgent"
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Demande"],
  endpoints: (builder) => ({
    getAllDemandesForAgent: builder.query({
      query: (agentId) => `/demandes/agent/${agentId}`,
      providesTags: ["Demande"],
    }),
    getDemande: builder.query({
      query: (id) => `/demandes/${id}`,
      providesTags: ["Demande"],
    }),
  }),
});

export const { useGetAllDemandesForAgentQuery, useGetDemandeQuery } = api;

export const mockDemandesData = [
  {
    id: 33,
    statut: StatutDemande.EN_COURS,
    urgence: "moyen",
    justification: "Optimisation du processus de traitement des données",
    dateCreation: "2025-03-08T11:24:04.006002",
    dateEnCours: "2025-03-08T12:13:49.879473",
    title: "REQ-2024-001",
    type: "Demande de développement",
    dateEstime: "2025-03-09T11:24:04.001003"
  },
  {
    id: 34,
    statut: StatutDemande.EN_ATTENTE_DE_CHEF,
    urgence: "urgent",
    justification: "Migration nécessaire pour sécurité",
    dateCreation: "2025-03-09T15:39:39.670669",
    dateEnCours: null,
    title: "REQ-2024-002",
    type: "Demande d'infrastructure",
    dateEstime: "2025-03-10T15:39:39.663626"
  },
  {
    id: 35,
    statut: StatutDemande.TERMINEE,
    urgence: "pas urgent",
    justification: "Amélioration UX demandée par les utilisateurs",
    dateCreation: "2025-03-10T10:15:22.123456",
    dateEnCours: "2025-03-10T11:30:45.654321",
    dateTerminee: "2025-03-11T14:22:33.987654",
    title: "REQ-2024-003",
    type: "Demande de développement",
    dateEstime: "2025-03-12T10:15:22.123456"
  },
  {
    id: 36,
    statut: StatutDemande.REJETEE,
    urgence: "moyen",
    justification: "Hors du périmètre actuel",
    dateCreation: "2025-03-12T09:45:11.112233",
    dateEnCours: null,
    title: "REQ-2024-004",
    type: "Demande de fonctionnalité",
    dateEstime: "2025-03-14T09:45:11.112233"
  },
  {
    id: 37,
    statut: StatutDemande.EN_ATTENTE_DE_DEPENDENCE,
    urgence: "urgent",
    justification: "Bloquant pour le déploiement",
    dateCreation: "2025-03-13T16:20:30.445566",
    dateEnCours: null,
    title: "REQ-2024-005",
    type: "Résolution d'incident",
    dateEstime: "2025-03-15T16:20:30.445566"
  }
];

export const NotificationType = Object.freeze({
  MODIFICATION_REQUEST: "MODIFICATION_REQUEST",
  CANCELLATION_REQUEST: "CANCELLATION_REQUEST",
  ADDITIONAL_INFO_REQUEST: "ADDITIONAL_INFO_REQUEST",
  STATUS_CHANGE: "STATUS_CHANGE",
  ADDITIONAL_INFORMATION_REQUEST: "ADDITIONAL_INFORMATION_REQUEST",
  INFO_PROVIDED: "INFO_PROVIDED",
  REQUEST_APPROVED: "REQUEST_APPROVED",
  REQUEST_REJECTED: "REQUEST_REJECTED",
  DEMANDE_START: "DEMANDE_START",
  MODIFICATION_APPROVED: "MODIFICATION_APPROVED",
  CANCELLATION_APPROVED: "CANCELLATION_APPROVED",
  MODIFICATION_REJECTED: "MODIFICATION_REJECTED",
  CANCELLATION_REJECTED: "CANCELLATION_REJECTED",
});


export const mockDemandeDetail = {
  id: 40,
  statut: StatutDemande.EN_ATTENTE_DE_CHEF,
  urgence: "pas urgent",
  data: {
    champURL: "https://claude.ai/chat/1d6cb8e0-6c03-48aa-9b56-1a3beb0000c3",
    champDate: "2025-03-18T23:00:00.000Z",
    champText: "Intégration des nouvelles API de paiement",
    champRadio: "Option B",
    champRange: 21,
    champNumber: 14,
    champSelect: "Option 2",
    champCheckbox: ["Option X", "Option Z"],
    champTextarea: "Description détaillée du besoin d'intégration des nouvelles API de paiement pour améliorer la performance du système."
  },
  justification: "Nécessaire pour la mise à jour du système de paiement",
  dateCreation: "2025-03-12T11:27:36.111464",
  dateEnCours: null,
  dateTerminee: null,
  title: "REQ-2024-006",
  dureeTravailRealisateur: null,
  dureeRetard: null,
  dependentDemandes: [
    {
      id: 45,
      statut: StatutDemande.EN_ATTENTE_DE_DEPENDENCE,
      urgence: "urgent",
      data: {
        detail: "Mise à jour de la base de données",
        priorite: "Haute"
      },
      justification: "Support requis de l'équipe base de données",
      dateCreation: "2025-03-13T13:58:04.921958",
      dateEnCours: null,
      dateTerminee: null,
      title: "REQ-2024-007",
      dureeTravailRealisateur: null,
      dureeRetard: null,
      dependentDemandes: [],
      type: "Demande de développement",
      dateEstime: "2025-03-14T13:58:04.909898"
    }
  ],
  type: "Demande de développement",
  dateEstime: "2025-03-28T11:27:36.111464"
};