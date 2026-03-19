import React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
        } else if (theme === "dark") {
            setTheme("system");
        } else {
            setTheme("light");
        }
    };

    return (
        <button
            onClick={cycleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title={`Current theme: ${theme}. Click to change.`}
        >
            {theme === "light" && <Sun size={18} />}
            {theme === "dark" && <Moon size={18} />}
            {theme === "system" && <Laptop size={18} />}
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
