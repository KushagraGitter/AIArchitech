
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
import type { UserDesign } from './architech-app'; // Assuming UserDesign is exported
import { formatDistanceToNow } from 'date-fns';
import { FileText, PlusCircle, Hand } from 'lucide-react';

interface WelcomeBackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  designs: UserDesign[];
  onLoadDesignClick: (designId: string, designName: string) => void;
  onCreateNewClick: () => void;
}

export function WelcomeBackDialog({
  isOpen,
  onClose,
  designs,
  onLoadDesignClick,
  onCreateNewClick,
}: WelcomeBackDialogProps) {
  if (!isOpen) {
    return null;
  }

  const sortedDesigns = [...designs].sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
  const recentDesigns = sortedDesigns.slice(0, 5); // Show top 5 recent

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Hand className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">Welcome Back!</DialogTitle>
          </div>
          <DialogDescription>
            Choose one of your recent designs to continue, or start a new one.
          </DialogDescription>
        </DialogHeader>

        {recentDesigns.length > 0 && (
          <div className="py-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Recent Designs
            </h3>
            <ScrollArea className="h-[200px] pr-3">
              <div className="space-y-2">
                {recentDesigns.map((design) => (
                  <Button
                    key={design.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-2 px-3 text-left"
                    onClick={() => onLoadDesignClick(design.id, design.name)}
                  >
                    <FileText className="h-4 w-4 mr-2 shrink-0" />
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
        )}

        <DialogFooter className="gap-2 sm:justify-between">
           <DialogClose asChild>
            <Button type="button" variant="ghost">
              Close
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
