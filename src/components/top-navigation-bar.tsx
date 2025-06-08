"use client";

import React from 'react';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, SaveIcon, ListChecks, Download, Upload, UserCircle, Settings2, LogOut } from 'lucide-react';
import { Logo } from '@/components/logo';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { ThemeOption } from '@/components/theme-toggle-button'; // Assuming ThemeOption is exported

interface TopNavigationBarProps {
  currentDesignName: string | null;
  currentUser: User | null;
  isSavingDesign: boolean;
  onMyDesignsClick: () => void;
  onSaveDesign: () => void;
  canSave: boolean;
  onExportDesign: () => void;
  onImportDesignClick: () => void;
  onLogout: () => void;
  themes: ThemeOption[];
  setTheme: (theme: string) => void;
}

export function TopNavigationBar({
  currentDesignName,
  currentUser,
  isSavingDesign,
  onMyDesignsClick,
  onSaveDesign,
  canSave,
  onExportDesign,
  onImportDesignClick,
  onLogout,
  themes,
  setTheme,
}: TopNavigationBarProps) {
  return (
    <div className="h-14 flex items-center justify-between px-4 border-b bg-card text-card-foreground sticky top-0 z-30">
      <div className="flex items-center gap-1 sm:gap-2">
        <SidebarTrigger className="md:hidden -ml-2" />
        <div className="hidden md:flex items-center"> <Logo variant="icon" /> </div>
        <h1 className="text-xl font-bold text-primary whitespace-nowrap overflow-hidden md:hidden">Architech AI</h1>

        <Button variant="ghost" size="sm" onClick={onMyDesignsClick}>
          <ListChecks className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">My Designs</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={onSaveDesign} disabled={isSavingDesign || !canSave}>
          {isSavingDesign ? (
            <Loader2 className="mr-0 md:mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SaveIcon className="mr-0 md:mr-2 h-4 w-4" />
          )}
          <span className="hidden md:inline">Save</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onExportDesign} title="Export Design as JSON">
            <Download className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Export</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onImportDesignClick} title="Import Design from JSON">
            <Upload className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Import</span>
        </Button>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
        <h2 className="text-base font-medium text-foreground truncate max-w-xs lg:max-w-sm xl:max-w-md">
          {currentDesignName || "Untitled Design"}
        </h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">User Profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {currentUser && (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Signed in as</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings2 className="h-5 w-5" />
               <span className="sr-only">Settings & Theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {themes.map((themeOption) => (
              <DropdownMenuItem
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className="cursor-pointer"
              >
                <themeOption.icon className="mr-2 h-4 w-4" />
                <span>{themeOption.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
