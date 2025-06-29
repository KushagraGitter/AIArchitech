
"use client";

import React, { useState, useMemo } from 'react';
import type { Node, Edge } from 'reactflow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Layers } from 'lucide-react';
import type { NodeData } from './design-canvas';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import type { Template } from './initialTemplates';

interface TemplateBrowserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onLoadTemplate: (nodes: Node<NodeData>[], edges: Edge[], templateName: string) => void;
}

const getIconComponent = (iconName: string): React.ElementType => {
  if (!iconName) return LucideIcons.HelpCircle;
  const icons = LucideIcons as any;
  const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const foundIconKey = Object.keys(icons).find(
    key => key.toLowerCase() === normalizedIconName.toLowerCase() || key.toLowerCase() === iconName.toLowerCase()
  );
  return foundIconKey ? icons[foundIconKey] : LucideIcons.HelpCircle;
};

const levelColors: Record<Template['level'], string> = {
  Beginner: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800',
  Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  Advanced: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800',
};


export function TemplateBrowserDialog({
  isOpen,
  onClose,
  templates,
  onLoadTemplate,
}: TemplateBrowserDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return templates;
    const lowercasedTerm = searchTerm.toLowerCase();
    return templates.filter(template =>
      template.name.toLowerCase().includes(lowercasedTerm) ||
      template.description.toLowerCase().includes(lowercasedTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
    );
  }, [searchTerm, templates]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            System Design Templates
          </DialogTitle>
          <DialogDescription>
            Start your project with a pre-built template to learn and build upon.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-base"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => {
              const Icon = getIconComponent(template.iconName);
              return (
                <div
                  key={template.name}
                  onClick={() => onLoadTemplate(template.nodes, template.edges, template.name)}
                  className="group relative flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:border-primary cursor-pointer transition-all duration-200"
                >
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                         <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <Badge variant="outline" className={cn("w-fit text-xs", levelColors[template.level])}>
                          {template.level}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1 min-h-[60px]">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {template.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                  </div>
                   <div className="border-t px-6 py-3 text-xs text-muted-foreground">
                        <span>{template.nodes.length} nodes</span> &bull; <span>{template.edges.length} connections</span>
                    </div>
                </div>
              );
            })}
             {filteredTemplates.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                    <p className="text-lg font-medium">No templates found</p>
                    <p className="text-sm">Try adjusting your search term.</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
