import React, { createContext, useContext, useEffect, useState } from 'react';

const LandingThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
});

const STORAGE_KEY = 'proxstream-landing-theme';

export const LandingThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-landing-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <LandingThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </LandingThemeContext.Provider>
  );
};

export const useLandingTheme = () => useContext(LandingThemeContext);

export default LandingThemeContext;
