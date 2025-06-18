import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import RequestCard from '../../component/demande/RequestCard';
import  { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon,AlertTriangle,Calendar,Clock,User,Phone,UserPlusIcon,Eye   } from "lucide-react";
import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetStatusRejectResponsableMutation,useStartDemandeMutation,useSetStatusAcceptMutation } from "../../Store/demandeApiSlice ";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {StatutDemande} from "../../Store/api";
import { useSelector } from "react-redux";
import { set, sub } from "date-fns"; 
import DetailDemande from "../../component/responsable/DetailDemande";
const RequestsList = ({ 
  user,
  title, 
  responsableDemandes, 
  showUrgentRequests = false,
  showCalendarView = false, 
  viewMode = "grid" 
}) => {
  
      const navigate=useNavigate();
      const [currentUser, setCurrentUser] = useState(user);
      const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
      const [rejectionReason, setRejectionReason] = useState("")
      const [rejectDemande] = useSetStatusRejectResponsableMutation()
      const [setStatus] = useSetStatusAcceptMutation();
    const [selectedDemandeId, setSelectedDemandeId] = useState(null);
      const [spec, setSpec] = useState(null)
        const requests = showUrgentRequests
        ? responsableDemandes.filter((request) => request.urgence == "urgent")
        : responsableDemandes;
      const [submitting,setSubmitting] = useState(false)
      const [submittingAccept,setSubmittingAccept] = useState(false)
      useEffect(() => {
        
        setCurrentUser(user);
      }, [user]);

      const formatDate = (dateString) => {
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, "0")
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      }

      const handleStatusChange = async (e, request, newStatus) => {
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
    
      const handleReject = (request) => {
        setSpec(request);
        setIsRejectDialogOpen(true);
      };
    
      const handleRejectConfirm = async (e, cuser) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        setSubmitting(true);
        
        try {
          if (!spec || !spec.id) {
            throw new Error("No request selected");
          }
          
          if (!cuser?.id) {
            throw new Error("User ID missing");
          }
          
          if (!rejectionReason.trim()) {
            throw new Error("Rejection reason is required");
          }
      
          await rejectDemande({
            id: spec.id,
            idr: cuser.id,
            message: rejectionReason
          }).unwrap();
      
          setIsRejectDialogOpen(false);
          setRejectionReason("");
          setSpec(null);
          toast.success("Demande rejetée avec succès");
          
        } catch (error) {
          console.error("Rejection error:", error);
          toast.error(error.message || "Erreur lors du rejet de la demande");
        } finally {
          setSubmitting(false);
        }
      };



      const renderActionButtons = (request) => {
       return (
          <div className="flex space-x-2">
            {request.statut === StatutDemande.EN_ATTENTE_DE_RESPONSABLE && (
              <>
                <button
                  onClick={(e) => handleStatusChange(e, request, "acceptée")}
                  className={cn(
                    "btn-action px-3 py-1.5 transition-all duration-300 shadow-sm hover:shadow-md text-green-600 bg-green-50 hover:bg-green-300 hover:text-green-700 rounded-md border-none shadow-none focus:ring-0",
                  )}
                  disabled={submittingAccept}
                >
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Accepter
                </button>
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(request);
                    }}
                    className={cn(
                      "btn-action px-3 py-1.5 transition-all duration-300 shadow-sm hover:shadow-md text-red-600 bg-red-50 hover:bg-red-300 hover:text-red-700 rounded-md border-none shadow-none focus:ring-0",
                    )}
                 
                  >
                    <XIcon className="w-4 h-4 mr-1" />
                    Rejeter
               </button>
              </>
            )}
            {request.statut ===  StatutDemande.ACCEPTEE && (
              <button
                onClick={(e) => handleStatusChange(e, request, StatutDemande.ACCEPTEE)}
                className={cn(
                  "btn-action px-3 py-1.5 transition-all duration-300 shadow-sm hover:shadow-md text-blue-600 bg-blue-50 hover:bg-blue-300 hover:text-blue-700 rounded-md border-none shadow-none focus:ring-0",
                )}
              >
                <UserPlusIcon className="w-4 h-4 mr-1" />
                Affecter
              </button>
            )}
          </div>
        );
      };



  return (
    <div className="section-container">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-header">{title}</h2>
          
          {showCalendarView && (
            <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full hover:bg-secondary/80 transition-colors">
              <CalendarIcon className="h-4 w-4" />
              <span>Vue Calendrier</span>
            </Button>
          )}
        </div>
      )}
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
                   {showUrgentRequests ? (
            <UrgentRequestsSection 
  requests={requests} 
  handleStatusChange={handleStatusChange} 
  handleReject={handleReject}
  submittingAccept={submittingAccept}
  submitting={submitting}
/>
          ):
            requests.map((request, index) => (
<RequestCard
  key={request.id}
  request={request}
  showActions={true}
  onStatusChange={(e, newStatus) => handleStatusChange(e, request, newStatus)}
  onReject={() => handleReject(request)}
  isSubmittingAccept={submittingAccept}  
  isSubmittingReject={submitting} 
  className="border border-white/80 dark:border-white/10 shadow-sm bg-white/90 dark:bg-background/80 backdrop-blur-sm"
/>
            ))} 
         


        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-elegant overflow-hidden animate-fade-in">
          <Table className="w-full request-list-table">
            <TableHeader>

              <TableRow className="bg-secondary/40">
              
                <TableHead className="font-medium text-xs uppercase tracking-wider">Référence</TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider">Titre</TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider">Demandeur</TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider">Statut</TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider">Priorité</TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responsableDemandes.map((request) => (
                <TableRow 
                  key={request.id} 
                  className="border-t hover:bg-secondary/20 transition-all cursor-pointer btn-hover-effect" 
                  onClick={() => setSelectedDemandeId(request.id)}
           
                >
 
                  <TableCell className="font-medium">#{request.id}</TableCell>
                  <TableCell className="font-medium">
                    {request.urgence.toLowerCase() === 'urgent' && (
                      <span className="inline-flex items-center mr-2 text-urgent">
                        <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-urgent mr-1.5"></span>
                        Urgent
                      </span>
                    )}
                    {request.title}
                  </TableCell>
                  <TableCell>{request.demandeurName}</TableCell>
                  <TableCell>
                  <span className={`status-badge px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.statut === StatutDemande.EN_ATTENTE_DE_RESPONSABLE 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        request.statut === StatutDemande.EN_ATTENTE_DE_CHEF 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        request.statut === StatutDemande.EN_ATTENTE_DE_DEPENDENCE 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        request.statut === StatutDemande.ACCEPTEE 
                          ? 'bg-green-100 text-green-800 border border-green-200' :
                        request.statut === StatutDemande.EN_COURS 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        request.statut === StatutDemande.TERMINEE 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        request.statut === StatutDemande.REJECTEE 
                          ? 'bg-red-100 text-red-800 border border-red-200' :
                        request.statut === StatutDemande.ANNULEE 
                          ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {request.statut === StatutDemande.EN_ATTENTE_DE_RESPONSABLE && 'En Attente Resp.'}
                        {request.statut === StatutDemande.EN_ATTENTE_DE_CHEF && 'En Attente Chef'}
                        {request.statut === StatutDemande.EN_ATTENTE_DE_DEPENDENCE && 'En Attente Dépendance'}
                        {request.statut === StatutDemande.ACCEPTEE && 'Acceptée'}
                        {request.statut === StatutDemande.EN_COURS && 'En Cours'}
                        {request.statut === StatutDemande.TERMINEE && 'Terminée'}
                        {request.statut === StatutDemande.REJECTEE && 'Rejetée'}
                        {request.statut === StatutDemande.ANNULEE && 'Annulée'}
                      </span>
                  </TableCell>
                  <TableCell>
                    <span className={`status-badge ${request.urgence.toLowerCase() === 'urgent' ? 'bg-red-100 text-red-800 border-red-300' : 
                      request.urgence.toLowerCase() === 'moyen' ? 'bg-orange-100 text-orange-800 border-orange-300' : 
                      request.urgence.toLowerCase() === 'pas urgent' ? 'bg-blue-100 text-blue-800 border-blue-300' : 
                      'bg-green-100 text-green-800 border-green-300'}`}>
                      {request.urgence}
                    </span>
                  </TableCell>
                  <TableCell>
                  {renderActionButtons(request)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
<DialogComponent
  isOpen={isRejectDialogOpen}
  onClose={() => setIsRejectDialogOpen(false)}
  onConfirm={handleRejectConfirm} 
  rejectionReason={rejectionReason}
  setRejectionReason={setRejectionReason}
  spec={spec}
  user={currentUser}
  sub={submitting}
/><DetailDemande
                        demandeId={selectedDemandeId}
                        isOpen={!!selectedDemandeId}
                        onClose={() => setSelectedDemandeId(null)}
                      />
    </div>
    
  );
};

export default RequestsList;




function UrgentRequestsSection({ requests, handleStatusChange, handleReject,submittingAccept,submitting }) {
  return (
    <div className="section-container">
      <h2 className="text-xl font-semibold text-red-600 flex items-center mb-4">
        <AlertTriangle className="w-5 h-5 mr-2" />
        Demandes Urgentes
      </h2>
      <div className=" rounded-xl p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => (
<RequestCard
  key={request.id}
  request={request}
  showActions={true}
  onStatusChange={(e, newStatus) => handleStatusChange(e, request, newStatus)}
  onReject={() => handleReject(request)}
  isSubmittingAccept={submittingAccept}  
  isSubmittingReject={submitting} 
  className="border border-white/80 dark:border-white/10 shadow-sm bg-white/90 dark:bg-background/80 backdrop-blur-sm"
/>
          ))}
        </div>
      </div>
    </div>
  )
}

function DialogComponent({ 
  isOpen, 
  onClose, 
  onConfirm,
  rejectionReason, 
  setRejectionReason, 
  spec, 
  user,
  sub
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md border-0 rounded-lg shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-red-500/90 to-red-600/90 rounded-t-lg" />

          <DialogHeader className="pt-12 relative z-10">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <div className="bg-red-100 p-2 rounded-full">
                <XIcon className="w-6 h-6 text-red-600" />
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
  onClick={(e) => onConfirm(e, user)} 
  disabled={!rejectionReason.trim() || sub}
>

              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>   
  );
}