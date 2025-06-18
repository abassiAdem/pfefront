import React, { useState, useEffect } from "react";
import { format, isSameMonth, isSameDay } from "date-fns";
import { de, fr } from "date-fns/locale";

import { 
  Check, X, Filter, Calendar, Clock, ChevronDown,Search ,
  LayoutGrid, LayoutList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { getFormattedId } from "@/lib/utils";
import DetailDemande from "../responsable/DetailDemande";
import { cn } from "@/lib/utils";
import { useGetDemandesFinaliseesQuery,useGetDemandesFinalisesByAgentQuery} from "../../Store/demandeApiSlice ";
import { useSelector } from "react-redux";
const urgenceClasses = {
  urgent: "bg-red-600 text-white rounded-md",
  true: "bg-red-600 text-white rounded-md", 
  moyenne: "bg-yellow-500 text-white rounded-md",
  moyen: "bg-yellow-500 text-white rounded-md",
  "pas urgent": "bg-emerald-500 text-white rounded-md"
};

const urgenceLabels = {
  urgent: "Urgent",
  true: "Urgent", 
  moyenne: "Moyenne",
  moyen: "Moyenne",
  "pas urgent": "Non urgent"
};

const statutOptions = [
    { value: "TERMINEE", label: "Terminée" },
    { value: "ANNULEE", label: "Annulée" },
    { value: "REJECTEE", label: "Rejetée" }
  ];

  const dateFilterOptions = [
    { value: "all", label: "Toutes les dates" },
    { value: "month", label: "Ce mois" },
    { value: "day", label: "Ce jour" },
    { value: "custom", label: "Date spécifique" }
  ];
  
  const getStatusConfig = (status) => {
    switch (status) {
      case "TERMINEE":
        return {
          badgeClass: "bg-green-100 text-green-600 border border-green-300 rounded-md",
          labelFr: "Terminée",
          icon: <Check className="w-4 h-4 text-green-600" />
        };
      case "ANNULEE":
        return {
          badgeClass: "bg-gray-100 text-gray-600 border border-gray-300 rounded-md",
          labelFr: "Annulée",
          icon: <X className="w-4 h-4 text-gray-600" />
        };
      case "REJECTEE":
        return {
          badgeClass: "bg-red-100 text-red-600 border border-red-300 rounded-md",
          labelFr: "Rejetée",
          icon: <X className="w-4 h-4 text-red-600" />
        };
      default:
        return {
          badgeClass: "bg-gray-100 text-gray-600 border border-gray-300 rounded-md",
          labelFr: "Inconnu",
          icon: null
        };
    }
  };

  const HistoriqueDemande = ({ role=false }) => {
    const { isAuthenticated, user,token,roles, loading, error: authError } = useSelector((state) => state.auth);
    const [selectedStatuts, setSelectedStatuts] = useState([]);
    const [selectedDate, setSelectedDate] = useState(undefined);
    const [dateFilterType, setDateFilterType] = useState("all");
    const [selectedDemandeId, setSelectedDemandeId] = useState(null);
    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    

    const {
        data: demandes=[],
        isLoading,
        error,
      } = role
        ? useGetDemandesFinaliseesQuery(user?.id, { skip: !user?.id })
        : useGetDemandesFinalisesByAgentQuery(user?.id, { skip: !user?.id });

        const filterDemandes = () => {
          return demandes.filter(demande => {

              if (searchQuery && !demande.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                  return false;
              }
              if (selectedStatuts.length > 0 && !selectedStatuts.includes(demande.statut)) {
                  return false;
              }
              const demandeDate = new Date(demande.dateTerminee || demande.dateCreation);
              const today = new Date();
              
              if (dateFilterType === "month" && !isSameMonth(demandeDate, today)) {
                  return false;
              }
              
              if (dateFilterType === "day" && !isSameDay(demandeDate, today)) {
                  return false;
              }
              
              if (dateFilterType === "custom" && selectedDate) {
                  return (
                      demandeDate.getDate() === selectedDate.getDate() &&
                      demandeDate.getMonth() === selectedDate.getMonth() &&
                      demandeDate.getFullYear() === selectedDate.getFullYear()
                  );
              }
              
              return true;
          });
      };

  const filteredDemandes = filterDemandes();

  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage);
  const paginatedDemandes = filteredDemandes.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );
  const handleResetFilters = () => {
    setSelectedStatuts([]);
    setDateFilterType("all");
    setSelectedDate(undefined);
  };

  const toggleStatut = (value) => {
    setSelectedStatuts(prev => 
      prev.includes(value)
        ? prev.filter(s => s !== value)
        : [...prev, value]
    );
  };

  const handleDateFilterChange = (value) => {
    setDateFilterType(value);
    if (value !== "custom") {
      setSelectedDate(undefined);
    }
  };

  const handleViewDetail = (id) => {
    setSelectedDemandeId(id);
  };


 
  const isFilterActive = selectedStatuts.length > 0 || dateFilterType !== "all";

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === "grid" ? "list" : "grid");
  };
  const SearchInput = () => (
    <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
            type="search"
            placeholder="Rechercher par titre..."
            className="pl-10 pr-4 py-2 rounded-full shadow-sm"
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
            }}
        />
        {searchQuery && (
            <X
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                onClick={() => setSearchQuery("")}
            />
        )}
    </div>);

 
