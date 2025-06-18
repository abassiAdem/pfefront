import { useState,useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Printer, Download, CheckCircle2,Phone } from "lucide-react";
import StatusBadge from "../StatusBaget";
import ResourceTable from "./ResourceTable";
import AssignmentSummary from "./AssignmentSummary";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGetDemandeQuery } from "../../Store/demandeApiSlice ";
import { useDispatch, useSelector } from "react-redux";
//import { useGetRealisateurAvaibQuery } from "../../Store/demandeApiSlice ";

import {intervalToDuration, parseISO } from "date-fns";
import { useAffecterRealisateurMutation,useUpdateUrgenceMutation,useAdjustDateEstimeeMutation,useGetGanttQuery,useGetRealisateurAvaibQuery } from "../../Store/demandeApiSlice ";
import { useCreateInformationRequestMutation } from "../../Store/notificationQuerySlice";

const formatEstimatedDuration = (dateEstime, dateCreation) => {
  if (!dateEstime || !dateCreation) return "Durée inconnue";


  const start = parseISO(dateCreation); 
  const end = parseISO(dateEstime);

  if (isNaN(start) || isNaN(end)) return "Format de date invalide";

  const duration = intervalToDuration({ start, end });


  const formattedDuration = [];
  if (duration.hours) formattedDuration.push(`${duration.hours}h`);
  if (duration.minutes) formattedDuration.push(`${duration.minutes}m`);
  if (duration.seconds) formattedDuration.push(`${duration.seconds}s`);

  return formattedDuration.length ? formattedDuration.join(" ") : "0m";
};

const getUrgencyLevel = (urgence) => {
  switch (urgence.toLowerCase()) {
    case 'urgent':
      return 'Urgent';
    case 'prioritaire':
      return 'High';
    case 'normal':
      return 'Medium';
    case 'pas urgent':
    default:
      return 'Low';
  }
};


const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { data: request = [], isLoading }=useGetDemandeQuery(id);
  const [createInformationRequest] = useCreateInformationRequestMutation();
  const [selectedResources, setSelectedResources] = useState([]);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [affectation, setAffectation] = useState(new Date());
  const [assignmentCompleted, setAssignmentCompleted] = useState(false);
  const { data: sampleResources = [], isLoading: resourcesLoading } = useGetRealisateurAvaibQuery(user?.id);
  const [infoRequest, setInfoRequest] = useState('');
  const [assignResource] = useAffecterRealisateurMutation();
  const [adjustDate] = useAdjustDateEstimeeMutation();
  
    const [UpdateUrgence] = useUpdateUrgenceMutation();
 const handleUrgencyChange = async (requestId, newUrgency) => {
    try {
      const result = await UpdateUrgence({ 
        id: requestId, 
        urgence: newUrgency  
      }).unwrap(); 
      
      toast.success(`Urgence mise à jour à: ${newUrgency}`);
      
      return result;
    } catch (error) {
      toast.error("Échec de la mise à jour de l'urgence");
      console.error("Error updating urgency:", error);
      throw error;
    }
  };
 

  if (isLoading || resourcesLoading) return <div>Loading...</div>;

  const handleSelectResources = (resources) => {
    setSelectedResources(resources);
  };
  const handleConfirmAssignment = async (duration,affecter) => {
    try {
      if (!selectedResources.length) {
        toast("Erreur");
        return;
      }

      const dateAffecter = new Date(affecter);

      for (const resource of selectedResources) {
              const formattedDate = dateAffecter instanceof Date 
        ? dateAffecter.toISOString().split('T')[0] 
        : dateAffecter;
        
        const ob={ 
          demandeId: id, 
          realisateurId: resource.id, 
          dateAffectation: formattedDate,
          dureEstimee: duration
        } 
        await assignResource(ob).unwrap();
        toast.success("Affectation confirmée");
      }
  
     
      setAssignmentCompleted(true);
      
    } catch (error) {
      
       
    }
  };
  const formattedDate = scheduledDate ? format(scheduledDate, 'dd MMMM yyyy', { locale: fr }) : "";

  const handleSendInfoRequest = async (message) => {
    if (!request || !message.trim()) return;

    try {
      const ob={
        demandeId: request.id,
        message: message,
        requesterId:user.id,
        isRead: false,
      } 
      await createInformationRequest(ob).unwrap();

      toast.success("Demande d'information envoyée avec succès");
      setInfoRequest('');
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande d'information:", error);
    } finally {
    
    }
  };



  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-white/80"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Demande de Service # REQ--{request.id}
                </h1>
                <p className="text-muted-foreground">{request.title}</p>
              </div>
 
            </div>
          </div>

          {assignmentCompleted ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Affectation Réussie!</h2>
              <p className="text-muted-foreground mb-6">
                Les ressources ont été affectées avec succès à cette demande.
              </p>
              <Button onClick={() => navigate('/')}>
                Retourner à la Liste
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-medium">Sélectionner des ressources</h3>
               <ResourceTable resources={sampleResources} onAssign={handleSelectResources} />

              <div className="mt-6">
                <h3 className="text-lg font-medium">Date d'Affectation</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formattedDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                      locale={fr}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <AssignmentSummary
                selectedResources={selectedResources}
                estimatedDuration={request.dateCreation}
                affectation={affectation} 
                scheduledDate={formattedDate}  
                onConfirm={handleConfirmAssignment}
                onSendInfoRequest={handleSendInfoRequest}
                onUrgencyChange={handleUrgencyChange}
                currentRequest={request}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;