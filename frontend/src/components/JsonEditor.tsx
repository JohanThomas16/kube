import React, { useState, useCallback } from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter JSON here...',
  disabled = false,
  error
}) => {
  const [isValid, setIsValid] = useState(true);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Validate JSON
    if (newValue.trim()) {
      try {
        JSON.parse(newValue);
        setIsValid(true);
      } catch {
        setIsValid(false);
      }
    } else {
      setIsValid(true);
    }
  }, [onChange]);

  const formatJson = useCallback(() => {
    if (value.trim()) {
      try {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        onChange(formatted);
        setIsValid(true);
      } catch {
        // Invalid JSON, don't format
      }
    }
  }, [value, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          JSON Credential
        </label>
        <button
          type="button"
          onClick={formatJson}
          disabled={disabled || !value.trim()}
          className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Format JSON
        </button>
      </div>
      
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={12}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 font-mono text-sm text-gray-900 placeholder-gray-500 ${
          error || !isValid
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
      />
      
      {!isValid && (
        <p className="text-sm text-red-600">Invalid JSON format</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
