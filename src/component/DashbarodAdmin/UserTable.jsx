"use client"
import  CreateDep  from "@/component/DashbarodAdmin/CreateDep"
import { useState, useMemo, useEffect } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
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
import { Badge } from "@/components/ui/badge"
import {UpdateUserDialog} from "./UpdateUserDialog"
import { Search, Filter, Pencil,Eye,Trash2,Trash, Loader2, ChevronDown, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar ,UserNameAvatar} from "../UserAvatar"
import { useGetUsersQuery, useDeleteUserMutation,useUpdateUserMutation,useGetChefsQuery, useGetResponsablesQuery} from "../../Store/userSlice"
import { CreateUserDialog } from "./create_users"
import { toast } from "sonner"
export function UserTable() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [userToEdit, setUserToEdit] = useState(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { data: chefs, isLoading: chefsLoading } = useGetChefsQuery();
  const { data: responsables, isLoading: responsablesLoading } = useGetResponsablesQuery();
  const { data, isLoading, error, refetch } = useGetUsersQuery(undefined, {
    pollingInterval: 5000, 
  })

  const [deleteUser] = useDeleteUserMutation()
 

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "NOM",
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <UserNameAvatar user={user} className="h-8 w-8" />
              <span>
                {user.firstName} {user.lastName}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button  variant="ghost"
            className="bg-transparent text-black hover:bg-transparent hover:text-black focus:ring-0 focus:outline-none" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              EMAIL
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "isActive",
        header: "Activité",
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <Badge className={isActive ? "bg-green-400 rounded-full" : "bg-red-500 rounded-full"  }>
              {isActive ? "Actif" : "Inactif"}
            </Badge>
          );
        },
      },

