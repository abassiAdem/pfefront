import React, { useRef, useState, useEffect,useMemo } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form";
import * as z from "zod"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Info, Pencil,Loader2,Loader,Upload,CheckCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useDispatch,useSelector} from "react-redux"
import { updateDemande } from "../../Store/DemandeSlice"
import { useUpdateDemandeMutation } from "../../Store/demandeApiSlice "
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {toast } from "sonner"
import { FileIcon,Download} from "lucide-react"
import { useGetFormulaireByTypeNameQuery } from "../../Store/TypeSlice"


export function UpdateDemandeDialog({ isOpen, onClose, demande }) {
  const {user} = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [updateDemandeMutation, { isLoading }] = useUpdateDemandeMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
 
    }
   } , [isOpen]);

  const { data: formTemplateData, error: formTemplateError, isLoading: isTemplateLoading } = 
    useGetFormulaireByTypeNameQuery(demande.type);
    const isNormalType = demande?.type == "Normal" ;
  const formTemplate = formTemplateData?.[0];

  const templateFieldNames = formTemplate?.champs?.map(field => field.nom) || [];



  const getInitialValues = () => {
    const baseValues = {
      title: demande?.title || "",
      urgence: demande?.urgence || "moyen",
      justification: demande?.justification || "",
      typeId: demande?.typeId || 0,
      informationsSup: demande?.infoSup || "",
    };

    if (formTemplate) {
      formTemplate.champs.forEach(field => {
        if (baseValues[field.nom] === undefined) {
          if (field.type === "checkbox") {
            baseValues[field.nom] = [];
          } else if (field.type === "number" || field.type === "range") {
            baseValues[field.nom] = 0;
          } else {
            baseValues[field.nom] = "";
          }
        }
      });
    }

    if (demande?.data && formTemplate) {
      formTemplate.champs.forEach(field => {
        const fieldValue = demande.data[field.nom];
        if (fieldValue !== undefined) {
          if (field.type === "checkbox") {
            baseValues[field.nom] = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
          } else if (field.type === "date" && fieldValue) {
            baseValues[field.nom] = fieldValue instanceof Date ? fieldValue : new Date(fieldValue);
          } else if (field.type === "number" || field.type === "range") {
            baseValues[field.nom] = Number(fieldValue);
          } else {
            baseValues[field.nom] = fieldValue;
          }
        }
      });
    }
    
    return baseValues;
  };
 
  const FileMeta = z.object({
    data:        z.string(),   // the Base64 payload
    contentType: z.string(),   // e.g. "text/plain"
    fileName:    z.string(),   // e.g. "notes.txt"
  });
  const dynamicFormSchema = useMemo(() => {
    const baseSchema = z.object({
      title: z.string().min(1),
      urgence: z.string(),
      justification: z.string().min(1),
      informationsSup: z.string().optional(),
    });
  
    if (!formTemplate) return baseSchema;
  
    return formTemplate.champs.reduce((schema, field) => {
      if (['title', 'urgence', 'justification', 'informationsSup'].includes(field.nom)) {
        return schema;
      }
  
      let fieldSchema;
      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'url':
        case 'email':
          fieldSchema = field.obligatoire 
            ? z.string().min(1, { message: "Ce champ est requis" }) 
            : z.string().optional();
          break;
        case 'number':
        case 'range':
          fieldSchema = z.number();
          if (field.obligatoire) fieldSchema = fieldSchema.min(0);
          break;
        case 'checkbox':
          fieldSchema = z.array(z.string()).optional();
          break;
        case 'date':
          fieldSchema = z.date().optional();
          break;
          case 'file':
          case 'signature': 
              fieldSchema = z.union([
                z.instanceof(File), 
                FileMeta
              ]).optional();
              break;
            default:
              fieldSchema = z.any().optional();
          }
      
          return schema.extend({ [field.nom]: fieldSchema });
        }, baseSchema);
  }, [formTemplate]);

  const form = useForm({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: getInitialValues(),
    shouldUnregister: true, 
  });


  useEffect(() => {
    if (formTemplate && demande) {
      form.reset(getInitialValues());
    }
  }, [formTemplate, demande,form]);

  

  if (isTemplateLoading || !formTemplate) {
    return <div>Loading form template...</div>;
  }

  if (formTemplateError) {
    return <div>Error loading form template</div>;
  }

  const renderDynamicFields = () => {
    if (!formTemplate || isNormalType ) return null;

    return formTemplate.champs
    .filter(field => {

      return  !['title', 'urgence', 'justification','informationsSup'].includes(field.nom);
    })
      .map((field) => {
        switch (field.type) {
          case "text":
          case "number":
          case "url":
            return (
              <FormField
                key={field.id}
                control={form.control}
                name={field.nom}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>
                      {field.nom}
                      {field.obligatoire && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={field.type}
                        placeholder={`Entrez ${field.nom}`}
                        {...formField}
                        onChange={(e) => {
                          if (field.type === "number") {
                            formField.onChange(e.target.value ? Number(e.target.value) : "")
                          } else {
                            formField.onChange(e.target.value)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )

          case "textarea":
            return (
              <FormField
                key={field.id}
                control={form.control}
                name={field.nom}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>
                      {field.nom}
                      {field.obligatoire && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder={`Entrez ${field.nom}`} {...formField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )

            case "date":
              return (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={field.nom}
                  render={({ field: formField }) => {
                    const dateValue = formField.value ? new Date(formField.value) : null;
                    const formattedDate = dateValue ? dateValue.toISOString().split('T')[0] : '';
                    
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          {field.nom}
                          {field.obligatoire && <span className="text-destructive ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          <input
                            type="date"
                            value={formattedDate}
                            onChange={(e) => {
                              const date = e.target.value ? new Date(e.target.value) : null;
                              formField.onChange(date);
                            }}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              );
              case 'signature':
                return (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={field.nom}
                    render={({ field: formField }) => {
                      const canvasRef = useRef(null);
                      const [drawing, setDrawing] = useState(false);
                      const [hasSigned, setHasSigned] = useState(false);
              
                      useEffect(() => {
                        const canvas = canvasRef.current;
                        if (!canvas) return;
              
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.strokeStyle = '#000000';
                        ctx.lineWidth = 2;
                        ctx.lineCap = 'round';
              
                        if (demande?.data?.[field.nom]) {
                          const img = new Image();
                          img.onload = () => {
                            ctx.drawImage(img, 0, 0);
                            setHasSigned(true);
                          };
                          img.src = demande.data[field.nom];
                        }
                      }, [field.nom]);
              
                      const startDrawing = (e) => {
                        setDrawing(true);
                        const ctx = canvasRef.current.getContext('2d');
                        const rect = canvasRef.current.getBoundingClientRect();
                        ctx.beginPath();
                        ctx.moveTo(
                          e.clientX - rect.left,
                          e.clientY - rect.top
                        );
                      };
              
                      const draw = (e) => {
                        if (!drawing) return;
                        const ctx = canvasRef.current.getContext('2d');
                        const rect = canvasRef.current.getBoundingClientRect();
                        ctx.lineTo(
                          e.clientX - rect.left,
                          e.clientY - rect.top
                        );
                        ctx.stroke();
                      };
              
                      const stopDrawing = () => {
                        if (drawing) {
                          setDrawing(false);
                          setHasSigned(true);
                          canvasRef.current.toBlob((blob) => {
                            if (blob) {
                              const file = new File([blob], `${field.nom}-signature.png`, {
                                type: 'image/png'
                              });
                              formField.onChange(file);
                            }
                          }, 'image/png');
                        }
                      };
              
                      const clearSignature = () => {
                        const canvas = canvasRef.current;
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        formField.onChange(null);
                        setHasSigned(false);
                      };
              
                      return (
                        <FormItem>
                          <FormLabel>
                            {field.nom}
                            {field.obligatoire && <span className="text-destructive ml-1">*</span>}
                          </FormLabel>
                          <div className="border rounded-md p-2">
                            <canvas
                              ref={canvasRef}
                              width={300}
                              height={150}
                              className="border border-gray-300 rounded-md bg-white cursor-crosshair"
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={(e) => {
                                e.preventDefault();
                                startDrawing(e.touches[0]);
                              }}
                              onTouchMove={(e) => {
                                e.preventDefault();
                                draw(e.touches[0]);
                              }}
                              onTouchEnd={stopDrawing}
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearSignature}
                              >
                                Effacer
                              </Button>
                              {hasSigned && (
                                <span className="text-sm text-green-600 flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Signature fournie
                                </span>
                              )}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                );
               
               
                case 'file':
  return (
    <FormField
      key={field.id}
      control={form.control}
      name={field.nom}
      render={({ field: formField }) => { 
        useEffect(() => {
          const meta = demande?.data?.[field.nom];
          if (meta && !formField.value) { 
            formField.onChange(meta);
          }
        }, [demande?.data, field.nom, formField]);

        // 2) When user picks a new file:
        const [newFileUrl, setNewFileUrl] = useState(null);
        const handleFileChange = (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          formField.onChange(file);             
          setNewFileUrl(URL.createObjectURL(file));
        };

        // 3) Inspect the current value:
        const value = formField.value;
        const isNewFile = value instanceof File;
        const metaParse = FileMeta.safeParse(value);
        const isExistingMeta = metaParse.success;

        // 4) Build href + filename for download
        let href, downloadName;
if (isNewFile) {
  href         = URL.createObjectURL(value);
  downloadName = value.name;
} else if (isExistingMeta) {
  const { data, contentType, fileName } = metaParse.data;
  href         = `data:${contentType};base64,${data}`;
  downloadName = fileName;
}

        return (
          <FormItem>
            <FormLabel>
              {field.nom}
              {field.obligatoire && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <div className="space-y-2">
 
                {href && downloadName && (
                  <div className="mt-2">
                    <a
                      href={href}
                      download={downloadName}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger {downloadName}
                    </a>
                  </div>
                )}
 
                {isNewFile && (
                  <p className="text-green-600 text-sm font-semibold text-center">
                    Fichier sélectionné : {value.name}
                  </p>
                )}
 
                <Label
                  htmlFor={`${field.nom}-upload`}
                  className="cursor-pointer"
                >
                  <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-2 hover:border-primary/50">
                    <Upload className="h-5 w-5" />
                    <p className="text-sm">
                      {href ? 'Remplacer le fichier' : 'Télécharger un fichier'}
                    </p>
                  </div>
                </Label>
                <Input
                  id={`${field.nom}-upload`}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );

               
                 case "color":
                   return (
                     <FormField key={field.id} control={form.control} name={field.nom} render={({ field }) => (
                       <FormItem>
                         <FormLabel>
                           {field.nom}{field.obligatoire && <span className="text-red-500 ml-1">*</span>}
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

               
                case "email":
                  return (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={field.nom}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>
                            {field.nom}
                            {field.obligatoire && <span className="text-destructive ml-1">*</span>}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@exemple.com"
                              {...formField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
          case "select":
            return (
              <FormField
                key={field.id}
                control={form.control}
                name={field.nom}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>
                      {field.nom}
                      {field.obligatoire && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Sélectionnez ${field.nom}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option.id} value={option.valeur}>
                            {option.valeur}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )

          case "radio":
            return (
              <FormField
                key={field.id}
                control={form.control}
                name={field.nom}
                render={({ field: formField }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>
                      {field.nom}
                      {field.obligatoire && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={formField.onChange}
                        value={formField.value}
                        className="flex flex-col space-y-1"
                      >
                        {field.options.map((option) => (
                          <FormItem key={option.id} className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value={option.valeur} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.valeur}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );

          case "checkbox":
            return (
              <FormField
                key={field.id}
                control={form.control}
                name={field.nom}
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        {field.nom}
                        {field.obligatoire && <span className="text-destructive ml-1">*</span>}
                      </FormLabel>
                    </div>
                    {field.options.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name={field.nom}
                        render={({ field: formField }) => {
                          return (
                            <FormItem key={option.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={formField.value?.includes(option.valeur)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = formField.value || []
                                    return checked
                                      ? formField.onChange([...currentValue, option.valeur])
                                      : formField.onChange(currentValue.filter((value) => value !== option.valeur))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{option.valeur}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )

          case "range":
            return (
              <FormField
                key={field.id}
                control={form.control}
                name={field.nom}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>
                      {field.nom}
                      {field.obligatoire && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          defaultValue={[formField.value || 0]}
                          onValueChange={(values) => {
                            formField.onChange(values[0])
                          }}
                        />
                        <div className="text-center text-sm text-muted-foreground">{formField.value || 0}</div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )


          default:
            return null
        }
      }).filter(Boolean);
  };
  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
       
      const fd = new FormData();
       
      const dataObj = {};
       
      Object.keys(values).forEach(key => { 
        if (!['title', 'urgence', 'justification','informationsSup'].includes(key)) {
          const fieldConfig = formTemplate.champs.find(f => f.nom === key);
          const currentValue = values[key];
 
        if (fieldConfig?.type === 'file' || fieldConfig?.type === 'signature') {
          if (currentValue instanceof File) {
  
            fd.append(key, currentValue, currentValue.name);
          } else if (demande?.data?.[key]) { 
            dataObj[key] = demande.data[key];
          }
        } else {
          dataObj[key] = currentValue;
        }
      }
    });
      
      // Create the DTO
      const dto = {
        id: demande.id,
        title: values.title,
        urgence: values.urgence,
        justification: values.justification,
        infoSup: values.informationsSup,
        data: dataObj,
        type: values.type,
        agentId: user.id
      };
      
      fd.append('demande', JSON.stringify(dto));
      
      formTemplate?.champs
        .filter(f => ['file', 'signature'].includes(f.type))
        .forEach(f => {
          const file = values[f.nom];
          if (file instanceof File) {
            fd.append(f.nom, file, file.name);
          }
        });
      const response = await updateDemandeMutation({
        id: demande.id,
        demandeDTO: fd  
      }).unwrap();
      
      toast.success("Demande mise à jour avec succès");
      onClose();
    } catch (err) {
      console.error("Full error:", err);
      toast.error(`Échec: ${err.data?.message || err.message || "Erreur inconnue"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-xl shadow-lg">
      <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
             <div className="text-sm ">
               <Pencil className="h-6 w-6 text-primary" />
                 Modifier la demande
               </div>
          </DialogTitle>
          <DialogDescription  className="text-gray-600">
            Modifiez les informations de la demande ci-dessous.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
        <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            encType="multipart/form-data" 
            className="space-y-6 p-4"
          >


            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">
                    Titre <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      autoFocus 
                      placeholder="Ex: Mise à jour du système" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urgence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">
                    Urgence <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un niveau d'urgence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="pas urgent">Pas urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">
                    Justification <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez la raison de cette demande"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="informationsSup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">
                  Informations supplémentaires 
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez la raison de cette demande"
                      className="min-h-[100px]"
                      rows={2} 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {!isNormalType && formTemplate && renderDynamicFields().length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">
                  Informations supplémentaires
                </h3>
                <div className="space-y-4">{renderDynamicFields()}</div>
              </div>
            )}

            <DialogFooter className="flex justify-end gap-2">
              <Button className="bg-[#003b7e] hover:bg-[#00326a] text-white" type="button" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" className="bg-[#003b7e] hover:bg-[#00326a] text-white"  >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}