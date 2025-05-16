
"use client";

import * as React from "react";
import { Laptop, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes = [
  { name: "Light", value: "light", icon: Sun },
  { name: "Dark", value: "dark", icon: Moon },
  { name: "Ocean", value: "theme-ocean", icon: Palette }, // Using Palette as a generic theme icon
  { name: "Forest", value: "theme-forest", icon: Palette }, // Using Palette as a generic theme icon
  { name: "System", value: "system", icon: Laptop },
];

export function ThemeToggleButton() {
  const { setTheme, theme: activeTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Select theme">
          {activeTheme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {activeTheme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
          {activeTheme === 'theme-ocean' && <Palette className="h-[1.2rem] w-[1.2rem]" />}
          {activeTheme === 'theme-forest' && <Palette className="h-[1.2rem] w-[1.2rem]" />}
          {activeTheme === 'system' && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => setTheme(theme.value)}
            className="cursor-pointer"
          >
            <theme.icon className="mr-2 h-4 w-4" />
            <span>{theme.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
