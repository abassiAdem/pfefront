import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Ban } from 'lucide-react';
import { Clock, CheckCircle, Search, Filter, SlidersHorizontal, RefreshCw, Loader2, AlertTriangle,PlayCircle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ServiceCard from '../../component/executor/ServiceCard';
import { useGetDemandesFinaliseesRealisateurQuery } from '../../Store/demandeApiSlice ';
import { useSelector,useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { StatutDemande, statutLabels } from '../../Store/api';
const ExecutorService = () => {
  const { isAuthenticated, user, token, roles, loading, error: authError } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { 
    data: demandes = [], 
    isLoading, 
    isFetching, 
    refetch 
  } = useGetDemandesFinaliseesRealisateurQuery(user?.id, { skip: !user?.id });
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
 
 



  const statusTabs = [
    { value: 'all', label: 'Toutes' },
    {value: StatutDemande.AFFECTEE, label: statutLabels.AFFECTEE, icon:PlayCircle },
    { value: StatutDemande.EN_COURS, label: statutLabels.EN_COURS, icon: Clock },
    { value: StatutDemande.TERMINEE, label: statutLabels.TERMINEE, icon: CheckCircle },
    { value: StatutDemande.ANNULEE, label: statutLabels.ANNULEE, icon: Ban },
    { value: StatutDemande.EN_ATTENTE_DE_DEPENDENCE, label: statutLabels.EN_ATTENTE_DE_DEPENDENCE, icon: Clock }
   
    
  ];
  const filteredDemandes = useMemo(() => {
    let result = [...demandes];

    if (filterStatus !== 'all') {
      result = result.filter(d => d.statut === filterStatus);
    }
  
    if (filterType !== 'all') {
      result = result.filter(d => 
        typeof d.type === 'string' ? d.type === filterType : d.type?.name === filterType
      );
    }
  
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.title?.toLowerCase().includes(query) || 
        d.demandeurName?.toLowerCase().includes(query) || 
        (typeof d.type === 'string' ? d.type.toLowerCase().includes(query) : d.type?.name?.toLowerCase().includes(query))
      );
    }
  
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.dateCreation) - new Date(b.dateCreation));
    } else if (sortOrder === 'urgency') {
      const urgencyOrder = { 'haute': 0, 'moyenne': 1, 'moyen': 1, 'basse': 2 };
      result.sort((a, b) => 
        (urgencyOrder[a.urgence?.toLowerCase()] ?? 99) - 
        (urgencyOrder[b.urgence?.toLowerCase()] ?? 99)
      );
    }
  
    return result;
  }, [demandes, searchQuery, sortOrder, filterStatus, filterType]); 
  
  useEffect(() => {
    let result = [...demandes];
    
    if (filterStatus !== 'all') {
      result = result.filter(d => d.statut === filterStatus);
    }
    
    if (filterType !== 'all') {
      result = result.filter(d => {
        if (typeof d.type === 'string') {
          return d.type === filterType;
        } else if (d.type?.name) {
          return d.type.name === filterType;
        }
        return false;
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => {
        const titleMatch = d.title?.toLowerCase().includes(query);
        const demandeurMatch = d.demandeurName?.toLowerCase().includes(query);
        const typeMatch = typeof d.type === 'string' 
          ? d.type.toLowerCase().includes(query)
          : d.type?.name?.toLowerCase().includes(query);

        return titleMatch || demandeurMatch || typeMatch;
      });
    }
    
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.dateCreation) - new Date(b.dateCreation));
    } else if (sortOrder === 'urgency') {
      const urgencyOrder = { 'haute': 0, 'moyenne': 1, 'moyen': 1, 'basse': 2 };
      result.sort((a, b) => 
        (urgencyOrder[a.urgence?.toLowerCase()] ?? 99) - 
        (urgencyOrder[b.urgence?.toLowerCase()] ?? 99)
      );
    }
    
   
  }, [demandes, searchQuery, sortOrder, filterStatus, filterType]);

  const handleViewDetails = (id) => {
    const demande = demandes.find(d => d.id === id) || null;
    setSelectedDemande(demande);
    setDetailsOpen(true);
  };
  const handleRefresh = async () => {
    try {
      await refetch();
      
    } catch (error) {
      toast.error("Erreur lors du rafraîchissement des données");
    }
  }

  const uniqueTypes = Array.from(
    new Set(demandes.map(d => {
      if (typeof d.type === 'string') return d.type;
      if (d.type?.name) return d.type.name;
      return null;
    }).filter(Boolean))
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
     
      
      <main className="flex-1 container px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-1.5 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Gérez et suivez toutes vos demandes de service en cours.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {Object.values(StatutDemande).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statutLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[150px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récentes</SelectItem>
                <SelectItem value="oldest">Plus anciennes</SelectItem>
                <SelectItem value="urgency">Par urgence</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative md:hidden">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isLoading || isFetching}
            >
              {(isLoading || isFetching) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {(isLoading || isFetching) ? "Chargement..." : "Rafraîchir"}
            </Button>
          </div>
        </div>
        
        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full border-b-2 border-b-orange-500 [&_[role=tabpanel]]:border-none">
        <div className="overflow-x-auto pb-1">
        <TabsList className="flex flex-nowrap min-w-max justify-start bg-transparent border-none shadow-none [&_*]:border-none">

              {statusTabs.map((tab) => (
                <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="    whitespace-nowrap flex items-center
    border-none shadow-none
    hover:bg-white hover:text-orange-400
    data-[state=active]:bg-white
    data-[state=active]:text-orange-400
    after:border-none after:!border-b-0 after:!shadow-none after:!content-none
    relative"
                        >

                  {tab.icon && <tab.icon className="mr-2 h-5 w-5" />}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
            {statusTabs.map((tab) => (
              <TabsContent 
              key={tab.value} 
              value={tab.value} 
              className="space-y-5 border-orange-400 mt-6 border-none after:border-none before:border-none"
            >
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Chargement des demandes...</span>
                  </div>
                ) : filteredDemandes.filter(d => 
                    tab.value === 'all' ? true : d.statut === tab.value
                  ).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {`Aucune demande ${tab.label.toLowerCase()} trouvée`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-3 gap-4 fade-in-stagger">
                    {filteredDemandes
                      .filter(d => tab.value === 'all' ? true : d.statut === tab.value)
                      .map((demande) => (
                        <ServiceCard
                          key={demande.id}
                          demande={demande}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

      </main>


    </div>
  );
};

export default ExecutorService;