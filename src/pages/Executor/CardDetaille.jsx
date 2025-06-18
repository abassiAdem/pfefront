import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import DetailDemande from "../../component/responsable/DetailDemande";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  CheckCircle,
  FileText,
  Users,
  Timer,
  User,
  ClipboardList,
  MessageCircle,
  ChevronRight,
  Edit,
  BarChart3,
  RotateCw,
  Send,
  AlertTriangle,
  Clock,Link,PlusCircle,Plus,Activity,ArrowRight,BarChart,Download
} from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox"

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import StatusBadge from '../../component/executor/StatusBadgeService';
import UrgenceBadge from '../../component/executor/UrgenceBadge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGetDemandeQuery,useAdjustDateEstimeeMutation,useCompleteDemandeMutation,useUpdateDataDependenceMutation,useSetStatusAffecteeMutation,useStartDemandeMutation} from '../../Store/demandeApiSlice ';
import {useCreateInformationRequestMutation,} from '../../Store/notificationQuerySlice';
import { Info,Mail,Phone,PlayCircle,ArrowUpRight } from 'lucide-react';
import { useSelector,useDispatch } from 'react-redux';
import {StatutDemande} from '../../Store/api';
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return '-';
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      return '-';
    }
  };

  
  function calculateProgression(demande) {
    // Si la demande est terminée, retourner 100%
    if (demande.statut === 'TERMINEE') {
      return 100;
    }
    
    // Si la demande est en cours et a une date estimée
    if (demande.dateEnCours && demande.dateEstime) {
      const startDate = new Date(demande.dateEnCours).setHours(0, 0, 0, 0);
      const endDate = new Date(demande.dateEstime).setHours(0, 0, 0, 0);
      const currentDate = new Date().setHours(0, 0, 0, 0);
      
      // Calculer la durée totale en millisecondes
      const totalDuration = endDate - startDate;
      
      // Calculer la durée écoulée en millisecondes
      const elapsedDuration = currentDate - startDate;
      
      // Si la date actuelle est avant la date de début, retourner 0%
      if (elapsedDuration < 0) {
        return 0;
      }
      
      // Calculer le pourcentage d'avancement
      const progressPercentage = (elapsedDuration / totalDuration) * 100;
      
      // Limiter le pourcentage à 100% maximum même si on a dépassé la date estimée
      return Math.min(100, Math.round(progressPercentage));
    }
    
    // Fallback aux statuts si les dates ne sont pas disponibles
    const statusWeights = {
      'CREEE': 0,
      'ACCEPTEE': 10,
      'EN_COURS': 30,
      'TERMINEE': 100
    };
    
    return statusWeights[demande.statut] || 0;
  }
  

  function getProgressionColor(demande) {
    const progression = calculateProgression(demande);
    
    if (demande.dateEstime && new Date() > new Date(demande.dateEstime) && demande.statut !== 'TERMINEE') {
      return "bg-orange-500";
    }
    
    if (progression < 30) return "bg-yellow-500"; 
    if (progression < 70) return "bg-blue-500";    
    return "bg-green-600";                        
  }
  
