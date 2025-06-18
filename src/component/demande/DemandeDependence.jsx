
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Upload,Info,Send   } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useDispatch, useSelector } from "react-redux"
import { useGetTypesQuery, useGetFormulaireByTypeIdQuery,useGetTypesNotNormalQuery } from "../../Store/TypeSlice"
import { useCreateDemandeMutation } from "../../Store/demandeApiSlice "
import { resetDemandeState, selectDemandeStatus, selectDemandeError } from '../../Store/DemandeSlice';
import { useParams,useSearchParams,useNavigate} from "react-router-dom"
import { useRef } from "react";

import { ArrowLeft } from "lucide-react"

export default function DemandeDependence() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get("parentId");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTypeValue, setSelectedTypeValue] = useState(null); 
  const [formTemplate, setFormTemplate] = useState(null);
  const [selectTypeDate, setSelectTypeDate] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { data: requestType, error: typesError } = useGetTypesQuery();
  const { data: requestTypeNotNormal, error: typesErrorNotNormal } = useGetTypesNotNormalQuery();
  const { data: formTemplateData, error: formTemplateError, refetch: refetchFormTemplate } = useGetFormulaireByTypeIdQuery(selectedType, { skip: !selectedType });
  const [createDemande, { isLoading }] = useCreateDemandeMutation();
  const { isAuthenticated, user, token, roles, loading, error: authError } = useSelector((state) => state.auth);
  const demandeStatus = useSelector(selectDemandeStatus);
  const demandeError = useSelector(selectDemandeError);
  const dispatch = useDispatch();

  useEffect(() => {
    if (formTemplateData && formTemplateData.length > 0) {

      setFormTemplate(formTemplateData[0]);
    }
  }, [formTemplateData]);

  const createFormSchema = (template) => {
    if (!template)
      return z.object({
        title: z.string().min(1, "Le titre est requis"),
        urgence: z.enum(["urgent", "moyen", "pas urgent"]),
        justification: z.string().min(1, "La justification est requise"),
        typeId: z.number(),
        informationsSup: z.string().optional(),
        //depende : z.string().optional(),

          //confirmation: z.boolean().optional(),
        //depend: z.boolean().optional(),
      });

    const schemaFields = {
      title: z.string().min(1, "Le titre est requis"),
      urgence: z.enum(["urgent", "moyen", "pas urgent"]),
      justification: z.string().min(1, "La justification est requise"),
      typeId: z.number(),
      //depende : z.string().optional(),
      //depend: z.boolean().optional(),
    };

    template.champs.forEach((field) => {
      if (field.type === "text" || field.type === "textarea" || field.type === "url") {
        schemaFields[field.nom] = field.obligatoire
          ? z.string().min(1, `${field.nom} est requis`)
          : z.string().optional();
      } else if (field.type === "number" || field.type === "range") {
        schemaFields[field.nom] = field.obligatoire ? z.number().min(0) : z.number().optional();
      } else if (field.type === "date") {
        schemaFields[field.nom] = field.obligatoire ? z.date() : z.date().optional();
      } else if (field.type === "checkbox") {
        schemaFields[field.nom] = field.obligatoire
          ? z.array(z.string()).min(1, "Sélectionnez au moins une option")
          : z.array(z.string()).optional();
      } else if (field.type === "select" || field.type === "radio") {
        schemaFields[field.nom] = field.obligatoire
          ? z.string().min(1, "Sélectionnez une option")
          : z.string().optional();
      } else if (field.type === "file") {
        schemaFields[field.nom] = field.obligatoire ? z.any() : z.any().optional();
      }
    });

    return z.object(schemaFields);
  };

  const formSchema = createFormSchema(formTemplate);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      urgence: "moyen",
      justification: "",
      informationsSup: "",
      typeId: selectedType || 0,
      //depend: false,
    },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
  
    const dataObj = {};
    const fd = new FormData();
  
    if (formTemplate) {
      formTemplate.champs.forEach((field) => {
        if (field.type !== 'file' && field.type !== 'signature') {
          dataObj[field.nom] = values[field.nom];
        }
      });
    }
  
    const payload = {
      title: values.title,
      urgence: values.urgence,
      data: dataObj,
      parentId: parentId,
      justification: values.justification,
      inforSup: values.informationsSup, 
      agentId: user.id,
      dureeEstimee:selectTypeDate ,
      type: selectedTypeValue,
      //depend: values.depend||false,
    };
  
    fd.append('demande', JSON.stringify(payload));
  
    formTemplate?.champs
      .filter(f => ['file', 'signature'].includes(f.type))
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
      setFormTemplate(null);
      dispatch(resetDemandeState());
      navigate(-1);
      toast.success("Demande dependence soumise avec succès!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erreur lors de la soumission du formulaire");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTypeChange = (value) => {
    if (value === "1") {  
      setSelectedType(null); 
      setSelectTypeDate(15);
      setSelectedTypeValue("Normal");
      form.setValue("typeId", 1); 
      return;
    }
  
    const selected = requestTypeNotNormal?.find(type => type.id === Number(value)); 
    if (selected) {
      setSelectTypeDate(selected.dureeEstimee);
      setSelectedType(selected.id);
      setSelectedTypeValue(selected.name);
    }
    form.setValue("typeId", Number(value));
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
        

        // Email
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

        const clear = () => {
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
              <Button variant="outline" size="sm" onClick={clear}>
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
        
                  {/* Hidden input registered with React Hook Form */}
                  <FormControl>
                    <Input
                      id={`${f.nom}-upload`}
                      type="file"
                      accept="*/*"
                      className="hidden"
                      onChange={(e) => field.onChange(e.target.files[0])}
                    />
                  </FormControl>
        
                  {/* Visible drop area styled as a card */}
                  <Label htmlFor={`${f.nom}-upload`} className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Glissez et déposez ou cliquez pour sélectionner un fichier
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Taille maximale: 10MB
                      </p>
        
                      {/* Display the uploaded file name when available */}
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
          <Send className="h-6 w-6" /> Créer Demande De Dépendence
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
            <Button 
                variant="ghost" 
                className="mb-4" 
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> 
                {parentId ? "Retour aux détails de la demande" : "Retour au tableau de bord"}
            </Button>
            </div> 
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-6">
  
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Titre
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le titre de votre demande" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <FormField
                control={form.control}
                name="typeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type de demande
                      <span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <Select onValueChange={handleTypeChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent> 
                        {requestTypeNotNormal?.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Niveau de priorité
                      <span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une priorité" />
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
            </div>

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Justification de demande
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Fournissez des informations détaillées sur votre demande..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formTemplateError ? (
              <div className="text-destructive">Erreur lors du chargement du formulaire</div>
            ) : (
              selectedType &&
              formTemplate && (
                <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4"><Info className="h-5 w-5 text-blue-500" /><h3 className="text-lg font-medium">Infos supplémentaires</h3></div>
                <div className="space-y-4">{formTemplate.champs.map(renderField)}</div>
              </div>
              )
            )}

            

            <div className="text-sm text-muted-foreground mt-4">
              <span className="text-destructive">*</span> Champs obligatoires
            </div>

            <CardFooter className="px-0 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                Annuler
              </Button>
              <Button type="submit" disabled={submitting || (!selectedType && form.getValues("typeId") !== 1)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center">
                {submitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Soumission...
                  </>
                ) : (
                  "Soumettre la demande"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}