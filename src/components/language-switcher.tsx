'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { LANGUAGES } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'text-only';
  showFlag?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  variant = 'default',
  showFlag = true,
  className = ''
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGES.find(lang => lang.code === language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as any);
    setIsOpen(false);
  };

  // Compact variant for mobile or tight spaces
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          aria-label={t('profile.language')}
        >
          {showFlag && currentLanguage && (
            <span className="text-lg" role="img" aria-label={currentLanguage.name}>
              {currentLanguage.flag}
            </span>
          )}
          <span className="font-medium">{currentLanguage?.code.toUpperCase()}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[120px] z-50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  language === lang.code ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
                }`}
              >
                {showFlag && (
                  <span className="text-lg" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                )}
                <span className="flex-1 text-left">{lang.code.toUpperCase()}</span>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-purple-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Text-only variant without flags
  if (variant === 'text-only') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:border-gray-400"
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{currentLanguage?.name}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[140px] z-50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  language === lang.code ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
                }`}
              >
                <span>{lang.name}</span>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-purple-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant with flags and full names
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:border-gray-400 bg-white"
        aria-label={t('profile.language')}
      >
        {showFlag && currentLanguage && (
          <span className="text-lg" role="img" aria-label={currentLanguage.name}>
            {currentLanguage.flag}
          </span>
        )}
        <div className="flex flex-col items-start">
          <span className="font-medium text-gray-900">{currentLanguage?.name}</span>
          <span className="text-xs text-gray-500">{t('profile.language')}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] z-50">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
            {t('profile.language')}
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                language === lang.code ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
              }`}
            >
              {showFlag && (
                <span className="text-lg" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
              )}
              <div className="flex-1 text-left">
                <div className="font-medium">{lang.name}</div>
                <div className="text-xs text-gray-500">{lang.code.toUpperCase()}</div>
              </div>
              {language === lang.code && (
                <Check className="h-4 w-4 text-purple-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple language toggle for header/navbar
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  const currentLang = LANGUAGES.find(lang => lang.code === language);
  const nextLang = LANGUAGES.find(lang => lang.code !== language);

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors ${className}`}
      aria-label={`Switch to ${nextLang?.name}`}
      title={`Switch to ${nextLang?.name}`}
    >
      <span className="text-lg" role="img" aria-label={currentLang?.name}>
        {currentLang?.flag}
      </span>
      <span className="hidden sm:inline">{currentLang?.code.toUpperCase()}</span>
    </button>
  );
}

// Language selector for forms/settings
export function LanguageSelector({
  value,
  onChange,
  className = '',
  showLabels = true
}: {
  value?: string;
  onChange?: (language: string) => void;
  className?: string;
  showLabels?: boolean;
}) {
  const { language: contextLanguage, setLanguage, t } = useLanguage();
  const currentValue = value || contextLanguage;

  const handleChange = (newLanguage: string) => {
    if (onChange) {
      onChange(newLanguage);
    } else {
      setLanguage(newLanguage as any);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {showLabels && (
        <label className="block text-sm font-medium text-gray-700">
          {t('profile.language')}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
              currentValue === lang.code
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <span className="text-2xl" role="img" aria-label={lang.name}>
              {lang.flag}
            </span>
            <div className="text-left">
              <div className="font-medium">{lang.name}</div>
              <div className="text-sm opacity-75">{lang.code.toUpperCase()}</div>
            </div>
            {currentValue === lang.code && (
              <Check className="h-5 w-5 ml-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Loading skeleton for language switcher
export function LanguageSwitcherSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'text-only' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg">
      <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="flex flex-col gap-1">
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}