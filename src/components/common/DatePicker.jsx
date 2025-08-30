import React, { useState, useRef, useEffect } from 'react';

const DatePicker = ({
  value = '',
  onChange,
  placeholder = 'Select date',
  disabled = false,
  required = false,
  error = null,
  label = null,
  className = '',
  minDate = null,
  maxDate = null,
  showTime = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
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


  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate and call onChange
    if (newValue) {
      try {
        const date = new Date(newValue);
        if (!isNaN(date.getTime())) {
          // Check min/max constraints
          if (minDate && date < new Date(minDate)) return;
          if (maxDate && date > new Date(maxDate)) return;
          
          onChange && onChange(newValue);
        }
      } catch {
        // Invalid date, don't call onChange
      }
    } else {
      onChange && onChange('');
    }
  };

  const handleDateSelect = (dateStr) => {
    setInputValue(dateStr);
    onChange && onChange(dateStr);
    setIsOpen(false);
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentDate = inputValue ? new Date(inputValue) : today;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === today.toDateString();
      const isSelected = inputValue && current.toDateString() === new Date(inputValue).toDateString();
      
      // Check if date is disabled by min/max constraints
      const isDisabled = 
        (minDate && current < new Date(minDate)) ||
        (maxDate && current > new Date(maxDate));
      
      days.push({
        date: new Date(current),
        dateStr,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const currentDate = inputValue ? new Date(inputValue) : new Date();
    const newMonth = direction === 'prev' 
      ? new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    setInputValue(newMonth.toISOString().split('T')[0]);
  };

  const getCurrentMonthYear = () => {
    const date = inputValue ? new Date(inputValue) : new Date();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const quickSelectOptions = [
    { label: 'Today', value: new Date().toISOString().split('T')[0] },
    { label: 'Yesterday', value: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
    { label: 'Last Week', value: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] },
    { label: 'Last Month', value: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0] }
  ];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type={showTime ? 'datetime-local' : 'date'}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={minDate}
          max={maxDate}
          className={`
            w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          📅
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80">
          {/* Quick Select Options */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickSelectOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleDateSelect(option.value)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 text-left"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <h3 className="font-medium text-gray-900">{getCurrentMonthYear()}</h3>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="p-2 text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            {generateCalendarDays().map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => !day.isDisabled && handleDateSelect(day.dateStr)}
                disabled={day.isDisabled}
                className={`
                  p-2 text-sm rounded hover:bg-gray-100 transition-colors
                  ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                  ${day.isToday ? 'bg-blue-100 text-blue-600 font-medium' : ''}
                  ${day.isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${day.isDisabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}
                `}
              >
                {day.day}
              </button>
            ))}
          </div>

          {/* Clear button */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => handleDateSelect('')}
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

// Specialized date range picker component
export const DateRangePicker = ({
  startDate = '',
  endDate = '',
  onStartDateChange,
  onEndDateChange,
  placeholder = { start: 'Start date', end: 'End date' },
  disabled = false,
  required = false,
  error = null,
  label = null,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DatePicker
          value={startDate}
          onChange={onStartDateChange}
          placeholder={placeholder.start}
          disabled={disabled}
          required={required}
          maxDate={endDate || null}
          error={error?.start}
        />
        <DatePicker
          value={endDate}
          onChange={onEndDateChange}
          placeholder={placeholder.end}
          disabled={disabled}
          required={required}
          minDate={startDate || null}
          error={error?.end}
        />
      </div>
      
      {error?.general && (
        <p className="mt-1 text-sm text-red-600">{error.general}</p>
      )}
    </div>
  );
};

export default DatePicker;