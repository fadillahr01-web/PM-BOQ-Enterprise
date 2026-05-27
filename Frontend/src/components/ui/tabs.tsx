import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ value, onValueChange, className, children, ...props }: any) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            activeValue: value, 
            onValueChange 
          })
        }
        return child;
      })}
    </div>
  )
}

const TabsList = ({ value, activeValue, onValueChange, className, children, ...props }: any) => {
  const currentActive = activeValue ?? value
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeValue: currentActive, onValueChange })
        }
        return child;
      })}
    </div>
  )
}

const TabsTrigger = ({ value, activeValue, onValueChange, className, children, ...props }: any) => {
  const isActive = value === activeValue
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-500",
        isActive
          ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-500"
          : "hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-900/50 dark:hover:text-slate-100",
        className
      )}
      onClick={() => onValueChange && onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, activeValue, className, children, ...props }: any) => {
  if (value !== activeValue) return null
  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
