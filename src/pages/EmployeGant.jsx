import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetGanttQuery } from '../Store/demandeApiSlice ';
import DependencyArrow from '../component/DependencyArrow';
import { isSameDay, isWithinInterval } from 'date-fns';
import { formatDate, getFormattedId } from '../lib/utils';
import { useSelector,useDispatch } from 'react-redux';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';

const statusColors = {
  AFFECTE: '#4CAF50',
  EN_COURS: '#2196F3',
  TERMINEE: '#9E9E9E',
  EN_ATTENTE_DE_DEPENDENCE: '#FF9800',
};

const StatusLegend = () => (
  <div className="flex flex-wrap gap-3 mt-2 mb-4">
    {Object.entries(statusColors).map(([status, color]) => (
      <div key={status} className="flex items-center">
        <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: color }} />
        <span className="text-sm text-gray-700">{status.replace(/_/g, ' ')}</span>
      </div>
    ))}
  </div>
);

const EmployeGant = () => {
  const {user,roles}=useSelector((state) => state.auth)
  const { data: ganttData = {}, isLoading } = useGetGanttQuery(user?.id);
  const [searchParams] = useSearchParams();
  const selectedRea = searchParams.get('realisateur');

  const [viewMode, setViewMode] = useState('jour');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [singleJump, setSingleJump] = useState(null);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [singleJumpValue, setSingleJumpValue] = useState('');
  const [rangeStartValue, setRangeStartValue] = useState('');
  const [rangeEndValue, setRangeEndValue] = useState('');
  const [activeTask, setActiveTask] = useState(null);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [searchRealisateur, setSearchRealisateur] = useState('');
const [selectedMetier, setSelectedMetier] = useState('');

  const containerRef = useRef(null);
  const taskRefs = useRef({});
  const lastScrollPos = useRef(0);

  const dayWidth = 80;
  const leftColumnWidth = 192;
  const timelineRange = useMemo(() => {
    if (viewMode === 'semaine') {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month, 1 + (5 * 7) - 1); // 5 weeks
      return { start, end, unit: 'week' };
    } else if (viewMode === 'mois') {
      const year = selectedDate.getFullYear();
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return { start, end, unit: 'month' };
    } else { // "jour" view
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { start, end, unit: 'day' };
    }
  }, [selectedDate, viewMode]);

const generateTimelineHeaders = () => {
  const headers = [];
  const { start, end, unit } = timelineRange;

  if (unit === 'day') {
    const totalDays = end.getDate();
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(start.getFullYear(), start.getMonth(), i);
      headers.push({
        label: date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }),
        date,
      });
    }
  } else if (unit === 'week') {
    for (let i = 0; i < 5; i++) {
      const weekStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i * 7);
      headers.push({
        label: `Semaine ${i + 1}`,
        date: weekStart,
      });
    }
  } else if (unit === 'month') {
    for (let i = 0; i < 12; i++) {
      const date = new Date(selectedDate.getFullYear(), i, 1);
      headers.push({
        label: date.toLocaleDateString('fr-FR', { month: 'long' }),
        date,
      });
    }
  }
  return headers;
};

