import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, CheckSquare, FileText, ListFilter, Type, AlignLeft, Hash, FileInput, Radio,
  Mail,         
  Link,         
  Droplet,     
  PenTool} from "lucide-react";
import { use, useEffect } from "react"
export default function ViewTypeDialog({ open, onOpenChange, typeToView }) {
    if (!typeToView) return null
 
    
    const formatDate = (dateString) => {
      return new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(dateString))
    }
  
    const getFieldIcon = (type) => {
      switch (type) {
        case "text":
          return <Type className="h-4 w-4 text-blue-500" />
        case "textarea":
          return <AlignLeft className="h-4 w-4 text-indigo-500" />
        case "number":
          return <Hash className="h-4 w-4 text-emerald-500" />
        case "date":
          return <Calendar className="h-4 w-4 text-amber-500" />
        case "select":
          return <ListFilter className="h-4 w-4 text-purple-500" />
        case "checkbox":
          return <CheckSquare className="h-4 w-4 text-pink-500" />
      
          case "radio":
            return <Radio className="h-4 w-4 text-violet-500" />;
          case "email":
            return <Mail className="h-4 w-4 text-indigo-600" />;
          case "url":
            return <Link className="h-4 w-4 text-blue-600" />;
          case "color":
            return <Droplet className="h-4 w-4 text-rose-500" />;
          case "signature":
            return <PenTool className="h-4 w-4 text-gray-700" />;
          case "file":
            return <FileInput className="h-4 w-4 text-orange-500" />;
        default:
          return <FileText className="h-4 w-4 text-gray-500" />
      }
    }
  
    const getFieldTypeName = (type) => {
      const types = {
        text: "Texte",
        textarea: "Zone de texte",
        number: "Nombre",
        date: "Date",
        select: "Liste déroulante",
        checkbox: "Case à cocher",
        radio:     "Bouton radio",
    email:     "Email",
    url:       "URL",
    color:     "Couleur",
    signature: "Signature",
    file:      "Fichier",
      }
      return types[type] || type
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {typeToView.name}
              <Badge className="ml-2" variant={typeToView.status === "active" ? "success" : "secondary"}>
                {typeToView.status === "active" ? "Actif" : "Inactif"}
              </Badge>
            </DialogTitle>
            <DialogDescription>Détails du type de demande et de son formulaire associé</DialogDescription>
          </DialogHeader>
  
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date de création</p>
                <p className="font-medium">{formatDate(typeToView.dateCreation)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Dernière modification</p>
                <p className="font-medium">{formatDate(typeToView.dateModification)}</p>
              </div>
            </div>
  
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Champs du formulaire</h3>
  
              {typeToView.formulaire.champs && typeToView.formulaire.champs.length > 0 ? (
                <ScrollArea className="h-[300px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {typeToView.formulaire.champs.map((field, index) => (
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
  
            <div className="flex justify-end">
              <Button className="bg-[#2563EB] text-white hover:bg-[#2563EB]" onClick={() => onOpenChange(false)}>Fermer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }