import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

export const STATUS_OPTIONS = [
  { value: 'EN_ATTENTE_DE_CHEF', label: 'En attente de chef' },
  { value: 'EN_ATTENTE_DE_RESPONSABLE', label: 'En attente de responsable' },
  { value: 'EN_ATTENTE_DE_DEPENDENCE', label: 'En attente de dependence' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' },
  { value: 'ANNULEE', label: 'Annulée' },
  { value: 'REJECTEE', label: 'Rejetée' },
  {value:'AFFECTEE', label:'Affectée'},
  { value: 'ACCEPTEE', label: 'Acceptée' },
];

const FilterControls = ({ selectedStatuses, onStatusChange }) => {
  const handleStatusToggle = (statusValue) => {
    const newStatuses = selectedStatuses.includes(statusValue)
      ? selectedStatuses.filter((s) => s !== statusValue)
      : [...selectedStatuses, statusValue];
    onStatusChange(newStatuses);
  };

  const selectAll = () => {
    onStatusChange(STATUS_OPTIONS.map((status) => status.value));
  };

  const resetSelection = () => {
    onStatusChange([]);
  };

  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        Statuts
        {selectedStatuses.length > 0 && (
          <span className="ml-1 text-xs font-medium">
            ({selectedStatuses.length})
          </span>
        )}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="start">
      <DropdownMenuLabel className="flex justify-between items-center">
        <span>Filtrer par statut</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              selectAll();
            }}
          >
            Tout
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              resetSelection();
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div className="space-y-1 px-1 py-1 max-h-60 overflow-y-auto">
        {STATUS_OPTIONS.map((status) => (
          <div
            key={status.value}
            className="flex items-center space-x-2 p-2 hover:bg-accent rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              id={`status-${status.value}`}
              checked={selectedStatuses.includes(status.value)}
              onCheckedChange={() => handleStatusToggle(status.value)}
            />
            <label
              htmlFor={`status-${status.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >

              {status.label}
            </label>
          </div>
        ))}
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
  );
};

export default FilterControls;
