import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppLanguage, isValidLanguage } from './types';
import { t as getTranslation } from './translations';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'app_lang';

function getInitialLanguage(): AppLanguage {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    for (const urlLang of [params.get('lang'), params.get('language')]) {
      if (isValidLanguage(urlLang)) {
        return urlLang;
      }
    }
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (isValidLanguage(savedLang)) {
      return savedLang;
    }
  }
  return 'kor';
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);

  const setLanguage = (newLang: AppLanguage) => {
    if (!isValidLanguage(newLang)) return;
    setLanguageState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLang);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  useEffect(() => {
    const handleHistoryChange = () => setLanguageState(getInitialLanguage());
    window.addEventListener('popstate', handleHistoryChange);
    return () => window.removeEventListener('popstate', handleHistoryChange);
  }, []);

  const t = (key: string) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
