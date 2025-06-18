import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { GripVertical, X, Loader2, Plus } from "lucide-react"
import { useCreateTypeMutation } from "../../Store/TypeSlice"

const fieldTypes = [
  { value: "text", label: "Texte" },
  { value: "number", label: "Nombre" },
  { value: "date", label: "Date" },
  { value: "select", label: "Sélection" },
  { value: "textarea", label: "Zone de texte" },
  { value: "checkbox", label: "Case à cocher" },
  { value: "file", label: "Fichier" },
  { value: "radio", label: "Bouton radio" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "color", label: "Couleur" },
  { value: "signature", label: "Signature" }
]

export function AddTypeDialog({ open, onOpenChange }) {
  const [typeName, setTypeName] = useState("")
  const [dureeEstimee, setDureeEstimee] = useState("")
  const [fields, setFields] = useState([])
  const [createType, { isLoading }] = useCreateTypeMutation()
  const OPTION_REQUIRED_TYPES = ['checkbox', 'select', 'radio']

  const addField = () => {
    setFields([...fields, { id: Date.now().toString(), nom: "", type: "text", obligatoire: false }])
  }

  const removeField = (id) => setFields(fields.filter(f => f.id !== id))

  const addOption = (fieldId) => {
    setFields(fields.map(f => f.id === fieldId ? ({
      ...f,
      options: [...(f.options||[]), { id: Date.now(), valeur: "" }]
    }) : f))
  }

  const removeOption = (fieldId, optId) => {
    setFields(fields.map(f => f.id === fieldId ? ({
      ...f,
      options: f.options.filter(o=>o.id!==optId)
    }) : f))
  }

  const updateOption = (fieldId, optId, val) => {
    setFields(fields.map(f => f.id === fieldId ? ({
      ...f,
      options: f.options.map(o => o.id===optId ? {...o, valeur: val} : o)
    }) : f))
  }

  const updateField = (id, updates) => {
    const curr = fields.find(f=>f.id===id) || {}

    if (updates.type && !OPTION_REQUIRED_TYPES.includes(updates.type)) updates.options = undefined
   
    else if (updates.type && OPTION_REQUIRED_TYPES.includes(updates.type)) {
      if (!curr.options || !curr.options.length) updates.options = [{ id: Date.now(), valeur: "" }]
    }
    setFields(fields.map(f => f.id===id ? {...f, ...updates} : f))
  }

  const onDragEnd = (res) => {
    if (!res.destination) return
    const arr = [...fields]
    const [m] = arr.splice(res.source.index,1)
    arr.splice(res.destination.index,0,m)
    setFields(arr)
  }

  const validateForm = () => {
    if (!typeName.trim()) return false
    if (!dureeEstimee.trim()) return false
    if (fields.some(f=>!f.nom.trim())) return false
    if (fields.some(f=> OPTION_REQUIRED_TYPES.includes(f.type) && (!f.options||f.options.some(o=>!o.valeur.trim())) )) return false
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return toast.error("Formulaire incomplet")
    try {
      const payload = {
        typeName,
        dureeEstimee,
        status: "active",
        formulaireValide: true,
        champs: fields.map(({nom,type,obligatoire,options})=>({
          nom, type, obligatoire,
          options: (OPTION_REQUIRED_TYPES.includes(type) ? options.map(o=>o.valeur) : undefined)
        }))
      }
      await createType(payload).unwrap()
      toast.success(`Type "${typeName}" créé !`)
      onOpenChange(false)
    } catch(err) {
      console.error(err)
      toast.error("Erreur lors de la création")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-100px)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Nouveau type de demande</DialogTitle>
          <DialogDescription>Définissez nom et champs du formulaire.</DialogDescription>
        </DialogHeader>
        <div className="overflow-auto flex-1 py-2 px-1 space-y-6">
          <div>
            <Label htmlFor="typeName">Nom du type</Label>
            <Input id="typeName" value={typeName} onChange={e=>setTypeName(e.target.value)} placeholder="Ex : Congé" />
            {!typeName.trim() && <p className="text-red-500">Obligatoire</p>}
          </div>
          <div>
            <Label htmlFor="dureeEstimee">Durée Estimee</Label>
            <Input id="dureeEstimee" type="number" value={dureeEstimee} onChange={e=>setDureeEstimee(e.target.value)} placeholder="Ex : 15 jours" />
            {!dureeEstimee.trim() && <p className="text-red-500">Obligatoire</p>}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Champs</Label>
              <Button size="sm" variant="outline" onClick={addField}><Plus className="h-4 w-4 mr-1"/>Ajouter</Button>
            </div>
            {fields.length===0 && <div className="p-4 border-dashed border-gray-300 text-center text-gray-500">Aucun champ</div>}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="fields">
                {provided => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {fields.map((f,idx)=>(
                      <Draggable key={f.id} draggableId={f.id} index={idx}>
                        {prov=>(
                          <div ref={prov.innerRef} {...prov.draggableProps} className="flex bg-slate-50 p-4 rounded-lg border">
                            <div {...prov.dragHandleProps} className="mr-2 pt-1"><GripVertical/></div>
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Nom</Label>
                                  <Input value={f.nom} onChange={e=>updateField(f.id,{nom:e.target.value})} />
                                </div>
                                <div>
                                  <Label>Type</Label>
                                  <Select value={f.type} onValueChange={v=>updateField(f.id,{type:v})}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{fieldTypes.map(t=><SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox checked={f.obligatoire} onCheckedChange={v=>updateField(f.id,{obligatoire:v})}/>
                                <Label>Obligatoire</Label>
                              </div>
                              {/* options for select/checkbox/radio */}
                              {OPTION_REQUIRED_TYPES.includes(f.type) && (
                                <div className="border-t pt-3 space-y-2">
                                  <div className="flex justify-between items-center"><Label>Options</Label></div>
                                  {f.options.map((opt, i) => (
  <div key={opt.id} className="flex items-center space-x-2">
    <span className="text-sm text-gray-500 w-6">{i+1}.</span>
    <Input
      value={opt.valeur}
      onChange={e => updateOption(f.id, opt.id, e.target.value)}
      placeholder="Saisissez une option"
      className={opt.valeur.trim() === '' ? 'border-red-300' : ''}
    />
    <Button size="icon" variant="outline" onClick={() => removeOption(f.id, opt.id)}>
      <X className="h-4 w-4" />
    </Button>
  </div>
))}
                                  <Button size="sm" variant="outline" onClick={()=>addOption(f.id)}><Plus className="h-4 w-4 mr-1"/>Ajouter</Button>
                                </div>
                              )}
                              
                            </div>
                            <Button size="icon" variant="ghost" onClick={()=>removeField(f.id)}><X/></Button>
                          </div>
                        )}</Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}</Droppable>
            </DragDropContext>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={()=>onOpenChange(false)}>Annuler</Button>
            <Button className="bg-blue-700 text-white" onClick={handleSubmit} disabled={isLoading||!validateForm()}>
              {isLoading ? <><Loader2 className="animate-spin mr-1"/>Création...</> : "Créer le type"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
