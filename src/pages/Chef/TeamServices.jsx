import React, { useState, useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAllDemandesByAgentChefIdQuery } from "../../Store/demandeApiSlice ";
import { useSelector } from "react-redux";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  Search,
  Eye
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DetailDemande from "../../component/responsable/DetailDemande";
const STATUS_MAP = {
  TERMINEE: { 
    color: "bg-green-100 text-green-600 border border-green-300 rounded-md", 
    label: "Terminée" 
  },
  EN_COURS: { 
    color: "bg-violet-50 text-violet-800 border-violet-200 font-semibold px-2 py-1 rounded-md", 
    label: "En cours" 
  },
  EN_ATTENTE_DE_DEPENDENCE: {
    color: "bg-pink-70 text-pink-800 border-pink-200 font-semibold px-2 py-1 rounded-md",
    label: "En attente de dépendance",
  },
  ACCEPTEE: { 
    color: "bg-blue-50 text-blue-800 border-blue-200 font-semibold px-2 py-1 rounded-md", 
    label: "Acceptée" 
  },
  EN_ATTENTE_DE_CHEF: {
    color: "bg-amber-50 text-amber-800 border-amber-200 font-semibold px-2 py-1 rounded-md",
    label: "En attente de chef"
  },
  AFFECTEE: {
    color: "bg-green-100 text-green-600 border border-green-300 rounded-md",
    label: "Affectée"
  },
  ANNULEE: {
    color: "bg-gray-100 text-gray-600 border border-gray-300 rounded-md",
    label: "Annulée"
  },
  EN_ATTENTE_DE_RESPONSABLE: {
    color: "bg-red-50 text-red-800 border-red-200 font-semibold px-2 py-1 rounded-md",
    label: "En attente de responsable"
  },
  REJECTEE: {
    color: "bg-red-100 text-red-600 border border-red-300 rounded-md",
    label: "Rejetée"
  }
};
const URGENCY_MAP = {
  urgent: { color: "bg-red-100 text-red-800 border-red-200", label: "Urgent" },
  moyen: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "Moyen" },
  "pas urgent": { color: "bg-green-100 text-green-800 border-green-200", label: "Pas urgent" },
};

export default function ServicesTable() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedDemandeId, setSelectedDemandeId] = useState(null);
  const userId = useSelector((state) => state.auth.user?.id);
  const { data: response = { data: [] }, isLoading, isError } = useGetAllDemandesByAgentChefIdQuery(
    userId, 
    { skip: !userId }
  );
  const services = useMemo(() => response?.data || [], [response?.data]);
 
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const getStatusBadge = useCallback((status) => {
    const statusInfo = STATUS_MAP[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", label: status };
    return (
      <Badge variant="outline" className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  }, []);

  const getUrgencyBadge = useCallback((urgency) => {
    const urgencyInfo = URGENCY_MAP[urgency] || { color: "bg-gray-100 text-gray-800 border-gray-200", label: urgency };
    return (
      <Badge variant="outline" className={urgencyInfo.color}>
        {urgencyInfo.label}
      </Badge>
    );
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Service",
        cell: ({ row }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-medium max-w-[180px] truncate">{row.getValue("title")}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.getValue("title")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <div className="capitalize">{row.getValue("type")}</div>,
      },
      {
        accessorKey: "demandeurName",
        header: "Demandeur",
        cell: ({ row }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[150px] truncate">{row.getValue("demandeurName")}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.getValue("demandeurName")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        accessorKey: "dateCreation",
        header: "Date de création",
        cell: ({ row }) => (
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            {formatDate(row.getValue("dateCreation"))}
          </div>
        ),
      },
      {
        accessorKey: "dateEstime",
        header: "Date estimée",
        cell: ({ row }) => (
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            {formatDate(row.getValue("dateEstime"))}
          </div>
        ),
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ row }) => getStatusBadge(row.getValue("statut")),
      },
      {
        accessorKey: "urgence",
        header: "Urgence",
        cell: ({ row }) => getUrgencyBadge(row.getValue("urgence")),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const service = row.original;
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => setSelectedDemandeId(service.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </Button>
            </div>
          );
        },
      },
    ],
    [formatDate, getStatusBadge, getUrgencyBadge]
  );

  const filteredServices = useMemo(() => {
    let filtered = services;
    

    if (searchTerm && Array.isArray(services)) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.title?.toLowerCase().includes(searchLower) ||
        service.type?.toLowerCase().includes(searchLower) ||
        service.demandeurName?.toLowerCase().includes(searchLower) ||
        (service.realisateurName && service.realisateurName.toLowerCase().includes(searchLower)) ||
        service.statut?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "all" && Array.isArray(filtered)) {
      filtered = filtered.filter(service => service.statut === statusFilter);
    }
    
    return filtered;
  }, [services, searchTerm, statusFilter]);

  const table = useReactTable({
    data: filteredServices,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    initialState: {
      pagination: { pageSize: 10 }
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(5).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-800">Erreur de chargement des services</h3>
              <p className="text-red-600 mt-2">Veuillez réessayer plus tard ou contacter le support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Tous les services</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Services de recherche..."
              className="pl-8 pr-4"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">colonnes</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id === "demandeurName" ? "Requestor" : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-semibold">
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <ChevronDown className="ml-1 h-4 w-4" />,
                              desc: <ChevronDown className="ml-1 h-4 w-4 rotate-180" />,
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                    Aucun service trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
            Affichage {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} de{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}{" "}
              sur {table.getFilteredRowModel().rows.length} services
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
            <DetailDemande
              demandeId={selectedDemandeId}
              isOpen={!!selectedDemandeId}
              onClose={() => setSelectedDemandeId(null)}
            />
    </div>
  );
}