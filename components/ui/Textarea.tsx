import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: boolean;
    helperText?: string;
    fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    error,
    helperText,
    fullWidth = true,
    className = '',
    ...props
}) => {
    const baseStyles = "p-4 rounded-lg bg-gray-50 dark:bg-black/20 border text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-gray-400";
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
            <textarea
                className={`${baseStyles} ${borderStyles} ${widthStyles} ${className}`}
                onFocus={(e) => {
                    // Auto-scroll to center on focus
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    props.onFocus?.(e);
                }}
                {...props}
            ></textarea>
            {helperText && (
                <span className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
                    {helperText}
                </span>
            )}
        </div>
    );
};
