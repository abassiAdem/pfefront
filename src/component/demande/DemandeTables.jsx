import React from 'react';
import { useState, useMemo, useRef } from "react";

  
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle,
  Eye,
  FileText,
  Users,
  Calendar,
  Link,
} from "lucide-react";
 import { useGetAllDemandeQuery } from "../../Store/demandeApiSlice ";
const getStatutBadge = (statut) => {
  const variants = {
    EN_COURS: {
      icon: PlayCircle,
      text: "En cours",
      className: "bg-violet-50 text-violet-800 border-violet-200",
    },
    EN_ATTENTE_DE_RESPONSABLE: {
      icon: Clock,
      text: "En attente responsable",
      className: "bg-red-50 text-red-800 border-red-200",
    },
    EN_ATTENTE_DE_CHEF: {
      icon: Clock,
      text: "En attente chef",
      className: "bg-amber-50 text-amber-800 border-amber-200",
    },
    EN_ATTENTE_DE_DEPENDENCE: {
      icon: Clock,
      text: "En attente dépendence",
      className: "bg-pink-70 text-pink-800 border-pink-200",
    },
    ANNULEE: {
      icon: XCircle,
      text: "Annulée",
      className: "bg-gray-100 text-gray-600 border-gray-300",
    },
    AFFECTEE: {
      icon: CheckCircle,
      text: "Affectée",
      className: "bg-green-100 text-green-600 border-green-300",
    },
    REJECTEE: {
      icon: XCircle,
      text: "Rejetée",
      className: "bg-red-100 text-red-600 border-red-300",
    },
    TERMINEE: {
      icon: CheckCircle,
      text: "Terminée",
      className: "bg-green-100 text-green-600 border-green-300",
    },
    ACCEPTEE: {
      icon: CheckCircle,
      text: "Acceptée",
      className: "bg-blue-50 text-blue-800 border-blue-200",
    },
  };

  const config = variants[statut];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} flex items-center gap-1.5 font-medium border rounded-md px-2 py-1`}>
      <Icon className="w-3.5 h-3.5" />
      {config.text}
    </Badge>
  );
};
 
const getUrgenceBadge = (urgence) => {
  const variants = {
    urgent: {
      text: "Urgent",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: "🔴",
    },
    moyen: {
      text: "Moyenne",
      className: "bg-orange-50 text-orange-700 border-orange-200",
      icon: "🟠",
    },
    "pas urgent": {
      text: "Non urgent",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: "🟢",
    },
  };

  const config = variants[urgence];

  return (
    <Badge className={`${config.className} flex items-center gap-1.5 font-medium border rounded-md px-2 py-1`}>
      <span className="text-xs">{config.icon}</span>
      {config.text}
    </Badge>
  );
};
 

 
const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const StatutBadge = React.memo(({ statut }) => {
  const variants = {
    EN_COURS: {
      icon: PlayCircle,
      text: "En cours",
      className: "bg-violet-50 text-violet-800 border-violet-200",
    },
    EN_ATTENTE_DE_RESPONSABLE: {
      icon: Clock,
      text: "En attente responsable",
      className: "bg-red-50 text-red-800 border-red-200",
    },
    EN_ATTENTE_DE_CHEF: {
      icon: Clock,
      text: "En attente chef",
      className: "bg-amber-50 text-amber-800 border-amber-200",
    },
    EN_ATTENTE_DE_DEPENDENCE: {
      icon: Clock,
      text: "En attente dépendence",
      className: "bg-pink-70 text-pink-800 border-pink-200",
    },
    ANNULEE: {
      icon: XCircle,
      text: "Annulée",
      className: "bg-gray-100 text-gray-600 border-gray-300",
    },
    AFFECTEE: {
      icon: CheckCircle,
      text: "Affectée",
      className: "bg-green-100 text-green-600 border-green-300",
    },
    REJECTEE: {
      icon: XCircle,
      text: "Rejetée",
      className: "bg-red-100 text-red-600 border-red-300",
    },
    TERMINEE: {
      icon: CheckCircle,
      text: "Terminée",
      className: "bg-green-100 text-green-600 border-green-300",
    },
    ACCEPTEE: {
      icon: CheckCircle,
      text: "Acceptée",
      className: "bg-blue-50 text-blue-800 border-blue-200",
    },
  };

  const config = variants[statut];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} flex items-center gap-1.5 font-medium border rounded-md px-2 py-1`}>
      <Icon className="w-3.5 h-3.5" />
      {config.text}
    </Badge>
  );
});
 
