import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: boolean;
    helperText?: string;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    fullWidth = true,
    className = '',
    ...props
}) => {
    const baseStyles = "h-12 px-4 rounded-lg bg-gray-50 dark:bg-black/20 border text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400";
    const borderStyles = error
        ? "border-red-500 ring-1 ring-red-500"
        : "border-gray-200 dark:border-gray-700";
    const widthStyles = fullWidth ? "w-full" : "";

    return (
        <div className={`space-y-1.5 ${widthStyles}`}>
            {label && (
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <input
                className={`${baseStyles} ${borderStyles} ${widthStyles} ${className}`}
                onFocus={(e) => {
                    // Auto-scroll to center on focus
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    props.onFocus?.(e);
                }}
                {...props}
            />
            {helperText && (
                <span className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
                    {helperText}
                </span>
            )}
        </div>
    );
};
