"use client";

import React, { useMemo, useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent as ShadSidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, BookCopy } from 'lucide-react';
import type { ComponentGroup, ComponentConfig } from '@/components/designComponents'; 
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  groupedDesignComponents: ComponentGroup[]; 
  onDragStart: (event: React.DragEvent, component: ComponentConfig, color: string, borderColor: string) => void;
}

export function AppSidebar({
  groupedDesignComponents, 
  onDragStart,
}: AppSidebarProps) {
  const [componentSearchTerm, setComponentSearchTerm] = useState('');

  const filteredComponentGroups = useMemo(() => {
    if (!componentSearchTerm.trim()) {
      return groupedDesignComponents;
    }
    const lowerSearchTerm = componentSearchTerm.toLowerCase();
    return groupedDesignComponents
      .map(group => {
        const filteredComponents = group.components.filter(component =>
          component.name.toLowerCase().includes(lowerSearchTerm) ||
          component.description.toLowerCase().includes(lowerSearchTerm)
        );
        return { ...group, components: filteredComponents };
      })
      .filter(group => group.components.length > 0);
  }, [groupedDesignComponents, componentSearchTerm]);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="p-0">
      </SidebarHeader>
      <ShadSidebarContent className="p-0">
        <ScrollArea className="h-full">
            <div className="sticky top-0 bg-sidebar z-10 border-b border-sidebar-border px-4 py-3 space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                  <BookCopy className="h-5 w-5"/>
                  Node Library
                </h3>
                 <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                          type="text"
                          placeholder="Search nodes..."
                          value={componentSearchTerm}
                          onChange={(e) => setComponentSearchTerm(e.target.value)}
                          className="pl-8 h-9 text-sm group-data-[collapsible=icon]:hidden"
                      />
                       <Search className="h-6 w-6 hidden group-data-[collapsible=icon]:block mx-auto" />
                  </div>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {filteredComponentGroups.map((group) => (
                  <div key={group.groupName}>
                      <SidebarGroupLabel className="px-0 text-xs uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                          {group.groupName}
                      </SidebarGroupLabel>
                       <div className="mt-2 space-y-1 group-data-[collapsible=icon]:mt-0">
                          {group.components.map((component) => (
                          <div
                              key={component.name}
                              draggable={true}
                              onDragStart={(event) => onDragStart(event, component, group.color, group.borderColor)}
                              className="group/item flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-sidebar-accent cursor-grab group-data-[collapsible=icon]:justify-center"
                              title={component.name}
                          >
                              <component.icon className={cn("h-6 w-6 shrink-0 transition-colors", group.color, "group-hover/item:text-sidebar-accent-foreground")} />
                              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                  <span className="font-semibold text-sm leading-tight text-card-foreground transition-colors group-hover/item:text-sidebar-accent-foreground">{component.name}</span>
                                  <span className="text-xs text-muted-foreground transition-colors group-hover/item:text-sidebar-accent-foreground">{component.description}</span>
                              </div>
                          </div>
                          ))}
                      </div>
                  </div>
              ))}
            </div>
        </ScrollArea>
      </ShadSidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border flex items-center group-data-[collapsible=icon]:justify-center">
      </SidebarFooter>
    </Sidebar>
  );
}