const handlePageChange = (newPage) => {
  setCurrentPage(newPage);
};
 
const PaginationControls = () => (
  <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">
          Affichage de {(currentPage - 1) * itemsPerPage + 1} à{' '}
          {Math.min(currentPage * itemsPerPage, filteredDemandes.length)} sur{' '}
          {filteredDemandes.length} demandes
      </div>
      <div className="flex items-center gap-2">
          <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
          >
              Précédent
          </Button>
          <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                      pageNum = i + 1;
                  } else if (currentPage <= 3) {
                      pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                  } else {
                      pageNum = currentPage - 2 + i;
                  }

                  return (
                      <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-10 h-10 p-0 bg-white text-black" 
                          onClick={() => handlePageChange(pageNum)}
                      >
                          {pageNum}
                      </Button>
                  );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                      <span className="mx-1">...</span>
                      <Button 
                          size="sm"
                          className="w-10 h-10 p-0"
                          onClick={() => handlePageChange(totalPages)}
                      >
                          {totalPages}
                      </Button>
                  </>
              )}
          </div>
          <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
          >
              Suivant
          </Button>
      </div>
  </div>
);

  const renderGridView = () => (
    <div className="space-y-4">
      {filteredDemandes.map((demande) => {
        const { badgeClass, labelFr, icon } = getStatusConfig(demande.statut);
        const creationDate = new Date(demande.dateCreation);
        const termineeDate = demande.dateTerminee ? new Date(demande.dateTerminee) : null;
        
        return (
          <Card
            key={demande.id}
            className="hover:bg-accent/5 transition-all duration-300 cursor-pointer hover:shadow-lg shadow-sm border border-gray-100/80 rounded-lg overflow-hidden transform hover:-translate-y-1"
            onClick={() => handleViewDetail(demande.id)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn("rounded-lg p-2 w-8 h-8 flex items-center justify-center", 
                    demande.statut === "TERMINEE" ? "bg-green-50" : 
                    demande.statut === "ANNULEE" ? "bg-gray-50" : 
                    "bg-red-50"
                  )}>
                    {icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{getFormattedId(demande.id)}</h3>
                      <span className="text-xs px-2 py-1 rounded-full font-medium text-muted-foreground bg-gray-100">
                        {format(creationDate, "dd MMM yyyy", { locale: fr })}
                      </span>

                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", urgenceClasses[demande.urgence || "pas urgent"])}>
                        {urgenceLabels[demande.urgence || "pas urgent"]}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1">{demande.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("text-xs px-2 py-1 rounded-full", badgeClass)}>
                        {labelFr}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 border border-blue-200 rounded-md">
                        {demande.type}
                      </span>
                    </div>
                  </div>
                </div>
                {termineeDate && demande.statut === "TERMINEE" ? (
                  <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                    <Check className="h-4 w-4" />
                    <span>{format(termineeDate, "dd MMM yyyy", { locale: fr })}</span>
                  </div>
                ) : demande.statut === "ANNULEE" || demande.statut === "REJECTEE" ? (
                  <div className="flex items-center gap-1 text-sm text-red-600 font-medium">
                    <X className="h-4 w-4" />
                    <span>{demande.dateTerminee ? format(new Date(demande.dateTerminee), "dd MMM yyyy", { locale: fr }) : "Non définie"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>En attente</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );


  const renderListView = () => (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-sm">ID</th>
            <th className="text-left py-3 px-4 font-medium text-sm">Titre</th>
            <th className="text-left py-3 px-4 font-medium text-sm">Type</th>
            <th className="text-left py-3 px-4 font-medium text-sm">Urgence</th>
            <th className="text-left py-3 px-4 font-medium text-sm">Date création</th>
            <th className="text-left py-3 px-4 font-medium text-sm">Statut</th>
            <th className="text-left py-3 px-4 font-medium text-sm">Date finalisation</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDemandes.map((demande) => {
            const { badgeClass, labelFr, icon } = getStatusConfig(demande.statut);
            const creationDate = new Date(demande.dateCreation);
            const termineeDate = demande.dateTerminee ? new Date(demande.dateTerminee) : null;
            
            return (
              <tr 
                key={demande.id} 
                className="border-b hover:bg-accent/5 cursor-pointer transition-colors"
                onClick={() => handleViewDetail(demande.id)}
              >
                <td className="py-3 px-4">
                  <span className="font-medium">{getFormattedId(demande.id)}</span>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium">{demande.title}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 border border-blue-200 rounded-md">
                    {demande.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={cn("text-xs px-2 py-1 rounded-full font-medium", urgenceClasses[demande.urgence || "pas urgent"])}>
                    {urgenceLabels[demande.urgence || "pas urgent"]}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {format(creationDate, "dd MMM yyyy", { locale: fr })}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1 rounded flex items-center justify-center", 
                      demande.statut === "TERMINEE" ? "bg-green-50" : 
                      demande.statut === "ANNULEE" ? "bg-gray-50" : 
                      "bg-red-50"
                    )}>
                      {icon}
                    </div>
                    <span className={cn("text-xs px-2 py-1 rounded-full", badgeClass)}>
                      {labelFr}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {termineeDate && demande.statut === "TERMINEE" ? (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span>{format(termineeDate, "dd MMM yyyy", { locale: fr })}</span>
                    </div>
                  ) : demande.statut === "ANNULEE" || demande.statut === "REJECTEE" ? (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <X className="h-4 w-4" />
                      <span>{demande.dateTerminee ? format(new Date(demande.dateTerminee), "dd MMM yyyy", { locale: fr }) : "Non définie"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>En attente</span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {totalPages > 1 && <PaginationControls />}
    </div>
  );





  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Historique des Demandes</h1>
        
        <div className="flex items-center gap-2">
        <SearchInput />
          <Button 
            variant="outline" 
            size="icon"
            className="relative"
            onClick={toggleViewMode}
            title={viewMode === "grid" ? "Vue liste" : "Vue grille"}
          >
            {viewMode === "grid" ? (
              <LayoutList className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Statut
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statutOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedStatuts.includes(option.value)}
                  onCheckedChange={() => toggleStatut(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))} 
              {selectedStatuts.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedStatuts([])}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {dateFilterType === "all" 
                  ? "Date" 
                  : dateFilterType === "month" 
                    ? "Ce mois" 
                    : dateFilterType === "day" 
                      ? "Aujourd'hui" 
                      : selectedDate 
                        ? format(selectedDate, "dd MMMM yyyy", { locale: fr })
                        : "Date spécifique"
                }
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              <DropdownMenuLabel>Filtrer par date</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dateFilterOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={dateFilterType === option.value}
                  onCheckedChange={() => handleDateFilterChange(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
              {dateFilterType !== "all" && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDateFilterChange("all")}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {dateFilterType === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {selectedDate 
                    ? format(selectedDate, "dd MMMM yyyy", { locale: fr })
                    : "Sélectionner une date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 bg-white" align="end">
                <div className="p-3 border-b border-border">
                  <h3 className="font-medium text-sm">Sélectionnez une date</h3>
                </div>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          )}

          {isFilterActive && (
            <Button variant="ghost" onClick={handleResetFilters} className="text-muted-foreground">
              Réinitialiser tout
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-center">
            <div className="h-6 w-48 bg-gray-200 rounded-md mx-auto mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded-md mx-auto"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-destructive mb-4">
            <X className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-medium mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground">
            Impossible de charger l'historique des demandes.
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      ) : filteredDemandes.length === 0 ? (
        <div className="bg-muted/30 text-center rounded-lg p-12">
          <div className="text-muted-foreground mb-4">
            <Calendar className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-medium mb-2">Aucune demande trouvée</h3>
          <p className="text-muted-foreground">
            {isFilterActive
              ? "Aucune demande ne correspond aux critères de filtrage."
              : "Aucune demande finalisée n'est disponible."}
          </p>
          {isFilterActive && (
            <Button className="mt-4" onClick={handleResetFilters}>
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      ) : (
        viewMode === "grid" ? renderGridView() : renderListView()
      )}
      
      <DetailDemande
        demandeId={selectedDemandeId}
        isOpen={!!selectedDemandeId}
        onClose={() => setSelectedDemandeId(null)}
      />
    </div>
  );
};
export default HistoriqueDemande;