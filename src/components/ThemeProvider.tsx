import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
type Preference = "light" | "dark" | "system";
type Theme = "light" | "dark";
const ThemeContext = createContext<
  | {
      theme: Theme;
      preference: Preference;
      setPreference: (value: Preference) => void;
      toggle: () => void;
    }
  | undefined
>(undefined);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<Preference>(() => {
    try {
      const p = localStorage.getItem("theme");
      return p === "light" || p === "dark" ? p : "system";
    } catch {
      return "system";
    }
  });
  const [system, setSystem] = useState<Theme>(() =>
    matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );
  const theme = preference === "system" ? system : preference;
  useEffect(() => {
    const m = matchMedia("(prefers-color-scheme: dark)");
    const change = () => setSystem(m.matches ? "dark" : "light");
    m.addEventListener("change", change);
    return () => m.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("theme", preference);
    } catch {
      /* In-memory theme remains available. */
    }
  }, [theme, preference]);
  return (
    <ThemeContext.Provider
      value={{
        theme,
        preference,
        setPreference,
        toggle: () => setPreference(theme === "dark" ? "light" : "dark"),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProvider missing");
  return context;
}
