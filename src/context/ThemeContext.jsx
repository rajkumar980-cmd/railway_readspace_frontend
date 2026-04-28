import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';

const ThemeContext = createContext(null);

function getInitialTheme() {
  const stored = localStorage.getItem('lf-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  // Track whether this is first mount so we skip the transition on initial apply
  const isFirstMount = useRef(true);

  // useLayoutEffect fires before paint — prevents flash of wrong theme
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lf-theme', theme);
    isFirstMount.current = false;
  }, [theme]);

  const toggle = () => {
    // Briefly enable global color transitions only during theme switch
    document.body.classList.add('theme-transitioning');
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
    setTimeout(() => document.body.classList.remove('theme-transitioning'), 320);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
