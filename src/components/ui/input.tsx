import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    icon?: React.ElementType
  }
>(({ className, type, icon: Icon, ...props }, ref) => {
  const hasIcon = Icon && "absolute left-3 top-1/2 -translate-y-1/2"
  return (
    <div className="relative w-full">
      {Icon && (
        <Icon
          className={cn(
            "pointer-events-none size-4 shrink-0 text-muted-foreground",
            hasIcon
          )}
        />
      )}
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          Icon && "pl-9",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  )
})
Input.displayName = "Input"

export { Input }

    