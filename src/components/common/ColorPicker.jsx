import React, { useState, useRef, useEffect } from 'react';

const ColorPicker = ({
  value = '#3B82F6',
  onChange,
  disabled = false,
  required = false,
  error = null,
  label = null,
  className = '',
  allowCustom = true,
  showPreview = true,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);
  const containerRef = useRef(null);

  useEffect(() => {
    setCustomColor(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const predefinedColors = [
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Slate', value: '#64748B' }
  ];

  const categoryColors = [
    { name: 'Food & Dining', value: '#F59E0B' },
    { name: 'Transportation', value: '#3B82F6' },
    { name: 'Shopping', value: '#EC4899' },
    { name: 'Entertainment', value: '#8B5CF6' },
    { name: 'Bills & Utilities', value: '#EF4444' },
    { name: 'Healthcare', value: '#10B981' },
    { name: 'Travel', value: '#06B6D4' },
    { name: 'Education', value: '#F97316' }
  ];

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const handleColorSelect = (color) => {
    setCustomColor(color);
    onChange && onChange(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange && onChange(newColor);
  };

  const isValidHexColor = (color) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const getContrastTextColor = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="flex items-center gap-3">
        {/* Color Preview Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            ${sizeClasses[size]} rounded-lg border-2 border-gray-300 shadow-sm transition-all
            ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-gray-400 focus:ring-2 focus:ring-blue-500'}
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
          `}
          style={{ backgroundColor: value }}
          title={`Selected color: ${value}`}
        >
          <span className="sr-only">Select color</span>
        </button>

        {/* Color Value Display */}
        {showPreview && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customColor}
              onChange={handleCustomColorChange}
              disabled={disabled}
              placeholder="#3B82F6"
              className={`
                w-24 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              `}
            />
            {isValidHexColor(customColor) && (
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: customColor }}
              />
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Color Picker Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80">
          {/* Predefined Colors */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Colors</h4>
            <div className="grid grid-cols-6 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  className={`
                    w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 focus:ring-2 focus:ring-blue-500
                    ${value === color.value ? 'border-gray-800 ring-2 ring-blue-500' : 'border-gray-300 hover:border-gray-400'}
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {value === color.value && (
                    <span 
                      className="block w-full h-full flex items-center justify-center text-xs font-bold"
                      style={{ color: getContrastTextColor(color.value) }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category Colors */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Category Colors</h4>
            <div className="grid grid-cols-4 gap-2">
              {categoryColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  className={`
                    p-2 rounded-lg border-2 transition-all hover:scale-105 focus:ring-2 focus:ring-blue-500 text-xs
                    ${value === color.value ? 'border-gray-800 ring-2 ring-blue-500' : 'border-gray-300 hover:border-gray-400'}
                  `}
                  style={{ 
                    backgroundColor: color.value,
                    color: getContrastTextColor(color.value)
                  }}
                  title={color.name}
                >
                  {color.name.split(' ')[0]}
                  {value === color.value && (
                    <div className="text-center mt-1">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          {allowCustom && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Color</h4>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  placeholder="#3B82F6"
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleColorSelect(customColor)}
                  disabled={!isValidHexColor(customColor)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
              {!isValidHexColor(customColor) && customColor && (
                <p className="mt-1 text-xs text-red-600">Invalid hex color format</p>
              )}
            </div>
          )}

          {/* Recent Colors (placeholder for future implementation) */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              type="button"
              onClick={() => handleColorSelect('')}
              className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized color picker for categories
export const CategoryColorPicker = ({ value, onChange, ...props }) => (
  <ColorPicker
    {...props}
    value={value}
    onChange={onChange}
    allowCustom={true}
    showPreview={true}
    size="md"
  />
);

export default ColorPicker;