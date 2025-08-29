// Environment configuration for Finance Inspector UI
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  },

  // Application Configuration
  app: {
    name: 'Finance Inspector',
    version: '1.0.0',
    description: 'Personal Finance Management System',
  },

  // Development Configuration
  dev: {
    enableLogging: import.meta.env.DEV || false,
    showDebugInfo: import.meta.env.VITE_SHOW_DEBUG === 'true',
  },

  // Feature Flags
  features: {
    darkMode: true,
    notifications: true,
    analytics: false,
    realTimeUpdates: false,
  },

  // UI Configuration
  ui: {
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
    },
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: [5, 10, 25, 50],
    },
  },

  // Validation Rules
  validation: {
    user: {
      nameMinLength: 2,
      nameMaxLength: 100,
      emailMaxLength: 255,
    },
    income: {
      amountMin: 0,
      amountMax: 999999999,
      descriptionMaxLength: 500,
    },
  },

  // Date Formatting
  dateFormat: {
    display: 'DD/MM/YYYY',
    api: 'YYYY-MM-DD',
    datetime: 'DD/MM/YYYY HH:mm:ss',
  },
};

export default config;