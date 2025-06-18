import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Plus, Pencil, Eye, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AddTypeDialog } from "../component/DashbarodAdmin/AddTypeDialog"
import { useGetTypesQuery,useUpdateTypeMutation,useDeleteTypeMutation } from "../Store/TypeSlice"
import { toast } from "sonner"
import EditTypeDialog from "../component/DashbarodAdmin/EditTypeDialog"
import ViewTypeDialog from "../component/DashbarodAdmin/ViewTypeDialog"

export function TypeDemande() {

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [typeToEdit, setTypeToEdit] = useState(null)
  const [typeToView, setTypeToView] = useState(null)

  const [updateType] = useUpdateTypeMutation()
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const { data, isLoading, error } = useGetTypesQuery()
  const [types, setTypes] = useState([])
  const [deleteType] = useDeleteTypeMutation()

  useEffect(() => {
    if (data && Array.isArray(data)) { 
      setTypes(data);
    } else {
      setTypes([]); 
    }
  }, [data]);
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(dateString));
  };
  
  const handleDelete = (type) => {
    setTypeToDelete(type);
    setIsAlertOpen(true);
  };
  
  const handleTypeUpdated = (updatedType) => {
    setTypes(prevTypes =>
      prevTypes.map(type => (type.id === updatedType.id ? updatedType : type))
    );
  };
  
  const handleConfirm = async () => {
    if (!typeToDelete) return;
    
    try {
      const result = await deleteType(typeToDelete.id);
      
      if (result.error) {
        console.error("Delete operation failed:", result.error);
        toast.error("Une erreur s'est produite lors de la suppression du type de demande");
        return;
      }

      toast.success("Type de demande supprimé avec succès");

      setTypes(prevTypes => prevTypes.filter(t => t.id !== typeToDelete.id));
      
    } catch (error) {
      console.error("Exception during delete operation:", error);
      toast.error("Une erreur s'est produite lors de la suppression du type de demande");
    } finally {
      setIsAlertOpen(false);
      setTypeToDelete(null);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Gestion des Types de Demandes</h1>
        <p className="text-muted-foreground">
          Créez et gérez les différents types de demandes et leurs formulaires associés
        </p>
      </div>

      <Button className="bg-blue-600 text-white hover:bg-blue-600 hover:text-white " onClick={() => setIsDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nouveau type de demande
      </Button>

      <div className="bg-white w-[950px] rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Dernière modification</TableHead>
              <TableHead>Duree Estimee</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{formatDate(type.dateCreation)}</TableCell>
                  <TableCell>{formatDate(type.dateModification)}</TableCell>
                  <TableCell>{type.dureeEstimee}    Jours</TableCell>
                  <TableCell>
  <Badge variant={type.status === "active" ? "success" : "secondary"}>
    {type.status === "active" ? "Actif" : "Inactif"}
  </Badge>
</TableCell>


                <TableCell className="text-right space-x-2">
                  <Button  className="bg-white text-black hover:bg-white"  onClick={() => {
    setTypeToEdit(type); 
    setIsEditDialogOpen(true); 
  }} size="icon">
                    <Pencil className="h-4 w-4  text-blue-700" />
                  </Button>
                  <Button className="bg-white text-black hover:bg-white"   onClick={() => {
    setTypeToView(type); 
    setIsViewDialogOpen(true); 
  }}size="icon">
                    <Eye className="h-4 w-4  text-blue-700" />
                  </Button>
                  <Button className="bg-white text-black hover:bg-white"  onClick={()=>{handleDelete(type)}}size="icon">
                    <Trash2 className="h-4 w-4 text-red-700" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AddTypeDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} className="z-[1000]"/> 
        
      <EditTypeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        typeToEdit={typeToEdit}
        onTypeUpdated={handleTypeUpdated}
        useUpdateTypeMutation={() => [updateType, { isLoading: false }]}
      />

      <ViewTypeDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} typeToView={typeToView} />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="z-[1002]">
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce type de demande?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cette action supprimera définitivement le type de demande
              {typeToDelete && ` "${typeToDelete.name}"`} et toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

