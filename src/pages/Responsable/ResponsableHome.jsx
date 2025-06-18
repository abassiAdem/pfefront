import React, { useEffect,useState } from 'react'
import { useSelector,useDispatch } from 'react-redux';
import { selectResourceManagerDemandes } from '../../Store/DemandeSlice';
import RequestCard from '../../component/demande/RequestCard';
import RequestsList from '../../component/responsable/RequestsList ';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'
import { LayoutGrid, LayoutList, FlameIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useGetAllDemandesEnAttenteResponsableQuery } from '../../Store/demandeApiSlice ';
export default function ResponsableHome() {
  const { user, roles } = useSelector((state) => state.auth);
  const { data: responsableDemandes = [], isLoading } = useGetAllDemandesEnAttenteResponsableQuery(user?.id);
  const urgentRequests = responsableDemandes.filter((request) => request.urgence === "urgent");
  const activeRequests = responsableDemandes.filter((request) => request.urgence !== "urgent");
  const [viewMode, setViewMode] = useState("grid");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Demandes</h1>
          <p className="text-muted-foreground mt-2">Gérez et traitez les demandes de service</p>
        </header>

        {isLoading ? (
          <RequestsSkeletonLoader />
        ) : (
          <> 
            <div className="flex justify-end mb-6">
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={(value) => value && setViewMode(value)}
                className="border rounded-lg bg-white shadow-sm"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view" className="hover:bg-secondary/60 transition-colors">
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Cartes</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view" className="hover:bg-secondary/60 transition-colors">
                  <LayoutList className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Liste</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {urgentRequests.length > 0 && (
              <section className="mb-12">

                
                <RequestsList 
                  user={user}
                  title="" 
                  showUrgentRequests={true}
                  responsableDemandes={urgentRequests} 
                  showCalendarView={false}
                  viewMode={viewMode}
                />
              </section>
            )}
 
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-header mb-0 bg-gradient-to-r from-foreground/90 to-foreground/70 bg-clip-text text-transparent font-semibold">
                  Demandes Actives
                </h2>
              </div>

              <RequestsList 
                user={user}
                title="" 
                showUrgentRequests={false}
                responsableDemandes={activeRequests} 
                showCalendarView={true}
                viewMode={viewMode}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}





function RequestsSkeletonLoader() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
          </div>
          <div className="h-10 bg-muted rounded w-full"></div>
        </div>
      ))}
    </div>
  )
}

