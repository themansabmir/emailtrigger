import * as React from "react";
import { cn } from "@/lib";

const Label = ({ className, ...props }) => {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
};
Label.displayName = "Label";

export { Label };
