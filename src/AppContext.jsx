import { createContext, useContext, useState } from "react";
import { translations } from "./i18n";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("en");

  const t = (key) => translations[lang]?.[key] ?? translations.es[key] ?? key;

  return (
    <AppContext.Provider value={{ theme, setTheme, lang, setLang, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
