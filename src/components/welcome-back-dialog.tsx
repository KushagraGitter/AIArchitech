
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UserDesign } from './architech-app';
import { formatDistanceToNow } from 'date-fns';
import { FileText, PlusCircle, Hand, ListChecks } from 'lucide-react';

interface WelcomeBackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  designs: UserDesign[];
  onLoadDesignClick: (designId: string, designName: string) => void;
  onCreateNewClick: () => void;
  dialogType?: "welcomeBack" | "myDesigns"; // New prop to differentiate dialog context
}

export function WelcomeBackDialog({
  isOpen,
  onClose,
  designs,
  onLoadDesignClick,
  onCreateNewClick,
  dialogType = "welcomeBack", // Default to welcomeBack
}: WelcomeBackDialogProps) {
  if (!isOpen) {
    return null;
  }

  const sortedDesigns = [...designs].sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
  const recentDesigns = sortedDesigns.slice(0, dialogType === "myDesigns" ? designs.length : 5); // Show all if "myDesigns", else top 5

  const title = dialogType === "myDesigns" ? "My Saved Designs" : "Welcome Back!";
  const description = dialogType === "myDesigns"
    ? "Select a design to load it onto the canvas, or create a new one."
    : "Choose one of your recent designs to continue, or start a new one.";
  const Icon = dialogType === "myDesigns" ? ListChecks : Hand;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        {designs.length > 0 ? (
          <div className="py-4">
            {dialogType === "welcomeBack" && (
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Recent Designs
                </h3>
            )}
            <ScrollArea className="h-[250px] pr-3"> {/* Increased height slightly */}
              <div className="space-y-2">
                {recentDesigns.map((design) => (
                  <Button
                    key={design.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-2.5 px-3 text-left" // Slightly more padding
                    onClick={() => onLoadDesignClick(design.id, design.name)}
                  >
                    <FileText className="h-4 w-4 mr-3 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium leading-tight">{design.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Last updated: {formatDistanceToNow(design.updatedAt.toDate(), { addSuffix: true })}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
           <div className="py-8 text-center text-muted-foreground">
             <p>You haven't saved any designs yet.</p>
             <p className="text-sm">Start by creating a new design!</p>
           </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between pt-4">
           <DialogClose asChild>
            <Button type="button" variant="ghost">
              {dialogType === "myDesigns" ? "Close" : "Cancel"}
            </Button>
          </DialogClose>
          <Button onClick={onCreateNewClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Design
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