{
  accessorKey: "role",
  header: ({ column }) => {
    return (
      <Button variant="ghost"
      className="bg-transparent text-black hover:bg-transparent hover:text-black focus:ring-0 focus:outline-none"onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        RÔLE
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  },
  cell: ({ row }) => {
    const role = row.original.role || row.original.userType;
    return role === "NO_ROLE" ? "Admin" : role.toLowerCase();
  },
  filterFn: (row, id, value) => {
    const role = row.original.role || row.original.userType;
    const displayRole = role === "NO_ROLE" ? "Admin" : role.toLowerCase();
    return value.includes(displayRole);
  },
},
{
       accessorKey: "departement",
       header: ({ column }) => {
         return (
           <Button
  variant="ghost"
  className="bg-transparent text-black -ml-2 hover:bg-transparent hover:text-black focus:ring-0 focus:outline-none"
  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
>
  DÉPARTEMENT
  <ArrowUpDown className="ml-2 h-4 w-4" />
</Button>

         );
       },
       cell: ({ row }) => {
         return row.original.departement || "-";
       },
       filterFn: (row, id, value) => {
         // Only keep rows whose departement is in the filter array
         return value.includes(row.original.departement);
       },
},
      {
        id: "actions",
        accessorKey: "",
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex justify-end gap-2 ">
              <Button className="bg-white outline-none hover:bg-white" onClick={() => {
                  setUserToEdit(user)
                  setIsUpdateDialogOpen(true)
                }} size="icon">
                <Pencil className="h-4 w-4 text-blue-600" />
                <span className="sr-only">Modifier</span>
              </Button>
              <Button className="bg-white outline-none hover:bg-white" onClick={() => handleDeleteClick(user)} size="icon">
                <Trash className="h-4 w-4 text-[#DC2626]" />
                <span className="sr-only">Supprimer</span>
              </Button>
            </div>
          )
        },
      },

    ],
    [deleteUser],
  )
  function handleDeleteClick(user) {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  async function handleUpdateUser(updatedUser) {
    if (!userToEdit) return

    try {
      const response = await updateUser({ id: userToEdit.id, ...updatedUser }).unwrap()

      toast.success("Succès", {
        description: "L'utilisateur a été mis à jour avec succès.",
      })
    } catch (error) {
      console.error("Error updating user:", error)

      toast.error("Erreur", {
        description: error.message || "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
      })
    } finally {
      setIsUpdateDialogOpen(false)
      setUserToEdit(null)
    }
  }

  async function HandleDelete() {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      const response = await deleteUser(userToDelete.id).unwrap()

      toast.success("Succès", {
        description: "L'utilisateur a été supprimé avec succès.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)

      toast.error("Erreur", {
        description: error.message || "Une erreur est survenue lors de la suppression de l'utilisateur.",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const users = data?.data || []



  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })
 
   const uniqueDepartments = useMemo(() => {
    // Pull out every departement string (could be undefined)
    const depts = users.map((u) => u.departement || "");
    // Filter out empty strings, then dedupe
    return [...new Set(depts.filter((d) => d !== ""))];
  }, [users]);

  const uniqueRoles = useMemo(() => {
    const roles = users.map((user) => {
      const role = user.role || user.userType;
      return role === "NO_ROLE" ? "Admin" : role;
    });
    return [...new Set(roles)];
  }, [users]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement des utilisateurs...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Une erreur est survenue lors du chargement des utilisateurs.</div>
      </div>
    )
  }

  return (
    <div className="bg-white w-[1050px] max-w-7xl mx-auto rounded-md shadow">
      <div className="p-4 border-b">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold">Gestion des Utilisateurs</h2>

    {/* Wrap the two buttons in one flex box */}
    <div className="flex items-center gap-2">
      <CreateUserDialog />
      <CreateDep />
    </div>
  </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des utilisateurs..."
              className="pl-8 w-[200px] sm:w-[300px]"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-1">
                <Filter className="h-4 w-4" />
                Filtrer par rôle
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {uniqueRoles.map((role) => (
                <DropdownMenuCheckboxItem
                  key={role}
                  checked={table.getColumn("role")?.getFilterValue()?.includes(role)}
                  onCheckedChange={(checked) => {
                    const filterValues = table.getColumn("role")?.getFilterValue() || []
                    if (checked) {
                      table.getColumn("role")?.setFilterValue([...filterValues, role])
                    } else {
                      table.getColumn("role")?.setFilterValue(filterValues.filter((value) => value !== role))
                    }
                  }}
                >
                  {role}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Clear all role filters
                  table.getColumn("role")?.setFilterValue(undefined)
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Réinitialiser
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="flex gap-1">
      <Filter className="h-4 w-4" />
      Filtrer par département
      <ChevronDown className="h-4 w-4 ml-1" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    {uniqueDepartments.map((dept) => (
      <DropdownMenuCheckboxItem
        key={dept}
        checked={table.getColumn("departement")?.getFilterValue()?.includes(dept)}
        onCheckedChange={(checked) => {
          const filterValues = table.getColumn("departement")?.getFilterValue() || [];
          if (checked) {
            table.getColumn("departement")?.setFilterValue([...filterValues, dept]);
          } else {
            table.getColumn("departement")?.setFilterValue(
              filterValues.filter((value) => value !== dept)
            );
          }
        }}
      >
        {dept}
      </DropdownMenuCheckboxItem>
    ))}
    <DropdownMenuSeparator />
    <DropdownMenuItem
      onClick={() => table.getColumn("departement")?.setFilterValue([])}
      className="text-blue-500 hover:text-blue-600"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Réinitialiser
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Colonnes <ChevronDown className="ml-2 h-4 w-4" />
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
                        onCheckedChange={(value) => column.toggleVisibility(value)}
                      >
                        {column.id === "name"
                          ? "Nom"
                          : column.id === "email"
                            ? "Email"
                            : column.id === "role"
                              ? "Rôle"
                              : column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                      <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    table.getAllColumns().forEach(column => {
                      if (column.getCanHide()) {
                        column.toggleVisibility(true)
                      }
                    })
                  }}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Tout afficher
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="overflow-x-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} >{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-2 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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

          <div className="flex  items-center gap-2">
            <span className="text-sm ">
              Page{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
              </strong>
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="border text-black bg-white rounded p-1 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} par page
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} utilisateurs au total
          </p>
        </div>
      </div>
      <UpdateUserDialog
        user={userToEdit}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
          
        chefs={chefs || []}
        responsables={responsables || []}
        isLoading={isLoading}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => setIsDeleteDialogOpen(open)}>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer l'utilisateur {userToDelete?.firstName} {userToDelete?.lastName} ? Cette
                action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={HandleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
                {isDeleting ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
          
          </AlertDialog>
          
    </div>

  )
}