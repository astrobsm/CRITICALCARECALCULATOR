'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent'
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="ml-1 inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-300"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
        aria-label="Information"
      >
        <Info className="w-4 h-4" />
      </button>

      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} animate-fadeIn`}
          role="tooltip"
        >
          <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-lg">
            {content}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface InputWithTooltipProps {
  label: string;
  tooltip: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: string;
  required?: boolean;
  error?: string;
}

export function InputWithTooltip({
  label,
  tooltip,
  type = 'number',
  value,
  onChange,
  placeholder,
  unit,
  min,
  max,
  step = '0.01',
  required = false,
  error
}: InputWithTooltipProps) {
  const hasError = Boolean(error && value);
  const isValid = !hasError && Boolean(value);

  const getInputClasses = () => {
    const baseClasses = "w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2";
    
    if (!value) {
      return `${baseClasses} border-gray-300 focus:border-primary-500 focus:ring-primary-200`;
    }
    
    if (isValid) {
      return `${baseClasses} border-green-400 bg-green-50 focus:border-green-500 focus:ring-green-200`;
    }
    
    return `${baseClasses} border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200`;
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        <Tooltip content={tooltip} />
      </label>
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required={required}
          className={getInputClasses()}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${label}-error` : undefined}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      
      {error && value && (
        <p id={`${label}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <Info className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectWithTooltipProps {
  label: string;
  tooltip: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}

export function SelectWithTooltip({
  label,
  tooltip,
  value,
  onChange,
  options,
  required = false
}: SelectWithTooltipProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        <Tooltip content={tooltip} />
      </label>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 focus:outline-none bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
