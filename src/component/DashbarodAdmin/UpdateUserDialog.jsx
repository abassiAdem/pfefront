import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGetUsersQuery, useDeleteUserMutation,useUpdateUserMutation } from "../../Store/userSlice"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff, Loader2, Shield, Briefcase, Users, User,User2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
const userRoles = [
    { id: "admin", label: "Administrateur", icon: Shield },
    { id: "chef", label: "Chef", icon: Briefcase },
    { id: "responsable", label: "Responsable", icon: Users },
    { id: "realisateur", label: "Réalisateur", icon: User },
    { id: "employe", label: "Employe", icon: User },
      { id: "superuser", label: "Super utilisateur", icon: User2 },
  ]
  
  export function UpdateUserDialog({
    user,
    open,
    onOpenChange,
    chefs = [],
    responsables = [],
    isLoading = false,
  }) {
    const {
      control,
      register,
      handleSubmit,
      watch,
      reset,
      formState: { errors },
    } = useForm({
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        role: "", 
        competence: "",
        chefId: "",
        responsableId: "",
        password: "",
        metier: "",
      },
    })
  
    const [updateUser] = useUpdateUserMutation()
    const selectedRole = watch("role")
    const needsChef = selectedRole === "employe"
    const needsResponsable = selectedRole === "realisateur"
    const [showPassword, setShowPassword] = useState(false)
    const togglePasswordVisibility = () => setShowPassword(!showPassword)
  
    useEffect(() => {  
        if (user) {
          reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.userType === "NO_ROLE" ? "admin" : user.role || user.userType,
            competence: user.competence || "",
            chefId: user.chefId || "",
            responsableId: user.responsableId || "",
            metier: user.metier || "",
            password: "",
          });
        } 
      }, [user, reset]);
  
    async function onSubmit(data) {
      
      
      // Get the current user role (either from role or userType field)
      const currentUserRole = user.role || user.userType;
      
      // Check if the role has actually changed
      const roleHasChanged = currentUserRole !== data.role;
      
      const userData = {
        id: user.id, 
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        competence: data.competence || "",
        chefId: data.chefId || "",
        responsableId: data.responsableId || "",
        metier: data.metier || "",
      }

      // Only include password if it's provided
      if (data.password && data.password.trim() !== "") {
        userData.password = data.password;
      }

      // Always include userType with the selected role
      // The backend should handle whether this represents a change or not
      userData.userType = data.role;

      try {
       
        await updateUser(userData).unwrap()
        toast.success("L'utilisateur a été mis à jour avec succès.")
        onOpenChange(false)
      } catch (error) {
        const errorMessage = error.data?.error || "Une erreur est survenue lors de la mise à jour de l'utilisateur."
        toast.error(errorMessage)
        console.error("Error updating user:", error)
      }
    }
    
    const getChefName = (id) => {
      const chef = chefs?.find(c => c.id === id)
      return chef ? `${chef.firstName} ${chef.lastName}` : "Sélectionnez un chef"
    }
  
    const getResponsableName = (id) => {
      const responsable = responsables?.find(r => r.id === id)
      return responsable ? `${responsable.firstName} ${responsable.lastName}` : "Sélectionnez un responsable"
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="firstName"
                  {...register("firstName", {
                    required: "Le prénom est requis",
                    minLength: { value: 2, message: "Le prénom doit contenir au moins 2 caractères" },
                  })}
                  className={cn(errors.firstName && "border-red-500")}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="lastName"
                  {...register("lastName", {
                    required: "Le nom est requis",
                    minLength: { value: 2, message: "Le nom doit contenir au moins 2 caractères" },
                  })}
                  className={cn(errors.lastName && "border-red-500")}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email", {
                  required: "L'email est requis",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Adresse email invalide",
                  },
                })}
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
  
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Le rôle est requis" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn(errors.role && "border-red-500")}>
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map(({ id, label, icon: Icon }) => (
                        <SelectItem key={id} value={id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>
  
            {needsChef && (
              <div className="space-y-2">
                <Label>Chef</Label>
                <Controller
                  name="chefId"
                  control={control}
               
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className={cn(errors.chefId && "border-red-500")}>
                        <SelectValue placeholder="Sélectionnez un chef">
                          {getChefName(field.value)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {chefs?.map(chef => (
                          <SelectItem key={chef.id} value={chef.id}>
                            {chef.firstName} {chef.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.chefId && <p className="text-sm text-red-500">{errors.chefId.message}</p>}
              </div>
            )}
  
            {needsResponsable && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="metier">Metier</Label>
                  <Input
                    id="metier"
                    placeholder="metier"
                    {...register("metier" )}
                    className={cn(errors.metier && "border-red-500")}
                  />
                  {errors.metier && <p className="text-sm text-red-500">{errors.metier.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="competence">Compétence</Label>
                  <Input
                    id="competence"
                    placeholder="competence"
                    {...register("competence" )}
                    className={cn(errors.competence && "border-red-500")}
                  />
                  {errors.competence && <p className="text-sm text-red-500">{errors.competence.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Responsable</Label>
                  <Controller
                    name="responsableId"
                    control={control}
                  
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className={cn(errors.responsableId && "border-red-500")}>
                          <SelectValue placeholder="Sélectionnez un responsable">
                            {getResponsableName(field.value)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {responsables?.map(responsable => (
                            <SelectItem key={responsable.id} value={responsable.id}>
                              {responsable.firstName} {responsable.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.responsableId && <p className="text-sm text-red-500">{errors.responsableId.message}</p>}
                </div>
              </>
            )}
  
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe (laisser vide pour ne pas modifier)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  {...register("password", {
                    minLength: {
                      value: 8,
                      message: "Le mot de passe doit contenir au moins 8 caractères",
                    },
                  })}
                  className={cn(errors.password && "border-red-500", "pr-10")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Cacher le mot de passe" : "Montrer le mot de passe"}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
  
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-[#2563EB] text-white hover:bg-[#2563EB]" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mettre à jour
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }