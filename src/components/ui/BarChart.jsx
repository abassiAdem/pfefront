import React, { useState, useEffect } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const BarChart = ({ data, chartKey }) => {
  if (!data) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }
    const [animationKey, setAnimationKey] = useState(0);
    const [internalKey, setInternalKey] = useState(0);
    useEffect(() => {
      
      setInternalKey(prev => prev + 1);
    }, [data, chartKey]);
  
    if (!data || data.length === 0) {
      return <div className="text-center text-gray-500">Aucune donnée disponible</div>;
    }
  
    const formattedData = data.map((item) => ({
      name: item.type || item.metier,
      Demandes: item.count,
    }));
  
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 shadow-md rounded-md border border-gray-100">
            <p className="font-medium">{label}</p>
            <p className="text-sm text-gray-600">
              Nombre: <span className="font-semibold">{payload[0].value}</span>
            </p>
          </div>
        );
      }
      return null;
    };
  
    return (
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            key={animationKey}
            data={formattedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={false}  
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <Bar
              dataKey="Demandes"
               fill="#0EA5E9"
              radius={[4, 4, 0, 0]}
              animationDuration={750}
              animationBegin={0}
              stroke="none"  // Remove bar borders
              activeBar={{
                fill: "#0284C7",
                stroke: "none",  // Remove active bar borders
                fillOpacity: 1,  // Ensure full opacity
                radius: [4, 4, 0, 0],  // Match original radius
              }}
              className="no-hover-effect"
            />
          </RechartsBarChart>
        </ResponsiveContainer>
        
        <style jsx global>{`
          .no-hover-effect .recharts-bar-rectangle:hover {
            filter: none !important;
            stroke: none !important;
            outline: none !important;
          }
          
          .recharts-tooltip-wrapper:focus {
            outline: none !important;
          }
        `}</style>
      </div>
    );
  };
  
  export default BarChart;