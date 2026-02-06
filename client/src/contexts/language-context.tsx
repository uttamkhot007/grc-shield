import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Language, LanguageConfig, languages, translations, TranslationKey } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  languageConfig: LanguageConfig;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  languages: LanguageConfig[];
  direction: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "grc-language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && languages.some((l) => l.code === stored)) {
    return stored as Language;
  }
  
  const browserLang = navigator.language.split("-")[0];
  if (languages.some((l) => l.code === browserLang)) {
    return browserLang as Language;
  }
  
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  
  const languageConfig = languages.find((l) => l.code === language) || languages[0];
  
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    
    const config = languages.find((l) => l.code === lang);
    if (config) {
      document.documentElement.dir = config.direction;
      document.documentElement.lang = lang;
    }
  }, []);
  
  const t = useCallback(
    (key: TranslationKey): string => {
      const langTranslations = translations[language];
      if (langTranslations && key in langTranslations) {
        return langTranslations[key as keyof typeof langTranslations];
      }
      return translations.en[key] || key;
    },
    [language]
  );
  
  useEffect(() => {
    document.documentElement.dir = languageConfig.direction;
    document.documentElement.lang = language;
  }, [language, languageConfig.direction]);
  
  return (
    <LanguageContext.Provider
      value={{
        language,
        languageConfig,
        setLanguage,
        t,
        languages,
        direction: languageConfig.direction,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
