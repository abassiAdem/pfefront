import React, { useEffect,useState } from "react";
import { Download } from "lucide-react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge"

import { formatDate, cn} from "@/lib/utils";
import { useGetDemandeQuery,useUpdateInfoSupMutation } from "../../Store/demandeApiSlice ";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Timer, Activity, BarChart4, ClipboardList, Info, ArrowRight, User, AlertTriangle } from "lucide-react";
import {
  StatutDemande,
  statutLabels,
  statutClasses,
  urgenceLabels,
  urgenceClasses,
} from "@/Store/api";
import { Loader, Clock, Calendar, AlertCircle, FileText, Link, CheckCircle, XCircle,Pencil,Save  } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
const getMimeTypeFromB64 = (b64) => {
  if (typeof b64 !== "string") {
    return "application/octet-stream";
  }
  if (b64.startsWith("/9j/"))    return "image/jpeg";
  if (b64.startsWith("iVBOR"))   return "image/png";
  if (b64.startsWith("R0lGOD"))  return "image/gif";
  if (b64.startsWith("JVBERi0")) return "application/pdf";
  return "application/octet-stream";
}


const DetailDemande = ({
  demandeId,
  isOpen,
  onClose,
}) => {
  

  const { data: demande, isLoading, error } = useGetDemandeQuery(demandeId);
  const [updateInfoSup, { isLoading: isUpdating }] = useUpdateInfoSupMutation();
  const [editMode, setEditMode] = useState(false);
  const [infoSupValue, setInfoSupValue] = useState('');

  useEffect(() => {
    if (demande?.infoSup) {
   
      setInfoSupValue(demande.infoSup);
    }
  }, [demande])

const handleSaveInfoSup = async () => {
    if (infoSupValue.trim() === "") {
      toast("Veuillez saisir des informations supplémentaires avant de sauvegarder.");
      return;
    }
    try {
      await updateInfoSup({demandeId: demande.id, infoSup: infoSupValue }).unwrap();
      setEditMode(false);
      toast.success("Informations supplémentaires sauvegardées avec succès.");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des informations supplémentaires:", error);
      toast("Une erreur est survenue lors de la sauvegarde des informations supplémentaires.");
    }
  };
  if (!isOpen || !demandeId) return null;

  if (isLoading) {
    return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] min-h-[600px] p-0 overflow-hidden glass-card">
        <DialogHeader>
          <DialogTitle className="sr-only">Chargement des détails</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center h-full">
          <Loader className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2">Chargement des détails...</span>
        </div>
      </DialogContent>
    </Dialog>
    );
  }

  if (error || !demande) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Erreur</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-center">
              Une erreur est survenue lors du chargement des détails de la demande.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const renderDataValue = (value) => {
    if (value === null || value === undefined) return "-";
    
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="pill" className="bg-secondary">
              {item}
            </Badge>
          ))}
        </div>
      );
    }
    
    if (typeof value === "string" && value.startsWith("http")) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center"
        >
          {value.substring(0, 30)}...
          <Link className="h-3.5 w-3.5 ml-1" />
        </a>
      );
    }
    
    if (typeof value === "string" && value.includes("T")) {

      try {
        return formatDate(value);
      } catch (e) {

        return value;
      }
    }
    
    return String(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] p-0 overflow-hidden glass-card animate-fade-in">
      <DialogHeader className="p-6 pb-0 pr-20"> 
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center">
      <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
      <DialogTitle className="text-xl font-semibold">
        {demande.title || `Demande #${demande.id}`}
      </DialogTitle>
    </div>
    <div className="flex items-center gap-2"> 
      <Badge
        className={cn(
          "ml-2 max-w-[200px] truncate", 
          statutClasses[demande.statut] || "bg-secondary"
        )}
        title={statutLabels[demande.statut] || demande.statut} 
      >
        {statutLabels[demande.statut] || demande.statut}
      </Badge>
    </div>
  </div>
          <DialogDescription asChild  className="text-sm">
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Créée le {formatDate(demande.dateCreation)}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Date estimée: {formatDate(demande.dateEstime)}</span>
              </div>
              <div>
                <Badge
                  className={cn(
                    urgenceClasses[demande.urgence] || "bg-secondary"
                  )}
                >
                  {urgenceLabels[demande.urgence] || demande.urgence}
                </Badge>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="h-full">
          <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-3">
  <TabsTrigger value="details" className="custom-tab-trigger">Détails</TabsTrigger>
  <TabsTrigger value="realisation" className="custom-tab-trigger relative">
    Réalisation

  </TabsTrigger>
  <TabsTrigger value="dependances" className="custom-tab-trigger relative">
    Dépendances

  </TabsTrigger>
