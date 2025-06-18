import { cn } from "@/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
const ActionButtonResp = ({ type, onClick, className, showText = true }) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "btn-action px-3 py-1.5 transition-all duration-300 shadow-sm hover:shadow-md", 
        type === "approve" 
          ? "text-green-600 bg-green-50 hover:bg-green-300 hover:text-green-700 rounded-md border-none shadow-none focus:ring-0"
          : type === "affecter"
          ? "text-blue-600 bg-blue-50 hover:bg-blue-300 hover:text-blue-700 rounded-md border-none shadow-none focus:ring-0"
          : "text-red-600 bg-red-50 hover:bg-red-300 hover:text-red-700 rounded-md border-none shadow-none focus:ring-0",
        className
      )}
    >
      {type === "approve" ? (
        <>
          <CheckIcon className="w-4 h-4 mr-1" />
          {showText && "Approuver"}
        </>
      ) : type === "affecter" ? (
        <>
          <CheckIcon className="w-4 h-4 mr-1" />
          {showText && "Affecter"}
        </>
      ) : (
        <>
          <XIcon className="w-4 h-4 mr-1" />
          {showText && "Refuser"}
        </>
      )}
    </Button>
  );
};

export default ActionButtonResp;
