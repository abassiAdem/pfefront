import { CalendarDays,CheckCircle, Send , X,Clock, Users,MessageSquare  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect,useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { UrgencyDropdown } from "../../pages/Chef/UrgencyDropdown";
const AssignmentSummary = ({
  selectedResources,
  estimatedDuration,
  affectation, 
  scheduledDate,
  onConfirm,
  onSendInfoRequest,
  onUrgencyChange,
  currentRequest,
  initialMessage = ""
}) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [message, setMessage] = useState(initialMessage);

  const [duration, setDuration] = useState(new Date(estimatedDuration));
  const [affecter, setAffecter] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const handleDurationChange = (e) => {
    setDuration(e.target.value);
  };

  const handleAffecterChange = (e) => {
    setAffecter(e.target.value);
  };

  const handleConfirmClick = () => {

    onConfirm(duration, new Date(affecter));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSendInfoRequest(message);
    setShowRequestForm(false);
    setMessage("");
  };

 const handleUrgencyChange = async (requestId, newUrgency) => {
  if (!onUrgencyChange) {
    toast("Fonctionnalité non disponible");
  
  }
  
  return onUrgencyChange(requestId, newUrgency);
}
  const isConfirmButtonDisabled = !(selectedResources && selectedResources.length > 0);

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm space-y-5">
      <h3 className="text-lg font-medium">Résumé de l'Affectation</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Ressources Sélectionnées</h4>
          <div className="flex items-center">
            <Users className="text-blue-500 h-5 w-5 mr-2" />
            <span className="font-medium">{selectedResources.length} ressources sélectionnées</span>
          </div>
          <div className="pl-7 space-y-1">
            {selectedResources.map(resource => (
              <div key={resource.id} className="text-sm">{resource.name}</div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Date Prévue</h4>
          <div className="flex items-center">
            <CalendarDays className="text-blue-500 h-5 w-5 mr-2" />
            <span className="font-medium">{scheduledDate}</span>
          </div>
        </div>
        {currentRequest && (
            <div className="space-y-2 w-fit"> 
            <h4 className="text-sm font-medium text-muted-foreground">Niveau d'urgence</h4>
            <div className="w-48">
              <UrgencyDropdown 
                currentUrgency={currentRequest.urgence} 
                requestId={currentRequest.id}
                onUrgencyChange={onUrgencyChange}
              />
            </div>
          </div>
      )}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Durée Affectation</h4>
          <div className="flex items-center">
            <CalendarDays className="text-blue-500 h-5 w-5 mr-2" />
            <Input
            type="date"
            value={affecter}
            required
            onChange={handleAffecterChange}
            className="w-full"
          />
          </div>
        </div>
          

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Durée Estimée</h4>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <Clock className="text-blue-500 h-5 w-5 mr-2" />
              <input
                type="number"
                min="1"
                max="365"  
                required
                value={duration}
                onChange={handleDurationChange}
                className="w-20 bg-transparent outline-none text-gray-700"
                placeholder="30"
              />
              <span className="text-gray-400 ml-1">jours</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 flex flex-col gap-4 border-t border-gray-200">
        {showRequestForm ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-800">Demande d'informations supplémentaires</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowRequestForm(false)} 
                className="rounded-full hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5">
              <div className="mb-5">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Veuillez préciser les informations nécessaires pour cette affectation..."
                  className="w-full resize-none focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
      

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="text-gray-700 border-gray-300"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                    <span>Envoyer la demande</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 flex items-center gap-2"
              onClick={() => setShowRequestForm(true)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Demander des informations supplémentaires</span>
            </Button>
            
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              onClick={handleConfirmClick}
              disabled={isConfirmButtonDisabled}
            >
              <CheckCircle className="h-4 w-4" />
              Confirmer l'Affectation
            </Button>
          </div>
        )}
      </div>
    </div>

  );
};

export default AssignmentSummary;
