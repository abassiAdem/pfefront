import React from "react";
import ActivityChart from "./ActivityChart";

const ChartContainer = ({ title, subtitle, data }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
      <div className="h-[350px] w-full p-2">
        <ActivityChart data={data} />
      </div>
    </div>
  );
};

export default ChartContainer;