const timelineHeaders = generateTimelineHeaders();



  const handleSingleJumpChange = (e) => {
    const val = e.target.value;
    setSingleJumpValue(val);
    if (val) {
      const newDate = new Date(val);
      setSingleJump(newDate);
      setRangeStart('');
      setRangeStartValue('');
      setRangeEnd('');
      setRangeEndValue('');
      setScrollLocked(true);
    } else {
      setSingleJump(null);
      setScrollLocked(false);
    }
  };

  const handleRangeStartChange = (e) => {
    const val = e.target.value;
    setRangeStartValue(val);
    setRangeStart(val);
    if (val) {
      setSingleJump(null);
      setSingleJumpValue('');
      setScrollLocked(true);
    }
  };

  const handleRangeEndChange = (e) => {
    const val = e.target.value;
    setRangeEndValue(val);
    setRangeEnd(val);
  };

  const resetDateFilters = () => {
    setSingleJump(null);
    setSingleJumpValue('');
    setRangeStart('');
    setRangeStartValue('');
    setRangeEnd('');
    setRangeEndValue('');
    setScrollLocked(false);
  };
  const scrollToDate = (targetDate) => {
    if (!targetDate || !containerRef.current) return;

    if (targetDate < timelineRange.start || targetDate > timelineRange.end) {
      setSelectedDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
      return;
    }
    let scrollPosition = 0;
    const msPerDay = 24 * 60 * 60 * 1000;
    if (viewMode === 'jour') {
      const daysFromStart = Math.floor((targetDate - timelineRange.start) / msPerDay);
      scrollPosition = daysFromStart * dayWidth;
    } else if (viewMode === 'semaine') {
      const weeksFromStart = Math.floor((targetDate - timelineRange.start) / (msPerDay * 7));
      scrollPosition = weeksFromStart * (7 * dayWidth);
    } else if (viewMode === 'mois') {
      const monthDiff =
        (targetDate.getMonth() - timelineRange.start.getMonth()) +
        (12 * (targetDate.getFullYear() - timelineRange.start.getFullYear()));
      scrollPosition = monthDiff * dayWidth;
    }
    containerRef.current.scrollLeft = scrollPosition;
  };

  // When a date jump or range start changes and scroll lock is active, scroll to that date.
  useEffect(() => {
    if (scrollLocked) {
      if (singleJump) {
        scrollToDate(singleJump);
      } else if (rangeStart) {
        scrollToDate(new Date(rangeStart));
      }
    }
  }, [singleJump, rangeStart, timelineRange, viewMode, scrollLocked]);

  const filteredGanttData = useMemo(() => {
    return Object.entries(ganttData).map(([id, data]) => {
      const realisateur = Array.isArray(data) && data.length > 0 ? data[0] : null;
      const tasks = Array.isArray(data) ? data : [];
      const filteredTasks = tasks.filter((task) => {
        const tStart = new Date(task.startDate);
        const tEnd = new Date(task.endDate);
        return tEnd >= timelineRange.start && tStart <= timelineRange.end;
      });
      return { id, realisateur, tasks: filteredTasks };
    })
    .filter(({ realisateur }) => {
      // Filter by realisateur name
      if (searchRealisateur && realisateur) {
        return realisateur.realisateurName.toLowerCase().includes(searchRealisateur.toLowerCase());
      }
      return true;
    })
    .filter(({ realisateur }) => {
      // Filter by metier
      if (selectedMetier && realisateur) {
        return realisateur.metier === selectedMetier;
      }
      return true;
    });
}, [ganttData, timelineRange, searchRealisateur, selectedMetier]);

