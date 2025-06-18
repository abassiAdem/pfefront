

import { createSlice } from '@reduxjs/toolkit';
import { demandeApiSlice } from './demandeApiSlice ';
import { StatutDemande } from './api';
import { notificationQuerySlice } from './notificationQuerySlice';
const initialState = {
    demandes: [],
    employeeDemandes: [],
    supervisorDemandes: [],
    resourceManagerDemandes: [],
    finalizedDemandes: [],
    status: 'idle',
    error: null,
    currentUserId: null,
    pendingApprovals: [],
    approbationModification: false,
    approbationAnnulation: false,
    lastRefetchTriggered: null,
};

const demandeSlice = createSlice({
    name: 'demandes',
    initialState,
    reducers: {
        forceUpdateDemande: (state, action) => {
            const updatedDemande = action.payload;
            
            const updateList = (list) => 
              list.map(d => d.id === updatedDemande.id ? updatedDemande : d);
            
            return {
              ...state,
              demandes: updateList(state.demandes),
              employeeDemandes: updateList(state.employeeDemandes),
              supervisorDemandes: updateList(state.supervisorDemandes),
              resourceManagerDemandes: updateList(state.resourceManagerDemandes),
              finalizedDemandes: updateList(state.finalizedDemandes)
            };
          },
        resetDemandeState: (state) => {
            return initialState;
        },
        setCurrentUserId: (state, action) => {
            state.currentUserId = action.payload;
        },
        triggerRefetch: (state) => {
            state.lastRefetchTriggered = Date.now();
          },
        deleteDemande: (state, action) => {
            const demandeId = action.payload;
            return {
              ...state,
              demandes: state.demandes.filter(demande => demande.id !== demandeId),
              employeeDemandes: state.employeeDemandes.filter(demande => demande.id !== demandeId),
              supervisorDemandes: state.supervisorDemandes.filter(demande => demande.id !== demandeId),
              resourceManagerDemandes: state.resourceManagerDemandes.filter(demande => demande.id !== demandeId),
              finalizedDemandes: state.finalizedDemandes.filter(demande => demande.id !== demandeId),
            };
          },
        updateDemande: (state, action) => {
            const updatedDemande = action.payload;
            state.demandes = state.demandes.map(demande =>
                demande.id === updatedDemande.id ? updatedDemande : demande
            );

            if (state.employeeDemandes.some(d => d.id === updatedDemande.id)) {
                state.employeeDemandes = state.employeeDemandes.map(demande =>
                    demande.id === updatedDemande.id ? updatedDemande : demande
                );
            }

            if (updatedDemande.statut === StatutDemande.EN_ATTENTE_DE_CHEF) {
                if (!state.supervisorDemandes.some(d => d.id === updatedDemande.id)) {
                    state.supervisorDemandes.push(updatedDemande);
                } else {
                    state.supervisorDemandes = state.supervisorDemandes.map(demande =>
                        demande.id === updatedDemande.id ? updatedDemande : demande
                    );
                }
            } else {
                state.supervisorDemandes = state.supervisorDemandes.filter(
                    demande => demande.id !== updatedDemande.id
                );
            }

            if (updatedDemande.statut === StatutDemande.EN_ATTENTE_DE_RESPONSABLE) {
                if (!state.resourceManagerDemandes.some(d => d.id === updatedDemande.id)) {
                    state.resourceManagerDemandes.push(updatedDemande);
                } else {
                    state.resourceManagerDemandes = state.resourceManagerDemandes.map(demande =>
                        demande.id === updatedDemande.id ? updatedDemande : demande
                    );
                }
            } else {
                state.resourceManagerDemandes = state.resourceManagerDemandes.filter(
                    demande => demande.id !== updatedDemande.id
                );
            }

            if (updatedDemande.statut === StatutDemande.FINALISE) {
                if (!state.finalizedDemandes.some(d => d.id === updatedDemande.id)) {
                    state.finalizedDemandes.push(updatedDemande);
                } else {
                    state.finalizedDemandes = state.finalizedDemandes.map(demande =>
                        demande.id === updatedDemande.id ? updatedDemande : demande
                    );
                }
            } else {
                state.finalizedDemandes = state.finalizedDemandes.filter(
                    demande => demande.id !== updatedDemande.id
                );
            }
        },
        requestModificationApproval: (state, action) => {
            const { demandeId, demandeTitle, reason } = action.payload;
            const demande = state.demandes.find(d => d.id === demandeId);
            if (demande) {
              demande.approbationModification = false; 
            }
          },
          requestCancellationApproval: (state, action) => {
            const { demandeId, demandeTitle, reason } = action.payload;
            const demande = state.demandes.find(d => d.id === demandeId);
            if (demande) {
              demande.approbationAnnulation = false; 
            }
          },
          approveModification: (state, action) => {
            const { demandeId } = action.payload;
            const demande = state.demandes.find(d => d.id === demandeId);
            if (demande) {
              demande.approbationModification = true; 
            }
          },
          rejectModification: (state, action) => {
            const { demandeId } = action.payload;
            const demande = state.demandes.find(d => d.id === demandeId);
            if (demande) {
              demande.approbationModification = false; 
            }
          },
          approveCancellation: (state, action) => {
            const { demandeId } = action.payload;
            const demande = state.demandes.find(d => d.id === demandeId);
            if (demande) {
              demande.approbationAnnulation = true; 
            }
          },
          rejectCancellation: (state, action) => {
            const { demandeId } = action.payload;
            const demande = state.demandes.find(d => d.id === demandeId);
            if (demande) {
              demande.approbationAnnulation = false;
            }
          },
        
    },  
    extraReducers: (builder) => {
        builder
            .addMatcher(
                demandeApiSlice.endpoints.createDemande.matchPending,
                (state) => {
                    state.status = 'loading';
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.createDemande.matchFulfilled,
                (state, action) => {
                    state.status = 'succeeded';
                    const newDemande = action.payload;
                    
                    if (!state.demandes.some(d => d.id === newDemande.id)) {
                        state.demandes.push(newDemande);
                    }

                    if (newDemande.agentId === state.currentUserId && 
                        !state.employeeDemandes.some(d => d.id === newDemande.id)) {
                        state.employeeDemandes.push(newDemande);
                    }

                    if (newDemande.statut === StatutDemande.EN_ATTENTE_DE_CHEF && 
                        !state.supervisorDemandes.some(d => d.id === newDemande.id)) {
                        state.supervisorDemandes.push(newDemande);
                    }
                    
                    if (newDemande.statut === StatutDemande.EN_ATTENTE_DE_RESPONSABLE && 
                        !state.resourceManagerDemandes.some(d => d.id === newDemande.id)) {
                        state.resourceManagerDemandes.push(newDemande);
                    }
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.createDemande.matchRejected,
                (state, action) => {
                    state.status = 'failed';
                    state.error = action.error.message;
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.getAllDemandesForAgent.matchFulfilled,
                (state, action) => {
                    state.employeeDemandes = action.payload;
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.getAllDemandesForChef.matchFulfilled,
                (state, action) => {
                    state.supervisorDemandes = action.payload;
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.getAllDemandesEnAttenteResponsable.matchFulfilled,
                (state, action) => {
                    state.resourceManagerDemandes = action.payload;
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.getDemandesFinalisees.matchFulfilled,
                (state, action) => {
                    state.finalizedDemandes = action.payload;
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.completeDemande.matchFulfilled,
                (state, action) => {
                    const updatedDemande = action.payload;

                    demandeSlice.caseReducers.updateDemande(state, { payload: updatedDemande });
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.updateDemande.matchFulfilled,
                (state, action) => {
                    const updatedDemande = action.payload;
                    demandeSlice.caseReducers.updateDemande(state, { payload: updatedDemande });
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.setStatusAccept.matchFulfilled,
                (state, action) => {
                    const updatedDemande = action.payload;

                    demandeSlice.caseReducers.updateDemande(state, { payload: updatedDemande });
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.setStatusReject.matchFulfilled,
                (state, action) => {
                    const updatedDemande = action.payload;
                    demandeSlice.caseReducers.updateDemande(state, { payload: updatedDemande });
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.setStatusAnule.matchFulfilled,
                (state, action) => {
                    const updatedDemande = action.payload;

                    demandeSlice.caseReducers.updateDemande(state, { payload: updatedDemande });
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.setStatusRespons.matchFulfilled,
                (state, action) => {
                    const updatedDemande = action.payload;
                    // Use the updateDemande reducer to handle all arrays
                    demandeSlice.caseReducers.updateDemande(state, { payload: updatedDemande });
                }
            )
            .addMatcher(
                demandeApiSlice.endpoints.affecterRealisateur.matchFulfilled,
                (state, action) => {
                    const updatedDemande = action.payload;

                    demandeSlice.caseReducers.updateDemande(state, { payload: updatedDemande });
                }
            )
 
    }
});

export const selectAllDemandes = (state) => state.demandes.demandes;
export const selectEmployeeDemandes = (state) => state.demandes.employeeDemandes;
export const selectSupervisorDemandes = (state) => state.demandes.supervisorDemandes;
export const selectResourceManagerDemandes = (state) => state.demandes.resourceManagerDemandes;
export const selectFinalizedDemandes = (state) => state.demandes.finalizedDemandes;
export const selectDemandeStatus = (state) => state.demandes.status;
export const selectDemandeError = (state) => state.demandes.error;

export const selectPendingSupervisorDemandes = (state) =>
    state.demandes.supervisorDemandes.filter(
        demande => demande.statut === StatutDemande.EN_ATTENTE_DE_CHEF
    );

export const selectPendingResourceManagerDemandes = (state) =>
    state.demandes.resourceManagerDemandes.filter(
        demande => demande.statut === StatutDemande.EN_ATTENTE_DE_RESPONSABLE
    );

export const selectInProgressDemandes = (state) =>
    state.demandes.demandes.filter(
        demande => demande.statut === StatutDemande.EN_COURS
    );

export const {forceUpdateDemande, resetDemandeState, setCurrentUserId, deleteDemande, updateDemande,  requestModificationApproval,
    requestCancellationApproval,
    approveModification,
    rejectModification,
    approveCancellation,triggerRefetch ,
    rejectCancellation } = demandeSlice.actions;
export default demandeSlice.reducer;