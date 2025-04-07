"use client";

import { useTheme } from "@/context/ThemeProvider";
import { Laptop, Sun, Moon } from "lucide-react";

export default function Tabs() {

  const { theme, setTheme } = useTheme();

  const themes = {
    "system": 0,
    "light": 1,
    "dark": 2
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative text-gray-700 dark:text-gray-300 flex bg-white dark:bg-neutral-950 p-1 rounded-3xl border border-[#ddd] dark:border-[#333] shadow-xs text-xs z-10"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setTheme("system");
        }}
        className={`transition-colors ${theme === "system" ? "text-white" : "dark:hover:text-gray-300/50 hover:text-gray-700/50"} p-1 w-6 flex justify-center items-center flex-grow rounded-md cursor-pointer select-none`}
      >
        <Laptop className="w-4 h-4 text-inherit" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setTheme("light");
        }}
        className={`transition-colors ${theme === "light" ? "text-white" : "dark:hover:text-gray-300/50 hover:text-gray-700/50"} p-1 w-6 flex justify-center items-center flex-grow rounded-md cursor-pointer select-none`}
      >
        <Sun className="w-4 h-4 text-inherit" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setTheme("dark");
        }}
        className={`transition-colors ${theme === "dark" ? "text-white" : "dark:hover:text-gray-300/50 hover:text-gray-700/50"} p-1 w-6 flex justify-center items-center flex-grow rounded-md cursor-pointer select-none`}
      >
        <Moon className="w-4 h-4 text-inherit" />
      </button>

      <div
        style={{ left: `calc(${themes[theme]} * 24px + 4px)` }}
        className={`transition-[left] duration-300 absolute top-1 bottom-1 p-1 w-6 border rounded-full bg-purple-500 dark:bg-[#212121] -z-10`}
      ></div>
    </div>
  );
}
