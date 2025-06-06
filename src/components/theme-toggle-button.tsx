
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

// Exporting themes array for reuse
export const themes = [
  { name: "Light", value: "light", icon: Sun },
  { name: "Dark", value: "dark", icon: Moon },
  { name: "Ocean", value: "theme-ocean", icon: Palette },
  { name: "Forest", value: "theme-forest", icon: Palette },
  { name: "Midnight Dusk", value: "theme-midnight-dusk", icon: Moon },
  { name: "Cyber Glow", value: "theme-cyber-glow", icon: Moon },
  { name: "System", value: "system", icon: Laptop },
];

export function ThemeToggleButton() {
  const { setTheme, theme: activeTheme } = useTheme();

  const ActiveIcon = themes.find(t => t.value === activeTheme)?.icon || Laptop;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Select theme">
          <ActiveIcon className="h-[1.2rem] w-[1.2rem]" />
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
