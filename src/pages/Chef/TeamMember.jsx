
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {useGetUsersForChefQuery} from "../../Store/userSlice"
import { useSelector } from "react-redux"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"





import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react" 


import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table" 
export default function TeamMembers() {
  const { user } = useSelector((state) => state.auth)
  const { data: response = {}, isLoading: isLoadingTeamMembers } = useGetUsersForChefQuery(user?.id)

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  
  const navigate = useNavigate()

  const teamMembers = useMemo(() => {
    return response?.data || []
  }, [response])

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: 0
    }))
  }, [searchTerm, roleFilter])


  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return "??"
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleBadge = (role) => {
    const roleMap = {
      ADMIN: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Admin" },
      CHEF: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Team Lead" },
      EMPLOYEE: { color: "bg-green-100 text-green-800 border-green-200", label: "Employee" },
    }

    const roleInfo = roleMap[role] || { color: "bg-gray-100 text-gray-800 border-gray-200", label: role }

    return (
      <Badge variant="outline" className={roleInfo.color}>
        {roleInfo.label}
      </Badge>
    )
  }

  const viewEmployeeDetails = (id) => {
    navigate(`/chef/team-management?id=${id}`)
  }

  const columns = useMemo(() => [
    {
      accessorKey: "Nom",
      header: "Nom",
      cell: ({ row }) => {
        const member = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="font-medium">
              {member.firstName} {member.lastName}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="max-w-[180px] truncate">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{row.getValue("email")}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.getValue("email")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => getRoleBadge(row.getValue("role")),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("id")}</div>,
    },

  ], [])

  const filteredMembers = useMemo(() => {
    if (!searchTerm && !roleFilter) return teamMembers

    return teamMembers.filter(member => {

      const matchesSearch =
        !searchTerm ||
        `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.id?.toString() || '').includes(searchTerm)

      const matchesRole = !roleFilter || member.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [teamMembers, searchTerm, roleFilter])

  const table = useReactTable({
    data: filteredMembers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },

    manualPagination: false,
    debugTable: false,
  })

  const exportToCSV = () => {
    const headers = ["ID", "First Name", "Last Name", "Email", "Role", "Role ID", "Keycloak ID"]
    
    const csvData = filteredMembers.map((member) => [
      member.id || '',
      member.firstName || '',
      member.lastName || '',
      member.email || '',
      member.role || '',
      member.roleId || '',
      member.keycloakId || '',
    ])

    const csvContent = [
      headers.join(","), 
      ...csvData.map((row) => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "team-members.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  if (isLoadingTeamMembers) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Membres de l'équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Team Members</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by name, email, ID..."
                className="pl-8 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">

            
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Columns</span>
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
                          {column.id === "name" ? "Name" : column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={exportToCSV} className="gap-1">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
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
                              className={header.column.getCanSort() ? "cursor-pointer select-none flex items-center" : ""}
                              onClick={header.column.getToggleSortingHandler()}
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
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                      Aucun membre de l'équipe trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="flex-1 text-sm text-muted-foreground">
                {filteredMembers.length > 0 ? (
                  <>
                    Affichage de {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} à{" "}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length
                    )}{" "}
                    sur {table.getFilteredRowModel().rows.length} members
                  </>
                ) : (
                  "No results"
                )}
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
                <div className="text-sm mx-2">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
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
      </div>
    </div>
  )
}

/*              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setRoleFilter(null)} className={!roleFilter ? "bg-accent" : ""}>
                    All Roles
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setRoleFilter("ADMIN")}
                    className={roleFilter === "ADMIN" ? "bg-accent" : ""}
                  >
                    Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setRoleFilter("CHEF")}
                    className={roleFilter === "CHEF" ? "bg-accent" : ""}
                  >
                    Team Lead
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setRoleFilter("EMPLOYEE")}
                    className={roleFilter === "EMPLOYEE" ? "bg-accent" : ""}
                  >
                    Employee
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */