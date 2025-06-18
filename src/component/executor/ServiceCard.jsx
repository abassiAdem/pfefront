import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, User, Users,ArrowUpRight  } from 'lucide-react';
import StatusBadge from './StatusBadgeService';
import UrgenceBadge from './UrgenceBadge';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ demande }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (e) {
      return '-';
    }
  };
  const navigate = useNavigate();
  const getTypeName = () => {
    if (typeof demande.type === 'string') {
      return demande.type;
    } else if (demande.type && 'name' in demande.type) {
      return demande.type.name;
    }
    return "Non défini";
  };
 const handelNavigate = (id) => {

    navigate(`/realisateur/services/${id}`);
  };
  const typeName = getTypeName();
  const realisateurName = demande.realisateur?.name || demande.realisateurName || "Non assigné";
  const demandeurName = demande.agent?.fullName || demande.demandeurName || "Non défini";

  return (
    <Card className="glass-card card-hover overflow-hidden animate-fade-in w-full   shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">{demande.title}</CardTitle>
          <StatusBadge status={demande.statut} />
        </div>
        <div className="flex gap-2 mt-1">
          <UrgenceBadge urgence={demande.urgence} />
          <span className="px-2 py-0.5 bg-secondary rounded text-xs font-medium flex items-center gap-1">
            <FileText size={12} />
            {typeName}
          </span>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        <p className="text-muted-foreground line-clamp-2 mb-3">{demande.infoSup || "Aucune information supplémentaire"}</p>
        
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-2">
          <div className="flex items-center gap-2">
            <User size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Demandeur:</span>
            <span className="font-medium truncate">{demandeurName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Réalisateur:</span>
            <span className="font-medium truncate">{realisateurName}</span>
          </div>
          
          <div className="flex items-center gap-2 col-span-2">
            <Calendar size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Créé le:</span>
            <span className="font-medium">{formatDate(demande.dateCreation)}</span>
          </div>
          
          <div className="flex items-center gap-2 col-span-2">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Date estimée:</span>
            <span className="font-medium">{formatDate(demande.dateEstimee || demande.dateEstime)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-end">

        <div className="mt-4 flex items-center text-xs text-blue-500 font-medium cursor-pointer group" onClick={() =>handelNavigate(demande.id)}>
                    <span> Voir détails</span>
                    <ArrowUpRight size={14} className="ml-1 transition-transform  text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;