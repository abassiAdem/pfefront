import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#8b5cf6', '#e0e0e0'];
const getTranslatedStatus = (status) => {
    switch (status) {
      case 'Active': return 'Actif';
      case 'Inactive': return 'Inactif';
      default: return status; 
    }
  };

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
        <p className="font-medium text-sm">{getTranslatedStatus(data.status)}</p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Nombre :</span> {data.count}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Pourcentage :</span> {data.percentage.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const UserStatusPieChart = ({ title,subtitle,data = [] }) => {
    return (
      <div  className="space-y-4">
        <div className="space-y-1 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="percentage"
              nameKey="status"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              layout="horizontal"
              iconSize={12}
              iconType="circle"
              wrapperStyle={{ paddingTop: 20, fontSize: 12 }}
              formatter={(value) => <span style={{ color: '#64748b' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  export default UserStatusPieChart;