const UrgenceBadge = React.memo(({ urgence }) => {
  const variants = {
    urgent: {
      text: "Urgent",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: "🔴",
    },
    moyen: {
      text: "Moyenne",
      className: "bg-orange-50 text-orange-700 border-orange-200",
      icon: "🟠",
    },
    "pas urgent": {
      text: "Non urgent",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: "🟢",
    },
  };

  const config = variants[urgence];

  return (
    <Badge className={`${config.className} flex items-center gap-1.5 font-medium border rounded-md px-2 py-1`}>
      <span className="text-xs">{config.icon}</span>
      {config.text}
    </Badge>
  );
}); 
const MemoizedAvatar = React.memo(({ name, bgColor, textColor }) => (
  <Avatar className="h-8 w-8">
    <AvatarFallback className={`${bgColor} ${textColor} text-xs font-medium`}>
      {name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : ""}
    </AvatarFallback>
  </Avatar>
));
 
const formatDate = (dateString) => {
  return dateString ? new Date(dateString).toLocaleDateString("fr-FR") : "";
};
 
const VirtualizedTableBody = ({ table, columns }) => {
  const rowHeights = useRef({});
  const listRef = useRef();

  const { rows } = table.getRowModel();

  const getRowHeight = (index) => {
    return rowHeights.current[index] || 60; 
  };

  const setRowHeight = (index, height) => {
    if (rowHeights.current[index] !== height) {
      rowHeights.current[index] = height;
      listRef.current?.resetAfterIndex(index);
    }
  };

  const Row = ({ index, style }) => {
    const row = rows[index];
    return (
      <div
        style={style}
        className={`flex ${row.original.isAttached ? "border-l-4 border-l-blue-400" : ""}`}
        ref={(el) => {
          if (el) {
            setRowHeight(index, el.getBoundingClientRect().height);
          }
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <div 
            key={cell.id} 
            className="flex-1 flex items-center px-4 py-2"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        ))}
      </div>
    );
  };

  return (
    <List
      height={600}
      itemCount={rows.length}
      itemSize={getRowHeight}
      width="100%"
      ref={listRef}
    >
      {Row}
    </List>
  );
};

