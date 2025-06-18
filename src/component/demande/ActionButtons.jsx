
import { use, useEffect, useState } from "react"
import { Eye, Edit, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useSelector,useDispatch } from "react-redux"

import { notificationQuerySlice} from '../../Store/notificationQuerySlice';
import { useDeleteDemandeMutation,demandeApiSlice } from "../../Store/demandeApiSlice ";
import { UpdateDemandeDialog } from "./UpdateDemandeDialog";


import { updateDemande } from '../../Store/DemandeSlice';

export function ActionButtons({ demande, onView }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [reason, setReason] = useState("");
  const [deleteDemande] = useDeleteDemandeMutation();
  const dispatch = useDispatch();
 
  const { user,roles } = useSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const isChef = roles?.realmRoles?.includes("chef") || roles?.clientRoles?.includes("chef");
   const isRealisateur = roles?.realmRoles?.includes("realisateur") || roles?.clientRoles?.includes("realisateur");
  const allowedStatuses = ["EN_ATTENTE_DE_CHEF", "EN_ATTENTE_DE_RESPONSABLE", "ACCEPTEE","AFFECTEE"];
  const isStatusAllowed = allowedStatuses.includes(demande.statut);

  let canModify = demande?.approbationModification;
  let canDelete = demande?.approbationAnnulation;
  
 
  if (isChef || isRealisateur) {
    canModify = true;
    canDelete = true;
  } else {
    canModify = demande?.approbationModification;
    canDelete = demande?.approbationAnnulation;
  }

  if (demande.statut === "EN_ATTENTE_DE_CHEF") {
    canModify = demande?.approbationModification;
    canDelete = demande?.approbationAnnulation;
  }

  const editDisabled = !isStatusAllowed ;
  const deleteDisabled = !isStatusAllowed ;
  
  const handleActionClick = async (type) => {
    if (type === "modification") { 
       if (canModify) {
        setUpdateDialogOpen(true); 
      } else {
        requestApproval(type);
      }
    } else if (type === "deletion") {
      if (canDelete) {
        try {
          await deleteDemande(demande.id);

          toast.success("Demande supprimée avec succès !");
        } catch (error) {
          console.error(error);
          toast.error("Une erreur est survenue lors de la suppression.");
        }
      } else {
        requestApproval(type);
      }
    }
  };

  const requestApproval = (type) => {
    setActionType(type);
    setReason("");
    setDialogOpen(true);
  };

  const handleRequestPermission = async () => {
    setSubmitting(true);
    if (!reason.trim()) {
      toast.error("Veuillez fournir un motif");
      return;
    }
    
    const isModification = actionType === "modification";
    const type = isModification ? "MODIFICATION_REQUEST" : "CANCELLATION_REQUEST";
  
    const notificationData = {
      demandeId: demande.id,
      message: `Demande d'approbation pour ${isModification ? "modification" : "annulation"}`,
      motifRejet: reason,
      demandeTitle: demande.title,
      userId: user.id,
      type,
      isActionable: true
    };
  
    try {
  
      dispatch(updateDemande({
        id: demande.id,
        ...(isModification
          ? { approbationModification: false }
          : { approbationAnnulation: false }),
        statut: isModification ? "MODIFICATION_PENDING" : "CANCELLATION_PENDING"
      }));
   
      const response = await dispatch(
        isModification
          ? notificationQuerySlice.endpoints.requestModificationApproval.initiate(notificationData)
          : notificationQuerySlice.endpoints.requestCancellationApproval.initiate(notificationData)
      ).unwrap();
  
  
  
    } catch (error) {
      console.error("Error:", error);
  
      dispatch(updateDemande({
        id: demande.id,
        ...demande 
      }));
    } finally {
      setSubmitting(false);
      setDialogOpen(false);
    }
  };
  return (
    <>
      <div className="flex justify-end items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView}>
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled={editDisabled}
          className={`h-8 w-8 ${editDisabled ? "text-gray-400" : canModify ? "text-green-500" : "text-amber-500"}`}
          onClick={() => handleActionClick("modification")}
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled={deleteDisabled}
          className={`h-8 w-8 ${deleteDisabled ? "text-gray-400" : canDelete ? "text-green-500" : "text-amber-500"}`}
          onClick={() => handleActionClick("deletion")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Demande d'autorisation requise
            </DialogTitle>
            <DialogDescription>
              {actionType === "modification"
                ? "Pour modifier cette demande, vous avez besoin de l'autorisation de votre superviseur."
                : "Pour supprimer cette demande, vous avez besoin de l'autorisation de votre superviseur."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reason" className="font-medium">
                Motif de la demande <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Veuillez expliquer pourquoi vous souhaitez modifier/supprimer cette demande..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Votre superviseur examinera votre motif avant d'approuver ou de refuser votre demande.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="text-white bg-blue-700 hover:bg-blue-800" onClick={handleRequestPermission}>
            {submitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Soumission...
                  </>
                ) : (
                  "Envoyer l'autorisation"
                )}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpdateDemandeDialog
        isOpen={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        demande={demande}
      />
    </>
  );
}

/*    disabled={demande.statut!="EN_ATTENTE_DE_CHEF" || demande.statut!="EN_ATTENTE_DE_RESPONSABLE" || demande.statut!="ACCEPTEE"} */