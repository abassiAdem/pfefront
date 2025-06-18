import { useState, useEffect, useMemo, use } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import DonutChart from "../../components/ui/DonutChart";
import BarChart from "../../components/ui/BarChart";
import FilterControls from "../../components/FilterControls";
import { demandeApiSlice } from "../../Store/demandeApiSlice ";
import { Button } from "@/components/ui/button";
import { useSelector,useDispatch } from 'react-redux';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetDemandesByMetierQuery,useGetDemandesByTypeQuery } from "../../Store/demandeApiSlice ";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const STATUS_OPTIONS = [
  { value: 'EN_ATTENTE_DE_CHEF', label: 'En attente de chef' },
  { value: 'EN_ATTENTE_DE_RESPONSABLE', label: 'En attente de responsable' },
  { value: 'EN_ATTENTE_DE_DEPENDENCE', label: 'En attente de dependence' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' },
  { value: 'ANNULEE', label: 'Annulée' },
  { value: 'REJECTEE', label: 'Rejetée' },
  {value:'AFFECTEE', label:'Affectée'},
  { value: 'ACCEPTEE', label: 'Acceptée' }
];


const DEFAULT_SELECTED_STATUSES = STATUS_OPTIONS
  .filter((status) => status.value !== "ANNULEE" && status.value !== "REJECTEE")
  .map((status) => status.value);
  const EmployeDashboard = () => {
    const dispatch = useDispatch();
    const [selectedStatuses, setSelectedStatuses] = useState(
      DEFAULT_SELECTED_STATUSES
    );  
    const [dateRange, setDateRange] = useState({
      from: null,
      to: null
    });
    
    const [chartKey, setChartKey] = useState(0);
    const formatDateForApi = (date) => {
      if (!date) return undefined;
      
      return date.toISOString().split('T')[0];
    };
  
    const {user,roles}=useSelector((state) => state.auth)
    const { data: JOB_TYPE_DATA = [], isLoading: isLoadingJobData, error: errorJobData } = 
    useGetDemandesByMetierQuery({
      statuses: selectedStatuses,
      startDate: formatDateForApi(dateRange.from), 
      endDate: formatDateForApi(dateRange.to),
      userId: user?.id
    });
  
  const { data: REQUEST_TYPE_DATA = [], isLoading: isLoadingRequestData, error: errorRequestData } = 
    useGetDemandesByTypeQuery({
      statuses: selectedStatuses,
      startDate: formatDateForApi(dateRange.from), 
      endDate: formatDateForApi(dateRange.to),
      userId: user?.id
    });

      useEffect(() => {
        if (REQUEST_TYPE_DATA.length > 0 || JOB_TYPE_DATA.length > 0) {
          setChartKey(prevKey => prevKey + 1);
        }
      }, [REQUEST_TYPE_DATA, JOB_TYPE_DATA]);
      const aggregatedTypeData = useMemo(() => {
        if (isLoadingRequestData || REQUEST_TYPE_DATA.length === 0) {
          return [];
        }
        
        return REQUEST_TYPE_DATA.map(item => ({
          type: item.typeName,
          metier: item.typeName, 
          count: item.percentage
        }));
      }, [REQUEST_TYPE_DATA, isLoadingRequestData]);
      
      const aggregatedJobData = useMemo(() => {
        if (isLoadingJobData || JOB_TYPE_DATA.length === 0) {
          return [];
        }
        
        return JOB_TYPE_DATA.map(item => ({
          metier: item.metier,
          count: item.percentage
        }));
      }, [JOB_TYPE_DATA, isLoadingJobData]);

    const totalCount = useMemo(() => {
      if (!aggregatedJobData || aggregatedJobData.length === 0) {
        return 0;
      }
      return aggregatedJobData.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    }, [aggregatedJobData]);
  
    const handleDateChange = (dates) => {
      setDateRange(dates);
 
      setChartKey(prevKey => prevKey + 1);
      dispatch(
        demandeApiSlice.util.invalidateTags(["Demande"])
      );
      setChartKey(prevKey => prevKey + 1);
    };
    const handleStatusChange = (status, checked) => {
      const newStatuses = checked
        ? [...selectedStatuses, status]
        : selectedStatuses.filter(s => s !== status);
      
      setSelectedStatuses(newStatuses.length ? newStatuses : DEFAULT_SELECTED_STATUSES);
    };
  
  return (
    <motion.div 
      className="min-h-screen p-4 md:p-2 bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord des Demandes</h1>
          <p className="text-gray-600">
            Vue d'ensemble des demandes par statut, type et métier.
          </p>
        </div>
<div className="mb-6">
  <Card className="overflow-hidden">
    <CardHeader className="pb-1">
      <CardTitle className="text-xl font-semibold">Filtrer par Statut</CardTitle>
    </CardHeader>
    <CardContent className="py-2">

    <div className="flex flex-col md:flex-row gap-4 items-start">

        <div className="w-full md:w-auto flex flex-col gap-2">
          <Label htmlFor="status">Statuts</Label>
          <FilterControls
            selectedStatuses={selectedStatuses}
            onStatusChange={setSelectedStatuses}
          />
        </div>

        <div className="w-full md:w-auto flex flex-col gap-2">
    <Label htmlFor="date-range">Période</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "dd MMM yyyy", { locale: fr })} -{" "}
                {format(dateRange.to, "dd MMM yyyy", { locale: fr })}
              </>
            ) : (
              format(dateRange.from, "dd MMM yyyy", { locale: fr })
            )
          ) : (
            <span>Sélectionner une période</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleDateChange}
          numberOfMonths={2}
          locale={fr}
        />
      </PopoverContent>
    </Popover>
  </div>
</div>
             
      
    </CardContent>
  </Card>
</div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">
                  Distribution par Type de Demande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={aggregatedTypeData} key={chartKey} />
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">
                  Distribution par Métier
                </CardTitle>
              </CardHeader>
              <CardContent>
              <DonutChart data={aggregatedJobData} totalCount={totalCount} key={chartKey} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeDashboard;