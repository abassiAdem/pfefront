import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, User, Info,Link,Eye ,Loader2,X,ArrowUpRight, AlertTriangle, CheckCircle2, FileText,CheckCircle } from "lucide-react";
import { UrgencyDropdown } from "../../pages/Chef/UrgencyDropdown";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DetailDemande from "../responsable/DetailDemande";
import {useUpdateUrgenceMutation} from "../../Store/demandeApiSlice ";
const UrgenceColor = {
  "pas urgent": "bg-blue-100 text-blue-800",
  moyen: "bg-amber-100 text-amber-800",
  urgent: "bg-red-100 text-red-800",
};

const UrgenceIcon = {
  "pas urgent": <CheckCircle  className="h-5 w-5 text-blue-600" />,
  moyen: <Clock className="h-4 w-4 text-amber-600" />,
  urgent: <AlertTriangle className="h-4 w-4 text-red-600" />,
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const DemandeCard = ({ request, onAction,onUrgencyChange, loadingAction }) => {
  const reqCode = `REQ-${String(request.id).padStart(3, "0")}`;
 const  [selectedDemandeId, setSelectedDemandeId] = React.useState(null);

 const handleUrgencyChange = async (requestId, newUrgency) => {
  if (!onUrgencyChange) {
    toast("Fonctionnalité non disponible");
  
  }
  
  return onUrgencyChange(requestId, newUrgency);
}
  return (
    <Card className="w-full border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg relative">

      {request.isAttached && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 transform rotate-45 translate-x-8 -translate-y-1 z-10">
          Attachée
        </div>
      )}
      
      <div className={`h-2 ${request.urgence === "urgent" ? "bg-red-500" : request.urgence === "moyen" ? "bg-amber-500" : "bg-blue-500"}`} />
      
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">{reqCode}</span>
          <div>
            <h3 className="text-lg font-semibold">{request.title}</h3>
            {request.isAttached && (
              <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                <Link className="h-3 w-3" />
                <span>Attachée à: {request.parentDemandeTitle} (REQ-{String(request.parentDemandeId).padStart(3, "0")})</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
        <UrgencyDropdown 
          currentUrgency={request.urgence} 
          requestId={request.id}
          onUrgencyChange={handleUrgencyChange}
        />
          <Badge variant="outline" className="bg-slate-100 text-slate-800 font-medium">
            {request.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 bg-white">

        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-50 p-1.5 rounded-md">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Demandeur</p>
            <p className="text-sm font-medium text-gray-900">{request.demandeurName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-50 p-1.5 rounded-md">
            <Calendar className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Créé le</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(request.dateCreation)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-50 p-1.5 rounded-md">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Délai estimé</p>
            <p className="text-sm font-medium text-gray-900">{request.dureEstimee} jours</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 p-1.5 rounded-md">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Date estimée</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(request.dateEstime)}</p>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 flex items-center justify-between gap-2.5 mt-1 bg-gray-50 p-3 rounded-md">
          <div className="col-span-1 md:col-span-2 flex items-start gap-2.5 mt-1 bg-gray-50  rounded-md">
              <div className="bg-purple-50 p-1.5 rounded-md mt-0.5">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Justification</p>
                  <p className="text-sm text-gray-700">{request.justification}</p>
                </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-orange-600 font-medium cursor-pointer group" onClick={() =>setSelectedDemandeId(request.id)}>
                    <span>  détails</span>
                    <ArrowUpRight size={14} className="ml-1 transition-transform  text-orange-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
           </div>
          </div>
        {request.dependentDemandes && request.dependentDemandes.length > 0 && (
          <div className="col-span-1 md:col-span-2 mt-2">
            <div className="text-xs text-gray-500 mb-1">Demandes liées:</div>
            <div className="flex flex-wrap gap-2">
              {request.dependentDemandes.map(dep => (
                <Badge 
                  key={dep.id} 
                  variant="outline" 
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                 
                >
                  {dep.title} (REQ-{String(dep.id).padStart(3, "0")})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-3 py-4 px-6 border-t bg-gray-50">
        <Button 
          onClick={() => onAction(request.id, "reject")}
          disabled={loadingAction === "reject"}
          className="bg-red-600 text-white hover:bg-red-600 transition-colors duration-200"
        >
          {loadingAction === "reject" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <X />
          )}
          {loadingAction === "reject" ? "Traitement..." : "Rejeter"}
        </Button>
        <Button 
          onClick={() => onAction(request.id, "approve")}
          disabled={loadingAction === "approve"}
          className="bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
        >
          {loadingAction === "approve" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <CheckCircle2 />
          )}
          {loadingAction === "approve" ? "Traitement..." : "Approuver"}
        </Button>
      </CardFooter>
      <DetailDemande
        isOpen={selectedDemandeId === request.id}
        demandeId={request.id}
        onClose={() => setSelectedDemandeId(null)}
   
        />
    </Card>
  );
};

export default DemandeCard;