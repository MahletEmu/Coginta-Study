import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-violet-600 hover:bg-violet-700 text-white shadow-xs focus-visible:ring-violet-500",
      secondary:
        "bg-stone-100 hover:bg-stone-200 text-slate-800 border border-stone-200/80 focus-visible:ring-stone-400",
      outline:
        "border border-stone-300 hover:border-slate-400 bg-white hover:bg-stone-50 text-slate-700 focus-visible:ring-violet-500",
      ghost:
        "hover:bg-stone-100 text-slate-700 focus-visible:ring-violet-500",
      danger:
        "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 focus-visible:ring-rose-500",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-9 px-4 text-sm rounded-lg gap-2",
      lg: "h-11 px-6 text-base rounded-xl gap-2.5",
      icon: "h-9 w-9 rounded-lg justify-center p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
