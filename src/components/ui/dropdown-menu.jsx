import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext(null);

export function DropdownMenu({ children }) {
  const [open, setOpen] = React.useState(false);
  
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('[data-dropdown-menu]')) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [open]);
  
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative" data-dropdown-menu>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            if (child.type === DropdownMenuTrigger) {
              return React.cloneElement(child, { onClick: () => setOpen(!open) });
            }
            if (child.type === DropdownMenuContent) {
              return open ? React.cloneElement(child) : null;
            }
          }
          return child;
        })}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export const DropdownMenuTrigger = React.forwardRef(({ asChild, children, className, onClick, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick, ref, ...props });
  }
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuContent = React.forwardRef(({ className, align = "end", children, ...props }, ref) => {
  const alignClass = align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2";
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md",
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef(({ className, children, onClick, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("my-1 h-px bg-gray-200", className)}
      {...props}
    />
  );
});
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

