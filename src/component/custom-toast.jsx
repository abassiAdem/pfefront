import { X } from "lucide-react";
import { toast as originalToast } from "@/components/ui/use-toast";

export function toast(message, options) {
  return originalToast(
    <div className="flex items-start">
      <div className="flex-1 mr-4">
        <div className="text-sm font-medium">{message}</div>
        {options.description && (
          <div className="text-sm text-muted-foreground mt-1">{options.description}</div>
        )}
      </div>
      {options.action}
    </div>,
    {
      duration: 10000,
      className: "p-0 pl-2",
    }
  );
}

toast.error = (message) => {
  return originalToast({
    variant: "destructive",
    title: message,
  });
};

export function VerticalButton({ color, text, onClick }) {
  const bgColor = color === "green" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";

  return (
    <button className={`h-full px-4 ${bgColor} text-white transition-colors`} onClick={onClick}>
      <div className="flex flex-col items-center justify-center">
        {text.split("").map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>
    </button>
  );
}

export function CloseButton({ onClick }) {
  return (
    <button onClick={onClick} className="absolute top-2 left-2 text-gray-500 hover:text-gray-700">
      <X className="h-4 w-4" />
    </button>
  );
}
