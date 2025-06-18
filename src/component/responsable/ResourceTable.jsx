import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CalendarDays, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";

const formatFrenchDate = (dateString) => {
  const date = parseDateSafe(dateString);
  if (!date) return '-';
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const parseDateSafe = (dateString) => {
  if (!dateString) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const ResourceTable = ({ resources, onAssign }) => {
  const [selectedId, setSelectedId] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMetier, setFilterMetier] = useState("Tous Metiers");
  const [filterAvailability, setFilterAvailability] = useState("All");
  const [viewWeek, setViewWeek] = useState(true); // CHANGED: global view state
  const navigate = useNavigate(); // React-Router

  const safeResources = useMemo(() => resources.map(resource => ({
    id: resource.id,
    name: `${resource.firstName} ${resource.lastName}`,
    email: resource.email,
    metier: resource.metier,
    skills: resource.competences ? resource.competences.split(',').map(s => s.trim()) : [],
    availability: resource.disponibilites === 'disponible' ? 'Disponible' : 'Occupé',
    firstOccupiedDate: resource.firstOccupiedDate,
    firstAvailableDate: resource.firstAvailableDate,
    workload7: Math.round(resource.workloadNext7Days),
    workload30: Math.round(resource.workloadNext30Days)
  })), [resources]);

  const metierOptions = useMemo(() => [
    "Tous Metiers",
    ...Array.from(new Set(safeResources.map(r => r.metier)))
  ], [safeResources]);

  const filteredResources = useMemo(() => safeResources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMetier = filterMetier === 'Tous Metiers' || r.metier === filterMetier;
    const matchesAvail = filterAvailability === 'All' || r.availability === filterAvailability;
    return matchesSearch && matchesMetier && matchesAvail;
  }), [safeResources, searchQuery, filterMetier, filterAvailability]);

  const handleSelect = (resource) => {
    setSelectedId(resource.id);
    onAssign([resource]);
  };

  const metierColorMap = {
    IT: 'bg-blue-500',
    Finance: 'bg-green-500',
    Marketing: 'bg-purple-500',
    default: 'bg-orange-500'
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Ressources Disponibles</h2>
 
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="border rounded p-2 focus:outline-none focus:ring focus:border-blue-300"
        />
        <select
          value={filterMetier}
          onChange={e => setFilterMetier(e.target.value)}
          className="border rounded p-2 text-center focus:outline-none focus:ring focus:border-blue-300"
        >
          {metierOptions.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={filterAvailability}
          onChange={e => setFilterAvailability(e.target.value)}
          className="border rounded p-2 text-center focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="All">Tous Disponibilité</option>
          <option value="Disponible">Disponible</option>
          <option value="Occupé">Occupé</option>
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Ressource</TableHead>
              <TableHead className="text-center">Métier</TableHead>
              <TableHead>Compétences</TableHead>
              <TableHead className="text-center">Disponibilité</TableHead>
              <TableHead>Première occupation</TableHead>
              <TableHead>Première disponibilité</TableHead>
              <TableHead className="text-center">
                Charge de Travail  
                <button
                  onClick={() => setViewWeek(w => !w)}
                  className="ml-2 flex items-center text-xs text-muted-foreground hover:text-blue-600 focus:outline-none"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="ml-1 uppercase">{viewWeek ? 'Semaine' : 'Mois'}</span>
                </button>
              </TableHead>
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResources.map(resource => {
              const currentWorkload = viewWeek ? resource.workload7 : resource.workload30; // CHANGED: use global view
              const isSelected = selectedId === resource.id;
              const avatarBg = metierColorMap[resource.metier] || metierColorMap.default;

              return (
                <TableRow key={resource.id} className={`hover:bg-muted/20 ${isSelected ? 'shadow-lg bg-white' : ''}`}>
                  <TableCell className="pr-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="selectedResource"
                        checked={isSelected}
                        onChange={() => handleSelect(resource)}
                        className="sr-only peer"
                      /> 
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-blue-600 peer-checked:ring-2 peer-checked:ring-blue-200 flex items-center justify-center transition">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition"></div>
                      </div>
                    </label>
                  </TableCell>

                  <TableCell className="pl-2">
  <div
    onClick={() => navigate(`/responsable/gantt?realisateur=${resource.id}`)}
    className="flex items-center gap-2 cursor-pointer"
  >
                      <div className={`h-10 w-10 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold`}>{resource.name.charAt(0)}</div>
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-muted-foreground">{resource.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">{resource.metier}</TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {resource.skills.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className={`flex items-center justify-center px-2 py-1 rounded-full ${resource.availability === 'Disponible' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <Clock className={`mr-1.5 h-4 w-4 ${resource.availability === 'Disponible' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className="ml-1 font-medium">{resource.availability}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center">
                      <CalendarDays className="mr-1.5 h-4 w-4 text-muted-foreground" />
                      <span>{formatFrenchDate(resource.firstOccupiedDate)}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center">
                      <CalendarDays className="mr-1.5 h-4 w-4 text-muted-foreground" />
                      <span>{formatFrenchDate(resource.firstAvailableDate)}</span>
                    </div>
                  </TableCell>
 
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${
                          currentWorkload > 80 ? 'bg-red-500' :
                          currentWorkload > 60 ? 'bg-orange-500' :
                          currentWorkload > 0 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} style={{ width: `${currentWorkload}%` }}></div>
                      </div>
                      <span className="ml-2 text-xs font-medium">{currentWorkload}%</span>
                    </div>
                  </TableCell>

                  
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ResourceTable;
