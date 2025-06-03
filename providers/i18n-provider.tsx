'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { I18N_LANGUAGES, Language } from '@/i18n/config';
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';

interface I18nProviderProps {
  children: ReactNode;
}

interface LanguageContextProps {
  languageCode: string;
  language: Language;
  changeLanguage: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined,
);

function I18nProvider({ children }: I18nProviderProps) {
  const [languageCode, setLanguageCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      // Only access localStorage in the browser
      return localStorage.getItem('language') || 'en';
    }
    return 'en'; // Default language if running on the server
  });

  // Find the current language configuration based on the language code
  const language =
    I18N_LANGUAGES.find((lang) => lang.code === languageCode) ||
    I18N_LANGUAGES[0];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only access localStorage in the browser
      localStorage.setItem('language', languageCode);
    }
    if (language?.direction) {
      document.documentElement.setAttribute('dir', language.direction);
    }
  }, [languageCode, language]);

  const changeLanguage = (code: string) => {
    setLanguageCode(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', code);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ languageCode, changeLanguage, language }}
    >
      <RadixDirectionProvider dir={language.direction}>
        {children}
      </RadixDirectionProvider>
    </LanguageContext.Provider>
  );
}

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within an I18nProvider');
  }
  return context;
};

export { I18nProvider, useLanguage };
