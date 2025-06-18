import React, { useState, useEffect } from "react";
import StatusCard from "./StatusCard";
import { CheckCircle, Clock, FileQuestion, Activity, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const StatusDashboard2 = ({ data }) => {

  
const total = Object.values(data).reduce((sum, value) => sum + value, 0);
const acceptedCount =
  (data.AFFECTEE ?? 0) +
  (data.ACCEPTEE ?? 0);
  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatusCard
          title="Total"
          count={total?? 0}
          icon={Users}
          variant="primary"
        />
        <StatusCard
          title="En Cours"
          count={data.EN_COURS?? 0}
          icon={Activity}
          variant="info"
          total={total}
        />
        
        <StatusCard
          title="Acceptée"
          count={acceptedCount}
          icon={CheckCircle}
          variant="success"
          total={total}
        />
        <StatusCard
          title="En Attente Chef"
          count={data.EN_ATTENTE_DE_CHEF?? 0}
          icon={Clock}
          variant="warning"
          total={total}
        />
        <StatusCard
          title="Attente Dependence"
          count={data.EN_ATTENTE_DE_DEPENDENCE?? 0}
          icon={FileQuestion}
          variant="danger"
          total={total}
        />
      </div>

    </div>
  );
};

export default StatusDashboard2;