</TabsList>
          </div>
          
          <ScrollArea className="h-[calc(80vh-200px)] px-6 pb-6">
          <TabsContent value="details" className="mt-4 focus:outline-none">
  <div className="space-y-6 animate-slide-up">
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <ClipboardList className="h-5 w-5 mr-2 text-primary" />
          <CardTitle className="text-lg">Informations générales</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-background/70 p-4 rounded-lg shadow-sm border border-border/40">
          <h3 className="font-medium mb-2 flex items-center text-primary">
            <Info className="h-4 w-4 mr-2" />
            Type de demande
          </h3>
          <p className="pl-6">{demande.type || "-"}</p>
        </div>
        
        <div className="bg-background/70 p-4 rounded-lg shadow-sm border border-border/40">
          <h3 className="font-medium mb-2 flex items-center text-primary">
            <FileText className="h-4 w-4 mr-2" />
            Justification
          </h3>
          <p className="pl-6">{demande.justification || "-"}</p>
        </div>
      </CardContent>
    </Card>
    
    {demande.data && Object.keys(demande.data).length > 0 && (
  <Card className="bg-card/60 backdrop-blur-sm">
    <CardHeader className="pb-2">
      <div className="flex items-center">
        <Info className="h-5 w-5 mr-2 text-primary" />
        <CardTitle className="text-lg">Données complémentaires</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
  <div className="bg-background/70 rounded-lg divide-y border border-border/40">
    {Object.entries(demande.data).map(([key, value]) => {
      // Generate a human‑readable label.
      const label = key
        .replace("champ", "")
        .split(/(?=[A-Z])/)
        .join(" ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());

      // 1) Check if it's our file‑wrapper object.
      if (
        value &&
        typeof value === "object" &&
        typeof value.data === "string" &&
        typeof value.contentType === "string" &&
        typeof value.fileName === "string"
      ) {
        const { data: b64, contentType, fileName } = value;
        return (
          <div key={key} className="grid grid-cols-3 gap-4 p-3">
            <div className="font-medium text-sm text-muted-foreground col-span-1">
              {label}
            </div>
            <div className="col-span-2">
              <a
                href={`data:${contentType};base64,${b64}`}
                download={fileName}
                className="text-blue-600 hover:underline flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Télécharger {fileName}
              </a>
            </div>
          </div>
        );
      }

      // 2) Otherwise, if it's a raw Base64 string (for images/PDF), detect via MIME.
      if (typeof value === "string") {
        const mime = getMimeTypeFromB64(value);
        if (mime !== "application/octet-stream") {
          const ext = mime.split("/")[1];
          return (
            <div key={key} className="grid grid-cols-3 gap-4 p-3">
              <div className="font-medium text-sm text-muted-foreground col-span-1">
                {label}
              </div>
              <div className="col-span-2">
                <a
                  href={`data:${mime};base64,${value}`}
                  download={`${key.replace(/\s+/g, "_")}.${ext}`}
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger {label}
                </a>
              </div>
            </div>
          );
        }
      }
      return (
        <div key={key} className="grid grid-cols-3 gap-4 p-3">
          <div className="font-medium text-sm text-muted-foreground col-span-1">
            {label}
          </div>
          <div className="col-span-2">
            {renderDataValue(value)}
          </div>
        </div>
      );
    })}
  </div>
</CardContent>

  </Card>
)}

    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          <CardTitle className="text-lg">Dates et Statut</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-background/70 rounded-lg divide-y border border-border/40">
          <div className="grid grid-cols-3 gap-4 p-3">
            <div className="font-medium text-sm text-primary/80 col-span-1">Statut actuel</div>
            <div className="col-span-2">
              <Badge
                className={cn(
                  statutClasses[demande.statut] || "bg-secondary"
                )}
              >
                {statutLabels[demande.statut] || demande.statut}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 p-3">
            <div className="font-medium text-sm text-primary/80">Date de création</div>
            <div className="col-span-2">{formatDate(demande.dateCreation)}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 p-3">
            <div className="font-medium text-sm text-primary/80">Date de prise en charge</div>
            <div className="col-span-2">{demande.dateEnCours ? formatDate(demande.dateEnCours) : "Non démarré"}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 p-3">
            <div className="font-medium text-sm text-primary/80">Date de clôture</div>
            <div className="col-span-2">{demande.dateTerminee ? formatDate(demande.dateTerminee) : "Non terminée"}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 p-3">
            <div className="font-medium text-sm text-primary/80">Date estimée</div>
            <div className="col-span-2">{formatDate(demande.dateEstime)}</div>
          </div>
        </div>
      </CardContent>
    </Card>

            {(demande.infoSup !== undefined || editMode) && (
                  <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                          <CardTitle className="text-lg">Informations supplémentaires</CardTitle>
                        </div>
                        <div>
                          {!editMode ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1" 
                              onClick={() => setEditMode(true)}
                            >
                              <Pencil className="h-4 w-4" />
                              Modifier
                            </Button>
                          ) : (
                            <Button 
                             
                              size="sm" 
                              className="flex items-center gap-1 bg-[#003b7e] hover:bg-[#00326a] text-white"
                              onClick={handleSaveInfoSup}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <>
                                  <Loader className="h-3 w-3 animate-spin mr-2" />
                                  Sauvegarde...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Sauvegarder
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-background/70 p-4 rounded-lg border border-border/40">
                        {!editMode ? (
                          <p className="pl-6">{demande.infoSup || "-"}</p>
                        ) : (
                          <Textarea
                            value={infoSupValue}
                            onChange={(e) => setInfoSupValue(e.target.value)}
                            className="min-h-[120px]"
                            placeholder="Saisissez des informations supplémentaires..."
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
  </div>
</TabsContent>
            
            <TabsContent value="dependances" className="mt-4 focus:outline-none">
              <div className="animate-slide-up">
                {demande.dependentDemandes && demande.dependentDemandes.length > 0 ? (
                  <div className="space-y-4">
                    {demande.dependentDemandes.map((dep) => (
                      <div key={dep.id} className="bg-secondary/30 p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">
                            {dep.title || `Demande #${dep.id}`}
                          </div>
                          <Badge
                            className={cn(
                              statutClasses[dep.statut] || "bg-secondary"
                            )}
                          >
                            {statutLabels[dep.statut] || dep.statut}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">Type</div>
                            <div>{dep.type || "-"}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Urgence</div>
                            <Badge
                              size="sm"
                              className={cn(
                                urgenceClasses[dep.urgence] || "bg-secondary"
                              )}
                            >
                              {urgenceLabels[dep.urgence] || dep.urgence}
                            </Badge>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Date de création</div>
                            <div>{formatDate(dep.dateCreation)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Date estimée</div>
                            <div>{formatDate(dep.dateEstime)}</div>
                          </div>
                        </div>
                        
                        {dep.data && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="text-muted-foreground text-sm mb-1">Données</div>
                            <div className="text-sm">
                              {Object.entries(dep.data).map(([key, value], i, arr) => (
                                <React.Fragment key={key}>
                                  <span className="font-medium">{key}</span>: {String(value)}
                                  {i < arr.length - 1 && <span className="mx-2">•</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {dep.justification && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="text-muted-foreground text-sm mb-1">Justification</div>
                            <div className="text-sm">{dep.justification}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                    <p className="text-center">
                      Cette demande n'a pas de dépendances associées.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="realisation" className="mt-4 focus:outline-none">
  <div className="animate-slide-up space-y-6">

    <Card className="bg-card/60 backdrop-blur-sm overflow-hidden border border-border/60">
      <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="flex items-center">
          <User className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-lg">Informations du réalisateur</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="bg-background/80 dark:bg-background/20 rounded-lg p-4 border border-border/40">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center border-b pb-2 border-border/30">
              <span className="font-medium text-sm text-primary/80">Nom du réalisateur</span>
              <span className="font-medium">{demande.realisateurName || "-"}</span>
            </div>
            
            <div className="flex justify-between items-center border-b pb-2 border-border/30">
              <span className="font-medium text-sm text-primary/80">Durée de travail</span>
              <span className="font-medium">{demande.dureeTravailRealisateur}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-card/60 backdrop-blur-sm overflow-hidden border border-border/60">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center">
          <Timer className="h-5 w-5 text-amber-500 mr-2" />
          <CardTitle className="text-lg">Analyse des délais</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background/80 dark:bg-background/20 shadow-sm border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium">Création → Acceptation</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                {demande.delayCreationAccept || 0}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Délai entre la création et l'acceptation de la demande
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-background/80 dark:bg-background/20 shadow-sm border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-indigo-500" />
                <span className="text-sm font-medium">Acceptation → En cours</span>
              </div>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700">
                {demande.delayAcceptEnCours || 0}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Délai entre l'acceptation et la mise en œuvre
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background/80 dark:bg-background/20 shadow-sm border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                <span className="text-sm font-medium">Retard dépendances</span>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700">
                {demande.dureeRetardDependence || 0}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Retard causé par les dépendances
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-background/80 dark:bg-background/20 shadow-sm border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm font-medium">Retard total</span>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "border",
                  demande.totalMainDelay > 48 
                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700" 
                    : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                )}
              >
                {demande.totalMainDelay || 0}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Retard total dans le traitement de la demande
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-card/60 backdrop-blur-sm overflow-hidden border border-border/60">
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-50/30 to-blue-50/30 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center">
          <BarChart4 className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-lg">Résumé visuel des délais</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="bg-background/80 dark:bg-background/20 rounded-lg p-4 border border-border/40">
          <div className="space-y-4">
            <div className="w-full">
              <div className="flex justify-between mb-1 text-xs">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span>Création → Acceptation</span>
                </div>
                <span className="font-medium">{demande.delayCreationAccept || 0}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (demande.delayCreationAccept || 0) / 2)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="w-full">
              <div className="flex justify-between mb-1 text-xs">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                  <span>Acceptation → En cours</span>
                </div>
                <span className="font-medium">{demande.delayAcceptEnCours || 0}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                  className="bg-indigo-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (demande.delayAcceptEnCours || 0) / 2)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="w-full">
              <div className="flex justify-between mb-1 text-xs">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                  <span>Retard dépendances</span>
                </div>
                <span className="font-medium">{demande.dureeRetardDependence || 0}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (demande.dureeRetardDependence || 0) / 2)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="w-full">
              <div className="flex justify-between mb-1 text-xs">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: demande.totalMainDelay > 48 ? '#ef4444' : '#22c55e' }}></span>
                  <span>Retard total</span>
                </div>
                <span className="font-medium">{demande.totalMainDelay}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${demande.totalMainDelay > 48 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, (demande.totalMainDelay || 0) / 2)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};



DetailDemande.propTypes = {
  demandeId: PropTypes.number,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DetailDemande;