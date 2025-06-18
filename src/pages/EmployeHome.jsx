import React, { use, useEffect } from 'react'

import TableDemandes from '../component/TableDemande';
import StatusDashboard from '../component/demande/StatusDashboard'
import { useSelector } from 'react-redux';
import { useGetCardQuery,useGetCardResQuery } from '../Store/demandeApiSlice ';
import { is } from 'date-fns/locale';
import StatusDashboard2 from '../component/demande/StatusDashboard2';
const EmployeHome = () => {
  const {user,roles}=useSelector((state) => state.auth)

 let role = ""
  if (
    roles?.realmRoles?.includes("employe") ||
    roles?.clientRoles?.includes("employe")
  ) {
    role = "employe"
  } else if (
    roles?.realmRoles?.includes("responsable") ||
    roles?.clientRoles?.includes("responsable")
  ) {
    role = "responsable"
  }

  const isResponsable = role === "responsable"?true:false;
const {
  data: cardData={},
  isLoading,
  error,
} = isResponsable
  ? useGetCardResQuery(user?.id, { skip: !user?.id })
  : useGetCardQuery(user?.id, { skip: !user?.id });

return (
    <div>
      <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Statut de la demande</h2>

          </div>
          {isResponsable ? <StatusDashboard2 data={cardData} /> :<StatusDashboard data={cardData} />}
        </div>
       </div> 
       <TableDemandes role={isResponsable} />
 
    </div>
  )
}

export default EmployeHome