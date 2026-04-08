import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "white";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClass = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    // Size variants
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3.5 text-sm", // Matched styling with existing primary join button
    };

    // Style variants
    const variants = {
      primary: "bg-[#0066FF] text-white hover:bg-blue-700 shadow-sm shadow-blue-200 active:scale-[0.98]",
      secondary: "bg-gray-100 text-slate-800 hover:bg-gray-200 active:scale-[0.98]",
      outline: "border border-gray-300 bg-transparent text-slate-700 hover:bg-gray-50 active:scale-[0.98]",
      ghost: "bg-transparent text-slate-700 hover:bg-gray-100 active:scale-[0.98]",
      danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-200 active:scale-[0.98]",
      white: "bg-white text-slate-700 border border-gray-300 hover:bg-gray-50 shadow-sm active:scale-[0.98]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClass} ${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
