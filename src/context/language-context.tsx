'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language, 
  DEFAULT_LANGUAGE, 
  translations, 
  getNestedTranslation, 
  formatTranslation 
} from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = DEFAULT_LANGUAGE }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // Check localStorage first
        const storedLanguage = localStorage.getItem('preferred-language') as Language;
        if (storedLanguage && ['tr', 'en'].includes(storedLanguage)) {
          setLanguageState(storedLanguage);
        } else {
          // Fallback to browser language
          const browserLanguage = navigator.language.split('-')[0] as Language;
          if (['tr', 'en'].includes(browserLanguage)) {
            setLanguageState(browserLanguage);
          } else {
            setLanguageState(DEFAULT_LANGUAGE);
          }
        }
      } catch (error) {
        console.warn('Failed to initialize language:', error);
        setLanguageState(DEFAULT_LANGUAGE);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Update document language and direction
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      
      // Update page title based on language
      const titleKey = 'common.appTitle';
      const translatedTitle = getNestedTranslation(translations[language], titleKey);
      if (translatedTitle !== titleKey) {
        document.title = translatedTitle;
      }
    }
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    
    // Persist to localStorage
    try {
      localStorage.setItem('preferred-language', newLanguage);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }

    // Trigger custom event for other components to listen to
    const event = new CustomEvent('languageChanged', {
      detail: { language: newLanguage }
    });
    window.dispatchEvent(event);
  };

  const t = (key: string, values?: Record<string, string | number>): string => {
    try {
      const currentTranslations = translations[language];
      if (!currentTranslations) {
        console.warn(`Translations not found for language: ${language}`);
        return key;
      }

      let translation = getNestedTranslation(currentTranslations, key);
      
      // If translation not found in current language, try fallback
      if (translation === key && language !== DEFAULT_LANGUAGE) {
        const fallbackTranslations = translations[DEFAULT_LANGUAGE];
        translation = getNestedTranslation(fallbackTranslations, key);
      }

      // Apply formatting if values provided
      if (values && translation !== key) {
        return formatTranslation(translation, values);
      }

      return translation;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return key;
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    dir: 'ltr', // Turkish and English are both LTR
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Higher-order component for class components
export function withLanguage<P extends object>(
  Component: React.ComponentType<P & { language: LanguageContextType }>
) {
  return function WrappedComponent(props: P) {
    const languageContext = useLanguage();
    return <Component {...props} language={languageContext} />;
  };
}

// Custom hook for translation with plural support
export function useTranslation() {
  const { t, language } = useLanguage();

  const tPlural = (
    key: string, 
    count: number, 
    values?: Record<string, string | number>
  ): string => {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    const translation = t(pluralKey, { ...values, count });
    
    // If plural form not found, try the base key
    if (translation === pluralKey) {
      return t(key, { ...values, count });
    }
    
    return translation;
  };

  const tChoice = (
    key: string, 
    choice: string, 
    values?: Record<string, string | number>
  ): string => {
    return t(`${key}.${choice}`, values);
  };

  return {
    t,
    tPlural,
    tChoice,
    language,
    isRTL: false, // Turkish and English are LTR
    isLTR: true
  };
}

// Utility hook for date/time formatting based on language
export function useLocaleFormat() {
  const { language } = useLanguage();

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  };

  const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  };

  const formatDateTime = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  };

  const formatCurrency = (amount: number, currency = 'TRY') => {
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    
    // Adjust currency based on language preference if not specified
    const preferredCurrency = language === 'tr' ? 'TRY' : 'USD';
    const finalCurrency = currency === 'TRY' ? preferredCurrency : currency;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: finalCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number, options?: Intl.NumberFormatOptions) => {
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      ...options
    }).format(value / 100);
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCurrency,
    formatPercentage,
    locale: language === 'tr' ? 'tr-TR' : 'en-US'
  };
}

// Hook for detecting language changes
export function useLanguageChange(callback: (language: Language) => void) {
  const { language } = useLanguage();

  useEffect(() => {
    callback(language);
  }, [language, callback]);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<{ language: Language }>) => {
      callback(event.detail.language);
    };

    window.addEventListener('languageChanged' as any, handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged' as any, handleLanguageChange);
    };
  }, [callback]);
}