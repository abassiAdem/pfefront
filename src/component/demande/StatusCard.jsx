import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const StatusCard = ({ title, count, icon: Icon, variant = "default", total }) => {
  const variantStyles = {
    default: "border-slate-200 bg-white",
    primary: "border-blue-200 bg-blue-50",
    success: "border-green-200 bg-green-50",
    warning: "border-amber-200 bg-amber-50",
    danger: "border-red-200 bg-red-50",
    info: "border-violet-200 bg-violet-50",
  };

  const textColors = {
    default: "text-slate-800",
    primary: "text-blue-800",
    success: "text-green-800",
    warning: "text-amber-800",
    danger: "text-red-800",
    info: "text-violet-800",
  };

  const progressTrackColors = {
    default: "#f1f5f9",
    primary: "#bfdbfe",
    success: "#bbf7d0",
    warning: "#fde68a",
    danger: "#fecaca",
    info: "#ddd6fe",
  };

  const progressFillColors = {
    default: "#94a3b8",
    primary: "#2563eb",
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#7c3aed",
  };

  // Calculate percentage value if total is provided
  const progressValue = total ? (count / total) * 100 : 0;

  // Create a linear gradient for the progress bar with a smaller height.
  // We set the height to "1rem" for a slimmer progress bar.
  const progressBarStyle = {
    background: `linear-gradient(to right, ${progressFillColors[variant]} ${progressValue}%, ${progressTrackColors[variant]} ${progressValue}%)`,
    height: "1rem", // Adjusted from 1.5rem to 1rem for a smaller height
    borderRadius: "9999px",
    transition: "background 0.5s ease-in-out", // Optional smooth transition
  };

  return (
    <Card
      className={cn(
        "transition-all border rounded-lg shadow-sm hover:shadow-md w-full",
        variantStyles[variant]
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={cn("p-1.5 rounded-lg", variantStyles[variant])}>
            <Icon className={cn("h-4 w-4", textColors[variant])} />
          </div>
        </div>
        <p className={cn("text-2xl font-bold mb-2", textColors[variant])}>
          {count}
        </p>
        {total && (
          <div className="space-y-1.5">
            <div className="rounded-full overflow-hidden" style={progressBarStyle} />
            <p className="text-xs text-gray-500 font-medium">
              <span className={cn("font-semibold", textColors[variant])}>
                {Math.round(progressValue)}%
              </span>{" "}
              of total
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;