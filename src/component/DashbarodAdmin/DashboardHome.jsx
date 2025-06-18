

import React from 'react'
import { Card } from "@/components/ui/card";
import ChartContainer from "../DashbarodAdmin/ChartContainer";
import { useGetLineChartQuery ,useGetPieChartQuery} from "../../Store/userSlice";
import UserStatusContainer from "../DashbarodAdmin/UserStatusPieChart";
const DashboardHome = () => {
  const {
    data: userStatusData,
  } = useGetPieChartQuery();
  const {
      data: activityData,
    } = useGetLineChartQuery();
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tableau de Bord d'Activité</h1>
          <p className="text-gray-500 mt-1">Suivi et analyse de l'engagement des utilisateurs</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-xl">
            <ChartContainer 
          title="Activité des Utilisateurs - 7 Derniers Jours"
          subtitle="Nombre de connexions utilisateurs sur la période"
              data={activityData}
            />
          </Card>
          <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-xl">
            {userStatusData && userStatusData.length > 0 ? (
              <>
               
                <UserStatusContainer 
                title="Répartition du Statut des Utilisateurs"
                subtitle="Pourcentage d'utilisateurs actifs/inactifs"
                  data={userStatusData}
                />
              </>

            ) : (
              <div className="text-center text-gray-500">Aucune donnée disponible</div>
            )}

          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

