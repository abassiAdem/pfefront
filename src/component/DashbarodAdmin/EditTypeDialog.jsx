import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Plus, X, Eye, Edit, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

const formatDate = (date) => {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const getFieldIcon = (type) => {
  switch (type) {
    case "text":
      return <span className="text-blue-500">Aa</span>
    case "textarea":
      return <span className="text-green-500">¶</span>
    case "number":
      return <span className="text-purple-500">123</span>
    case "date":
      return <span className="text-orange-500">📅</span>
    case "select":
      return <span className="text-teal-500">▼</span>
    case "checkbox":
      return <span className="text-red-500">☑</span>
    case "radio":    return <span className="text-pink-500">◉</span>
    case "email":     return <span className="text-indigo-500">@</span>
    case "url":       return <span className="text-indigo-500">🌐</span>
    case "color":     return <span className="text-orange-500">🎨</span>
    case "signature": return <span className="text-gray-700">✒️</span>
    case "file":      return <span className="text-gray-800">📎</span>
    default:
      return <span className="text-gray-500">⚪</span>
  }
}

const getFieldTypeName = (type) => {
  const typeMap = {
    text: "Texte court",
    textarea: "Texte long",
    number: "Nombre",
    date: "Date",
    select: "Liste déroulante",
    checkbox: "Case à cocher",
    radio:  "Bouton radio",
    email:     "Email",
    url:       "URL",
    color:     "Couleur",
    signature: "Signature",
    file:      "Fichier",
  }
  return typeMap[type] || type
}

const fieldTypes = [
  { value: "text", label: "Texte court" },
  { value: "textarea", label: "Texte long" },
  { value: "number", label: "Nombre" },
  { value: "date", label: "Date" },
  { value: "select", label: "Liste déroulante" },
  { value: "checkbox", label: "Case à cocher" },
  { value: "radio",label: "Bouton radio" },
  { value: "email", label: "Email" }, 
  { value: "url", label: "URL" },
  { value: "color",     label: "Couleur" },
  { value: "signature", label: "Signature" },
  { value: "file",      label: "Fichier" },
  
]

export default function EditTypeDialog({ open, onOpenChange, typeToEdit, onTypeUpdated, useUpdateTypeMutation }) {
  const [typeName, setTypeName] = useState("")
  const [isActive, setIsActive] = useState(typeToEdit?.status === "active")
  const [dureeEstimee, setDureeEstimee] = useState(0)
  const [fields, setFields] = useState([])
  const [activeTab, setActiveTab] = useState("edit")
  const [updateType, { isLoading }] = useUpdateTypeMutation()
  const OPTION_REQUIRED_TYPES = ['checkbox', 'select', 'radio']
  useEffect(() => {
 
    if (typeToEdit) {
      setTypeName(typeToEdit.name)
      setDureeEstimee(typeToEdit.dureeEstimee || 0);
      setIsActive(typeToEdit.status === "active")
      setFields(
        typeToEdit.formulaire?.champs?.map(field => ({
     
          id: field.id ?? uuidv4(),
          nom: field.nom,
          type: field.type,
          obligatoire: field.obligatoire, 
          options: (field.options ?? []).map(opt => ({
            id: opt.id ?? uuidv4(),
            valeur: opt.valeur
          })),
        })) ?? []
      )
    }
  }, [typeToEdit])

  const addField = () => {
    const fieldType = "text";
    setFields([
      ...fields,
      {
        id: uuidv4(),
        nom: "",
        type: fieldType,
        obligatoire: false,
        ...(OPTION_REQUIRED_TYPES.includes(fieldType) ? { 
          options: [{ id: uuidv4(), valeur: "" }] 
        } : {})
      },
    ])
  }

  const updateField = (id, updates) => {
    const currentField = fields.find(f => f.id === id);
    
    if (updates.type && !OPTION_REQUIRED_TYPES.includes(updates.type)) {
      // Si le nouveau type ne nécessite pas d'options, les supprimer
      updates.options = undefined;
    } else if (updates.type && OPTION_REQUIRED_TYPES.includes(updates.type)) {
      // Si le nouveau type nécessite des options et qu'il n'y en a pas encore
      if (!currentField.options || currentField.options.length === 0) {
        // Ajouter une option vide que l'utilisateur pourra remplir
        updates.options = [{ id: uuidv4(), valeur: "" }];
      }
    }
    
    setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)));
  }

  const removeField = (id) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const moveField = (index, direction) => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === fields.length - 1)) {
      return
    }

    const newFields = [...fields]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]

    setFields(newFields)
  }
  const addOption = (fieldId) => {
    setFields(fields.map(field => {
      if (field.id !== fieldId) return field
      
      return {
        ...field,
        options: [
          ...(field.options || []),
          { id: uuidv4(), valeur: "" }
        ]
      }
    }))
  }

  const removeOption = (fieldId, optionId) => {
    setFields(fields.map(field => {
      if (field.id !== fieldId) return field
      
      return {
        ...field,
        options: field.options?.filter(opt => opt.id !== optionId) || []
      }
    }))
  }

  const updateOption = (fieldId, optionId, newValue) => {
    setFields(fields.map(field => {
      if (field.id !== fieldId) return field
      
      return {
        ...field,
        options: field.options?.map(opt => 
          opt.id === optionId ? { ...opt, valeur: newValue } : opt
        ) || []
      }
    }))
  }

  const validateForm = () => {

    const isTypeNameValid = typeName.trim() !== "";
    const isDureeEstimeeValid = typeof dureeEstimee === 'number' && dureeEstimee >0;

    const areFieldNamesValid = fields.every(field => field.nom.trim() !== "");
    

    const areOptionsValid = fields.every(field => {
      if (OPTION_REQUIRED_TYPES.includes(field.type)) {
        return field.options && 
               field.options.length > 0 && 
               field.options.every(opt => opt.valeur.trim() !== "");
      }
      return true;
    });
    
    return isTypeNameValid && areFieldNamesValid && areOptionsValid && isDureeEstimeeValid;
  }
  const handleSubmit = async () => {
    if (!typeName.trim()) {
      toast.error("Veuillez saisir un nom pour le type de demande")
      return
    }
    if (typeof dureeEstimee !== "number" || dureeEstimee <= 0) {
      toast.error("Veuillez saisir une durée estimée valide");
      return;
    }
    

    if (fields.length === 0) {
      toast.error("Veuillez ajouter au moins un champ au formulaire")
      return
    }

    for (const field of fields) {
      if (!field.nom.trim()) {
        toast.error("Tous les champs doivent avoir un nom")
        return
      }
    }
    try {
      const result = await updateType({
        id: typeToEdit.id,
        typeName: typeName,
        dureeEstimee,
        status: isActive ? "active" : "inactive",
        valide: typeToEdit.valide ?? false,
        formulaireValide: typeToEdit.formulaireValide ?? false,
        champs: fields.map(field => ({
          id: !isNaN(Number(field.id)) ? Number(field.id) : undefined,
          nom: field.nom,
          type: field.type,
          obligatoire: field.obligatoire, 
          options: OPTION_REQUIRED_TYPES.includes(field.type)
            ? (field.options || []).map(opt => opt.valeur)
            : [],
        }))
      });
  
      if (result.error) {
        console.error("Update operation failed:", result.error)
        toast.error(result.error.data?.message || "Une erreur s'est produite lors de la mise à jour")
        return
      }

      toast.success("Type de demande mis à jour avec succès")
      if (result.data) {
        onTypeUpdated(result.data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Exception during update operation:", error)
      toast.error("Une erreur s'est produite lors de la mise à jour")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-100px)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {activeTab === "view" ? (
              <>
                {typeToEdit?.name}
                <Badge className="ml-2" variant={typeToEdit?.status === "active" ? "success" : "secondary"}>
                  {typeToEdit?.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </>
            ) : (
              "Modifier le type de demande"
            )}
          </DialogTitle>
          <DialogDescription>
            {activeTab === "view"
              ? "Détails du type de demande et de son formulaire associé"
              : "Modifiez ce type de demande en ajustant les champs de formulaire."}
          </DialogDescription>
        </DialogHeader>
        {activeTab === "edit" && (
  <div className="flex items-center justify-between mb-4">
    <span className="font-medium text-sm">Actif</span>
    <Switch
      checked={isActive}
      onCheckedChange={setIsActive}
      aria-label="Statut actif / inactif"
    />
  </div>
)}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-y-auto flex-1 py-2 px-1 -mx-1 space-y-6">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="edit" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              Modifier
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Visualiser
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="typeName">Nom du type</Label>
              <Input
                id="typeName"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="Ex: Demande de congé"
              />
              {typeName.trim() === "" && (
                <p className="text-sm text-red-500 mt-1">Ce champ est obligatoire</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dur">Duree Estimee</Label>
              <Input
  type="number"
  id="dureeEstimee"
  value={dureeEstimee}
  onChange={(e) => setDureeEstimee(Number(e.target.value))} // Convert to number
  placeholder="Ex: Durée estimée"
/>
{(typeof dureeEstimee !== "number" || dureeEstimee <= 0) && (
  <p className="text-sm text-red-500 mt-1">Ce champ est obligatoire</p>
)}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Champs du formulaire</Label>
                <Button onClick={addField} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter un champ
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex flex-col items-center space-y-1 mt-2">
                      <Button
                        size="icon"
                        className="h-6 w-6 bg-[#2563EB] text-white hover:bg-[#2563EB]"
                        onClick={() => moveField(index, "up")}
                        disabled={index === 0}
                      >
                        <span className="sr-only">Monter</span>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        className="h-6 w-6 bg-[#2563EB] text-white hover:bg-[#2563EB]"
                        onClick={() => moveField(index, "down")}
                        disabled={index === fields.length - 1}
                      >
                        <span className="sr-only">Descendre</span>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom du champ</Label>
                          <Input
                            value={field.nom}
                            onChange={(e) =>
                              updateField(field.id, {
                                nom: e.target.value,
                              })
                            }
                            placeholder="Ex: Date de début"
                          />
                          {field.nom.trim() === "" && (
                            <p className="text-sm text-red-500">Ce champ est obligatoire</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Type de champ</Label>
                          <Select value={field.type} onValueChange={(value) => updateField(field.id, { type: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          className="h-4 w-4 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white focus:ring-0"
                          id={`required-${field.id}`}
                          checked={field.obligatoire}
                          onCheckedChange={(checked) =>
                            updateField(field.id, {
                              obligatoire: checked,
                            })
                          }
                        />
                        <Label htmlFor={`required-${field.id}`}>Champ obligatoire</Label>
                      </div>

                      
                      {OPTION_REQUIRED_TYPES.includes(field.type) && (
                        <div className="space-y-2 border-t pt-4 mt-2">
                          <div className="flex justify-between items-center">
                            <Label>Options</Label>
                            <span className="text-xs text-red-500">
                              {(!field.options || field.options.length === 0) && "Au moins une option requise"}
                            </span>
                          </div>
                          
                          {field.options?.length > 0 ? (
                            <div className="space-y-2">
                              {field.options.map((option, optIndex) => (
                                <div key={option.id} className="flex space-x-2 items-center">
                                  <span className="text-sm text-gray-500 w-6">{optIndex + 1}.</span>
                                  <Input
                                    value={option.valeur}
                                    onChange={(e) => 
                                      updateOption(field.id, option.id, e.target.value)
                                    }
                                    placeholder="Saisissez une option"
                                    className={option.valeur.trim() === "" ? "border-red-300" : ""}
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeOption(field.id, option.id)}
                                    disabled={field.options.length === 1}
                                    title={field.options.length === 1 ? "Au moins une option est requise" : "Supprimer cette option"}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 border border-dashed border-gray-300 rounded-md text-center text-gray-500 text-sm">
                              Aucune option définie
                            </div>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(field.id)}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une option
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button size="icon" className="bg-[#2563EB] text-white hover:bg-[#2563EB]" onClick={() => removeField(field.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center p-6 text-muted-foreground bg-slate-50 rounded-lg">
                    Aucun champ défini. Cliquez sur "Ajouter un champ" pour commencer.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                className="bg-[#2563EB] text-white hover:bg-[#2563EB]" 
                onClick={handleSubmit} 
                disabled={isLoading || !validateForm()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="view" className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date de création</p>
                <p className="font-medium">{formatDate(typeToEdit?.dateCreation)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Dernière modification</p>
                <p className="font-medium">{formatDate(typeToEdit?.dateModification)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Champs du formulaire</h3>

              {fields && fields.length > 0 ? (
                <ScrollArea className="h-[300px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {fields.map((field, index) => (
                      <div key={index} className="flex items-start p-3 bg-slate-50 rounded-lg">
                        <div className="mr-3 mt-1">{getFieldIcon(field.type)}</div>
                        <div className="flex-1">
                          <div className="font-medium">{field.nom}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{getFieldTypeName(field.type)}</span>
                            {field.obligatoire && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-500 border-red-200">
                                Obligatoire
                              </Badge>
                            )}
                          </div>
                          
                          
                          {OPTION_REQUIRED_TYPES.includes(field.type) && field.options && field.options.length > 0 && (
                            <div className="mt-2 text-sm">
                              <p className="text-muted-foreground">Options:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {field.options.map((option, optIndex) => (
                                  <Badge key={option.id} variant="secondary" className="bg-slate-100">
                                    {option.valeur}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center p-6 text-muted-foreground bg-slate-50 rounded-lg">
                  Aucun champ défini pour ce formulaire
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button className="bg-[#2563EB] text-white hover:bg-[#2563EB]" onClick={() => setActiveTab("edit")}>
                Modifier
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}