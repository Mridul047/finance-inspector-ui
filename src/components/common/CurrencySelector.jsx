import React, { useState, useRef, useEffect } from 'react';

const CurrencySelector = ({
  value = 'USD',
  onChange,
  disabled = false,
  required = false,
  error = null,
  label = null,
  className = '',
  showSymbol = true,
  showFlag = true,
  allowSearch = true,
  placeholder = 'Select currency'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && allowSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, allowSearch]);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' }
  ];

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'];

  const filteredCurrencies = currencies.filter(currency => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      currency.code.toLowerCase().includes(searchLower) ||
      currency.name.toLowerCase().includes(searchLower) ||
      currency.symbol.toLowerCase().includes(searchLower)
    );
  });

  const selectedCurrency = currencies.find(c => c.code === value);

  const handleCurrencySelect = (currencyCode) => {
    onChange && onChange(currencyCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  const formatCurrencyDisplay = (currency, compact = false) => {
    const parts = [];
    
    if (showFlag && currency.flag) parts.push(currency.flag);
    if (showSymbol && currency.symbol) parts.push(currency.symbol);
    
    if (compact) {
      parts.push(currency.code);
    } else {
      parts.push(`${currency.code} - ${currency.name}`);
    }
    
    return parts.join(' ');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2 pr-10 text-left border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white hover:border-gray-400'}
          `}
        >
          <span className="flex items-center gap-2">
            {selectedCurrency ? (
              formatCurrencyDisplay(selectedCurrency, true)
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </span>
        </button>
        
        <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Currency Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          {allowSearch && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search currencies..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>
          )}

          {/* Popular Currencies */}
          {!searchTerm && (
            <div className="p-3 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Currencies</h4>
              <div className="grid grid-cols-3 gap-1">
                {popularCurrencies.map(currencyCode => {
                  const currency = currencies.find(c => c.code === currencyCode);
                  if (!currency) return null;
                  
                  return (
                    <button
                      key={currency.code}
                      type="button"
                      onClick={() => handleCurrencySelect(currency.code)}
                      className={`
                        p-2 text-xs text-left rounded hover:bg-gray-100 transition-colors
                        ${value === currency.code ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}
                      `}
                    >
                      <div className="flex items-center gap-1">
                        {showFlag && <span>{currency.flag}</span>}
                        <span className="font-medium">{currency.code}</span>
                        {showSymbol && <span className="text-gray-500">({currency.symbol})</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Currencies List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCurrencies.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <span className="block text-2xl mb-2">🔍</span>
                <p>No currencies found</p>
              </div>
            ) : (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => handleCurrencySelect(currency.code)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0
                    ${value === currency.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {showFlag && <span className="text-lg">{currency.flag}</span>}
                      <div>
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-sm text-gray-500">{currency.name}</div>
                      </div>
                    </div>
                    {showSymbol && (
                      <span className="text-lg font-medium text-gray-600">{currency.symbol}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized currency selector for compact display
export const CompactCurrencySelector = ({ value, onChange, ...props }) => (
  <CurrencySelector
    {...props}
    value={value}
    onChange={onChange}
    showFlag={false}
    showSymbol={true}
    allowSearch={false}
    className="w-24"
  />
);

// Currency display component (read-only)
export const CurrencyDisplay = ({ 
  currencyCode, 
  amount = null, 
  showFlag = true, 
  showSymbol = true, 
  className = '' 
}) => {
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' }
  ];
  
  const currency = currencies.find(c => c.code === currencyCode);
  
  if (!currency) {
    return <span className={className}>{currencyCode}</span>;
  }
  
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {showFlag && <span>{currency.flag}</span>}
      {amount !== null ? (
        <>
          {showSymbol && <span>{currency.symbol}</span>}
          <span>{amount.toLocaleString()}</span>
          <span className="text-sm text-gray-500">{currency.code}</span>
        </>
      ) : (
        <>
          {showSymbol && <span>{currency.symbol}</span>}
          <span>{currency.code}</span>
        </>
      )}
    </span>
  );
};

export default CurrencySelector;