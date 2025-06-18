import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import DetailDemande from "./responsable/DetailDemande";
import { formatDate, cn } from "../lib/utils";
import {
  statutLabels,
  statutClasses,
  urgenceLabels,
  urgenceClasses,
} from "../Store/api";
import {
  useGetDemandesByResponsableQuery,
useGetAllDemandesForAgentQuery
} from "../Store/demandeApiSlice ";
import {
  Eye,
  Filter,
  Search,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import { selectDemandeStatus } from "../Store/DemandeSlice";
import { ActionButtons } from "./demande/ActionButtons";


  const TableDemandes = ({ role=false }) => {
    const { user } = useSelector((state) => state.auth);
    const { notifications } = useSelector((state) => state.notifications);
    const dispatch = useDispatch();
    const isResponsable = role ;
    const hasRelevantNotifications = useMemo(() => {
      return notifications.some(n => 
        ['modification_approved', 'cancellation_approved'].includes(n.type?.toLowerCase())
      );
    }, [notifications]);
  
    const queryOptions = {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      pollingInterval: hasRelevantNotifications ? 5000 : 0, 
    };
 
const {
      data: demandes,
      isLoading,
      error,
    } = role      ? useGetDemandesByResponsableQuery(user?.id, queryOptions)
      : useGetAllDemandesForAgentQuery(user?.id, queryOptions);

  useEffect(() => {
      
  }, [ user?.id,  demandes]);
 


  const [filters, setFilters] = useState({
    search: "",
    statut: "",
    urgence: "",
    type: "",
  });


  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const [selectedDemandeId, setSelectedDemandeId] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "dateCreation",
    direction: "desc",
  });

  const handleViewDetail = (id) => {
    setSelectedDemandeId(id);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  const uniqueTypes = useMemo(() => {
    if (!demandes || demandes.length === 0) return [];
    return Array.from(new Set(demandes.map((demande) => demande.type).filter(Boolean)));
  }, [demandes]);


  const filteredAndSortedDemandes = useMemo(() => {
    if (!demandes) return [];
    let result = [...demandes];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (demande) =>
          (demande.title && demande.title.toLowerCase().includes(searchLower)) ||
          (demande.type && demande.type.toLowerCase().includes(searchLower)) ||
          (demande.justification && demande.justification.toLowerCase().includes(searchLower)) ||
          String(demande.id).includes(filters.search)
      );
    }

    if (filters.statut && filters.statut !== "all") {
      result = result.filter((demande) => demande.statut === filters.statut);
    }

    if (filters.urgence && filters.urgence !== "all") {
      result = result.filter((demande) => demande.urgence === filters.urgence);
    }
    if (filters.type && filters.type !== "all") {
      result = result.filter((demande) => demande.type === filters.type);
    }

    return result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (!bValue) return sortConfig.direction === "asc" ? 1 : -1;

      if (
        typeof aValue === "string" &&
        aValue.includes("T") &&
        typeof bValue === "string" &&
        bValue.includes("T")
      ) {
        return sortConfig.direction === "asc"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue, "fr")
          : bValue.localeCompare(aValue, "fr");
      }
      return sortConfig.direction === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });
  }, [demandes, filters, sortConfig]);


  const totalPages = Math.ceil(filteredAndSortedDemandes.length / pageSize);
  const paginatedDemandes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedDemandes.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedDemandes, currentPage, pageSize]);

  const getTitle = (demande) => {
    return demande.title ? demande.title : `REQ-${String(demande.id).padStart(3, "0")}`;
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Tableau des Demandes</h2>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
        </div>
        <div className="rounded-xl overflow-hidden border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Titre",
                  "Type",
                  "Urgence",
                  "Date Création",
                  "Date Estimée",
                  "Statut",
                  "Date En Cours",
                  "Actions",
                ].map((header) => (
                  <TableHead key={header}>
                    <Skeleton className="h-5 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    {Array(8)
                      .fill(0)
                      .map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Erreur de chargement</h3>
        <p>Une erreur est survenue lors du chargement des demandes.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tableau des Demandes</h2>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Recherche..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.statut}
          onValueChange={(value) => handleFilterChange("statut", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(statutLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.urgence}
          onValueChange={(value) => handleFilterChange("urgence", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Urgence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les urgences</SelectItem>
            {Object.entries(urgenceLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.type}
          onValueChange={(value) => handleFilterChange("type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredAndSortedDemandes.length === 0 ? (
        <div className="bg-secondary/30 rounded-xl p-8 text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune demande trouvée</h3>
          <p className="text-muted-foreground">
            Aucune demande ne correspond aux critères de recherche actuels.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() =>
              setFilters({ search: "", statut: "", urgence: "", type: "" })
            }
          >
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-border shadow-sm bg-white">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-blue-600">
                <TableRow>
                  {[
                    "Titre",
                    "Type",
                    "Urgence",
                    "Date Création",
                    "Date Estimée",
                    "Statut",
                    "Date En Cours",
                    "Actions",
                  ].map((header) => (
                    <TableHead
                      key={header}
                      className={`${
                        header === "Actions"
                          ? "text-right w-[100px] text-white"
                          : "cursor-pointer text-white hover:bg-blue-700 transition-colors"
                      }`}
                      onClick={
                        header !== "Actions" && header !== "Urgence"
                          ? () =>
                              handleSort(
                                header === "Titre"
                                  ? "title"
                                  : header === "Date Création"
                                  ? "dateCreation"
                                  : header === "Date Estimée"
                                  ? "dateEstime"
                                  : header === "Date En Cours"
                                  ? "dateEnCours"
                                  : "type"
                              )
                          : undefined
                      }
                    >
                      <div className="flex items-center">
                        {header}
                        {header !== "Actions" && header !== "Urgence" && (
                          <ArrowUpDown
                            className={cn(
                              "ml-1 h-4 w-4",
                              sortConfig.key ===
                                (header === "Titre"
                                  ? "title"
                                  : header === "Date Création"
                                  ? "dateCreation"
                                  : header === "Date Estimée"
                                  ? "dateEstime"
                                  : header === "Date En Cours"
                                  ? "dateEnCours"
                                  : "type") && "text-white"
                            )}
                          />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDemandes.map((demande) => (
                  <TableRow
                    key={demande.id}
                    className="group hover:bg-secondary/40 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {getTitle(demande)}
                    </TableCell>
                    <TableCell>{demande.type}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(urgenceClasses[demande.urgence] || "bg-secondary")}
                      >
                        {urgenceLabels[demande.urgence] || demande.urgence}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(demande.dateCreation)}</TableCell>
                    <TableCell>{formatDate(demande.dateEstime)}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(statutClasses[demande.statut] || "bg-secondary")}
                      >
                        {statutLabels[demande.statut] || demande.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {demande.dateEnCours ? (
                        formatDate(demande.dateEnCours)
                      ) : (
                        <span className="text-muted-foreground italic text-sm">Non démarré</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {role ? (
                          <Button variant="ghost" onClick={() => handleViewDetail(demande.id)}>
                            <Eye className="h-4 w-4 mr-1" />
                            voir detail
                          </Button>
                        ) : (
                          <ActionButtons
                            demande={demande}
                            onView={() => handleViewDetail(demande.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="p-2 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Précédent
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                  Suivant
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Page <strong>{currentPage} sur {totalPages}</strong>
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border text-black bg-white rounded p-1 text-sm"
                >
                  {[10, 20, 30, 40, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} par page
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedDemandes.length} demandes au total
              </p>
            </div>
          </div>
        </div>
      )}
      <DetailDemande
        demandeId={selectedDemandeId}
        isOpen={!!selectedDemandeId}
        onClose={() => setSelectedDemandeId(null)}
      />
    </div>
  );
};

export default TableDemandes;