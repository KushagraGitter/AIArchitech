
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
import { Loader2, SaveIcon, ListChecks, Download, Upload, UserCircle, Settings2, LogOut, Code, FilePlus2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { ThemeOption } from '@/components/theme-toggle-button'; 

interface TopNavigationBarProps {
  currentDesignName: string | null;
  currentUser: User | null;
  isSavingDesign: boolean;
  onMyDesignsClick: () => void;
  onSaveDesign: () => void;
  canSave: boolean;
  onExportDesign: () => void;
  onImportDesignClick: () => void;
  onExportToTerraformClick: () => void;
  onNewDesignClick: () => void; // Added new prop
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
  onExportToTerraformClick,
  onNewDesignClick, // Consumed new prop
  onLogout,
  themes,
  setTheme,
}: TopNavigationBarProps) {
  return (
    <div className="h-14 flex items-center justify-between px-4 border-b bg-card text-card-foreground sticky top-0 z-30">
      {/* Left Aligned Items: Logo and Design Name */}
      <div className="flex items-center gap-1 sm:gap-2">
        <SidebarTrigger className="md:hidden -ml-2" />
        
        <div className="block md:hidden"> {/* Mobile: Full Logo with text */}
          <Logo variant="full" />
        </div>
        <div className="hidden md:block"> {/* Desktop: Icon Logo */}
          <Logo variant="icon" />
        </div>
        
        <h2 className="text-base font-medium text-foreground truncate max-w-xs lg:max-w-sm xl:max-w-md hidden md:block">
          {currentDesignName || "Untitled Design"}
        </h2>
      </div>

      {/* Right Aligned Items: Action Icons, User Menu, Settings Menu */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" onClick={onNewDesignClick} title="New Design">
          <FilePlus2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onSaveDesign} disabled={isSavingDesign || !canSave} title="Save Design">
          {isSavingDesign ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SaveIcon className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={onExportDesign} title="Export Design as JSON">
            <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onImportDesignClick} title="Import Design from JSON">
            <Upload className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onExportToTerraformClick} title="Export to Terraform (Experimental)">
            <Code className="h-4 w-4" />
        </Button>

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
                <DropdownMenuItem onClick={onMyDesignsClick} className="cursor-pointer">
                  <ListChecks className="mr-2 h-4 w-4" />
                  <span>My Designs</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
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