const uniqueMetiers = useMemo(() => {
  const metiers = new Set();
  Object.values(ganttData).forEach((data) => {
    if (Array.isArray(data) && data.length > 0 && data[0].metier) {
      metiers.add(data[0].metier);
    }
  });
  return Array.from(metiers).sort();
}, [ganttData]);
  useEffect(() => {
    if (!containerRef.current || filteredGanttData.length === 0) return;
    let minLeft = Infinity;
    filteredGanttData.forEach(({ tasks }) => {
      tasks.forEach((task) => {
        const pos = calculateTaskPosition(task.startDate, task.endDate);
        if (pos.left < minLeft) minLeft = pos.left;
      });
    });
    if (minLeft !== Infinity) {
      containerRef.current.scrollLeft = minLeft - 50;
    }
  }, [/* dependencies */ filteredGanttData, viewMode, selectedDate]);

  // Unlock scroll if the user manually scrolls away from the locked position.
  const handleScroll = (e) => {
    const currentScroll = e.currentTarget.scrollLeft;
    if (scrollLocked && Math.abs(currentScroll - lastScrollPos.current) > 10) {
      setScrollLocked(false);
    }
    lastScrollPos.current = currentScroll;
  };

  // Calculate task position within the timeline.
  const calculateTaskPosition = (taskStartDate, taskEndDate) => {
    const taskStart = new Date(taskStartDate);
    const taskEnd = new Date(taskEndDate);
    const { start,end, unit } = timelineRange;
    const effectiveStart = taskStart < start ? start : taskStart;
    const effectiveEnd = taskEnd > end ? end : taskEnd;

    let left = 0;
    let width = 0;
    if (unit === 'day') {
      const diffDays = Math.floor((effectiveStart - start) / (1000 * 60 * 60 * 24));
      const durationDays = Math.ceil((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)) + 1;
      left = diffDays * dayWidth;
      width = durationDays * dayWidth;
    } else if (unit === 'week') {
      const diffDays = Math.floor((effectiveStart - start) / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const durationDays = Math.ceil((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)) + 1;
      const durationWeeks = Math.ceil(durationDays / 7);
      left = diffWeeks * (7 * dayWidth);
      width = durationWeeks * (7 * dayWidth);
    } else if (unit === 'month') {
      const startMonth = start.getMonth();
      const taskMonth = effectiveStart.getMonth();
      let diffMonths = taskMonth - startMonth;
      if (diffMonths < 0) diffMonths += 12;
      const endMonth = effectiveEnd.getMonth();
      const durationMonths = (endMonth - taskMonth) + 1;
      left = diffMonths * dayWidth;
      width = durationMonths * dayWidth;
    }

    return { left, width };
  };

  // Filter the Gantt data based on the timeline.
  

  // Given a task ID, find its details from the filtered data.
  const findTaskById = (id) => {
    for (let rowIndex = 0; rowIndex < filteredGanttData.length; rowIndex++) {
      const { tasks } = filteredGanttData[rowIndex];
      for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
        if (tasks[taskIndex].id === String(id)) {
          return { task: tasks[taskIndex], rowIndex, position: taskIndex };
        }
      }
    }
    return { task: null, rowIndex: -1, position: -1 };
  };

  // Compute dependency arrows between tasks.
  const dependencyArrows = useMemo(() => {
    const arrows = [];
    filteredGanttData.forEach(({ tasks }) => {
      tasks.forEach((task) => {
        if (task.dependencies && task.dependencies.length > 0) {
          task.dependencies.forEach((depId) => {
            const { task: depTask } = findTaskById(depId);
            if (depTask && taskRefs.current[task.id] && taskRefs.current[depTask.id] && containerRef.current) {
              const waitRect = taskRefs.current[task.id].getBoundingClientRect();
              const depRect = taskRefs.current[depTask.id].getBoundingClientRect();
              const containerRect = containerRef.current.getBoundingClientRect();
              const fromX =
                waitRect.left - containerRect.left + waitRect.width / 2 + containerRef.current.scrollLeft;
              const fromY = waitRect.top - containerRect.top + waitRect.height / 2;
              const toX =
                depRect.left - containerRect.left + depRect.width / 2 + containerRef.current.scrollLeft;
              const toY = depRect.top - containerRect.top + depRect.height / 2;
              arrows.push(
                <DependencyArrow
                  key={`${task.id}-${depTask.id}`}
                  fromX={fromX}
                  fromY={fromY}
                  toX={toX}
                  toY={toY}
                />
              );
            }
          });
        }
      });
    });
    return arrows;
  }, [filteredGanttData, activeTask]);

  // Tooltip to show task details.
  const TaskDetail = ({ task }) => (
    <div className="p-3 max-w-xs bg-white rounded-lg">
      <div className="flex items-center mb-2">
        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: task.color }}></div>
        <h3 className="font-semibold text-base">{task.title}</h3>
      </div>
      <div className="space-y-1 text-sm">
        <div>
          <span className="font-medium text-gray-600">ID:</span> {getFormattedId(task.id)}
        </div>
        <div>
          <span className="font-medium text-gray-600">Statut:</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              task.statut === 'AFFECTE'
                ? 'bg-green-100 text-green-800'
                : task.statut === 'EN_COURS'
                ? 'bg-blue-100 text-blue-800'
                : task.statut === 'TERMINEE'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-orange-100 text-orange-800'
            }`}
          >
            {task.statut}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Réalisateur:</span> {task.realisateurName}
        </div>
        <div>
          <span className="font-medium text-gray-600">Début:</span> {formatDate(task.startDate)}
        </div>
        <div>
          <span className="font-medium text-gray-600">Fin:</span> {formatDate(task.endDate)}
        </div>
        {task.dependencies && task.dependencies.length > 0 && (
          <div>
            <span className="font-medium text-gray-600">Dépendances:</span>{' '}
            {task.dependencies.map((depId) => getFormattedId(depId)).join(', ')}
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  // Handler for changing period (previous/next month or year).
  const changePeriod = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'jour' || viewMode === 'semaine') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === 'mois') {
      newDate.setFullYear(newDate.getFullYear() + direction);
    }
    setSelectedDate(newDate);
    setScrollLocked(false);
  };

  // Calculate timeline width.
  let timelineWidth = 0;
  if (viewMode === 'jour') {
    timelineWidth = timelineHeaders.length * dayWidth;
  } else if (viewMode === 'semaine') {
    timelineWidth = timelineHeaders.length * (7 * dayWidth);
  } else if (viewMode === 'mois') {
    timelineWidth = timelineHeaders.length * dayWidth;
  }

  return (
    <div className="max-w-5xl mx-auto my-8 bg-white rounded-xl shadow-lg p-6 font-sans border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Diagramme de Gantt</h1>
        <div className="flex gap-2">
        {['jour', 'semaine', 'mois'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <label className="flex flex-col text-sm">
          Sauter à jour
          <input
            type="date"
            value={singleJumpValue}
            onChange={handleSingleJumpChange}
            className="border rounded p-1"
          />
        </label>
        <label className="flex flex-col text-sm">
          Début plage
          <input
            type="date"
            value={rangeStartValue}
            onChange={handleRangeStartChange}
            className="border rounded p-1"
          />
        </label>
        <label className="flex flex-col text-sm">
          Fin plage
          <input
            type="date"
            value={rangeEndValue}
            onChange={handleRangeEndChange}
            className="border rounded p-1"
          />
        </label>
        <button
          onClick={resetDateFilters}
          className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8"
          title="Réinitialiser les filtres de date"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/*filters*/}
      <div className="flex flex-wrap gap-4 mt-4">
  <div className="flex-1 min-w-[200px]">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Rechercher par nom de réalisateur
    </label>
    <input
      type="text"
      value={searchRealisateur}
      onChange={(e) => setSearchRealisateur(e.target.value)}
      placeholder="Nom du réalisateur..."
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
  <div className="flex-1 min-w-[200px]">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Filtrer par métier
    </label>
    <select
      value={selectedMetier}
      onChange={(e) => setSelectedMetier(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Tous les métiers</option>
      {uniqueMetiers.map((metier) => (
        <option key={metier} value={metier}>
          {metier}
        </option>
      ))}
    </select>
  </div>
</div>


      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changePeriod(-1)} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          ◀
        </button>
        <span className="text-lg font-semibold">
          {viewMode === 'mois'
            ? selectedDate.getFullYear()
            : selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => changePeriod(1)} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          ▶
        </button>
      </div>

      <div className="overflow-x-auto" ref={containerRef} onScroll={handleScroll}>
        <div className="min-w-full relative" style={{ width: timelineWidth + leftColumnWidth }}>
          <div className="flex border-b border-gray-300 sticky top-0 z-20 bg-white">
            <div className="w-[192px] flex-shrink-0 p-3 font-medium text-gray-700 border-r border-gray-300 sticky left-0 z-30 bg-white">
              Réalisateur
            </div>
            <div className="flex" style={{ width: timelineWidth }}>
              {timelineHeaders.map((header, index) => {
                const isToday = isSameDay(header.date, new Date());
                const isJump = singleJump && isSameDay(header.date, singleJump);
                const inRange =
                  rangeStart &&
                  rangeEnd &&
                  isWithinInterval(header.date, {
                    start: new Date(rangeStart),
                    end: new Date(rangeEnd),
                  });
                  
                let bgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                if (isToday) bgColor = 'bg-blue-200';
                if (isJump) bgColor = 'bg-blue-100';
                if (inRange) bgColor = 'bg-blue-50';
                return (
                  <div
                    key={index}
                    className={`p-2 text-center text-sm text-gray-600 border-r border-gray-200 ${bgColor}`}
                    style={{ width: viewMode === 'semaine' ? 7 * dayWidth : dayWidth, }}
                  >
                    {header.label}
                  </div>
                );
              })}
            </div>
          </div>

          {filteredGanttData.map(({ id, realisateur, tasks }) => {
            const isHighlighted = String(id) === selectedRea;
            return (
              <div
                key={id}
                onMouseLeave={() => setActiveTask(null)}
                className={`flex border-b border-gray-200 ${
                  isHighlighted ? 'shadow-md bg-blue-50' : 'hover:bg-gray-50'
                }`}
                style={{ width: timelineWidth + leftColumnWidth }}
              >
                <div className="w-[192px] p-3 border-r border-gray-200 sticky left-0 z-30 bg-white">
                  {realisateur?.realisateurName}
                </div>
                <div className="flex-1 relative" style={{ width: timelineWidth, minHeight: 80 }}>
                  {viewMode === 'jour' &&
                    timelineHeaders.map((header, index) => {
                      const isToday = isSameDay(header.date, new Date());
                      const isJump = singleJump && isSameDay(header.date, singleJump);
                      const inRange =
                        rangeStart &&
                        rangeEnd &&
                        isWithinInterval(header.date, {
                          start: new Date(rangeStart),
                          end: new Date(rangeEnd),
                        });
                      let bgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                      if (isToday) bgColor = 'bg-blue-200';
                      if (isJump) bgColor = 'bg-blue-100';
                      if (inRange) bgColor = 'bg-blue-50';
                      if (isHighlighted) bgColor = 'bg-blue-50';
                      return (
                        <div
                          key={index}
                          className={`absolute h-full ${bgColor}`}
                          style={{ left: index * dayWidth, width: dayWidth, top: 0, zIndex: 1 }}
                        />
                      );
                    })}

                  {tasks.map((task) => {
                    const pos = calculateTaskPosition(task.startDate, task.endDate);
                    return (
                      <TooltipProvider key={task.id} delayDuration={10}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              ref={(el) => {
                                if (el) taskRefs.current[task.id] = el;
                              }}
                              className="absolute h-10 rounded-md top-5 cursor-pointer shadow-md transition-transform duration-300 hover:scale-105 hover:opacity-90 z-10 overflow-hidden"
                              style={{
                                left: pos.left,
                                width: pos.width,
                                backgroundColor: task.color || statusColors[task.statut] || '#9E9E9E',
                              }}
                              onMouseEnter={() => setActiveTask(task.id)}
                              onMouseLeave={() => setActiveTask(null)}
                            >
                              <div className="px-2 py-1 text-white text-sm truncate">{task.title}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="p-0 bg-transparent border-none shadow-none" sideOffset={5}>
                            <TaskDetail task={task} />
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {dependencyArrows}
        </div>
      </div>
      <br />
      <StatusLegend />
    </div>
  );
};

export default EmployeGant;