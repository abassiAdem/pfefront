import React from 'react';
import ChartHeader from './ChartHeader';
import UserStatusPieChart from './../component/UserStatusPieChart';

const UserStatusContainer = ({ title, subtitle, data }) => {
  return (
    <div className="space-y-4">
      <ChartHeader title={title} subtitle={subtitle} />
      <div className="h-[350px] w-full p-2">
        <UserStatusPieChart data={data} />
      </div>
    </div>
  );
};

export default UserStatusContainer;