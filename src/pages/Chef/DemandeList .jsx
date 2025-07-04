import React, { useMemo,useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal,
  Eye,
  ThumbsUp,Loader2,
  FileText,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DetailDemande from '@/component/responsable/DetailDemande';
import { UrgencyDropdown } from "./UrgencyDropdown";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";;

const UrgenceIcon = {
    "urgent": <AlertTriangle className="h-4 w-4 text-red-500" />,
    "moyen": <Clock className="h-4 w-4 text-amber-500" />,
    "pas urgent": <CheckCircle  className="h-5 w-5 text-blue-600" />,
    "default": <Clock className="h-4 w-4 text-blue-500" />
  };
  
  const UrgenceColor = {
    "urgent": "bg-red-100 text-red-800 border-red-200",
    "moyen": "bg-amber-100 text-amber-800 border-amber-200",
    "pas urgent": "bg-blue-100 text-blue-800",
    "default": "bg-blue-100 text-blue-800 border-blue-200"
  };
  
  const COLORS = [
    "#0EA5E9", 
    "#F97316",  
    "#8B5CF6", 
    "#10B981",  
    "#F59E0B", 
    "#3B82F6",  
    "#EC4899",  
    "#14B8A6", 
    "#EF4444", 
    "#6366F1", 
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  
  const DemandeList = ({ 
    demandes,
    onAction,
    onUrgencyChange,
     loadingActions,
  }) => {
    const  [selectedDemandeId, setSelectedDemandeId] =useState(null);
    const typeColorMapping = useMemo(() => {
      const mapping = {};
      let colorIndex = 0;
      demandes.forEach((demande) => {
        if (!(demande.type in mapping)) {
          mapping[demande.type] = COLORS[colorIndex % COLORS.length];
          colorIndex++;
        }
      });
      return mapping;
    }, [demandes]);
    const handleUrgencyChange = async (requestId, newUrgency) => {  
      if (!onUrgencyChange) {
        toast("Fonctionnalité non disponible");
        return;
      }
      return onUrgencyChange(requestId, newUrgency);
    }
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-16 text-center font-semibold text-gray-600" align="center">Priorité</TableHead>
              <TableHead className="font-semibold text-gray-600" align="center">Titre</TableHead>
              <TableHead className="font-semibold text-gray-600" align="center">Demandeur</TableHead>
              <TableHead className="font-semibold text-gray-600 text-center " align="center">Type du demande</TableHead>
              <TableHead className="w-32 font-semibold text-gray-600" align="center">Date de création</TableHead>
              <TableHead className="w-32 font-semibold text-gray-600" align="center">Date estimée</TableHead>
              <TableHead className="w-32  font-semibold text-gray-600" align="center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demandes.map((demande,index) => (
              <TableRow 
                key={demande.id}
                className={`border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 ${!demande.isRead ? "bg-blue-50/30" : ""}`}
              >
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <UrgencyDropdown 
                      currentUrgency={demande.urgence} 
                      requestId={demande.id}
                      onUrgencyChange={handleUrgencyChange}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium flex items-center gap-2 text-gray-900">
                    {!demande.isRead && (
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0 animate-pulse" />
                    )}
                    {demande.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5 line-clamp-1 max-w-xs">
                  REQ-{String(demande.id).padStart(3, "0")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{demande.demandeurName}</div>
                  {/*<div className="text-xs text-gray-500 mt-1">{demande.type}</div>*/}
                </TableCell>
                <TableCell>
                <div
                style={{
                  backgroundColor: typeColorMapping[demande.type],
                  color: '#fff',
                  textAlign: 'center',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >

                {demande.type}
              </div>
            </TableCell>



                <TableCell>
                  <div className="text-sm text-gray-700">{formatDate(demande.dateCreation)}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-700">{formatDate(demande.dateEstime)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                            <>
                              <Button 
                                onClick={() => onAction(demande.id, "approve")}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 transition-all duration-200"
                                title="Approuver"
                                disabled={loadingActions && loadingActions[demande.id] === "approve"}
                              >
                                {loadingActions && loadingActions[demande.id]=== "approve" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                onClick={() => onAction(demande.id, "reject")}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 transition-all duration-200"
                                title="Rejeter"
                                disabled={loadingActions && loadingActions[demande.id]=== "reject"}
                              >
                                {loadingActions && loadingActions[demande.id] === "reject" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
    </>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 transition-all duration-200"
                          
                        >
                          <MoreHorizontal className="h-4.5 w-4.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[180px] p-1.5 border-none shadow-xl rounded-xl">
                        <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50 transition-all duration-200" onClick={() => setSelectedDemandeId(demande.id)}>
                          Voir les détails
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DetailDemande
          isOpen={!!selectedDemandeId} 
          demandeId={selectedDemandeId}
          onClose={() => setSelectedDemandeId(null)}
        />
      </div>
    );
  };
  
  export default DemandeList;
