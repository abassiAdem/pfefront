import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Loader2, User2, Briefcase, Shield, Users } from "lucide-react"
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateUserMutation, useGetChefsQuery, useGetResponsablesQuery,useDeleteUserMutation,useGetDepartementsQuery} from "../../Store/userSlice"

import { cn } from "@/lib/utils"

const userRoles = [
  { id: "admin", label: "Administrateur", icon: Shield },
  { id: "chef", label: "Chef", icon: Briefcase },
  { id: "responsable", label: "Responsable", icon: Users },
  { id: "realisateur", label: "Réalisateur", icon: User2 },
  { id: "employe", label: "Employe", icon: User2 },
  { id: "superuser", label: "Super utilisateur", icon: User2 },
]


export function CreateUserDialog() {
  const [open, setOpen] = useState(false);

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
      departementId: "",
      password: "",
      metier: "",
    },
  });

  const [createUser, { isLoading }] = useCreateUserMutation();
  const { data: chefs, isLoading: chefsLoading } = useGetChefsQuery();
  const { data: responsables, isLoading: responsablesLoading } = useGetResponsablesQuery();
  const { data: departements, isLoading: departementsLoading } = useGetDepartementsQuery();
  const [selectedResponsableId, setSelectedResponsableId] = useState("");
  const [selectedResponsableName, setSelectedResponsableName] = useState("Sélectionnez un responsable");
  const selectedRole = watch("role");
  const needsChef = selectedRole === "employe";
  const needsResponsable = selectedRole === "realisateur";
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const [selectedChefId, setSelectedChefId] = useState("");
  const [selectedChefName, setSelectedChefName] = useState("Sélectionnez un chef");
  async function onSubmit(data) {
    const userType = data.role || ""
    data.userType = userType
    if (data.chefId === "0") {
      toast.error("Erreur", {
        description: "Veuillez sélectionner un chef valide.",
      })
      return
    }

    if ((needsChef && !data.chefId) || (needsResponsable && !data.responsableId)) {
      toast.error("Erreur", {
        description: "Le champ requis pour ce rôle n'est pas renseigné.",
      })
    }
    if (!data.departementId) {
  toast.error("Erreur", {
    description: "Veuillez sélectionner un département.",
  });
      return
    }

    try { 
      await createUser(data).unwrap()
      toast.success("Succès", {
        description: "L'utilisateur a été créé avec succès.",
      })
      setOpen(false)
      reset()
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la création de l'utilisateur.",
      })
      console.error("Error creating user:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2563EB] text-white hover:bg-[#2563EB]" >
          <Users className="mr-2 h-4 w-4" />
          Ajouter un Utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Créez un nouveau compte utilisateur en remplissant les informations ci-dessous.
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

          {/*add dep*/}
<div className="space-y-2">
  <Label>Département</Label>
  <Controller
    name="departementId"
    control={control}
    rules={{ required: "Le département est requis" }}
    render={({ field }) => (
      <Select 
        onValueChange={(value) => field.onChange(value)} 
        value={field.value}
        disabled={departementsLoading}
      >
        <SelectTrigger className={cn(errors.departementId && "border-red-500")}>
          <SelectValue placeholder="Sélectionnez un département" />
        </SelectTrigger>
        <SelectContent>
          {departements?.data?.map((dept) => (
            <SelectItem key={dept.id} value={dept.id.toString()}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
  {errors.departementId && (
    <p className="text-sm text-red-500">{errors.departementId.message}</p>
  )}
</div>

          <div className="space-y-2">
            <Label>Rôle</Label>
            <Controller
              name="role"
              control={control}
              rules={{ required: "Le rôle est requis" }}
              render={({ field }) => (
                <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
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
  rules={{ required: "Le chef est requis" }}
  render={({ field }) => (
    <Select 
      onValueChange={(value) => {
        field.onChange(value);
        const chef = chefs?.find(c => c.id === value);
        if (chef) {
          setSelectedChefName(`${chef.firstName} ${chef.lastName}`);
          setSelectedChefId(value);
        }
      }}
      value={selectedChefId}
    >
      <SelectTrigger className={cn(errors.chefId && "border-red-500")}>
         <SelectValue placeholder="Sélectionnez un chef"/>
        <SelectValue>{selectedChefName}</SelectValue>
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
                  {...register("metier", {
                    required: "La metier est requise",
                    minLength: { value: 2, message: "La metier doit être obligatoire" },
                  })}
                  className={cn(errors.competence && "border-red-500")}
                />
                {errors.competence && <p className="text-sm text-red-500">{errors.metier.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="competence">Compétence</Label>
                <Input
                  id="competence"
                  placeholder="competence"
                  {...register("competence", {
                    required: "La compétence est requise",
                    minLength: { value: 2, message: "La compétence doit être obligatoire" },
                  })}
                  className={cn(errors.competence && "border-red-500")}
                />
                {errors.competence && <p className="text-sm text-red-500">{errors.competence.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Responsable</Label>
                <Controller
            name="responsableId"
            control={control}
            rules={{ required: "Le responsable est requis" }}
            render={({ field }) => (
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  const responsable = responsables?.find(r => r.id === value);
                  if (responsable) {
                    setSelectedResponsableName(`${responsable.firstName} ${responsable.lastName}`);
                    setSelectedResponsableId(value);
                  }
                }}
                value={selectedResponsableId}
              >
                <SelectTrigger className={cn(errors.responsableId && "border-red-500")}>
                <SelectValue placeholder="Sélectionnez un responsable" />
                  <SelectValue>{selectedResponsableName}</SelectValue>
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
  <Label htmlFor="password">Mot de passe</Label>
  <div className="relative">
    <Input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="********"
      {...register("password", {
        required: "Le mot de passe est requis",
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-[#2563EB] text-white hover:bg-[#2563EB]" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer l'utilisateur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
