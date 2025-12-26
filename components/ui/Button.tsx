import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  leftIcon, 
  rightIcon, 
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "w-full h-14 font-bold text-lg rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-red-700 active:bg-red-800 text-white shadow-primary/20",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 shadow-gray-200/50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:shadow-none",
    outline: "border-2 border-primary text-primary hover:bg-primary/5 shadow-none",
    ghost: "bg-transparent shadow-none hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200"
  };

  return (
    <button 
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};
