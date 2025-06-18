import React, { useRef, useState, useEffect } from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetTypesQuery,
  useGetFormulaireByTypeIdQuery,
  useGetTypesNotNormalQuery,
} from "../Store/TypeSlice";
import { useCreateDemandeMutation } from "../Store/demandeApiSlice "
import { resetDemandeState } from "../Store/DemandeSlice";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, Upload, Info ,Send  } from "lucide-react";
import clsx from "clsx";
import {selectEmployeeDemandes} from "../Store/DemandeSlice";
import { se } from 'date-fns/locale';
import { info } from 'autoprefixer';
export default function EmployeCreate() {
  const dispatch = useDispatch();
  const { user,roles } = useSelector((state) => state.auth);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTypeValue, setSelectedTypeValue] = useState(null);
  const [formTemplate, setFormTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dureeEstimeeValue, setDureeEstimeeValue] = useState(0);
  const demandes = useSelector(selectEmployeeDemandes);
  const { data: typesNotNormal } = useGetTypesNotNormalQuery();
  const [selectedDemande, setSelectedDemande] = useState(null);
  const { data: formTpl } = useGetFormulaireByTypeIdQuery(selectedType, { skip: !selectedType });
  const [createDemande, { isLoading }] = useCreateDemandeMutation();
  const isEmploye=(roles?.realmRoles?.includes("employe") === true) || (roles?.clientRoles?.includes("employe") === true)
  const buildSchema = (template) => {
    const base = {
      title: z.string().min(1),
      urgence: z.enum(["urgent", "moyen", "pas urgent"]),
      justification: z.string().min(1),
      typeId: z.number(),
      informationsSup: z.string().optional(),
    };
    if (!template) return z.object(base);
    template.champs.forEach((f) => {
      switch (f.type) {
        case "text":
        case "url":
        case "textarea":
          base[f.nom] = f.obligatoire ? z.string().min(1) : z.string().optional();
          break;
        case "number":
          base[f.nom] = f.obligatoire ? z.number() : z.number().optional();
          break;
          case "date":
            base[f.nom] = f.obligatoire
              ? z.preprocess(val => (typeof val === "string" ? new Date(val) : val), z.date())
              : z.preprocess(val => (val ? new Date(val) : undefined), z.date().optional());
          break;
        case "checkbox":
          base[f.nom] = f.obligatoire ? z.array(z.string()).min(1) : z.array(z.string()).optional();
          break;
        case "select":
        case "radio":
          base[f.nom] = f.obligatoire ? z.string().min(1) : z.string().optional();
          break;
        case "file":
          base[f.nom] = f.obligatoire ? z.any() : z.any().optional();
          break;
        case "signature":
            base[f.nom] = f.obligatoire ? z.any() : z.any().optional();
            break;
        case "email":
  base[f.nom] = f.obligatoire
    ? z.string().min(1).email()
    : z.string().email().optional();
  break;
case "color":
  base[f.nom] = f.obligatoire
    ? z.string().min(1) 
    : z.string().optional();
  break;
        default:
          break;
      }
    });
    return z.object(base);
  };
  
  const typeByRole = typesNotNormal?.filter((t) => {
    if (isEmploye) {
      if (t.id === 11) {
        return false;
    }

    }
    return true;
});
  const form = useForm({
    resolver: zodResolver(buildSchema(formTemplate)),
    defaultValues: { title: "", urgence: "moyen", justification: "", typeId: 0 ,informationsSup:""},
  });

  useEffect(() => {
    if (formTpl?.length) setFormTemplate(formTpl[0]);
  }, [formTpl]);

  const handleTypeChange = (val) => {
    if (val === "13") {
      setSelectedType(null);
      setSelectedTypeValue("Normal");
      setDureeEstimeeValue(0);
      form.setValue("typeId", 13);
      setFormTemplate(null);
      return;
    }
    const sel = typesNotNormal?.find((t) => String(t.id) === val);
    if (sel) {
      setSelectedType(sel.id);
      setSelectedTypeValue(sel.name);
      setDureeEstimeeValue(sel.dureeEstimee);
      form.setValue("typeId", sel.id);
    }
  };