export default function DemandeTable() {
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");
  const [urgenceFilter, setUrgenceFilter] = useState("TOUS");
  const [typeFilter, setTypeFilter] = useState("TOUS");
  const { data: demandes = [], isLoading } = useGetAllDemandeQuery();

  const filteredData = useMemo(() => {
    if (!demandes.length) return [];
    
    const globalFilterLower = globalFilter.toLowerCase();
    
    return demandes.filter((demande) => {
      if (statutFilter !== "TOUS" && demande.statut !== statutFilter) return false;
      if (urgenceFilter !== "TOUS" && demande.urgence !== urgenceFilter) return false;
      if (typeFilter !== "TOUS" && demande.type !== typeFilter) return false;
      
      if (globalFilter && 
          !demande.title?.toLowerCase().includes(globalFilterLower) &&
          !demande.demandeurName?.toLowerCase().includes(globalFilterLower) &&
          !demande.realisateurName?.toLowerCase().includes(globalFilterLower)
      ) {
        return false;
      }
      
      return true;
    });
  }, [demandes, statutFilter, urgenceFilter, typeFilter, globalFilter]);

  const columns = useMemo(() => [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const demande = row.original;
        return (
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {demande.isAttached && <Link className="w-3 h-3 text-blue-500" />}#{demande.id}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Demande",
      cell: ({ row }) => {
        const demande = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900 leading-tight">{demande.title}</div>
            {demande.infoSup && <div className="text-sm text-gray-600 leading-tight">{demande.infoSup}</div>}
            {demande.parentDemandeTitle && (
              <div className="text-xs text-blue-600 flex items-center gap-1">
                <Link className="w-3 h-3" />
                Dépend de: {demande.parentDemandeTitle}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => <StatutBadge statut={row.original.statut} />,
      filterFn: (row, id, value) => value === "TOUS" || row.original.statut === value,
    },
    {
      accessorKey: "urgence",
      header: "Urgence",
      cell: ({ row }) => <UrgenceBadge urgence={row.original.urgence} />,
      filterFn: (row, id, value) => value === "TOUS" || row.original.urgence === value,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium border-gray-300">
          {row.original.type}
        </Badge>
      ),
      filterFn: (row, id, value) => value === "TOUS" || row.original.type === value,
    },
    {
      accessorKey: "demandeurName",
      header: "Demandeur",
      cell: ({ row }) => {
        const demande = row.original;
        return (
          <div className="flex items-center gap-2">
            <MemoizedAvatar 
              name={demande.demandeurName} 
              bgColor="bg-blue-100" 
              textColor="text-blue-700" 
            />
            <span className="text-sm font-medium text-gray-900">{demande.demandeurName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "realisateurName",
      header: "Réalisateur",
      cell: ({ row }) => {
        const demande = row.original;
        return demande.realisateurName ? (
          <div className="flex items-center gap-2">
            <MemoizedAvatar 
              name={demande.realisateurName} 
              bgColor="bg-green-100" 
              textColor="text-green-700" 
            />
            <span className="text-sm font-medium text-gray-900">{demande.realisateurName}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">Non assigné</span>
        );
      },
    },
    {
      accessorKey: "dateCreation",
      header: "Créée le",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-3 h-3" />
          {formatDate(row.original.dateCreation)}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDemande(row.original)}
          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ], []);

  // Table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const skeletonRows = Array(5).fill(null);
  return (
    <div className="w-full space-y-6">
        <h1 className="text-2xl font-semibold mb-4">Demandes</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="Rechercher..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Select value={statutFilter} onValueChange={setStatutFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TOUS">Tous les statuts</SelectItem>
              <SelectItem value="EN_ATTENTE_DE_RESPONSABLE">En attente responsable</SelectItem>
              <SelectItem value="EN_ATTENTE_DE_CHEF">En attente chef</SelectItem>
              <SelectItem value="EN_ATTENTE_DE_DEPENDENCE">En attente dépendence</SelectItem>
              <SelectItem value="ACCEPTEE">Acceptée</SelectItem>
              <SelectItem value="EN_COURS">En cours</SelectItem>
              <SelectItem value="TERMINEE">Terminée</SelectItem>
              <SelectItem value="REJECTEE">Rejetée</SelectItem>
              <SelectItem value="ANNULEE">Annulée</SelectItem>
            </SelectContent>
          </Select>

          <Select value={urgenceFilter} onValueChange={setUrgenceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TOUS">Toutes urgences</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="moyen">Moyenne</SelectItem>
              <SelectItem value="pas urgent">Non urgent</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TOUS">Tous les types</SelectItem>
              <SelectItem value="DEVELOPPEMENT">Développement</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="SUPPORT">Support</SelectItem>
              <SelectItem value="FORMATION">Formation</SelectItem>
              <SelectItem value="AUTRE">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
 
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              skeletonRows.map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={`skeleton-cell-${index}-${colIndex}`}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={row.original.isAttached ? "border-l-4 border-l-blue-400" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucune demande trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Suivant
          </Button>
        </div>
      )}
      <Dialog open={!!selectedDemande} onOpenChange={() => setSelectedDemande(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-blue-600" />
              Détails de la demande #{selectedDemande?.id}
            </DialogTitle>
            <DialogDescription>Informations complètes et historique de la demande</DialogDescription>
          </DialogHeader>

          {selectedDemande && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedDemande.title}</h2>
                    {selectedDemande.infoSup && <p className="text-gray-600">{selectedDemande.infoSup}</p>}
                  </div>
                  <div className="flex gap-2">
                    {getStatutBadge(selectedDemande.statut)}
                    {getUrgenceBadge(selectedDemande.urgence)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-medium">
                      {selectedDemande.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Créée le {formatDate(selectedDemande.dateCreation)}
                  </div>
                  {selectedDemande.dureEstimee && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {selectedDemande.dureEstimee}h estimées
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
                <div className="border rounded-lg p-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Users className="w-5 h-5 text-blue-600" />
                    Personnes impliquées
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                          {getInitials(selectedDemande.demandeurName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{selectedDemande.demandeurName}</p>
                        <p className="text-sm text-gray-600">Demandeur</p>
                      </div>
                    </div>

                    {selectedDemande.realisateurName ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                            {getInitials(selectedDemande.realisateurName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{selectedDemande.realisateurName}</p>
                          <p className="text-sm text-gray-600">Réalisateur</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-500 italic">Aucun réalisateur assigné</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Chronologie
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Création</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedDemande.dateCreation)}</span>
                    </div>
                    {selectedDemande.dateAcceptation && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Acceptation</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedDemande.dateAcceptation)}</span>
                      </div>
                    )}
                    {selectedDemande.dateAffectation && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Affectation</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedDemande.dateAffectation)}</span>
                      </div>
                    )}
                    {selectedDemande.dateEnCours && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Début travaux</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedDemande.dateEnCours)}</span>
                      </div>
                    )}
                    {selectedDemande.dateTerminee && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Terminée</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedDemande.dateTerminee)}</span>
                      </div>
                    )}
                    {selectedDemande.dateEstime && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-700">Date estimée</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedDemande.dateEstime)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Informations complémentaires
                  </h3>
                  <div className="space-y-4">
                    {selectedDemande.justification && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Justification</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {selectedDemande.justification}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Approbations</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Modification</span>
                            {selectedDemande.approbationModification ? (
                              <Badge className="bg-green-100 text-green-800">Approuvée</Badge>
                            ) : (
                              <Badge variant="secondary">Non approuvée</Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Annulation</span>
                            {selectedDemande.approbationAnnulation ? (
                              <Badge className="bg-green-100 text-green-800">Approuvée</Badge>
                            ) : (
                              <Badge variant="secondary">Non approuvée</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Délais</h4>
                        <div className="space-y-2 text-sm">
                          {selectedDemande.delayCreationAccept !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Création → Acceptation</span>
                              <span>{selectedDemande.delayCreationAccept} jour(s)</span>
                            </div>
                          )}
                          {selectedDemande.delayAcceptEnCours !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Acceptation → Début</span>
                              <span>{selectedDemande.delayAcceptEnCours} jour(s)</span>
                            </div>
                          )}
                          {selectedDemande.totalMainDelay !== undefined && (
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-900">Délai total</span>
                              <span>{selectedDemande.totalMainDelay} jour(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {(selectedDemande.isAttached || selectedDemande.depend || selectedDemande.parentDemandeTitle) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Relations</h4>
                        <div className="space-y-2">
                          {selectedDemande.isAttached && (
                            <Badge variant="outline" className="mr-2">
                              Sous-tâche
                            </Badge>
                          )}
                          {selectedDemande.depend && (
                            <Badge variant="outline" className="mr-2">
                              A des dépendances
                            </Badge>
                          )}
                          {selectedDemande.parentDemandeTitle && (
                            <div className="text-sm text-blue-600 flex items-center gap-1 mt-2">
                              <Link className="w-4 h-4" />
                              Dépend de: {selectedDemande.parentDemandeTitle}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Clock className="w-5 h-5 text-green-600" />
                    Durées
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Durée estimée</span>
                      <span className="text-sm text-gray-900">
                        {selectedDemande.dureEstimee ? `${selectedDemande.dureEstimee}h` : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Travail réalisé</span>
                      <span className="text-sm text-gray-900">
                        {selectedDemande.dureeTravailRealisateur ? `${selectedDemande.dureeTravailRealisateur}h` : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Retard dépendances</span>
                      <span className="text-sm text-gray-900">
                        {selectedDemande.dureeRetardDependence ? `${selectedDemande.dureeRetardDependence}h` : "-"}
                      </span>
                    </div>
                    {selectedDemande.dureeTravailRealisateur && selectedDemande.dureEstimee && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-700">Progression</span>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round((selectedDemande.dureeTravailRealisateur / selectedDemande.dureEstimee) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}