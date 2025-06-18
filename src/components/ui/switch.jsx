import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

/**
 
A shadcn‑style toggle switch built on Radix UI.
bg-green-600 when checked
bg-input when unchecked
*/
const Switch = React.forwardRef(({ className, checked, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-green-600" : "bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform",
        checked && "translate-x-4"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };