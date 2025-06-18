import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { use, useEffect } from "react";
import { initializeAuth } from "./Store/auth2Slice";
import DashboardUser from "./component/DashbarodAdmin/DashboardUser";
import {TypeDemande} from "./pages/TypeDemande";
import LoginPage from "./pages/login";
import {useState} from "react";
import {PrivateRoute,RoleBasedRoute} from "./component/PrivateRouted";

import DemandeTable from "./component/demande/DemandeTables";
import Superuser from "./pages/superuser/Superuser";

import { UserTable } from "./component/DashbarodAdmin/UserTable";
import DashboardHome from "./component/DashbarodAdmin/DashboardHome";
import EmployeHome from "./pages/EmployeHome";

import EmployeCreate from "./pages/EmployeCreate";
import Responsable from "./pages/Responsable/Responsable";
import ResponsableHome from "./pages/Responsable/ResponsableHome";
import ChefHome from "./pages/Chef/ChefHome";
import Chef from "./pages/Chef/Chef";

import RequestDetail from "./component/responsable/RequestDetail";
import Executor from "./pages/Executor/Executor";
import ExecutorService from "./pages/Executor/ExecutorService";
import CardDetaille from "./pages/Executor/CardDetaille";
import EmployeGant from "./pages/EmployeGant";
import DemandeDependence from "./component/demande/DemandeDependence";
import { Employe } from "./pages/Employe";

import HistoriqueDemande from "./component/demande/HistoriqueDemande";
import ServicesTable from "./pages/Chef/TeamServices";
import EmployeDashboard from "./pages/Responsable/EmployeDashboard";
import TeamMembers from "./pages/Chef/TeamMember";
import LoadingSpinner from "./component/LoadingSpinner";
import MessageWrapper from "./component/notification/MessageWrapper";
import EmailConfiguation from "./component/DashbarodAdmin/EmailConfiguation";
import Unauthorized from "./component/Unauthorized ";
import {store} from "./Store/store";
function App() {
  const { isAuthenticated, user, loading, roles } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [roleDetermined, setRoleDetermined] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const initialize = async () => { 
      await dispatch(initializeAuth()).unwrap(); 
    };
    initialize();
  }, [dispatch]);

  useEffect(() => {
    if (!loading && isAuthenticated) { 
      
      let determinedRole = '';
      if (roles?.realmRoles?.includes("employe") || roles?.clientRoles?.includes("employe")) {
        determinedRole = "employe";
      } else if (roles?.realmRoles?.includes("responsable") || roles?.clientRoles?.includes("responsable")) {
        determinedRole = "responsable";
      } else if (roles?.realmRoles?.includes("admin") || roles?.clientRoles?.includes("admin")) {
        determinedRole = "admin";
      } else if (roles?.realmRoles?.includes("realisateur") || roles?.clientRoles?.includes("realisateur")) {
        determinedRole = "realisateur";
      } else if (roles?.realmRoles?.includes("chef") || roles?.clientRoles?.includes("chef")) {
        determinedRole = "chef";
      } else if (roles?.realmRoles?.includes("superuser") || roles?.clientRoles?.includes("superuser")) {
        determinedRole = "superuser";
      }
      setUserRole(determinedRole);
      setRoleDetermined(true);
    } else if (!loading && !isAuthenticated) {
      // Set role determination to true even when not authenticated
      // so unauthorized page can be accessed
      setRoleDetermined(true);
    }
  }, [loading, isAuthenticated, roles]);
 
 
  if (loading) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/unauthorized" element={<Unauthorized/>} />
          <Route path="*" element={<LoadingSpinner />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={
                userRole === "admin" ? "/dashboard" :
                userRole === "employe" ? "/employe" :
                userRole === "responsable" ? "/responsable" :
                userRole === "chef" ? "/chef" :
                userRole === "realisateur" ? "/realisateur" :
                "/unauthorized"
              } replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/login" element={<LoginPage />} /> 
        <Route path="/unauthorized" element={<Unauthorized/>} />

        <Route element={<PrivateRoute />}>
          <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<DashboardUser />}>
              <Route index element={<DashboardHome />} />
              <Route path="users" element={<UserTable />} />
              <Route path="types" element={<TypeDemande />} />
              <Route path="email-config" element={<EmailConfiguation />} />
            </Route>
          </Route>
          
          <Route element={<RoleBasedRoute allowedRoles={["employe"]} />}>
            <Route path="/employe" element={<Employe/>}>
              <Route index element={<EmployeHome />} />
              <Route path="create" element={<EmployeCreate />} />
              <Route path="historique" element={<HistoriqueDemande />} />
              <Route path="messages" element={<MessageWrapper/>} />
              <Route path="all" element={<DemandeTable />} />
            </Route>
          </Route>
         <Route element={<RoleBasedRoute allowedRoles={["superuser"]} />}>
            <Route path="/superuser" element={<Superuser/>}>
              <Route index element={<DemandeTable />} />
               <Route path="dashboard" element={<EmployeDashboard/>} />
            </Route>
          </Route>
          
          <Route element={<RoleBasedRoute allowedRoles={["responsable"]} />}>
              <Route path="/responsable" element={<Responsable />}>
                <Route index element={<ResponsableHome />} />
                <Route path="demande/:id" element={<RequestDetail/>} />
                <Route path="dashboard" element={<EmployeDashboard/>} />
                <Route path="gantt" element={<EmployeGant/>} />
                <Route path="create" element={<EmployeCreate />} />
                <Route path="service/en-cours" element={<EmployeHome />} />
                <Route path="service/traitees" element={<HistoriqueDemande role={roleDetermined}/>} />
                <Route path="messages" element={<MessageWrapper/>} />
              </Route>
          </Route>
          
          <Route element={<RoleBasedRoute allowedRoles={["realisateur"]} />}>
            <Route path="/realisateur" element={<Executor />}>
              <Route index element={<EmployeHome />} />
              <Route path="create" element={<EmployeCreate />} />
              <Route path="historique" element={<HistoriqueDemande/>} />
              <Route path="services" element={<ExecutorService />} />
              <Route path="services/:id" element={<CardDetaille/>} />
              <Route path="create-demande" element={<DemandeDependence/>} />
              <Route path="messages" element={<MessageWrapper/>} />
            </Route>
          </Route>
          
          <Route element={<RoleBasedRoute allowedRoles={["chef"]} />}>
            <Route path="/chef" element={<Chef />}>
              <Route index element={<ChefHome />} />
              <Route path="create" element={<EmployeCreate />} />
              <Route path="services" element={<EmployeHome />} />
              <Route path="historique" element={<HistoriqueDemande/>} />
              <Route path="services/team" element={<ServicesTable/>} />
              <Route path="equipe" element={<TeamMembers/>} />
              <Route path="messages" element={<MessageWrapper/>} />
            </Route>
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;