const isFormValid = () => { 
  const hasValidType = selectedTypeValue === "Normal" || selectedTypeValue !== null;
   
  const requiredFieldsFilled = 
    form.getValues("title")?.length > 0 && 
    form.getValues("justification")?.length > 0;
  
  return hasValidType && requiredFieldsFilled && !submitting && !isLoading;
};
  const handelDemandeChange = (val) => {
    if (val === "none") {
      setSelectedDemande(null);
      return;
    }
    const sel = demandes?.find((t) => String(t.id) === val);
    
    setSelectedDemande(sel || null);
  }
  const onSubmit = async (values) => {
    setSubmitting(true);

    const dataObj = {};
    formTemplate?.champs.forEach((f) => {
      if (f.type !== 'file') dataObj[f.nom] = values[f.nom];
    });
    let dto = {};
    const fd = new FormData();
    
    if(selectedDemande){
  
     dto = {
      title: values.title,
      urgence: values.urgence,
      justification: values.justification,
      infoSup: values.informationsSup,
      agentId: user.id,
      dureeEstimee: dureeEstimeeValue,    
      type: selectedTypeValue,
      data: dataObj,
      parentId: selectedDemande.id,
      isAttached: true,
    };}
    else{
          
     dto = {
      title: values.title,
      urgence: values.urgence,
      justification: values.justification,
      infoSup: values.informationsSup,
      agentId: user.id,
      dureeEstimee: dureeEstimeeValue,    
      type: selectedTypeValue,
      data: dataObj,
    };
    }
    
    fd.append('demande', JSON.stringify(dto));

const fileFieldTypes = ['file', 'signature'];
formTemplate?.champs
  .filter(f => fileFieldTypes.includes(f.type))
  .forEach(f => {
    const file = values[f.nom];
    if (file) {

      fd.append(f.nom, file, file.name);
    }
  });

    try {
      await createDemande(fd).unwrap();
      form.reset();
      setSelectedType(null);
      setSelectedTypeValue(null);
      setFormTemplate(null);
      dispatch(resetDemandeState());
      toast.success('Demande soumise !');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (f) => {
    switch (f.type) {
      case 'text':
      case 'number':
        return (
          <FormField key={f.id} control={form.control} name={f.nom} render={({ field }) => (
            <FormItem>
              <FormLabel>{f.nom}{f.obligatoire && <span className="text-red-600">*</span>}</FormLabel>
              <FormControl>
                <Input type={f.type} {...field} placeholder={`Entrez ${f.nom}`} onChange={e => field.onChange(f.type==='number'?Number(e.target.value):e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        );
      case 'textarea':
        return (
          <FormField key={f.id} control={form.control} name={f.nom} render={({ field }) => (
            <FormItem>
              <FormLabel>{f.nom}{f.obligatoire && <span className="text-red-600">*</span>}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={`Entrez ${f.nom}`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        );
      case 'date':
        return (
          <FormField key={f.id} control={form.control} name={f.nom} render={({ field }) => (
            <FormItem>
              <FormLabel>{f.nom}{f.obligatoire && <span className="text-red-600">*</span>}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        );
      case 'checkbox':
        return (
          <FormField key={f.id} control={form.control} name={f.nom} render={({ field }) => {
            const vals = Array.isArray(field.value)?field.value:[];
            return (
              <FormItem>
                <FormLabel>{f.nom}{f.obligatoire && <span className="text-red-600">*</span>}</FormLabel>
                <div className="space-y-2 ml-4">
                  {f.options.map(opt => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <Checkbox checked={vals.includes(opt.valeur)} onCheckedChange={chk => field.onChange(chk?[...vals,opt.valeur]:vals.filter(v=>v!==opt.valeur))} />
                      <span>{opt.valeur}</span>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}/>
        );
      case 'radio':
        return (
          <FormField key={f.id} control={form.control} name={f.nom} render={({ field }) => (
            <FormItem>
              <FormLabel>{f.nom}{f.obligatoire && <span className="text-red-600">*</span>}</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                  {f.options.map(opt => (
                    <FormItem key={opt.id} className="flex items-center space-x-2">
                      <FormControl><RadioGroupItem value={opt.valeur} /></FormControl>
                      <FormLabel>{opt.valeur}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        );
      case 'select':
        return (
          <FormField key={f.id} control={form.control} name={f.nom} render={({ field }) => (
            <FormItem>
              <FormLabel>{f.nom}{f.obligatoire && <span className="text-red-600">*</span>}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value||''}>
                <FormControl><SelectTrigger><SelectValue placeholder={`Sélectionnez ${f.nom}`} /></SelectTrigger></FormControl>
                <SelectContent>{f.options.map(opt=><SelectItem key={opt.id} value={opt.valeur}>{opt.valeur}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}/>
        );
        
case "email":
  return (
    <FormField key={f.id} control={form.control} name={f.nom} render={({ field }) => (
      <FormItem>
        <FormLabel>
          {f.nom}{f.obligatoire && <span className="text-red-500 ml-1">*</span>}
        </FormLabel>
        <FormControl>
          <Input
            type="email"
            placeholder={`Entrez ${f.nom}`}
            {...field}
          />
        </FormControl>
        <FormMessage/>
      </FormItem>
    )}/>
  );
  case "color":
    return (
      <FormField key={f.id} control={form.control} name={f.nom} render={({ field }) => (
        <FormItem>
          <FormLabel>
            {f.nom}{f.obligatoire && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type="color"
              {...field}
            />
          </FormControl>
          <FormMessage/>
        </FormItem>
      )}/>
    );
    case 'url':
   return (
     <FormField key={f.id} control={form.control} name={f.nom}
       render={({ field }) => (
         <FormItem>
           <FormLabel>
             {f.nom}{f.obligatoire && <span className="text-red-500 ml-1">*</span>}
           </FormLabel>
           <FormControl>
             <Input
               type="url"
               placeholder={`Entrez ${f.nom}`}
               {...field}
               onBlur={e => {
                 let val = e.target.value;
                 if (val && !/^https?:\/\//i.test(val)) val = 'https://' + val;
                 field.onChange(val);
               }}
             />
           </FormControl>
           <FormMessage/>
         </FormItem>
       )}/>
   );

   case 'signature':
    return (
      <FormField key={f.id} control={form.control} name={f.nom}
        render={({ field }) => {
          const canvasRef = useRef(null);
          const [drawing, setDrawing] = useState(false);
  
          useEffect(() => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
          }, []);
  
          const coords = e => {
            const r = canvasRef.current.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
          };
  
          const start = e => {
            setDrawing(true);
            const { x, y } = coords(e);
            const ctx = canvasRef.current.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(x, y);
          };
  
          const draw = e => {
            if (!drawing) return;
            const { x, y } = coords(e);
            const ctx = canvasRef.current.getContext('2d');
            ctx.lineTo(x, y);
            ctx.stroke();
          };
  
          const end = () => {
            setDrawing(false);
            canvasRef.current.toBlob(blob => {
              const file = new File([blob], `${f.nom}.png`, { type: 'image/png' });
              field.onChange(file);
            });
          };
  
          const clear = (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            field.onChange(null);
          };
  
          return (
            <FormItem>
              <FormLabel>
                {f.nom}{f.obligatoire && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={150}
                  className="border border-gray-300 rounded-md"
                  onMouseDown={start}
                  onMouseMove={draw}
                  onMouseUp={end}
                  onMouseLeave={end}
                />
              </FormControl>
              <div className="flex space-x-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button"  
                  onClick={clear}
                >
                  Effacer
                </Button>
              </div>
              {field.value?.name && (
                <p className="text-green-600 text-sm mt-2">
                  Signature: {field.value.name}
                </p>
              )}
              <FormMessage/>
            </FormItem>
          );
        }}/>
    );
        case 'file':
          return (
            <FormField
              key={f.id}
              control={form.control}
              name={f.nom}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {f.nom}
                    {f.obligatoire && <span className="text-red-600 ml-1">*</span>}
                  </FormLabel>
        
                  <FormControl>
                    <Input
                      id={`${f.nom}-upload`}
                      type="file"
                      accept="*/*"
                      className="hidden"
                      onChange={(e) => field.onChange(e.target.files[0])}
                    />
                  </FormControl>
                  <Label htmlFor={`${f.nom}-upload`} className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Glissez et déposez ou cliquez pour sélectionner un fichier
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Taille maximale: 10MB
                      </p>
        
                      {field.value?.name && (
                        <p className="text-green-600 text-sm font-semibold text-center">
                          Fichier sélectionné: {field.value.name}
                        </p>
                      )}
                    </div>
                  </Label>
        
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        
      
      default:
        return null;
    }
  };

  return (
    <Card className="w-full shadow-xl rounded-lg border bg-white">
      <CardHeader className="bg-blue-50 p-4">
        <CardTitle className="text-2xl text-blue-700 font-bold flex items-center gap-2">
          <Send className="h-6 w-6" /> Créer une nouvelle demande
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-6">

            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Titre <span className="text-red-600">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="Entrez le titre" /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <div className="grid grid-cols-5 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="typeId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type <span className="text-red-600">*</span></FormLabel>
                  <Select onValueChange={handleTypeChange} value={field.value?.toString()||''}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger></FormControl>
                    <SelectContent> 
                      {isEmploye ? 
                        typeByRole?.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>) : 
                        typesNotNormal?.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="urgence" render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité <span className="text-red-600">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="moyen">Moyen</SelectItem><SelectItem value="pas urgent">Pas urgent</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormItem>
                <FormLabel>Attache à demande</FormLabel>
                <Select 
                  onValueChange={handelDemandeChange} 
                  value={selectedDemande ? selectedDemande.id.toString() : "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez demande" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Aucune demande sélectionnée</SelectItem>
                    {demandes?.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </div>
          
            <FormField control={form.control} name="justification" render={({ field }) => (
              <FormItem>
                <FormLabel>Justification <span className="text-red-600">*</span></FormLabel>
                <FormControl><Textarea {...field} placeholder="Expliquez la demande" rows={4} /></FormControl>
                <FormMessage />
              </FormItem>
              
            )}/>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4"><Info className="h-5 w-5 text-blue-500" /><h3 className="text-lg font-medium">Infos supplémentaires</h3></div>
                {formTemplate && (<div className="space-y-4">{formTemplate.champs.map(renderField)}</div> )}
                <FormField control={form.control} name="informationsSup" render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Informations supplémentaires</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Entrez des informations supplémentaires" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>
      
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={()=>form.reset()}>Annuler</Button>
              <Button
  type="submit"
  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
  disabled={!isFormValid()}
  isLoading={submitting || isLoading}
>
  <Send className="h-4 w-4 mr-2" />
  {submitting ? 'Soumission…' : 'Soumettre'}
</Button>            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
















