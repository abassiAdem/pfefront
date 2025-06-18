import { cn } from "@/lib/utils";

const StatusBadge = ({ status, className }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Urgent":
        return "bg-gradient-to-r from-urgent/20 to-urgent/10 text-urgent border-urgent/30";
      case "Pas Urgent":
        return "bg-gradient-to-r from-low/20 to-low/10 text-low border-low/30";
      case "Moyen":
        return "bg-gradient-to-r from-medium/20 to-medium/10 text-medium border-medium/30";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTranslatedStatus = () => {
    switch (status) {
      case "Urgent": return "Urgent";
      case "Pas Urgent": return "Pas Urgent";
      case "Moyen": return "Moyen";
      default: return status;
    }
  };

  return (
    <span className={cn(
      "status-badge border shadow-sm", 
      getStatusStyles(), 
      className
    )}>
      {getTranslatedStatus()}
    </span>
  );
};

export default StatusBadge;