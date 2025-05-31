
import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  type: 'text' | 'number' | 'textarea';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  unit?: string;
  required?: boolean;
  min?: string;
  step?: string;
  rows?: number;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  unit,
  required = false,
  min,
  step,
  rows,
  disabled = false,
}) => {
  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100 disabled:text-gray-500";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {type === 'textarea' ? (
          <textarea
            id={id}
            name={id}
            rows={rows || 3}
            className={commonInputClasses}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
          />
        ) : (
          <input
            type={type}
            id={id}
            name={id}
            className={`${commonInputClasses} ${unit ? 'pr-12' : ''}`}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            step={step}
            disabled={disabled}
          />
        )}
        {unit && type !== 'textarea' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{unit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormField;
