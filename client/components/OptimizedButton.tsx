import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { buttonPress } from "../utils/animations";

interface OptimizedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function OptimizedButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  disabled,
  children,
  onClick,
  ...props
}: OptimizedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    select-none mobile-button fast-click will-change-transform
  `;

  const variantClasses = {
    primary: `
      bg-green-primary text-white hover:bg-green-secondary 
      focus-visible:ring-green-500 shadow-sm hover:shadow-md
      active:bg-green-600
    `,
    secondary: `
      bg-gray-100 text-gray-900 hover:bg-gray-200 
      focus-visible:ring-gray-500 
      active:bg-gray-300
    `,
    outline: `
      bg-transparent border-2 border-green-primary text-green-primary 
      hover:bg-green-primary hover:text-white focus-visible:ring-green-500
      active:bg-green-600 active:border-green-600
    `,
    ghost: `
      bg-transparent text-gray-700 hover:bg-gray-100 
      focus-visible:ring-gray-500
      active:bg-gray-200
    `,
    danger: `
      bg-red-500 text-white hover:bg-red-600 
      focus-visible:ring-red-500 shadow-sm hover:shadow-md
      active:bg-red-700
    `,
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-4 py-2 text-base min-h-[44px]",
    lg: "px-6 py-3 text-lg min-h-[52px]",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Haptic feedback for mobile devices
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }

    // Visual feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    if (onClick) {
      onClick(e);
    }
  };

  const handleTouchStart = () => {
    if (disabled || loading) return;
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${isPressed ? "scale-95" : ""}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...buttonPress}
      style={{
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        WebkitTouchCallout: "none",
      }}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {icon && iconPosition === "left" && !loading && (
        <span className="mr-2">{icon}</span>
      )}

      <span>{children}</span>

      {icon && iconPosition === "right" && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </motion.button>
  );
}
