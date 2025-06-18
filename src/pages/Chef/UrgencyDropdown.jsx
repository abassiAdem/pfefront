import React, { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const UrgencyDropdown = ({ currentUrgency, requestId, onUrgencyChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const UrgenceColor = {
    "pas urgent": "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "moyen": "bg-amber-100 text-amber-800 hover:bg-amber-200",
    "urgent": "bg-red-100 text-red-800 hover:bg-red-200",
  };

  const UrgenceIcon = {
    "pas urgent": <CheckCircle className="h-4 w-4 text-blue-600" />,
    "moyen": <Clock className="h-4 w-4 text-amber-600" />,
    "urgent": <AlertTriangle className="h-4 w-4 text-red-600" />,
  };

  const handleUrgencyUpdate = async (newUrgency) => {
    if (newUrgency === currentUrgency) return;
    
    setIsUpdating(true);
    try {
      await onUrgencyChange(requestId, newUrgency);
    } catch (error) {
      console.error("Error updating urgency:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isUpdating} asChild>
        <Badge 
          variant="outline" 
          className={`${UrgenceColor[currentUrgency]} flex items-center gap-1 px-2 py-1 font-medium cursor-pointer transition-all duration-200 ${isUpdating ? 'opacity-70' : ''}`}
        >
          {isUpdating ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-1"></div>
          ) : (
            UrgenceIcon[currentUrgency]
          )}
          {currentUrgency}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1 border-none shadow-xl bg-white rounded-xl">
        <DropdownMenuLabel className="px-3 text-gray-500">Modifier l'urgence</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isUpdating}
          className={`px-3 py-2 rounded-lg my-1 transition-all duration-200 flex items-center gap-2 ${currentUrgency === 'pas urgent' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'}`}
          onClick={() => handleUrgencyUpdate('pas urgent')}
        >
          <CheckCircle className="h-4 w-4 text-blue-600" />
          Pas urgent
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isUpdating}
          className={`px-3 py-2 rounded-lg my-1 transition-all duration-200 flex items-center gap-2 ${currentUrgency === 'moyen' ? 'bg-amber-50 text-amber-600 font-medium' : 'hover:bg-gray-50'}`}
          onClick={() => handleUrgencyUpdate('moyen')}
        >
          <Clock className="h-4 w-4 text-amber-600" />
          Moyen
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isUpdating}
          className={`px-3 py-2 rounded-lg my-1 transition-all duration-200 flex items-center gap-2 ${currentUrgency === 'urgent' ? 'bg-red-50 text-red-600 font-medium' : 'hover:bg-gray-50'}`}
          onClick={() => handleUrgencyUpdate('urgent')}
        >
          <AlertTriangle className="h-4 w-4 text-red-600" />
          Urgent
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