const CardDetaille = () => {
 const  [selectedDemandeId, setSelectedDemandeId] = React.useState(null);
    const [adjustdateEstime] = useAdjustDateEstimeeMutation();
    const [createInformationRequest] = useCreateInformationRequestMutation();
    const [completeDemande] = useCompleteDemandeMutation();
    const [updatingDemande] = useStartDemandeMutation();
    const [updateDataDependence] = useUpdateDataDependenceMutation();
    const [affectee]=useSetStatusAffecteeMutation();
    const navigate = useNavigate();
    const { id } = useParams();
    const {user}=useSelector((state) => state.auth);
    const { data: demande, isLoading, error } = useGetDemandeQuery(id);
    console.log("demande",demande);
    const [estimatedDate, setEstimatedDate] = useState(demande?.dateEstime ? format(new Date(demande.dateEstime), 'yyyy-MM-dd') : '');
    const [infoRequest, setInfoRequest] = useState('');
    const [updating, setUpdating] = useState(false);
    //const [activeTab, setActiveTab] = useState('details');
    const [activeTab, setActiveTab] = useState('nothing');
    const mettreAJourRef = useRef(null);
    const demanderInfoRef = useRef(null);
  
    useEffect(() => {
      if (activeTab === 'mettre-a-jour' && mettreAJourRef.current) {
        mettreAJourRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (activeTab === 'demander-info' && demanderInfoRef.current) {
        demanderInfoRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [activeTab]);
  
    
  
    
    const getTypeName = () => {
      if (!demande) return "Non défini";
      
      if (typeof demande.type === 'string') {
        return demande.type;
      } else if (demande.type?.name) {
        return demande.type.name;
      }
      return "Non défini";
    };
    const handleCreateDependentDemande = () => {

      navigate(`/realisateur/create-demande?parentId=${demande.id}`);
    };
    const handleUpdateEstimatedDate = async () => {

      try {
              await adjustdateEstime({
                demandeId: demande.id,
                newEstimated: estimatedDate 
              }).unwrap()
      
              toast.success("Date estimée mise à jour avec succès");
            } catch (error) {
              toast.error("Erreur lors de la mise à jour de la date");
            } finally {
              setUpdating(false);
            }
          };
    const getMimeTypeFromB64 = (b64) => {
      if (b64.startsWith("/9j/")) return "image/jpeg";
      if (b64.startsWith("iVBOR")) return "image/png";
      if (b64.startsWith("R0lGOD")) return "image/gif";
      if (b64.startsWith("JVBERi0")) return "application/pdf";
      return "application/octet-stream";
    };
    
    const renderDataField = (key, value) => {
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
    
      let content = value;
      let Icon = Info;
    
      if (typeof value === "string") { 
        if (key.toLowerCase().includes("telephone")) {
          Icon = Phone;
          content = `+216 ${value}`;
        } else { 
          const mime = getMimeTypeFromB64(value);
          if (mime !== "application/octet-stream") {
            const ext = mime.split("/")[1] || "bin";
            content = (
              <a
                href={`data:${mime};base64,${value}`}
                download={`${formattedKey.replace(/\s+/g, "_")}.${ext}`}
                className="text-blue-600 hover:underline flex items-center"
              >
                <Download className="h-4 w-4 mr-1" /> Télécharger {formattedKey}
              </a>
            );
          } else if (value.startsWith("http")) {
          
            content = (
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
          } else if (value.includes("@")) {
            
            Icon = Mail;
            content = value;
          }
        }
      } else if (typeof value === "object" && value !== null) {
        content = JSON.stringify(value);
      }
    
      return (
        <div key={key} className="p-4 bg-gray-50 rounded-lg mb-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formattedKey}</span>
          </div>
          <div className="pl-6 text-sm">{content}</div>
        </div>
      );
    };
    const handleUpdateDataDependence = async (id) => {
      if(!id) return;
      setUpdating(true);
      try {
        await updateDataDependence(id).unwrap();
        toast.success("Demande de dépendance mises à jour avec succès");
      } catch (error) {
        toast.error("Erreur lors de la mise à jour des données de dépendance");
      } finally {
        setUpdating(false);
      }
    
    }

    const handleCompleteDemande = async () => {
      if (!demande) return;
      
      setUpdating(true);
      try {
        await completeDemande(demande.id).unwrap();

      } catch (error) {
        toast.error("Erreur lors de la mise à jour du statut");
      } finally {
        setUpdating(false);
      }
    };
    const handleStartDemande = async () => {
      if (!demande) return;
      
      setUpdating(true);
      try {
        await updatingDemande(demande.id).unwrap();

      } catch (error) {
        toast.error("Erreur lors de la mise à jour du statut");
      } finally {
        setUpdating(false);
      }
    };
    

    const handleSendInfoRequest = async () => {
      if (!demande || !infoRequest.trim()) return;
  
      try {
        const ob={
          demandeId: demande.id,
          message: infoRequest,
          requesterId:user.id,
          isRead: false,
        } 
        await createInformationRequest(ob).unwrap();
  
        toast.success("Demande d'information envoyée avec succès");
        setInfoRequest('');
      } catch (error) {
        console.error("Erreur lors de l'envoi de la demande d'information:", error);
      } finally {
        console.log("finally");
      }
    };
  



    if (!demande) {
        return (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Demande non trouvée</h2>
            <p className="text-muted-foreground">La demande que vous cherchez n'existe pas ou a été supprimée.</p>
            <Button onClick={() => navigate('/realisateur')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
            </Button>
          </div>
        );
      }
    
  return (
    <div className="min-h-screen flex flex-col bg-background"> 
      <main className="flex-1 container px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/realisateur')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
          </Button>

            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <StatusBadge status={demande.statut} />
                      <span className="text-sm text-muted-foreground font-medium">
                        ID: {demande.id}
                      </span>
                      {demande.dateCreation && (
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Créé le: {formatShortDate(demande.dateCreation)}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold">{demande.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <UrgenceBadge urgence={demande.urgence} />
                      <span className="px-2 py-0.5 bg-secondary/70 rounded text-xs font-medium flex items-center gap-1">
                        <FileText size={12} />
                        {getTypeName()}
                      </span>
                    </div>
                    
                  </div>
                  <div className="flex gap-2 md:flex-col">
                      {demande.statut === 'AFFECTEE' || demande.statut==='EN_ATTENTE_DE_DEPENDENCE' ? (
                            <Button 
                                     onClick={handleStartDemande} 
                                     className="shrink-0 bg-amber-600 hover:bg-amber-700"
                                    disabled={updating}
                                              >
                                     {updating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                                )}
                                   Lancer le service
                              </Button>
                      ) : demande.statut !== "TERMINEE" ? (
                          <Button 
                            onClick={handleCompleteDemande} 
                            className="shrink-0 bg-green-600 hover:bg-green-700"
                            disabled={updating}
                          >
                            {updating ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Marquer comme terminée
                          </Button>
                      ) : null}
    
                           {  demande.statut !== "TERMINEE" && (
                                            <Button 
                                              onClick={handleCreateDependentDemande} 
                                              className="shrink-0 bg-blue-600 hover:bg-blue-700"
                                            >
                                              <Link className="mr-2 h-4 w-4" />
                                              Créer une demande liée
                                            </Button>)
                            } 

                    </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Timer className="h-5 w-5 text-primary" />
                      Gestion de la charge
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Charge estimée (jours)</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {demande.dureEstimee} Jours
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Charge réelle (jours)</p>
                        <p className="text-2xl font-bold text-green-600">
                          {demande.dureeTravailRealisateur 
                            ? demande.dureeTravailRealisateur + " Jours"
                            : "Non renseignée"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center">
                          <BarChart3 size={12} className="mr-1" /> Progression:
                        </span>
                        <span className="font-medium">
                          {calculateProgression(demande)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className={cn(
                            "h-2.5 rounded-full",
                            getProgressionColor(demande)
                          )} 
                          style={{ 
                            width: `${Math.min(100, calculateProgression(demande))}%`
                          }}
                        />
                      </div>
                    </div>
                    <br />
                    
                    <Button
  className="
    w-full
    inline-flex items-center justify-center space-x-2
    px-5 py-3
    border rounded-lg
    border-blue-600 text-blue-600
    hover:bg-blue-600/10
    focus:outline-none focus:ring-2 focus:ring-blue-600/50
    transition duration-150
  "
  variant="outline"
  onClick={() => {
    setActiveTab("mettre-a-jour");
    document
      .querySelector('[value="mettre-a-jour"]')
      ?.scrollIntoView({ behavior: "smooth" });
  }}
>
  <Edit className="h-5 w-5" />
  <span className="text-sm font-medium">Mettre à jour la charge</span>
</Button>

<Button
  className="
    mt-4
    w-full
    inline-flex items-center justify-center space-x-2
    px-5 py-3
    border rounded-lg
    border-teal-600 text-teal-600
    hover:bg-teal-600/10
    focus:outline-none focus:ring-2 focus:ring-teal-600/50
    transition duration-150
    transform -translate-x-1
  "
  variant="outline"
  onClick={() => {
    setActiveTab("demander-info");
    document
      .querySelector('[value=\"demander-info\"]')
      ?.scrollIntoView({ behavior: "smooth" });
  }}
>
  <Info className="h-5 w-5" />
  <span className="text-sm font-medium">Demander des infos</span>
</Button>







                  </div>
                
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    Équipe
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Demandeur</p>
                        <p className="font-medium">{demande.demandeurName || "Non défini"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Réalisateur</p>
                        <p className="font-medium">{demande.realisateur?.name || demande.realisateurName || "Non assigné"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-full">
  <Calendar className="h-6 w-6 text-purple-600" />
</div>


                      <div>
                        <p className="text-sm text-muted-foreground">Date Affectation</p>
                        <p className="font-medium">{formatShortDate(demande.dateAffectation || demande.dateAffectation)}</p>
                      </div>
                    </div>
                    
                    {demande.type && (
                      <div className="flex items-start gap-3 mt-4">
                        <div className="bg-purple-100 p-3 rounded-full">
  <Calendar className="h-6 w-6 text-purple-600" />
</div>
                        <div>
                        <p className="text-sm text-muted-foreground">Date limite</p>
                        <p className="font-medium">{formatShortDate(demande.dateEstime || demande.dateEstime)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="flex items-center text-lg font-semibold mb-4">
  <BarChart className="mr-2 h-5 w-5 text-gray-600" />
  Statistiques de délais
</h2>

 
  <div className="mb-4 bg-green-50 p-3 rounded-lg border">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-green-600">
        Retard total
      </span>
      <span className="text-lg font-bold text-green-700">
        {demande.totalMainDelay || 0} J
      </span>
    </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
   
    <div className="bg-blue-50 p-4 rounded-lg border">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-blue-600">
            Création → Acceptation
          </span>
        </div>
        <span className="text-lg font-semibold mt-2 text-blue-700">
          {demande.delayCreationAccept || 0} J
        </span>
        <p className="text-xs mt-1 text-blue-500">
          Délai entre la création et l&apos;acceptation
        </p>
      </div>
    </div>

    {/* Acceptation → En cours */}
    <div className="bg-indigo-50 p-4 rounded-lg border">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-indigo-500" />
          <span className="font-medium text-indigo-600">
            Acceptation → En cours
          </span>
        </div>
        <span className="text-lg font-semibold mt-2 text-indigo-700">
          {demande.delayAcceptEnCours || 0} J
        </span>
        <p className="text-xs mt-1 text-indigo-500">
          Délai entre l&apos;acceptation et la mise en œuvre
        </p>
      </div>
    </div>

    {/* Retard dépendances */}
    <div className="bg-amber-50 p-4 rounded-lg border">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-amber-600">
            Retard dépendances
          </span>
        </div>
        <span className="text-lg font-semibold mt-2 text-amber-700">
          {demande.dureeRetardDependence || 0} J
        </span>
        <p className="text-xs mt-1 text-amber-500">
          Retard causé par les dépendances
        </p>
      </div>
    </div>
  </div>
</div>


<div className="bg-white rounded-lg shadow-sm border p-6">
  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
    <Clock className="h-5 w-5 text-primary" />
    Gestion de la charge
  </h2>
  <ol className="relative border-l border-muted pl-8">
                  {demande.dateCreation && (
                    <li className=" relative mb-4">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                        <Calendar className="w-3.5 h-3.5 text-blue-800" />
                      </span>
                      <div className="ml-5 flex items-center gap-2">
                        <h3 className="font-medium">Création</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(demande.dateCreation)}
                        </p>
                      </div>
                    </li>
                  )}
                  
                  {demande.dateAcceptation && (
                    <li className="relative mb-4">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-800" />
                      </span>
                      <div className="ml-5 flex items-center gap-2">
                        <h3 className="font-medium">Acceptation</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(demande.dateAcceptation)}
                        </p>
                      </div>
                    </li>
                  )}
                  
                  {demande.dateEnCours && (
                    <li className="relative mb-4">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                        <Clock className="w-3.5 h-3.5 text-blue-800" />
                      </span>
                      <div className="ml-5 flex items-center gap-2">
                        <h3 className="font-medium">Début des travaux</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(demande.dateEnCours)}
                        </p>
                      </div>
                    </li>
                  )}
                  
                  {demande.dateTerminee && (
                    <li className="relative mb-4">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white">
                        <CheckCircle className="w-3.5 h-3.5 text-green-800" />
                      </span>
                      <div className="ml-5 flex items-center gap-2">
                        <h3 className="font-medium">Terminée</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(demande.dateTerminee)}
                        </p>
                      </div>
                    </li>
                  )}
                </ol>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
    <ClipboardList className="h-5 w-5 text-primary" />
    Justification
  </h2>
  <p className="text-sm text-muted-foreground">
    {demande.justification || "Aucune justification fournie."}
  </p>
</div>

              
              {demande.data && Object.entries(demande.data).length > 0 && (
  <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
    <h2 className="text-xl font-semibold flex items-center gap-2">
      <Info className="h-6 w-6" />
      Informations complémentaires
    </h2>
    <div
      className="mt-4 flex items-center text-lg text-orange-600 font-medium cursor-pointer group"
      onClick={() => setSelectedDemandeId(demande.id)}
    >
      <span> Voir détails</span>
      <ArrowUpRight
        size={20}
        className="ml-1 transition-transform text-orange-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </div>
  </div>
)}


            
<div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="mettre-a-jour">
              <RotateCw className="mr-2 h-4 w-4" />
              Mettre à jour
            </TabsTrigger>
            <TabsTrigger value="demander-info">
              <MessageCircle className="mr-2 h-4 w-4" />
              Demander des infos
            </TabsTrigger>
          </TabsList>
          <div ref={mettreAJourRef}>
            <TabsContent value="mettre-a-jour" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Mettre à jour la date estimée</CardTitle>
                  <CardDescription>
                    Modifiez la date estimée de terminaison pour cette demande
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="estimated-date" className="text-sm font-medium">
                      Nouvelle date estimée
                    </label>
                    <Input
                      id="estimated-date"
                      type="date"
                      value={estimatedDate}
                      onChange={(e) => setEstimatedDate(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (demande?.dateEstime) {
                        setEstimatedDate(
                          format(new Date(demande.dateEstime), 'yyyy-MM-dd')
                        );
                      }
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleUpdateEstimatedDate}
                    disabled={updating || !estimatedDate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {updating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Calendar className="mr-2 h-4 w-4" />
                    )}
                    Mettre à jour
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>

          <div ref={demanderInfoRef}>
            <TabsContent value="demander-info" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Demande d'information</CardTitle>
                  <CardDescription>
                    Envoyez une demande d'information au demandeur pour clarifier certains points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="info-request" className="text-sm font-medium">
                      Votre message
                    </label>
                    <Textarea
                      id="info-request"
                      placeholder="Veuillez préciser les détails concernant..."
                      value={infoRequest}
                      onChange={(e) => setInfoRequest(e.target.value)}
                      className="min-h-24"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setInfoRequest('')}>
                    Effacer
                  </Button>
                  <Button
                    onClick={handleSendInfoRequest}
                    disabled={updating || !infoRequest.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {updating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Envoyer
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

                <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                              <CardTitle className="text-lg font-semibold flex justify-between items-center">
                                <span>Demandes liées</span>
                                {  demande.statut !== "TERMINEE" && (
                                            <Button 
                                              onClick={handleCreateDependentDemande} 
                                              className="shrink-0 bg-blue-600 hover:bg-blue-700"
                                            >
                                              <Link className="mr-2 h-4 w-4" />
                                              Créer une demande liée
                                            </Button>)
                                          } 
                              </CardTitle>
                       </CardHeader>
                      <CardContent>
                        {demande.dependentDemandes && demande.dependentDemandes.length > 0 ? (
                          <div className="space-y-3">
                            {demande.dependentDemandes.map(dependentDemande => (
                                console.log(dependentDemande),
                                <div 
                                key={dependentDemande.id}
                                className="flex items-center justify-between p-3 border rounded-md hover:bg-secondary/10 cursor-pointer group"
                                onClick={() => navigate(`/demande/${dependentDemande.id}`)}
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="font-medium truncate">{dependentDemande.title}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <StatusBadge status={dependentDemande.statut} />
                                    {demande.statut !== 'AFFECTEE' && demande.statut !== 'TERMINEE' && (
                                    <Checkbox 
                                      className="hidden group-hover:block h-4 w-4 rounded-full border-primary text-primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateDataDependence(dependentDemande.id);
                                      }}
                                      checked={dependentDemande.dateDependence !== null}
                                    />)}

                                    
                                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <p>Aucune demande liée pour le moment</p>
                            <p className="text-sm mt-1">Créez une demande liée pour commencer</p>
                          </div>
                        )}
                      </CardContent>
                      <DetailDemande
                              isOpen={selectedDemandeId === demande.id}
                              demandeId={demande.id}
                              onClose={() => setSelectedDemandeId(null)}
                         
                              />
              </Card>
            </div>

        </div>
      </main>
    </div>
    
  );
};

export default CardDetaille;
