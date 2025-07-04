import React from 'react'
import { useState, useEffect } from "react" 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSelector,useDispatch } from "react-redux"
import {useGetAllDemandesForChefQuery, useSetStatusAnuleMutation,
  useSetStatusRejectMutation, useSetStatusResponsMutation,useUpdateUrgenceMutation,
  useSetStatusAcceptMutation,} from "../../Store/demandeApiSlice"
import DemandeCard from '@/component/demande/DemandeCard'
import DemandeList from './DemandeList' 
import {  selectDemandeStatus, selectDemandeError,setCurrentUserId } from '../../Store/DemandeSlice';
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom";
import { 
  Bell, 
  Search,
  CalendarDays,
  LayoutList,
  LayoutGrid,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MessageSquare,
  Info,
  Clock,
  User,
  AlertTriangle,
  ThumbsUp
} from "lucide-react";
import {StatutDemande} from "../../Store/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
function ChefHome() {
  const { isAuthenticated, user, token, roles, loading, error: authError } = useSelector((state) => state.auth);
  const dispatch = useDispatch();


  const demandeStatus = useSelector(selectDemandeStatus);
  const demandeError = useSelector(selectDemandeError);

  const { data:supervisorDemandes, isLoading, error ,refetch} = useGetAllDemandesForChefQuery(user?.id, {
    skip: !user?.id 
  });

  const [SetStatusAnule] = useSetStatusAnuleMutation();
  const [SetStatusReject] = useSetStatusRejectMutation();
  const [StatusAccept] = useSetStatusAcceptMutation();
  const [SetStatusAttenteResponsable] = useSetStatusResponsMutation();
  const [requests, setRequests] = useState([]);
  const [metrics, setMetrics] = useState({
    totalDemands: 0,
    approvalRate: 0,
    averageTime: 0,
  });
   const [loadingActions, setLoadingActions] = useState({});
  const [UpdateUrgence] = useUpdateUrgenceMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState('card');
  const [activeFilter, setActiveFilter] = useState('all');
  const [date, setDate] = useState(Date());
  useEffect(() => {
    if (supervisorDemandes && Array.isArray(supervisorDemandes)) {
      const sorted = [...supervisorDemandes].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
      setRequests(sorted);


      const totalDemands = supervisorDemandes.length;
      const approvedDemands = supervisorDemandes.filter(demande => demande.statut === 'Accepté').length;
      const approvalRate = totalDemands > 0 ? (approvedDemands / totalDemands) * 100 : 0;
      const averageTime = totalDemands > 0 ? supervisorDemandes.reduce((sum, demande) => {
        const creationDate = new Date(demande.dateCreation);
        const resolutionDate = new Date(demande.dateResolution || new Date());
        return sum + (resolutionDate - creationDate);
      }, 0) / totalDemands : 0;

      setMetrics({
        totalDemands,
        approvalRate,
        averageTime,
      });
    } 
  }, [supervisorDemandes]);
  const handleRefresh = async () => {
    try {
      await refetch();

    } catch (error) {
      toast.error("Erreur lors de l'actualisation des demandes");
      console.error(error);
    }
  };
  const handleUrgencyChange = async (requestId, newUrgency) => {
    try {
      const result = await UpdateUrgence({ 
        id: requestId, 
        urgence: newUrgency  
      }).unwrap();
      
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId ? { ...req, urgence: newUrgency } : req
        )
      );
      
      toast.success(`Urgence mise à jour à: ${newUrgency}`);
      
      return result;
    } catch (error) {
      toast.error("Échec de la mise à jour de l'urgence");
      console.error("Error updating urgency:", error);
      throw error;
    }
  };

  const getFilteredDemandes = () => {
    let filtered = requests;
 
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.demandeurName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.justification.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(d => !d.isRead);
        break;
      case 'urgent':
        filtered = filtered.filter(d => d.urgence === 'urgent');
        break;
      case 'pas urgent':
        filtered = filtered.filter(d => d.urgence === 'pas urgent');
        break;
      case 'moyen':
        filtered = filtered.filter(d => d.urgence === 'moyen');
        break;
      default:
        break;
    }
    
    return filtered;
  };
  const filteredDemandes = getFilteredDemandes();
  const handleAction = async (id, action) => {
    setLoadingActions(prev => ({ ...prev, [id]: action }));
    try {
      if(action === "approve") {

        await SetStatusAttenteResponsable(id).unwrap();

      }
      if(action === "reject") {

        await SetStatusReject(id).unwrap();

      }
            setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === id 
            ? { 
                ...req, 
                statut: action === "approve" ? "Accepté" : "Rejeté" 
              } 
            : req
        )
      );
    } catch (error) {
      toast.error("Une erreur s'est produite lors de la mise à jour du statut de la demande.");
      console.error(error);
           setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  }
  useEffect(() => {
    if (user) {
      dispatch(setCurrentUserId(user.id));
    }
  }, [user, dispatch]);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        <header className="px-6 py-6 mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold mb-2 text-slate-800">Demandes de service</h1>
          <p className="text-slate-600 mb-6">Validation des demandes en attente de votre approbation</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "mb-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {date ? format(date, "PPP") : "Voir le calendrier"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
          </Popover>
        </header>
      </div>

      <main className="py-8 px-4 mx-auto max-w-7xl">


        <div className="bg-white border rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-4 md:p-6 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  placeholder="Rechercher des demandes..."
                  className="pl-10 bg-white border border-gray-200 focus:border-blue-400 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-all duration-200">
                      <Filter className="h-4 w-4" />
                      <span>Filtre</span>
                      <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-600 border-blue-200">
                        {activeFilter === 'all' ? 'Tous' : 
                         activeFilter === 'pas urgent' ? 'pas urgent' :
                         activeFilter === 'urgent' ? 'urgent' :
                         activeFilter === 'moyen' ? 'moyen' : ''}   
                         
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1 border-none shadow-xl bg-white rounded-xl">
                    <DropdownMenuLabel className="px-3 text-gray-500">Filtrer par</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className={`px-3 py-2 rounded-lg my-1 transition-all duration-200 ${activeFilter === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'}`} 
                      onClick={() => setActiveFilter('all')}
                    >
                      Toutes les demandes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className={`px-3 py-2 rounded-lg my-1 transition-all duration-200 ${activeFilter === 'urgent' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'}`} 
                      onClick={() => setActiveFilter( 'pas urgent')}
                    >
                       Pas Urgentes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className={`px-3 py-2 rounded-lg my-1 transition-all duration-200 ${activeFilter === 'urgent' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'}`} 
                      onClick={() => setActiveFilter('moyen')}
                    >
                      Moyennes
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={`px-3 py-2 rounded-lg my-1 transition-all duration-200 ${activeFilter === 'urgent' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'}`} 
                      onClick={() => setActiveFilter('urgent')}
                    >
                      Urgentes
                    </DropdownMenuItem>

                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className={`text-gray-600 hover:text-blue-600 transition-all duration-200 ${isLoading ? "animate-spin" : ""}`}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <div className="bg-gray-200 h-6 w-px mx-1"></div>
                
                <div className="flex rounded-lg overflow-hidden border border-gray-200 drop-shadow-sm">
                  <Button 
                    variant={viewMode === 'card' ? 'default' : 'outline'} 
                    size="sm" 
                    className={`rounded-none transition-all duration-200 ${viewMode === 'card' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-white text-gray-600 hover:text-blue-600'}`}
                    onClick={() => setViewMode('card')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'outline'} 
                    size="sm" 
                    className={`rounded-none transition-all duration-200 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-white text-gray-600 hover:text-blue-600'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <span className="ml-4 text-gray-600 font-medium">Chargement des notifications...</span>
            </div>
          ) : filteredDemandes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune notification trouvée</h3>
              <p className="text-gray-500 max-w-md">
                {searchTerm ? 
                  "Aucune notification ne correspond à votre recherche." : 
                  "Vous n'avez aucune notification pour le moment."}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-6 bg-white hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setSearchTerm("")}
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <div className={`p-4 md:p-6 ${viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}`}>
              {viewMode === 'card' ? (
                filteredDemandes.map((demande) => (
                  <DemandeCard 
                    key={demande.id}
                    request={demande}
                    onAction={handleAction}
                    onUrgencyChange={handleUrgencyChange}
                    loadingAction={loadingActions[demande.id]}

                  />
                ))
              ) : (
                <DemandeList 
                  demandes={filteredDemandes}
                  onUrgencyChange={handleUrgencyChange}
                  onAction={handleAction}
                   loadingActions={loadingActions}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};


export default ChefHome
 
