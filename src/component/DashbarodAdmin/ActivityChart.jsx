import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};
const ActivityChart = ({ data = [] }) => {
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: formatDate(item.date)
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="formattedDate" 
          tick={{ fontSize: 12, fill: '#64748b' }} 
          tickMargin={10}
          stroke="#cbd5e1"
        />
        <YAxis 
          tickCount={5} 
          tick={{ fontSize: 12, fill: '#64748b' }} 
          tickMargin={10}
          stroke="#cbd5e1"
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: '#fff', 
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(203, 213, 225, 0.5)',
            padding: '8px 12px'
          }}
          formatter={(value) => [`${value}`, 'User Logins']}
          labelFormatter={(label) => `Date: ${label}`}
          cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
        />
        <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12, color: '#64748b' }} />
        <Line 
          type="monotone" 
          dataKey="count" 
          name="User Logins"
          stroke="#8b5cf6" 
          strokeWidth={3}
          activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} 
          dot={{ 
            stroke: '#8b5cf6', 
            strokeWidth: 2, 
            r: 4, 
            fill: '#fff'
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ActivityChart;

/*import { formatDate } from '../lib/utils'; */