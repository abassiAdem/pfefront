
import StatusBadge from '../executor/StatusBadgeService';
import UrgenceBadge from '../executor/UrgenceBadge';
import ActionButton from "./ActionButtonResp";
import { cn } from "@/lib/utils";
import { format, parseISO, set } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSetStatusRejectResponsableMutation,useStartDemandeMutation,useSetStatusAcceptMutation } from "../../Store/demandeApiSlice ";
import { toast } from "sonner";
import { CalendarIcon, UserIcon, PhoneIcon, AlertTriangleIcon,CheckIcon,XIcon ,Loader2,UserPlusIcon, ClockIcon,ArrowUpRight,AlertTriangle,Calendar,Clock,User,Phone  } from "lucide-react";
import {StatutDemande} from "../../Store/api";
import DetailDemande from "../responsable/DetailDemande";


const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return format(parseISO(dateString), "dd MMM yyyy", { locale: fr });
  } catch (e) {
    return dateString;
  }
};
export default function RequestCard({ 
  request, 
  showActions = true, 
  className,  
  onStatusChange,   
  onReject    ,
    isSubmittingAccept = false,  
  isSubmittingReject = false   
}) {
  const navigate=useNavigate();
  const [demande,setDemande]=useState(request);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedDemandeId, setSelectedDemandeId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectDemande] = useSetStatusRejectResponsableMutation()
  const [setStatus] = useSetStatusAcceptMutation(); 
  const isUrgent = request.urgence.toLowerCase() === "urgent"
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
  const formattedCreationDate = formatDate(demande.dateCreation)
  const formattedEstimatedDate = formatDate(demande.dateEstime)

  const handleApprove = (e) => {
    e.stopPropagation()
    navigate(`/responsable/demande/${request.id}`)
  }

      const handleStatusChange = async (e , newStatus) => {
        e.stopPropagation();

        setSubmittingAccept(true);
        try {
          if (newStatus === StatutDemande.ACCEPTEE  ) {
            navigate(`/responsable/demande/${request.id}`);
          }else{
            if(user?.id){
              await setStatus({ id: request.id, idr: user.id }).unwrap();
              setSubmittingAccept(false);
            } else{
              toast.error("Erreur lors de la mise à jour du statut : ID utilisateur manquant");
            }

          }
          setSubmittingAccept(true);
          

        } catch (error) {
          toast.error("Erreur lors de la mise à jour du statut");
          console.error("Error updating status:", error);
        }
      };
  const handleReject = (e) => {
    e.stopPropagation()
    setIsRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    try {
      if (!rejectionReason.trim()) return
      const user = { id: "someUserId" }

      await rejectDemande({
        id: request.id,
        idr: user.id,
        message: rejectionReason,
      }).unwrap()

      setIsRejectDialogOpen(false)
      setRejectionReason("")
      toast.success("Demande rejetée avec succès")
    } catch (error) {
      toast.error("Erreur lors du rejet de la demande")
      console.error(error)
    }
  }



  const handleCardClick = (e) => {
    e.stopPropagation();
    navigate(`/responsable/demande/${request.id}`);
  };

  const renderActionButton = () => {
    if (!showActions) return null;

    switch (request.statut) {
      case StatutDemande.EN_ATTENTE_DE_RESPONSABLE:
        return (
          <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
            <button
              disabled={isSubmittingAccept}
              onClick={(e) => onStatusChange(e, StatutDemande.EN_ATTENTE_DE_RESPONSABLE)}
              className={cn(
                "btn-action px-3 py-1.5 transition-all duration-300 shadow-sm hover:shadow-md text-green-600 bg-green-50 hover:bg-green-300 hover:text-green-700 rounded-md border-none shadow-none focus:ring-0",
              )}
            >
              {isSubmittingAccept ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckIcon className="w-4 h-4 mr-1" />
              )}
              {isSubmittingAccept ? "Traitement..." : "Accepter"}
            </button>
            <button
            disabled={isSubmittingReject}
              onClick={(e) => {
                e.stopPropagation();
                onReject(request);
              }}
              className={cn(
                "btn-action px-3 py-1.5 transition-all duration-300 shadow-sm hover:shadow-md text-red-600 bg-red-50 hover:bg-red-300 hover:text-red-700 rounded-md border-none shadow-none focus:ring-0",
              )}
            >
              {isSubmittingReject ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <XIcon className="w-4 h-4 mr-1" />
              )}
              {isSubmittingReject ? "Traitement..." : "Rejeter"}
            </button>
          </div>
        );
      case StatutDemande.ACCEPTEE:
        return (
          <button
            onClick={(e) => handleCardClick(e)}
            className={cn(
              "btn-action px-3 py-1.5 transition-all duration-300 shadow-sm hover:shadow-md text-blue-600 bg-blue-50 hover:bg-blue-300 hover:text-blue-700 rounded-md border-none shadow-none focus:ring-0",
            )}
          >
            <UserPlusIcon className="w-4 h-4 mr-1" />
            Affecter
          </button>
        );
      default:
        return null;
    }
  };
  return (
    <>
      <div

        className={cn(
          "p-4 rounded-lg border transition-all duration-200 hover:shadow-xl cursor-pointer",
          isUrgent ? "border-red-200 dark:border-red-800/50" : "border-border",
          "transform hover:scale-[1.01]",
          className,
        )}
      >
        <div className="flex flex-col space-y-3">
          {isUrgent && (
            <div className="flex items-center text-red-600 mb-1">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              <span className="text-sm font-medium">Demande Urgente</span>
            </div>
          )}

          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-foreground">{demande.title}</h3>
              <p className="text-sm text-muted-foreground capitalize">{demande.type}</p>
            </div>
            <div className="flex space-x-2">
              <UrgenceBadge urgence={demande.urgence} />
              <StatusBadge status={demande.statut} />
            </div>
          </div>

          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-3 mt-1">
            {formattedCreationDate && (
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                <span>Créée le {formattedCreationDate}</span>
              </div>
            )}

            {formattedEstimatedDate && (
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                <span>Estimée pour {formattedEstimatedDate}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-3">
            {demande.data?.username && (
              <div className="flex items-center">
                <User className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                <span>{demande.data.username}</span>
              </div>
            )}

            {demande.data?.telephone && (
              <div className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                <span>{demande.data.telephone}</span>
              </div>
            )}
          </div>

          {demande.justification && (
            <div className="mt-1 text-sm p-3 bg-secondary/50 rounded-lg">
              <p className="font-medium text-xs text-muted-foreground mb-1">Justification:</p>
              <p className="text-foreground">{demande.justification}</p>
            </div>
          )}

          <div className="flex items-center text-sm mt-1">
            <User className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            <span className="text-muted-foreground">Demandeur: </span>
            <span className="ml-1 font-medium">{demande.demandeurName}</span>
          </div>


          <div className='flex items-center justify-between'>
            <div className="mt-4 flex items-center text-md text-orange-600 font-medium cursor-pointer group" onClick={() =>setSelectedDemandeId(request.id)}>
                    <span>  détails</span>
                    <ArrowUpRight size={14} className="ml-1 transition-transform  text-orange-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
               </div>
               <div>               {showActions && (
            <div className="flex items-center justify-end mt-3 pt-3 border-t border-border/60">

              <div className="flex space-x-2">
                {renderActionButton()}
              </div>
            </div>
          )}</div>

          </div>

        </div>
      </div>
      <DetailDemande
        isOpen={selectedDemandeId === request.id}
        demandeId={request.id}
        onClose={() => setSelectedDemandeId(null)}
   
        />
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md border-0 rounded-lg shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-red-500/90 to-red-600/90 rounded-t-lg" />

          <DialogHeader className="pt-12 relative z-10">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <div className="bg-red-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-600"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </div>
              Motif de rejet
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              Veuillez fournir une explication détaillée pour le rejet de cette demande. Cette information sera partagée
              avec le demandeur.
            </p>

            <div className="relative">
              <Textarea
                placeholder="Veuillez indiquer le motif de rejet..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[120px] pr-10 resize-none border-muted focus:border-red-300 focus:ring focus:ring-red-100"
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {rejectionReason.length}/500
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-500 mt-0.5"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span className="text-sm text-amber-800">
                Cette action est définitive et ne peut pas être annulée après confirmation.
              </span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between border-t pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsRejectDialogOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim()}
              className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}