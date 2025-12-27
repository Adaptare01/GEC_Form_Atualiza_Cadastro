import React, { useState, useEffect, useRef } from 'react';
import { Input } from './Input';

interface DateInputProps {
    label?: string;
    value?: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    error?: boolean;
    helperText?: string;
    className?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
    label,
    value,
    onChange,
    error,
    helperText,
    className
}) => {
    // Internal state for the masked text input (DD/MM/YYYY)
    const [textValue, setTextValue] = useState('');
    const hiddenDateRef = useRef<HTMLInputElement>(null);

    // Sync from prop (YYYY-MM-DD) to text (DD/MM/YYYY)
    useEffect(() => {
        if (!value) {
            setTextValue('');
            return;
        }

        const [year, month, day] = value.split('-');
        if (year && month && day) {
            setTextValue(`${day}/${month}/${year}`);
        }
    }, [value]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove non-digits

        // Mask logic
        if (val.length > 8) val = val.slice(0, 8);

        if (val.length >= 5) {
            val = val.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
        } else if (val.length >= 3) {
            val = val.replace(/(\d{2})(\d{1,2})/, '$1/$2');
        }

        setTextValue(val);

        // Validate and emit if complete
        if (val.length === 10) {
            const [day, month, year] = val.split('/');
            // Basic validation
            const numDay = parseInt(day);
            const numMonth = parseInt(month);
            const numYear = parseInt(year);

            if (numMonth > 0 && numMonth <= 12 && numDay > 0 && numDay <= 31 && numYear > 1900) {
                // Determine max days in month (simple check)
                const date = new Date(numYear, numMonth - 1, numDay);
                if (date.getDate() === numDay && date.getMonth() === numMonth - 1) {
                    onChange(`${year}-${month}-${day}`);
                }
            }
        } else if (val === '') {
            onChange('');
        }
    };

    const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value); // This comes as YYYY-MM-DD from native picker
    };

    const openCalendar = () => {
        hiddenDateRef.current?.showPicker();
    };

    return (
        <div className="relative">
            {/* The visible text input */}
            <div className="relative">
                <Input
                    label={label}
                    placeholder="DD/MM/AAAA"
                    value={textValue}
                    onChange={handleTextChange}
                    error={error}
                    maxLength={10}
                    className={`pr-10 ${className || ''}`}
                    inputMode="numeric"
                // Allow opening calendar by clicking icon
                />

                {/* Calendar Icon Button */}
                <button
                    type="button"
                    onClick={openCalendar}
                    className="absolute right-3 top-[34px] p-1 text-gray-400 hover:text-primary transition-colors z-10"
                    aria-label="Selecionar data no calendário"
                >
                    <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                </button>
            </div>

            {/* Hidden native Date Input for the picker functionality */}
            <input
                ref={hiddenDateRef}
                type="date"
                value={value || ''}
                onChange={handleCalendarChange}
                className="invisible absolute top-0 left-0 w-0 h-0"
                tabIndex={-1}
            />
            {helperText && (
                <span className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'} mt-1 block`}>
                    {helperText}
                </span>
            )}
        </div>
    );
};
